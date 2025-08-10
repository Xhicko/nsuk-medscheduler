'use server'

import { NextResponse } from 'next/server'
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
        return await handleGetDepartments(request, supabase)
      case 'POST':
        return await handleCreateDepartment(request, supabase)
      case 'PUT':
        return await handleUpdateDepartment(request, supabase)
      case 'DELETE':
        return await handleDeleteDepartment(request, supabase)
      default:
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
    }
  } catch (error) {
    console.error('Departments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Fetch all departments with their faculties
async function handleGetDepartments(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const faculty_id = searchParams.get('faculty_id') || 'all'

    // Check if pagination is requested
    const isPaginated = searchParams.has('page') || searchParams.has('limit')

    if (isPaginated) {
      // New paginated logic for admin dashboard
      const offset = (page - 1) * limit

  // Build query for paginated results
  let query = supabase
        .from('departments')
        .select(`
          id,
          name,
          code,
          faculty_id,
          status,
          created_at,
          updated_at,
          faculties:faculty_id (
            id,
            name,
            status
          )
        `)

      // Apply search filter
      if (search.trim()) {
        const term = search.trim()
        query = query.or(`name.ilike.*${term}*,code.ilike.*${term}*`)
      }

      // Apply status filter
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      // Apply faculty filter
      if (faculty_id !== 'all') {
        query = query.eq('faculty_id', faculty_id)
      }

      // Get total count for pagination using a dedicated count query
      let countQuery = supabase
        .from('departments')
        .select('id', { count: 'exact', head: true })

      if (search.trim()) {
        const term = search.trim()
        countQuery = countQuery.or(`name.ilike.*${term}*,code.ilike.*${term}*`)
      }
      if (status !== 'all') {
        countQuery = countQuery.eq('status', status)
      }
      if (faculty_id !== 'all') {
        countQuery = countQuery.eq('faculty_id', faculty_id)
      }

      const { count: totalCount, error: countError } = await countQuery
      if (countError) {
        console.error('Error getting departments count:', countError)
      }

      // Get paginated data
      const { data: departments, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching departments:', error)
        return NextResponse.json(
          { error: 'Failed to fetch departments' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        departments: departments || [],
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount
      })

    } else {
      // Original logic for backward compatibility
      // Get all departments with their faculty names in a single query
      const { data, error } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          code,
          faculty_id,
          status,
          created_at,
          updated_at,
          faculties (
            id,
            name,
            status
          )
        `)
        .order('name')

      if (error) {
        console.error('Error fetching departments:', error)
        return NextResponse.json(
          { error: 'Failed to fetch departments' },
          { status: 500 }
        )
      }

      // Organize the data by faculties (original structure)
      const faculties = {}
      data.forEach(dept => {
        const faculty = dept.faculties
        if (!faculties[faculty.id]) {
          faculties[faculty.id] = {
            id: faculty.id,
            name: faculty.name,
            status: faculty.status,
            departments: []
          }
        }
        faculties[faculty.id].departments.push({
          id: dept.id,
          name: dept.name,
          code: dept.code,
          faculty_id: dept.faculty_id,
          status: dept.status,
          created_at: dept.created_at,
          updated_at: dept.updated_at
        })
      })

      return NextResponse.json(
        { 
          faculties: Object.values(faculties),
          departments: data 
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Error in handleGetDepartments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

// POST: Create a new department
async function handleCreateDepartment(request, supabase) {
  try {
    const body = await request.json()
    const { name, code, faculty_id, status = 'pending' } = body

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      )
    }

    if (!faculty_id) {
      return NextResponse.json(
        { error: 'Faculty selection is required' },
        { status: 400 }
      )
    }

    // Verify faculty exists and is verified
    const { data: faculty, error: facultyError } = await supabase
      .from('faculties')
      .select('id, status')
      .eq('id', faculty_id)
      .single()

    if (facultyError || !faculty) {
      return NextResponse.json(
        { error: 'Invalid faculty selected' },
        { status: 400 }
      )
    }

    if (faculty.status !== 'verified') {
      return NextResponse.json(
        { error: 'Departments can only be created under verified faculties' },
        { status: 400 }
      )
    }

    // Check for duplicate department name within the same faculty
    const { data: existingDept, error: duplicateError } = await supabase
      .from('departments')
      .select('id')
      .eq('faculty_id', faculty_id)
      .ilike('name', name.trim())
      .single()

    if (existingDept) {
      return NextResponse.json(
        { error: 'A department with this name already exists in the selected faculty' },
        { status: 400 }
      )
    }

    // Check for duplicate code if provided
    if (code?.trim()) {
      const { data: existingCode, error: codeError } = await supabase
        .from('departments')
        .select('id')
        .ilike('code', code.trim())
        .single()

      if (existingCode) {
        return NextResponse.json(
          { error: 'A department with this code already exists' },
          { status: 400 }
        )
      }
    }

    // Insert new department
    const { data: department, error } = await supabase
      .from('departments')
      .insert({
        name: name.trim(),
        code: code?.trim().toUpperCase() || null,
        faculty_id,
        status
      })
      .select(`
        id,
        name,
        code,
        faculty_id,
        status,
        created_at,
        updated_at,
        faculties:faculty_id (
          id,
          name,
          status
        )
      `)
      .single()

    if (error) {
      console.error('Error creating department:', error)
      return NextResponse.json(
        { error: 'Failed to create department' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Department created successfully',
      department
    })

  } catch (error) {
    console.error('Error in handleCreateDepartment:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}

// PUT: Update existing department
async function handleUpdateDepartment(request, supabase) {
  try {
    const body = await request.json()
    const { id, name, code, faculty_id, status } = body

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      )
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      )
    }

    if (!faculty_id) {
      return NextResponse.json(
        { error: 'Faculty selection is required' },
        { status: 400 }
      )
    }

    // Verify faculty exists and is verified
    const { data: faculty, error: facultyError } = await supabase
      .from('faculties')
      .select('id, status')
      .eq('id', faculty_id)
      .single()

    if (facultyError || !faculty) {
      return NextResponse.json(
        { error: 'Invalid faculty selected' },
        { status: 400 }
      )
    }

    if (faculty.status !== 'verified') {
      return NextResponse.json(
        { error: 'Departments can only be under verified faculties' },
        { status: 400 }
      )
    }

    // Check for duplicate department name within the same faculty (excluding current)
    const { data: existingDept, error: duplicateError } = await supabase
      .from('departments')
      .select('id')
      .eq('faculty_id', faculty_id)
      .ilike('name', name.trim())
      .neq('id', id)
      .single()

    if (existingDept) {
      return NextResponse.json(
        { error: 'A department with this name already exists in the selected faculty' },
        { status: 400 }
      )
    }

    // Check for duplicate code if provided (excluding current)
    if (code?.trim()) {
      const { data: existingCode, error: codeError } = await supabase
        .from('departments')
        .select('id')
        .ilike('code', code.trim())
        .neq('id', id)
        .single()

      if (existingCode) {
        return NextResponse.json(
          { error: 'A department with this code already exists' },
          { status: 400 }
        )
      }
    }

    // Update department
    const { data: department, error } = await supabase
      .from('departments')
      .update({
        name: name.trim(),
        code: code?.trim().toUpperCase() || null,
        faculty_id,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        name,
        code,
        faculty_id,
        status,
        created_at,
        updated_at,
        faculties:faculty_id (
          id,
          name,
          status
        )
      `)
      .single()

    if (error) {
      console.error('Error updating department:', error)
      return NextResponse.json(
        { error: 'Failed to update department' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Department updated successfully',
      department
    })

  } catch (error) {
    console.error('Error in handleUpdateDepartment:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    )
  }
}

// DELETE: Delete department (with validation)
async function handleDeleteDepartment(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      )
    }

    // Check if department exists
    const { data: existingDept, error: fetchErr } = await supabase
      .from('departments')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchErr || !existingDept) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Check if department has students (prevent deletion if it does)
    const { data: students, error: studentsErr } = await supabase
      .from('students')
      .select('id')
      .eq('department_id', id)
      .limit(1)

    if (studentsErr) {
      console.error('Error checking students:', studentsErr)
      return NextResponse.json(
        { error: 'Failed to validate department deletion' },
        { status: 500 }
      )
    }

    if (students && students.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department. Students are enrolled in this department. Please remove all students first.' },
        { status: 400 }
      )
    }

    // Delete department
    const { error: deleteErr } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (deleteErr) {
      console.error('Error deleting department:', deleteErr)
      return NextResponse.json(
        { error: 'Failed to delete department' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Department deleted successfully'
    })

  } catch (error) {
    console.error('Error in handleDeleteDepartment:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}
