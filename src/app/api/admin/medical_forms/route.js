'use server'

import { NextResponse } from 'next/server'
import { unauthorized, forbidden, methodNotAllowed, internalServerError } from '@/lib/api/responses'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Main handlers for different HTTP methods
export async function GET(request) {
  return handleRequest(request, 'GET')
}

export async function POST(request) {
  return handleRequest(request, 'POST')
}

export async function PUT(request) {
  return handleRequest(request, 'PUT')
}

export async function DELETE(request) {
  return handleRequest(request, 'DELETE')
}

async function handleRequest(request, method) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check authentication and authorization
    const { data: { session }, error: sessErr } = await supabase.auth.getSession()
  if (sessErr || !session) return unauthorized()

    const role = session.user?.user_metadata?.role 
  if (role !== 'admin' && role !== 'superadmin') return forbidden()

  // Route to appropriate handler based on HTTP method
    switch (method) {
      case 'GET':
        return await handleGetMedicalForms(request, supabase)
      case 'POST':
  if (role !== 'superadmin') return forbidden()
        // Keep the original POST handler
        try {
          // Your code to create a medical form will go here
          
          return NextResponse.json({ message: 'Medical form created successfully' }, { status: 201 })
        } catch (error) {
          console.error('Error creating medical form:', error)
          return NextResponse.json({ error: 'Failed to create medical form' }, { status: 500 })
        }
      case 'PUT':
  if (role !== 'superadmin') return forbidden()
        return await handleUpdateMedicalForm(request, supabase)
      case 'DELETE':
  if (role !== 'superadmin') return forbidden()
        return await handleDeleteMedicalForm(request, supabase)
      default:
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
    }
  } catch (error) {
    console.error('Medical Forms API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Fetch medical forms with pagination, search, and filters
async function handleGetMedicalForms(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit
    
    // Search and filter parameters
    const search = searchParams.get('search') || ''
    const completedFilter = searchParams.get('completed')
    const studentIdFilter = searchParams.get('student_id')
    const facultyFilter = searchParams.get('faculty')
    const departmentFilter = searchParams.get('department')
    
    // Determine if we need to use inner join for student-based filtering
    const needsStudentJoin = facultyFilter && facultyFilter !== 'all' || 
                           departmentFilter && departmentFilter !== 'all' ||
                           search;

    // Create a filtered base query first that we can reuse for both count and data
    let baseFilteredQuery = supabase.from('medical_forms');
    
    // Apply the same join condition for both queries
    if (needsStudentJoin) {
      baseFilteredQuery = baseFilteredQuery.select('*, students!inner(*)');
    } else {
      baseFilteredQuery = baseFilteredQuery.select('*, students(*)');
    }
    
    // Apply all filters to the base query
    if (completedFilter !== null && completedFilter !== undefined) {
      const isCompleted = completedFilter === 'true' || completedFilter === '1';
      baseFilteredQuery = baseFilteredQuery.eq('completed', isCompleted);
    }
    
    if (studentIdFilter) {
      baseFilteredQuery = baseFilteredQuery.eq('student_id', studentIdFilter);
    }
    
    if (facultyFilter && facultyFilter !== 'all') {
      baseFilteredQuery = baseFilteredQuery.eq('students.faculty_id', facultyFilter);
    }
    
    if (departmentFilter && departmentFilter !== 'all') {
      baseFilteredQuery = baseFilteredQuery.eq('students.department_id', departmentFilter);
    }
    
    // Handle search separately as it uses OR condition
    if (search) {
      const term = String(search).trim()
      if (term) {
        baseFilteredQuery = baseFilteredQuery.or(
          `full_name.ilike.*${term}*,matric_number.ilike.*${term}*`,
          { foreignTable: 'students' }
        )
      }
    }
    
    // Get count using a dedicated query with the same filters
    let countSelect = 'id'
    if (needsStudentJoin) {
      // Force inner join so student-based filters/search apply to count
      countSelect = 'id, students!inner(id)'
    }

    let countQuery = supabase
      .from('medical_forms')
      .select(countSelect, { count: 'exact', head: true })

    // Re-apply filters for the count query
    if (completedFilter !== null && completedFilter !== undefined) {
      const isCompleted = completedFilter === 'true' || completedFilter === '1'
      countQuery = countQuery.eq('completed', isCompleted)
    }
    if (studentIdFilter) {
      countQuery = countQuery.eq('student_id', studentIdFilter)
    }
    if (facultyFilter && facultyFilter !== 'all') {
      countQuery = countQuery.eq('students.faculty_id', facultyFilter)
    }
    if (departmentFilter && departmentFilter !== 'all') {
      countQuery = countQuery.eq('students.department_id', departmentFilter)
    }
    if (search) {
      const term = String(search).trim()
      if (term) {
        countQuery = countQuery.or(
          `full_name.ilike.*${term}*,matric_number.ilike.*${term}*`,
          { foreignTable: 'students' }
        )
      }
    }
    const { count, error: countError } = await countQuery
    if (countError) {
      console.error('Error getting medical forms count:', countError)
    }

    // Apply pagination and ordering to the main query
    // Clone the filtered base query for the data fetch but use the full select statement
    const dataQuery = baseFilteredQuery
      .select(`
        id,
        student_id,
        submitted_at,
        completed,
        general_health,
        inpatient_admit,
        inpatient_details,
        family_history,
        prev_tuberculosis,
        prev_hypertension,
        prev_epilepsy,
        prev_mental_illness,
        prev_cardiovascular,
        prev_arthritis,
        prev_asthma,
        prev_bronchitis,
        prev_hay_fever,
        prev_diabetes,
        prev_eye_ear_nose,
        prev_throat_trouble,
        prev_drug_sensitivity,
        prev_dysentery,
        prev_dizziness,
        prev_jaundice,
        prev_kidney_disease,
        prev_gonorrhea,
        prev_parasitic_disease,
        prev_heart_disease,
        prev_ulcer,
        prev_haemorrhoids,
        prev_skin_disease,
        prev_schistosomiasis,
        prev_other_condition,
        prev_other_details,
        smoke,
        alcohol,
        alcohol_since,
        alcohol_qty_per_day,
        leisure_activities,
        current_treatments,
        menses_regular,
        menses_painful,
        menses_duration_days,
        last_period_date,
        breast_sexual_disease,
        breast_sexual_details,
        imm_yellow_fever,
        imm_smallpox,
        imm_typhoid,
        imm_tetanus,
        imm_tuberculosis,
        imm_cholera,
        imm_polio,
        imm_others,
        imm_others_details,
        updated_at,
        students${needsStudentJoin ? '!inner' : ''} (
          id,
          matric_number,
          full_name,
          institutional_email,
          faculty_id,
          department_id,
          gender,
          religion,
          faculties (
            id,
            name
          ),
          departments (
            id,
            name
          )
        )
      `)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: medicalForms, error } = await dataQuery

    if (error) {
      console.error('Error fetching medical forms:', error)
      return NextResponse.json(
        { error: 'Failed to fetch medical forms' },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalCount = count || 0; // Use 0 if count is undefined/null
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      medicalForms,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error in handleGetMedicalForms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical forms' },
      { status: 500 }
    )
  }
}

// PUT: Update an existing medical form
async function handleUpdateMedicalForm(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('id')

    if (!formId) {
      return NextResponse.json(
        { error: 'Medical form ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Check if medical form exists
    const { data: existingForm, error: formErr } = await supabase
      .from('medical_forms')
      .select('id, student_id')
      .eq('id', formId)
      .single()

    if (formErr || !existingForm) {
      return NextResponse.json(
        { error: 'Medical form not found' },
        { status: 404 }
      )
    }

    // Build update object with provided fields from body
    const updateData = {}

  // Explicit date fields we know about
  const dateFields = new Set(['last_period_date'])
  // Fields that should be nullable if sent as empty string (common for numeric inputs)
  const nullableIfEmpty = new Set(['menses_duration_days'])

  // Only add fields to updateData if they're provided in the body
    // This allows partial updates
    for (const [key, value] of Object.entries(body)) {
      // Skip student_id as we don't allow changing the student association
      if (key === 'student_id' || key === 'id') continue

      let normalized = value

      // Coerce empty strings for date fields to null to satisfy Postgres date type
      if (dateFields.has(key)) {
        if (normalized === '' || normalized === undefined) {
          normalized = null
        }
      }
      // Additionally, treat any field name containing 'date' or ending in '_at' as date-like
      if ((/date/i.test(key) || /_at$/i.test(key)) && (normalized === '' || normalized === undefined)) {
        normalized = null
      }

      // Coerce empty strings for certain numeric/nullable fields to null
      if (nullableIfEmpty.has(key)) {
        if (normalized === '' || normalized === undefined) {
          normalized = null
        }
      }

      // Cast numeric fields where applicable
      if (key === 'menses_duration_days' && normalized !== null && normalized !== undefined) {
        const parsed = parseInt(normalized, 10)
        normalized = Number.isNaN(parsed) ? null : parsed
      }

      updateData[key] = normalized
    }
    
    // Enforce: If student's gender is not female, ignore menstrual fields entirely on the server
    try {
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .select('id, gender')
        .eq('id', existingForm.student_id)
        .single()
      const gender = (student?.gender || '').toString().toLowerCase()
      if (gender !== 'female') {
        updateData.menses_regular = false
        updateData.menses_painful = false
        updateData.menses_duration_days = null
        updateData.last_period_date = null
      }
    } catch (e) {
      // If we cannot determine gender, proceed without overriding; updateData normalization still guards dates
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update medical form
    const { data: updatedForm, error: updateErr } = await supabase
      .from('medical_forms')
      .update(updateData)
      .eq('id', formId)
      .select(`
        id,
        student_id,
        submitted_at,
        completed,
        general_health,
        inpatient_admit,
        inpatient_details,
        family_history,
        prev_tuberculosis,
        prev_hypertension,
        prev_epilepsy,
        prev_mental_illness,
        prev_cardiovascular,
        prev_arthritis,
        prev_asthma,
        prev_bronchitis,
        prev_hay_fever,
        prev_diabetes,
        prev_eye_ear_nose,
        prev_throat_trouble,
        prev_drug_sensitivity,
        prev_dysentery,
        prev_dizziness,
        prev_jaundice,
        prev_kidney_disease,
        prev_gonorrhea,
        prev_parasitic_disease,
        prev_heart_disease,
        prev_ulcer,
        prev_haemorrhoids,
        prev_skin_disease,
        prev_schistosomiasis,
        prev_other_condition,
        prev_other_details,
        smoke,
        alcohol,
        alcohol_since,
        alcohol_qty_per_day,
        leisure_activities,
        current_treatments,
        menses_regular,
        menses_painful,
        menses_duration_days,
        last_period_date,
        breast_sexual_disease,
        breast_sexual_details,
        imm_yellow_fever,
        imm_smallpox,
        imm_typhoid,
        imm_tetanus,
        imm_tuberculosis,
        imm_cholera,
        imm_polio,
        imm_others,
        imm_others_details,
        updated_at,
        students (
          id,
          matric_number,
          full_name,
          institutional_email,
          faculty_id,
          department_id,
          gender,
          religion,
          faculties (
            id,
            name
          ),
          departments (
            id,
            name
          )
        )
      `)
      .single()

    if (updateErr) {
      console.error('Error updating medical form:', updateErr)
      return NextResponse.json(
        { error: 'Failed to update medical form' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Medical form updated successfully',
      medicalForm: updatedForm
    }, { status: 200 })

  } catch (error) {
    console.error('Error in handleUpdateMedicalForm:', error)
    return NextResponse.json(
      { error: 'Failed to update medical form' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a medical form
async function handleDeleteMedicalForm(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('id')

    if (!formId) {
      return NextResponse.json(
        { error: 'Medical form ID is required' },
        { status: 400 }
      )
    }

    // Check if medical form exists
    const { data: existingForm, error: formErr } = await supabase
      .from('medical_forms')
      .select('id, student_id')
      .eq('id', formId)
      .single()

    if (formErr || !existingForm) {
      return NextResponse.json(
        { error: 'Medical form not found' },
        { status: 404 }
      )
    }

    // Get student information for the response message
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('full_name')
      .eq('id', existingForm.student_id)
      .single()

    // Delete medical form
    const { error: deleteErr } = await supabase
      .from('medical_forms')
      .delete()
      .eq('id', formId)

    if (deleteErr) {
      console.error('Error deleting medical form:', deleteErr)
      return NextResponse.json(
        { error: 'Failed to delete medical form' },
        { status: 500 }
      )
    }

    const studentName = student ? student.full_name : 'Unknown student'
    
    return NextResponse.json({
      message: `Medical form for ${studentName} was successfully deleted`
    }, { status: 200 })

  } catch (error) {
    console.error('Error in handleDeleteMedicalForm:', error)
    return NextResponse.json(
      { error: 'Failed to delete medical form' },
      { status: 500 }
    )
  }
}
