import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  unauthorized,
  forbidden,
  methodNotAllowed,
  internalServerError,
} from '@/lib/api/responses';

/* -------------------- Section order -------------------- */
const SECTION_ORDER = [
  'history',
  'lifestyle',
  'womens-health',
  'conditions-1',
  'conditions-2',
  'conditions-3',
  'conditions-4',
  'conditions-5',
  'conditions-6',
  'immunizations-1',
  'immunizations-2',
];

/* -------------------- Helpers -------------------- */
const parseBoolean = (rawValue) => {
  if (typeof rawValue === 'boolean') return rawValue;
  if (typeof rawValue === 'string') {
    const lower = rawValue.toLowerCase().trim();
    if (['true', '1', 'yes'].includes(lower)) return true;
    if (['false', '0', 'no'].includes(lower)) return false;
  }
  return undefined;
};

const parseInteger = (rawValue) => {
  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) return Math.floor(rawValue);
  if (typeof rawValue === 'string' && rawValue.trim() !== '') {
    const parsedInteger = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsedInteger) ? undefined : parsedInteger;
  }
  return undefined;
};

const formatDateToISO = (rawValue) => {
  if (!rawValue) return undefined;
  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
};

/* -------------------- Section schemas (zod) -------------------- */
/* Only fields belonging to each section are accepted; types coerced for safety */
const historySectionSchema = z.object({
  general_health: z.enum(['Good', 'Fair', 'Poor']).optional(),
  inpatient_admit: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  inpatient_details: z.string().nullable().optional(),
  family_history: z.string().nullable().optional(),
});
const lifestyleSectionSchema = z.object({
  smoke: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  alcohol: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  alcohol_since: z.string().optional().transform((v) => formatDateToISO(v)),
  alcohol_qty_per_day: z.string().nullable().optional(),
  leisure_activities: z.string().nullable().optional(),
  current_treatments: z.string().nullable().optional(),
});
const womensHealthSectionSchema = z.object({
  menses_regular: z.boolean().nullable().optional().transform((v) => (v === undefined ? undefined : parseBoolean(v))),
  menses_painful: z.boolean().nullable().optional().transform((v) => (v === undefined ? undefined : parseBoolean(v))),
  menses_duration_days: z.number().int().nullable().optional().transform((v) => (v === undefined ? undefined : parseInteger(v))),
  last_period_date: z.string().nullable().optional().transform((v) => (v ? formatDateToISO(v) : undefined)),
  breast_sexual_disease: z.boolean().nullable().optional().transform((v) => (v === undefined ? undefined : parseBoolean(v))),
  breast_sexual_details: z.string().nullable().optional(),
});
const conditions1Schema = z.object({
  prev_tuberculosis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_hypertension: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_epilepsy: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_mental_illness: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
});
const conditions2Schema = z.object({
  prev_cardiovascular: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_arthritis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_asthma: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_bronchitis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
});
const conditions3Schema = z.object({
  prev_hay_fever: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_diabetes: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_eye_ear_nose: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_throat_trouble: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
});
const conditions4Schema = z.object({
  prev_drug_sensitivity: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_dysentery: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_dizziness: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_jaundice: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
});
const conditions5Schema = z.object({
  prev_kidney_disease: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_gonorrhea: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_parasitic_disease: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_heart_disease: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
});
const conditions6Schema = z.object({
  prev_ulcer: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_haemorrhoids: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_skin_disease: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_schistosomiasis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_other_condition: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  prev_other_details: z.string().nullable().optional(),
});
const immunizations1Schema = z.object({
  imm_yellow_fever: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_smallpox: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_typhoid: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_tetanus: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
});
const immunizations2Schema = z.object({
  imm_tuberculosis: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_cholera: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_polio: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_others: z.boolean().optional().transform((v) => parseBoolean(v) ?? false),
  imm_others_details: z.string().nullable().optional(),
});

