"use server"
import { getServerSupabase } from '@/lib/supabaseServer'
import { getAdminSupabase } from '@/lib/supabaseAdmin'
import {
  SECTION_ORDER,
  SECTION_SCHEMAS,
  parseBoolean,
  parseInteger,
  formatDateToISO,
} from '@/lib/medicalForms'

/**
 * Server action to submit a section. Accepts plain JS object payload.
 * Returns an object: { nextSection, completed }
 */
export async function submitSection(payload) {
  const supabase = await getServerSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) {
    console.log('submitSection unauthorized', userErr)
    return { error: 'unauthorized', message: 'An error occurred. Please sign in and try again.' }
  }

  const requestedSection = String(payload.section || '').trim()
  if (!requestedSection || !SECTION_SCHEMAS[requestedSection]) {
    console.log('submitSection invalid_section', { requestedSection })
    return { error: 'invalid_section', message: 'An error occurred. Please try again.' }
  }

  // fetch student row
  const { data: studentRow, error: selectStudentError } = await supabase
    .from('students')
    .select('id, gender, medical_form_status')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (selectStudentError) {
    console.log('submitSection selectStudentError', selectStudentError)
    return { error: 'db_error', message: 'An error occurred. Please try again.' }
  }
  if (!studentRow) {
    console.log('submitSection student not found', { userId: user.id })
    return { error: 'not_found', message: 'An error occurred. Please try again.' }
  }

  const currentStatus = studentRow.medical_form_status || {}
  const currentStep = Number(currentStatus.current_step ?? 0)
  const genderValue = (studentRow.gender || '').toLowerCase()
  const totalSteps = genderValue === 'female' ? 11 : 10

  if (Number(currentStatus.current_step ?? 0) >= totalSteps || currentStatus?.status === 'completed') {
    console.log('submitSection already completed', { currentStatus })
    return { error: 'already_completed', message: 'An error occurred. Please try again.' }
  }

  const expectedSection = SECTION_ORDER[currentStep]
  if (requestedSection !== expectedSection) {
    console.log('submitSection invalid_order', { expectedSection, requestedSection })
    return { error: 'invalid_order', message: 'An error occurred. Please try again.' }
  }

  const sectionSchema = SECTION_SCHEMAS[requestedSection]

  // Filter payload to schema keys
  const payloadToValidate = Object.keys(payload).reduce((acc, k) => {
    if (k === 'section') return acc
    if (Object.prototype.hasOwnProperty.call(sectionSchema.shape, k)) acc[k] = payload[k]
    return acc
  }, {})

  if (Object.keys(payloadToValidate).length === 0) {
    console.log('submitSection no_valid_fields', { payload })
    return { error: 'no_valid_fields', message: 'An error occurred. Please try again.' }
  }

  // Normalize incoming values to types the Zod schemas expect.
  // - null or empty strings -> undefined for optional fields
  // - coerce boolean-like strings -> booleans
  // - coerce integer-like strings for fields that look numeric
  const normalizedPayload = {}
  for (const [fieldName, fieldValue] of Object.entries(payloadToValidate)) {
    // null -> undefined (so optional zod string accepts it)
    if (fieldValue === null) {
      normalizedPayload[fieldName] = undefined
      continue
    }

    if (typeof fieldValue === 'string') {
      const trimmed = fieldValue.trim()
      if (trimmed === '') {
        normalizedPayload[fieldName] = undefined
        continue
      }

      // boolean-like
      const maybeBool = parseBoolean(trimmed)
      if (maybeBool !== undefined) {
        normalizedPayload[fieldName] = maybeBool
        continue
      }

      // integer-like heuristics
      const maybeInt = parseInteger(trimmed)
      if (maybeInt !== undefined && /(days|duration|qty|_days|_qty)/i.test(fieldName)) {
        normalizedPayload[fieldName] = maybeInt
        continue
      }

      // date-like formatting: keep string but normalize common date inputs
      if (/date|period|since|last_period|_date/i.test(fieldName)) {
        const iso = formatDateToISO(trimmed)
        normalizedPayload[fieldName] = iso ?? trimmed
        continue
      }

      // default: trimmed string
      normalizedPayload[fieldName] = trimmed
      continue
    }

    if (typeof fieldValue === 'number') {
      // coerce numeric-looking fields to integers when applicable
      if (/(days|duration|qty|_days|_qty)/i.test(fieldName)) {
        normalizedPayload[fieldName] = parseInteger(fieldValue)
      } else {
        normalizedPayload[fieldName] = fieldValue
      }
      continue
    }

    // otherwise keep as-is (booleans already booleans, objects left for Zod)
    normalizedPayload[fieldName] = fieldValue
  }

  let validated
  try {
    console.log('submitSection normalizedPayload', normalizedPayload)
    validated = sectionSchema.partial().parse(normalizedPayload)
  } catch (e) {
    console.log('submitSection validation error', e)
    return { error: 'validation', message: 'An error occurred. Please check your input and try again.' }
  }

  const cleaned = {}
  for (const [k, v] of Object.entries(validated)) {
    if (v === undefined) continue
    cleaned[k] = v
  }

  // persist (atomic upsert to avoid SELECT-then-INSERT race)
  const admin = getAdminSupabase()

  // attach a short request id for auditability and make it available across the whole function
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
  try {
    const upsertPayload = { student_id: studentRow.id, ...cleaned, updated_at: new Date().toISOString() }
    console.log('submitSection upsert request', { requestId, section: requestedSection, studentId: studentRow.id })

    const { data: upsertedRow, error: upsertErr } = await admin
      .from('medical_forms')
      .upsert(upsertPayload, { onConflict: 'student_id' })

    if (upsertErr) {
      console.log('submitSection upsertErr', upsertErr)
      return { error: 'db_error', message: 'An error occurred while saving. Please try again.' }
    }
  } catch (err) {
    console.log('submitSection upsert exception', err)
    return { error: 'db_error', message: 'An unexpected error occurred. Please try again.' }
  }

  // advance step
  const newStep = currentStep + 1
  const newProgressFloat = Math.round((newStep / totalSteps) * 100)
  const newStatus = newStep >= totalSteps ? 'completed' : 'in_progress'

  const newMedicalFormStatus = {
    ...(currentStatus || {}),
    current_step: newStep,
    progress_percentage: newProgressFloat,
    status: newStatus,
  }

  // attempt conditional update; log request id and DB value for tracing
  console.log('submitSection updating student status', { requestId, studentId: studentRow.id, expectedCurrentStep: currentStep, newStep })
  const { data: updatedStudentRows, error: updateStudentError } = await admin
    .from('students')
    .update({ medical_form_status: newMedicalFormStatus, updated_at: new Date().toISOString() })
    .eq('auth_user_id', user.id)
    .eq('medical_form_status->>current_step', String(currentStep))

  if (updateStudentError) {
    console.log('submitSection updateStudentError', updateStudentError)
    return { error: 'db_error', message: 'An error occurred. Please try again.' }
  }

  if (!updatedStudentRows || updatedStudentRows.length === 0) {
    const { data: latestStudent } = await supabase
      .from('students')
      .select('medical_form_status')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    const latestStatus = latestStudent?.medical_form_status || {}
    console.log('submitSection conflict', { expected: currentStep, latest: latestStatus })

    const latestStepNum = Number(latestStatus.current_step ?? 0)
    const nextOnLatest = SECTION_ORDER[latestStepNum] ?? null

    // Return structured info so the client may advance to the correct step.
    return {
      conflict: true,
      message: 'This section was saved in another session. Navigating to the latest step.',
      nextSection: nextOnLatest,
      completed: latestStatus.status === 'completed',
      latestStepNum: latestStepNum
    }
  }

  return { nextSection: SECTION_ORDER[newStep] ?? null, completed: newStatus === 'completed' }
}
