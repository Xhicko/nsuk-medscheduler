import { NextResponse } from 'next/server'
import { unauthorized, forbidden, methodNotAllowed, internalServerError } from '@/lib/api/responses'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendResultReady } from '@/lib/email'

export async function GET(request) { return handleRequest(request, 'GET') }
export async function POST(request) { return handleRequest(request, 'POST') }
export async function PUT(request) { return handleRequest(request, 'PUT') }
export async function DELETE(request) { return handleRequest(request, 'DELETE') }

async function handleRequest(request, method) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Auth
    const { data: { session }, error: sessErr } = await supabase.auth.getSession()
    if (sessErr || !session) return unauthorized()
    const role = session.user?.user_metadata?.role
    if (role !== 'admin' && role !== 'superadmin') return forbidden()

    switch (method) {
      case 'GET':
        return await handleGetResults(request, supabase)
      case 'POST':
        if (role !== 'superadmin') return forbidden()
        return await handleNotifyStudent(request, supabase)
      case 'PUT':
        if (role !== 'superadmin') return forbidden()
        return await handleUpdateResult(request, supabase)
      case 'DELETE':
        if (role !== 'superadmin') return forbidden()
        return await handleDeleteResult(request, supabase)
      default:
        return methodNotAllowed()
    }
  } catch (error) {
    console.error('Error in students_results route:', error)
    return internalServerError()
  }
}
// GET: Fetch results notifications with pagination and filters
async function handleGetResults(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    const search = searchParams.get('search') || ''
    const facultyFilter = searchParams.get('faculty')
    const departmentFilter = searchParams.get('department')
    const statusFilter = searchParams.get('status') // 'ready' | 'notified' | 'all'

    const needsStudentJoin = Boolean(
      (facultyFilter && facultyFilter !== 'all') ||
      (departmentFilter && departmentFilter !== 'all') ||
      search
    )

    let baseQuery = supabase.from('result_notifications')
    baseQuery = baseQuery.select('*, students' + (needsStudentJoin ? '!inner' : '') + '(*)')

    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'ready') {
        baseQuery = baseQuery.eq('result_ready', true).eq('notified', false)
      } else if (statusFilter === 'notified') {
        baseQuery = baseQuery.eq('notified', true)
      }
    }
    if (facultyFilter && facultyFilter !== 'all') {
      baseQuery = baseQuery.eq('students.faculty_id', facultyFilter)
    }
    if (departmentFilter && departmentFilter !== 'all') {
      baseQuery = baseQuery.eq('students.department_id', departmentFilter)
    }
    if (search) {
      const term = String(search).trim()
      if (term) {
        baseQuery = baseQuery.or(
          `full_name.ilike.*${term}*,matric_number.ilike.*${term}*`,
          { foreignTable: 'students' }
        )
      }
    }

    // Count mirrors filters
    let countSelect = 'id'
    if (needsStudentJoin) countSelect = 'id, students!inner(id)'
    let countQuery = supabase.from('result_notifications').select(countSelect, { count: 'exact', head: true })
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'ready') {
        countQuery = countQuery.eq('result_ready', true).eq('notified', false)
      } else if (statusFilter === 'notified') {
        countQuery = countQuery.eq('notified', true)
      }
    }
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
    if (countError) console.error('Error getting results count:', countError)

    const dataQuery = baseQuery
      .select(`
        id,
        student_id,
        appointment_id,
        result_ready,
        notified,
        appointment_done_at,
        notified_at,
        created_at,
        updated_at,
        students${needsStudentJoin ? '!inner' : ''} (
          id,
          matric_number,
          full_name,
          institutional_email,
          faculty_id,
          department_id,
          faculties ( id, name ),
          departments ( id, name )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: results, error } = await dataQuery
    if (error) {
      console.error('Error fetching results:', error)
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }

    // Status counts
    const [{ count: readyTotal }, { count: notifiedTotal }] = await Promise.all([
      supabase
        .from('result_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('result_ready', true)
        .eq('notified', false),
      supabase
        .from('result_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('notified', true),
    ])

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      counts: {
        ready: readyTotal || 0,
        notified: notifiedTotal || 0,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Error in handleGetResults:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

// POST: Notify a student (set notified=true, notified_at=now)
async function handleNotifyStudent(request, supabase) {
  try {
    const body = await request.json()
    const id = body?.id
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    // Load target
    const { data: existing, error: fetchErr } = await supabase
      .from('result_notifications')
      .select('id, notified, student_id, students ( institutional_email, full_name, matric_number )')
      .eq('id', id)
      .single()
    if (fetchErr || !existing) return NextResponse.json({ error: 'Notification not found' }, { status: 404 })

    if (existing.notified) {
      return NextResponse.json({ message: 'Already notified' }, { status: 200 })
    }

    const nowISO = new Date().toISOString()

    const { data, error } = await supabase
      .from('result_notifications')
      .update({ notified: true, notified_at: nowISO, updated_at: nowISO })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })

    // Send Result Ready email (HTML + text)
    try {
      const to = existing?.students?.institutional_email
      const name = existing?.students?.full_name
    if (to) {
        await sendResultReady({
          to,
          systemName: process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler',
          studentName: name,
          matricNumber: existing?.students?.matric_number || undefined,
        })
      }
    } catch (e) {
      console.error('Failed to send result email:', e)
    }

    return NextResponse.json({ message: 'Student notified successfully', notification: data }, { status: 201 })
  } catch (error) {
    console.error('Error in handleNotifyStudent:', error)
    return NextResponse.json({ error: 'Failed to notify student' }, { status: 500 })
  }
}

// PUT: Revert notified -> ready or update flags
async function handleUpdateResult(request, supabase) {
  try {
    const body = await request.json()
    const id = body?.id
    const status = body?.status
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const updateData = { updated_at: new Date().toISOString() }
    if (status === 'ready') {
      updateData.notified = false
      updateData.notified_at = null
    }

    const { data, error } = await supabase
      .from('result_notifications')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

    return NextResponse.json({ message: 'Result updated successfully', notification: data }, { status: 200 })
  } catch (error) {
    console.error('Error in handleUpdateResult:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE: Delete a notification row
async function handleDeleteResult(request, supabase) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { error } = await supabase
      .from('result_notifications')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

    return NextResponse.json({ message: 'Notification deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error in handleDeleteResult:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
