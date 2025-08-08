'use server'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

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
    if (sessErr || !session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const role = session.user?.user_metadata?.role 
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden' }, 
        { status: 403 }
      )
    }

    // Route to appropriate handler based on HTTP method
    switch (method) {
      case 'GET':
        return await handleGetStudents(request, supabase)
      case 'PUT':
        return await handleUpdateStudent(request, supabase)
      case 'DELETE':
        return await handleDeleteStudent(request, supabase)
      default:
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
    }
  } catch (error) {
    console.error('Students API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Fetch students with pagination, search, and filters
async function handleGetStudents(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit
    
    // Search and filter parameters
    const search = searchParams.get('search') || ''
    const facultyFilter = searchParams.get('faculty')
    const departmentFilter = searchParams.get('department')
    const statusFilter = searchParams.get('status')
    const genderFilter = searchParams.get('gender')
    const religionFilter = searchParams.get('religion')

    // Build the base query with joins - only select necessary fields
    let query = supabase
      .from('students')
      .select(`
        id,
        matric_number,
        full_name,
        institutional_email,
        faculty_id,
        department_id,
        signup_status,
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
      `)

    // Apply search filter (search in name, matric number, or email)
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,matric_number.ilike.%${search}%,institutional_email.ilike.%${search}%`)
    }

    // Apply filters
    if (facultyFilter) {
      query = query.eq('faculty_id', facultyFilter)
    }
    if (departmentFilter) {
      query = query.eq('department_id', departmentFilter)
    }
    if (statusFilter) {
      query = query.eq('signup_status', statusFilter)
    }
    if (genderFilter) {
      query = query.eq('gender', genderFilter)
    }
    if (religionFilter) {
      query = query.eq('religion', religionFilter)
    }

    // Get total count for pagination (without limit/offset)
    const { count, error: countError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error getting students count:', countError)
      return NextResponse.json(
        { error: 'Failed to get students count' },
        { status: 500 }
      )
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: students, error } = await query

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error in handleGetStudents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// PUT: Update an existing student
async function handleUpdateStudent(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id')

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      matricNumber,
      fullName,
      institutionalEmail,
      facultyId,
      departmentId,
      gender,
      religion,
      signupStatus
    } = body

    // Check if student exists
    const { data: existingStudent, error: studentErr } = await supabase
      .from('students')
      .select('id, matric_number, institutional_email')
      .eq('id', studentId)
      .single()

    if (studentErr || !existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Validate fields if provided
    if (gender && !['male', 'female'].includes(gender.toLowerCase())) {
      return NextResponse.json(
        { error: 'Gender must be either "male" or "female"' },
        { status: 400 }
      )
    }

    if (religion && !['Christian', 'Muslim'].includes(religion)) {
      return NextResponse.json(
        { error: 'Religion must be either "Christian" or "Muslim"' },
        { status: 400 }
      )
    }

    if (signupStatus && !['pending', 'verified'].includes(signupStatus)) {
      return NextResponse.json(
        { error: 'Signup status must be either "pending" or "verified"' },
        { status: 400 }
      )
    }

    // Check faculty exists if updating
    if (facultyId) {
      const { data: faculty, error: facultyErr } = await supabase
        .from('faculties')
        .select('id')
        .eq('id', facultyId)
        .single()

      if (facultyErr || !faculty) {
        return NextResponse.json(
          { error: 'Faculty does not exist' },
          { status: 400 }
        )
      }
    }

    // Check department exists and belongs to faculty if updating
    if (departmentId) {
      const checkFacultyId = facultyId || existingStudent.faculty_id
      const { data: department, error: deptErr } = await supabase
        .from('departments')
        .select('id')
        .eq('id', departmentId)
        .eq('faculty_id', checkFacultyId)
        .single()

      if (deptErr || !department) {
        return NextResponse.json(
          { error: 'Department does not exist or does not belong to the specified faculty' },
          { status: 400 }
        )
      }
    }

    // Check matric number uniqueness if updating
    if (matricNumber && matricNumber !== existingStudent.matric_number) {
      const { data: duplicateMatric, error: matricErr } = await supabase
        .from('students')
        .select('id')
        .eq('matric_number', matricNumber)
        .neq('id', studentId)
        .single()

      if (duplicateMatric) {
        return NextResponse.json(
          { error: 'Student with this matric number already exists' },
          { status: 409 }
        )
      }
    }

    // Check email uniqueness if updating
    if (institutionalEmail && institutionalEmail !== existingStudent.institutional_email) {
      const { data: duplicateEmail, error: emailErr } = await supabase
        .from('students')
        .select('id')
        .eq('institutional_email', institutionalEmail)
        .neq('id', studentId)
        .single()

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Student with this email already exists' },
          { status: 409 }
        )
      }
    }

    // Build update object with only provided fields
    const updateData = {}
    if (matricNumber !== undefined) updateData.matric_number = matricNumber
    if (fullName !== undefined) updateData.full_name = fullName
    if (institutionalEmail !== undefined) updateData.institutional_email = institutionalEmail
    if (facultyId !== undefined) updateData.faculty_id = facultyId
    if (departmentId !== undefined) updateData.department_id = departmentId
    if (gender !== undefined) updateData.gender = gender ? gender.toLowerCase() : null
    if (religion !== undefined) updateData.religion = religion
    if (signupStatus !== undefined) updateData.signup_status = signupStatus
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update student
    const { data: updatedStudent, error: updateErr } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId)
      .select(`
        id,
        matric_number,
        full_name,
        institutional_email,
        faculty_id,
        department_id,
        signup_status,
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
      `)
      .single()

    if (updateErr) {
      console.error('Error updating student:', updateErr)
      return NextResponse.json(
        { error: 'Failed to update student' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Student updated successfully',
      student: updatedStudent
    }, { status: 200 })

  } catch (error) {
    console.error('Error in handleUpdateStudent:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a student
async function handleDeleteStudent(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id')

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Check if student exists
    const { data: existingStudent, error: studentErr } = await supabase
      .from('students')
      .select('id, full_name')
      .eq('id', studentId)
      .single()

    if (studentErr || !existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Delete student
    const { error: deleteErr } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)

    if (deleteErr) {
      console.error('Error deleting student:', deleteErr)
      return NextResponse.json(
        { error: 'Failed to delete student' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `${existingStudent.full_name} was successfully deleted from the students record`
    }, { status: 200 })

  } catch (error) {
    console.error('Error in handleDeleteStudent:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}