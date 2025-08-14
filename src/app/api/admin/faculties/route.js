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
        return await handleGetFaculties(request, supabase)
      case 'POST':
    if (role !== 'superadmin') return forbidden()
        return await handleCreateFaculty(request, supabase)
      case 'PUT':
    if (role !== 'superadmin') return forbidden()
        return await handleUpdateFaculty(request, supabase)
      case 'DELETE':
    if (role !== 'superadmin') return forbidden()
        return await handleDeleteFaculty(request, supabase)
      default:
        return methodNotAllowed()
    }
  } catch (error) {
    console.error('Faculties API error:', error)
    return internalServerError()
  }
}

// GET: Fetch all faculties
async function handleGetFaculties(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 0 // 0 means no pagination
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const isPaginated = limit > 0

    let baseQuery = supabase
      .from('faculties')
      .select('id, name, code, status, created_at, updated_at')

    if (search.trim()) {
      const term = search.trim()
      baseQuery = baseQuery.or(`name.ilike.*${term}*,code.ilike.*${term}*`)
    }
    if (status !== 'all') {
      baseQuery = baseQuery.eq('status', status)
    }

    if (!isPaginated) {
      const { data: faculties, error } = await baseQuery.order('name')
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
    }

    // Count query
    let countQuery = supabase
      .from('faculties')
      .select('id', { count: 'exact', head: true })
    if (search.trim()) {
      const term = search.trim()
      countQuery = countQuery.or(`name.ilike.*${term}*,code.ilike.*${term}*`)
    }
    if (status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }
    const { count, error: countError } = await countQuery
    if (countError) {
      console.error('Error getting faculties count:', countError)
    }

    const offset = (page - 1) * limit
    const { data: faculties, error } = await baseQuery
      .order('name')
      .range(offset, offset + limit - 1)
    if (error) {
      console.error('Error fetching faculties:', error)
      return NextResponse.json(
        { error: 'Failed to fetch faculties' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    return NextResponse.json(
      { faculties, pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 } },
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
    const { id, name, code, status } = await request.json()

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
      .select('id, name, code, status')
      .eq('id', id)
      .single()

    if (fetchErr || !existingFaculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Business logic for verified faculties
    if (existingFaculty.status === 'verified') {
      // For verified faculties, only allow status changes to pending
      // and prevent name/code changes unless status is being changed to pending
      if (status !== 'pending') {
        // If status is not being changed to pending, don't allow name/code changes
        if (name !== existingFaculty.name || code !== existingFaculty.code) {
          return NextResponse.json(
            { error: 'Verified faculties can only have their status changed to pending. Name and code changes require pending status.' },
            { status: 403 }
          )
        }
      }
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
    const updateData = { 
      name, 
      code, 
      updated_at: new Date() 
    }
    
    // Include status in update if provided
    if (status) {
      updateData.status = status
    }

    const { data: updatedFaculty, error: updateErr } = await supabase
      .from('faculties')
      .update(updateData)
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
      .select('id, name, status')
      .eq('id', id)
      .single()

    if (fetchErr || !existingFaculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Check if faculty is verified (cannot be deleted)
    if (existingFaculty.status === 'verified') {
      return NextResponse.json(
        { error: 'Verified faculties cannot be deleted' },
        { status: 403 }
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