const SECTION_SCHEMAS = {
  history: historySectionSchema,
  lifestyle: lifestyleSectionSchema,
  'womens-health': womensHealthSectionSchema,
  'conditions-1': conditions1Schema,
  'conditions-2': conditions2Schema,
  'conditions-3': conditions3Schema,
  'conditions-4': conditions4Schema,
  'conditions-5': conditions5Schema,
  'conditions-6': conditions6Schema,
  'immunizations-1': immunizations1Schema,
  'immunizations-2': immunizations2Schema,
};

/* -------------------- Supabase client factory -------------------- */
const createSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
};

/* -------------------- GET disabled -------------------- */
export function GET() {
  // Students must not read medical details from this endpoint.
  return methodNotAllowed();
}

/* -------------------- POST handler -------------------- */
export async function POST(request) {
  try {
    const supabaseClient = await createSupabaseClient();

    // Authenticate and ensure student role
    const authResult = await supabaseClient.auth.getUser();
    const authenticatedUser = authResult?.data?.user;
    if (authResult.error || !authenticatedUser) return unauthorized();

    const currentUserRole = (authenticatedUser.user_metadata?.role) || 'student';
    if (currentUserRole !== 'student') return forbidden();

    // Parse body
    const requestBody = await request.json().catch(() => null);
    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const requestedSection = String(requestBody.section || '').trim();
    if (!requestedSection || !SECTION_SCHEMAS[requestedSection]) {
      return NextResponse.json({ error: 'Invalid or missing section name' }, { status: 400 });
    }

    const studentId = authenticatedUser.id;

    // Fetch student's gender and medical_form_status
    const { data: studentRow, error: selectStudentError } = await supabaseClient
      .from('students')
      .select('gender, medical_form_status')
      .eq('id', studentId)
      .maybeSingle();

    if (selectStudentError) {
      console.error('DB error fetching student row:', selectStudentError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    if (!studentRow) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Determine current_step (default to 0 if not present)
    const currentStatus = studentRow.medical_form_status || {};
    const currentStep = Number(currentStatus.current_step ?? 0);

    // Determine total steps by gender: female = 11, male = 10
    const genderValue = (studentRow.gender || '').toLowerCase();
    const totalSteps = genderValue === 'female' ? 11 : 10;

    // Enforce not completed
    if (Number(currentStatus.current_step ?? 0) >= totalSteps || currentStatus?.status === 'completed') {
      return NextResponse.json({ error: 'Medical form already completed' }, { status: 403 });
    }

    // Expect the section that corresponds to currentStep index
    const expectedSection = SECTION_ORDER[currentStep];
    if (requestedSection !== expectedSection) {
      return NextResponse.json({
        error: 'Invalid section order',
        message: `Next allowed section is "${expectedSection}"`,
      }, { status: 400 });
    }

    // Validate section payload using the section schema
    const sectionSchema = SECTION_SCHEMAS[requestedSection];

    // Keep only keys defined in the schema shape (ignore extraneous keys)
    const payloadToValidate = Object.keys(requestBody).reduce((accumulator, fieldName) => {
      if (fieldName === 'section') return accumulator;
      if (Object.prototype.hasOwnProperty.call(sectionSchema.shape, fieldName)) {
        accumulator[fieldName] = requestBody[fieldName];
      }
      return accumulator;
    }, {});

    if (Object.keys(payloadToValidate).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for this section' }, { status: 400 });
    }

    // Parse and coerce
    let validatedSectionPayload;
    try {
      validatedSectionPayload = sectionSchema.partial().parse(payloadToValidate);
    } catch (validationError) {
      const validationIssues = (validationError?.errors || []).map((issue) => `${issue.path.join('.')}: ${issue.message}`);
      return NextResponse.json({ error: 'Validation failed', issues: validationIssues }, { status: 400 });
    }

    // Clean: remove undefined, enforce dependent nullification (unless parent true)
    const cleanedSectionPayload = {};
    for (const [fieldName, fieldValue] of Object.entries(validatedSectionPayload)) {
      if (fieldValue === undefined) continue;
      cleanedSectionPayload[fieldName] = fieldValue;
    }

    // Enforce dependency rules: if parent not explicitly true, clear dependent detail fields to null
    if (cleanedSectionPayload.inpatient_admit !== true) {
      cleanedSectionPayload.inpatient_details = null;
    }
    if (cleanedSectionPayload.alcohol !== true) {
      cleanedSectionPayload.alcohol_since = null;
      cleanedSectionPayload.alcohol_qty_per_day = null;
    }
    if (cleanedSectionPayload.breast_sexual_disease !== true) {
      cleanedSectionPayload.breast_sexual_details = null;
    }
    if (cleanedSectionPayload.prev_other_condition !== true) {
      cleanedSectionPayload.prev_other_details = null;
    }
    if (cleanedSectionPayload.imm_others !== true) {
      cleanedSectionPayload.imm_others_details = null;
    }

    // --- Persist section fields to medical_forms (update only the fields for this section) ---
    // We update the canonical medical_forms row for admin access. If it doesn't exist, create it.
    const { data: existingFormRow, error: selectFormError } = await supabaseClient
      .from('medical_forms')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (selectFormError) {
      console.error('DB error selecting medical_forms row:', selectFormError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!existingFormRow) {
      // Create a canonical row with student_id and this section's fields
      const insertPayload = { student_id: studentId, ...cleanedSectionPayload };
      const { error: insertFormError } = await supabaseClient
        .from('medical_forms')
        .insert(insertPayload);

      if (insertFormError) {
        console.error('DB insert error creating medical_forms row:', insertFormError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    } else {
      // Update only fields for this section
      const { error: updateFormError } = await supabaseClient
        .from('medical_forms')
        .update({ ...cleanedSectionPayload, updated_at: new Date().toISOString() })
        .eq('student_id', studentId);

      if (updateFormError) {
        console.error('DB update error updating medical_forms row:', updateFormError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    // --- Attempt to atomically advance student's medical_form_status.current_step ---
    const newStep = currentStep + 1;
    const newProgressFloat = Math.round((newStep / totalSteps) * 100);
    const newStatus = newStep >= totalSteps ? 'completed' : 'in_progress';

    const newMedicalFormStatus = {
      ...(currentStatus || {}),
      current_step: newStep,
      progress_percentage: newProgressFloat,
      status: newStatus,
    };

    // Conditional update: update student only if current_step still equals currentStep
    const { data: updatedStudentRows, error: updateStudentError } = await supabaseClient
      .from('students')
      .update({ medical_form_status: newMedicalFormStatus, updated_at: new Date().toISOString() })
      .eq('id', studentId)
      .eq('medical_form_status->>current_step', String(currentStep))
      .select();

    if (updateStudentError) {
      console.error('DB error updating students.medical_form_status:', updateStudentError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If no rows updated, a concurrent change happened — signal conflict so client can retry / refresh state
    if (!updatedStudentRows || updatedStudentRows.length === 0) {
      console.warn('Concurrent update detected when advancing medical_form_status for student:', studentId);
      return NextResponse.json({ error: 'Conflict: section submission failed due to concurrent update. Please retry.' }, { status: 409 });
    }

    // Success — do not include medical data in response
    const nextAllowedSection = SECTION_ORDER[newStep] ?? null;
    return NextResponse.json({
      message: `Section "${requestedSection}" submitted.`,
      nextSection: nextAllowedSection,
      completed: newStatus === 'completed',
    }, { status: 201 });

  } catch (error) {
    console.error('Unhandled error in POST /api/medical-form:', error);
    return internalServerError();
  }
}

/* -------------------- PUT/DELETE disabled -------------------- */
export function PUT() {
  return methodNotAllowed();
}
export function DELETE() {
  return methodNotAllowed();
}
