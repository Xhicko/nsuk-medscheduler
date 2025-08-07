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
    // Get all departments with their faculty names in a single query
    const { data, error } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        code,
        faculty_id,
        created_at,
        updated_at,
        faculties (
          id,
          name
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

    // Organize the data by faculties
    const faculties = {}
    data.forEach(dept => {
      const faculty = dept.faculties
      if (!faculties[faculty.id]) {
        faculties[faculty.id] = {
          id: faculty.id,
          name: faculty.name,
          departments: []
        }
      }
      faculties[faculty.id].departments.push({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        faculty_id: dept.faculty_id,
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
    const { name, code, facultyId } = body

    // Validate required fields
    if (!name || !facultyId) {
      return NextResponse.json(
        { error: 'Missing required fields: name and facultyId' },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Department name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Check if faculty exists
    const { data: faculty, error: facultyErr } = await supabase
      .from('faculties')
      .select('id, name')
      .eq('id', facultyId)
      .single()

    if (facultyErr || !faculty) {
      return NextResponse.json(
        { error: 'Faculty does not exist' },
        { status: 400 }
      )
    }

    // Check if department name already exists in this faculty (unique constraint)
    const { data: existingDept, error: existErr } = await supabase
      .from('departments')
      .select('id')
      .eq('faculty_id', facultyId)
      .eq('name', name.trim())
      .single()

    if (existingDept) {
      return NextResponse.json(
        { error: 'Department with this name already exists in the selected faculty' },
        { status: 409 }
      )
    }

    // Check if code already exists in this faculty (if provided)
    if (code && code.trim()) {
      const { data: existingCode, error: codeErr } = await supabase
        .from('departments')
        .select('id')
        .eq('faculty_id', facultyId)
        .eq('code', code.trim().toUpperCase())
        .single()

      if (existingCode) {
        return NextResponse.json(
          { error: 'Department with this code already exists in the selected faculty' },
          { status: 409 }
        )
      }
    }

    // Insert new department
    const { data: newDepartment, error: insertErr } = await supabase
      .from('departments')
      .insert({
        name: name.trim(),
        code: code ? code.trim().toUpperCase() : null,
        faculty_id: facultyId
      })
      .select(`
        id,
        name,
        code,
        faculty_id,
        created_at,
        updated_at,
        faculties (
          id,
          name
        )
      `)
      .single()

    if (insertErr) {
      console.error('Error creating department:', insertErr)
      return NextResponse.json(
        { error: 'Failed to create department' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Department "${newDepartment.name}" created successfully in ${newDepartment.faculties.name}`,
      department: newDepartment
    }, { status: 201 })

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
    const { id, name, code, faculty_id } = await request.json()

    // Validation
    if (!id || !name || !faculty_id) {
      return NextResponse.json(
        { error: 'Department ID, name, and faculty ID are required' },
        { status: 400 }
      )
    }

    // Check if department exists
    const { data: existingDept, error: fetchErr } = await supabase
      .from('departments')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchErr || !existingDept) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Check if faculty exists
    const { data: faculty, error: facultyErr } = await supabase
      .from('faculties')
      .select('id, name')
      .eq('id', faculty_id)
      .single()

    if (facultyErr || !faculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Check if new name conflicts with other departments in the same faculty
    const { data: nameConflict, error: nameErr } = await supabase
      .from('departments')
      .select('id')
      .eq('name', name)
      .eq('faculty_id', faculty_id)
      .neq('id', id)
      .single()

    if (nameConflict) {
      return NextResponse.json(
        { error: 'Department name already exists in this faculty' },
        { status: 409 }
      )
    }

    // Update department
    const { data: updatedDept, error: updateErr } = await supabase
      .from('departments')
      .update({ 
        name, 
        code: code || null, 
        faculty_id, 
        updated_at: new Date() 
      })
      .eq('id', id)
      .select(`
        id,
        name,
        code,
        faculty_id,
        created_at,
        updated_at,
        faculties (
          id,
          name
        )
      `)
      .single()

    if (updateErr) {
      console.error('Error updating department:', updateErr)
      return NextResponse.json(
        { error: 'Failed to update department' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Department "${updatedDept.name}" updated successfully`,
      department: updatedDept
    }, { status: 200 })

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
        { error: 'Cannot delete department that has students. Please reassign or remove students first.' },
        { status: 409 }
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
      message: `Department "${existingDept.name}" deleted successfully`
    }, { status: 200 })

  } catch (error) {
    console.error('Error in handleDeleteDepartment:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}
