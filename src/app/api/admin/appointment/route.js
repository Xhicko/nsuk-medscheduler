'use server'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

    // Auth
    const { data: { session }, error: sessErr } = await supabase.auth.getSession()
    if (sessErr || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const role = session.user?.user_metadata?.role
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    switch (method) {
      case 'GET':
        return await handleGetAppointments(request, supabase)
      case 'POST':
        // Default create stub
        return NextResponse.json({ message: 'Appointment created successfully' }, { status: 201 })
      case 'PUT':
  return await handleUpdateAppointment(request, supabase)
      case 'DELETE':
  return await handleDeleteAppointment(request, supabase)
      default:
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
    }
  } catch (error) {
    console.error('Appointments API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Fetch appointments with pagination, search, and filters
async function handleGetAppointments(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    // Filters
    const search = searchParams.get('search') || ''
    const studentId = searchParams.get('student_id')
    const facultyFilter = searchParams.get('faculty')
    const departmentFilter = searchParams.get('department')
    const statusFilter = searchParams.get('status') // optional: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'missed'

    const needsStudentJoin = Boolean(
      (facultyFilter && facultyFilter !== 'all') ||
      (departmentFilter && departmentFilter !== 'all') ||
      search
    )

    // Base filtered query for data
    let baseFilteredQuery = supabase.from('appointments')
    baseFilteredQuery = baseFilteredQuery.select('*, students' + (needsStudentJoin ? '!inner' : '') + '(*)')

    if (studentId) {
      baseFilteredQuery = baseFilteredQuery.eq('student_id', studentId)
    }
    if (statusFilter && statusFilter !== 'all') {
      baseFilteredQuery = baseFilteredQuery.eq('status', statusFilter)
    }
    if (facultyFilter && facultyFilter !== 'all') {
      baseFilteredQuery = baseFilteredQuery.eq('students.faculty_id', facultyFilter)
    }
    if (departmentFilter && departmentFilter !== 'all') {
      baseFilteredQuery = baseFilteredQuery.eq('students.department_id', departmentFilter)
    }
    if (search) {
      const term = String(search).trim()
      if (term) {
        baseFilteredQuery = baseFilteredQuery.or(
          `full_name.ilike.*${term}*,matric_number.ilike.*${term}*`,
          { foreignTable: 'students' }
        )
      }
    }

    // Count query mirrors filters (with inner join when needed)
    let countSelect = 'id'
    if (needsStudentJoin) countSelect = 'id, students!inner(id)'

    let countQuery = supabase.from('appointments').select(countSelect, { count: 'exact', head: true })
    if (studentId) countQuery = countQuery.eq('student_id', studentId)
    if (statusFilter && statusFilter !== 'all') countQuery = countQuery.eq('status', statusFilter)
    if (facultyFilter && facultyFilter !== 'all') countQuery = countQuery.eq('students.faculty_id', facultyFilter)
    if (departmentFilter && departmentFilter !== 'all') countQuery = countQuery.eq('students.department_id', departmentFilter)
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
      console.error('Error getting appointments count:', countError)
    }

    // Data query selection with nested student + faculty/department
    const dataQuery = baseFilteredQuery
      .select(`
        id,
        student_id,
        status,
        time_range,
        created_by,
        completed_at,
        created_at,
        updated_at,
        students${needsStudentJoin ? '!inner' : ''} (
          id,
          matric_number,
          full_name,
          institutional_email,
          faculty_id,
          department_id,
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: appointments, error } = await dataQuery
    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // Status counts (pending and scheduled) with same filters/search and proper join
    const buildCountQueryForStatus = (statusValue) => {
      let selectColumns = 'id'
      if (needsStudentJoin) selectColumns = 'id, students!inner(id)'
      let countQuery = supabase.from('appointments').select(selectColumns, { count: 'exact', head: true })
      if (studentId) countQuery = countQuery.eq('student_id', studentId)
      if (statusValue && statusValue !== 'all') countQuery = countQuery.eq('status', statusValue)
      if (facultyFilter && facultyFilter !== 'all') countQuery = countQuery.eq('students.faculty_id', facultyFilter)
      if (departmentFilter && departmentFilter !== 'all') countQuery = countQuery.eq('students.department_id', departmentFilter)
      if (search) {
        const term = String(search).trim()
        if (term) {
          countQuery = countQuery.or(
            `full_name.ilike.*${term}*,matric_number.ilike.*${term}*`,
            { foreignTable: 'students' }
          )
        }
      }
      return countQuery
    }

    const [{ count: pendingTotal }, { count: scheduledTotal }] = await Promise.all([
      buildCountQueryForStatus('pending'),
      buildCountQueryForStatus('scheduled'),
    ])

    return NextResponse.json(
      {
        appointments,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        counts: {
          pending: pendingTotal || 0,
          scheduled: scheduledTotal || 0,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in handleGetAppointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

// DELETE: Delete an appointment only if it's pending
async function handleDeleteAppointment(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointment_id') || searchParams.get('id')
    if (!appointmentId) {
      return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 })
    }

    // Ensure appointment exists and is pending
    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', appointmentId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    if (String(existing.status).toLowerCase() !== 'pending') {
      return NextResponse.json({ error: 'Only pending appointments can be deleted' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Appointment deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error in handleDeleteAppointment:', error)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}

// PUT: Update an appointment (schedule/edit time_range & status)
async function handleUpdateAppointment(request, supabase) {
  try {
    const body = await request.json()
    const appointmentId = body?.appointment_id || body?.appointmentId || body?.id
    const timeRange = body?.time_range || body?.timeRange
    const status = body?.status || 'scheduled'

    if (!appointmentId || !timeRange) {
      return NextResponse.json({ error: 'appointment_id and time_range are required' }, { status: 400 })
    }

    const updatePayload = {
      time_range: timeRange,
      status,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', appointmentId)
      .select(`
        id,
        student_id,
        status,
        time_range,
        completed_at,
        created_at,
        updated_at,
        students (
          id,
          matric_number,
          full_name,
          faculties ( id, name ),
          departments ( id, name )
        )
      `)
      .single()

    if (error) {
      // Likely conflict due to exclusion constraint (overlapping ranges)
      const statusCode = (error.code === '23505' || String(error.message || '').toLowerCase().includes('conflict')) ? 409 : 500
      return NextResponse.json({ error: error.message || 'Failed to update appointment' }, { status: statusCode })
    }

    if (!data) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json({ appointment: data, message: 'Appointment updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error in handleUpdateAppointment:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}
