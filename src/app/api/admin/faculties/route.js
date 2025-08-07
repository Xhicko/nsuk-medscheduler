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
        return await handleGetFaculties(request, supabase)
      case 'POST':
        return await handleCreateFaculty(request, supabase)
      case 'PUT':
        return await handleUpdateFaculty(request, supabase)
      case 'DELETE':
        return await handleDeleteFaculty(request, supabase)
      default:
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
    }
  } catch (error) {
    console.error('Faculties API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Fetch all faculties
async function handleGetFaculties(request, supabase) {
  try {
    const { data: faculties, error } = await supabase
      .from('faculties')
      .select('id, name, code, created_at, updated_at')
      .order('name')

    if (error) {
      console.error('Error fetching faculties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch faculties' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { faculties },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in handleGetFaculties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculties' },
      { status: 500 }
    )
  }
}

// POST: Create new faculty
async function handleCreateFaculty(request, supabase) {
  try {
    const { name, code } = await request.json()

    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Faculty name and code are required' },
        { status: 400 }
      )
    }

    // Check if faculty name already exists
    const { data: existingName, error: nameErr } = await supabase
      .from('faculties')
      .select('id')
      .eq('name', name)
      .single()

    if (existingName) {
      return NextResponse.json(
        { error: 'Faculty name already exists' },
        { status: 409 }
      )
    }

    // Check if faculty code already exists
    const { data: existingCode, error: codeErr } = await supabase
      .from('faculties')
      .select('id')
      .eq('code', code)
      .single()

    if (existingCode) {
      return NextResponse.json(
        { error: 'Faculty code already exists' },
        { status: 409 }
      )
    }

    // Create new faculty
    const { data: newFaculty, error: insertErr } = await supabase
      .from('faculties')
      .insert({ name, code })
      .select()
      .single()

    if (insertErr) {
      console.error('Error creating faculty:', insertErr)
      return NextResponse.json(
        { error: 'Failed to create faculty' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Faculty created successfully',
        faculty: newFaculty
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in handleCreateFaculty:', error)
    return NextResponse.json(
      { error: 'Failed to create faculty' },
      { status: 500 }
    )
  }
}

// PUT: Update existing faculty
async function handleUpdateFaculty(request, supabase) {
  try {
    const { id, name, code } = await request.json()

    // Validation
    if (!id || !name || !code) {
      return NextResponse.json(
        { error: 'Faculty ID, name, and code are required' },
        { status: 400 }
      )
    }

    // Check if faculty exists
    const { data: existingFaculty, error: fetchErr } = await supabase
      .from('faculties')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchErr || !existingFaculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Check if new name conflicts with other faculties
    const { data: nameConflict, error: nameErr } = await supabase
      .from('faculties')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .single()

    if (nameConflict) {
      return NextResponse.json(
        { error: 'Faculty name already exists' },
        { status: 409 }
      )
    }

    // Check if new code conflicts with other faculties
    const { data: codeConflict, error: codeErr } = await supabase
      .from('faculties')
      .select('id')
      .eq('code', code)
      .neq('id', id)
      .single()

    if (codeConflict) {
      return NextResponse.json(
        { error: 'Faculty code already exists' },
        { status: 409 }
      )
    }

    // Update faculty
    const { data: updatedFaculty, error: updateErr } = await supabase
      .from('faculties')
      .update({ name, code, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      console.error('Error updating faculty:', updateErr)
      return NextResponse.json(
        { error: 'Failed to update faculty' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Faculty updated successfully',
        faculty: updatedFaculty
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in handleUpdateFaculty:', error)
    return NextResponse.json(
      { error: 'Failed to update faculty' },
      { status: 500 }
    )
  }
}

// DELETE: Delete faculty (with validation)
async function handleDeleteFaculty(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Faculty ID is required' },
        { status: 400 }
      )
    }

    // Check if faculty exists
    const { data: existingFaculty, error: fetchErr } = await supabase
      .from('faculties')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchErr || !existingFaculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Check if faculty has departments (prevent deletion if it does)
    const { data: departments, error: deptErr } = await supabase
      .from('departments')
      .select('id')
      .eq('faculty_id', id)
      .limit(1)

    if (deptErr) {
      console.error('Error checking departments:', deptErr)
      return NextResponse.json(
        { error: 'Failed to validate faculty deletion' },
        { status: 500 }
      )
    }

    if (departments && departments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete faculty that has departments. Please delete all departments first.' },
        { status: 409 }
      )
    }

    // Delete faculty
    const { error: deleteErr } = await supabase
      .from('faculties')
      .delete()
      .eq('id', id)

    if (deleteErr) {
      console.error('Error deleting faculty:', deleteErr)
      return NextResponse.json(
        { error: 'Failed to delete faculty' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: `Faculty "${existingFaculty.name}" deleted successfully`
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in handleDeleteFaculty:', error)
    return NextResponse.json(
      { error: 'Failed to delete faculty' },
      { status: 500 }
    )
  }
}
