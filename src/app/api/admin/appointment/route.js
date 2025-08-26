'use server'

import { NextResponse } from 'next/server'
import { unauthorized, forbidden, methodNotAllowed, internalServerError } from '@/lib/api/responses'
import { sendScheduleAppointment, sendAppointmentReverted, sendAppointmentMissed, sendAppointmentRescheduled } from '@/lib/email'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {createSmartNotification}from '@lib/notificationHelpers'

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
  if (sessErr || !session) return unauthorized()

    const role = session.user?.user_metadata?.role
  if (role !== 'admin' && role !== 'superadmin') return forbidden()

  switch (method) {
      case 'GET':
        return await handleGetAppointments(request, supabase)
      case 'POST':
    if (role !== 'superadmin') return forbidden()
    return await handleCompleteAppointment(request, supabase)
      case 'PUT':
    if (role !== 'superadmin') return forbidden()
    return await handleUpdateAppointment(request, supabase)
      case 'DELETE':
    if (role !== 'superadmin') return forbidden()
    return await handleDeleteAppointment(request, supabase)
      default:
        return methodNotAllowed()
    }
  } catch (error) {
    console.error('Appointments API error:', error)
    return internalServerError()
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

// PUT: Update an appointment (schedule/edit time_range & status pending|scheduled|missed)
async function handleUpdateAppointment(request, supabase) {
  try {
    const body = await request.json()
    const appointmentId = body?.appointment_id || body?.appointmentId || body?.id
    const timeRange = body?.time_range ?? body?.timeRange ?? null
    const status = body?.status || 'scheduled'

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 })
    }

  const allowedStatuses = ['pending', 'scheduled', 'missed']
    if (!allowedStatuses.includes(status)) {
      if (status === 'completed') {
        return NextResponse.json({ error: 'Use POST to complete an appointment' }, { status: 405 })
      }
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Fetch existing to preserve fields when needed (e.g., completed without providing time_range)
    const { data: existing, error: existingErr } = await supabase
      .from('appointments')
      .select('id, status, time_range')
      .eq('id', appointmentId)
      .single()
    if (existingErr) {
      return NextResponse.json({ error: 'Failed to load appointment' }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

   // Store previous values for notification logic
   const previousStatus = existing.status;
   const previousTimeRange = existing.time_range;
   const nowISO = new Date().toISOString()

    const updatePayload = {
      // If undoing to pending, clear time_range; if marking missed, keep existing time_range unless a new one is provided
      time_range: status === 'pending' ? null : (status === 'missed' ? (timeRange ?? existing.time_range) : timeRange),
      status,
      updated_at: nowISO,
      completed_at: null,
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
          institutional_email,
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

     // Create smart notification based on status change
    try {
      await createSmartNotification(supabase, {
        studentId: data.student_id,
        appointmentId: data.id,
        newStatus: updatePayload.status,
        previousStatus: previousStatus,
        newTimeRange: updatePayload.time_range,
        previousTimeRange: previousTimeRange
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the entire request if notification creation fails
    }

  // Fire-and-forget email notification only when scheduling
    if (updatePayload.status === 'scheduled' && updatePayload.time_range) {
      try {
        const student = data?.students
        const to = student?.institutional_email
        const systemName = process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler'

        // time_range is a tsrange string: [start,end)
        let startISO = null
        let endISO = null
        const rawRange = data?.time_range
        if (typeof rawRange === 'string') {
          const parts = rawRange.replace(/^[\[(]/, '').replace(/[\])]/, '').split(',')
          if (parts.length === 2) {
            startISO = parts[0]?.replace(/\"/g, '').trim()
            endISO = parts[1]?.replace(/\"/g, '').trim()
          }
        } else if (rawRange && typeof rawRange === 'object' && rawRange.lower && rawRange.upper) {
          startISO = rawRange.lower
          endISO = rawRange.upper
        }

        const startDate = startISO ? new Date(startISO) : null
        const endDate = endISO ? new Date(endISO) : null
        const startStr = startDate ? `${startDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''
        const endStr = endDate ? `${endDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''

        if (to && startStr && endStr) {
          await sendScheduleAppointment({
            to,
            systemName,
            studentName: student?.full_name,
            matricNumber: student?.matric_number,
            start: startStr,
            end: endStr,
          })
        }
      } catch (notifyError) {
        console.error('Failed to send schedule email:', notifyError)
      }
    }

  // If we reverted to pending, notify the student that the appointment was undone
    if (updatePayload.status === 'pending') {
      try {
        const student = data?.students
        const to = student?.institutional_email
        const systemName = process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler'
        if (to) {
          await sendAppointmentReverted({
            to,
            systemName,
            studentName: student?.full_name,
            matricNumber: student?.matric_number,
            note: 'Your appointment has been reverted to pending. You will receive a new schedule soon.',
          })
        }
      } catch (notifyError) {
        console.error('Failed to send appointment reverted email:', notifyError)
      }
    }

  // If marked as missed, notify the student
    if (updatePayload.status === 'missed') {
      try {
        const student = data?.students
        const to = student?.institutional_email
        const systemName = process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler'

        // Extract start/end from possibly string or object tsrange
        let startISO = null
        let endISO = null
        const rawRange = data?.time_range || existing?.time_range
        if (typeof rawRange === 'string') {
          const parts = rawRange.replace(/^[\[(]/, '').replace(/[\])]/, '').split(',')
          if (parts.length === 2) {
            startISO = parts[0]?.replace(/\"/g, '').trim()
            endISO = parts[1]?.replace(/\"/g, '').trim()
          }
        } else if (rawRange && typeof rawRange === 'object' && rawRange.lower && rawRange.upper) {
          startISO = rawRange.lower
          endISO = rawRange.upper
        }

        const startDate = startISO ? new Date(startISO) : null
        const endDate = endISO ? new Date(endISO) : null
        const startStr = startDate ? `${startDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''
        const endStr = endDate ? `${endDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''

        if (to) {
          await sendAppointmentMissed({
            to,
            systemName,
            studentName: student?.full_name,
            matricNumber: student?.matric_number,
            start: startStr,
            end: endStr,
            note: 'Our records show you missed your scheduled medical appointment.',
          })
        }
      } catch (notifyError) {
        console.error('Failed to send appointment missed email:', notifyError)
      }
    }

    // If we are still scheduled and updated time_range (reschedule), notify student with new time
    if (updatePayload.status === 'scheduled' && updatePayload.time_range) {
      try {
        const student = data?.students
        const to = student?.institutional_email
        const systemName = process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler'

        let startISO = null
        let endISO = null
        const rawRange = data?.time_range
        if (typeof rawRange === 'string') {
          const parts = rawRange.replace(/^[\[(]/, '').replace(/[\])]/, '').split(',')
          if (parts.length === 2) {
            startISO = parts[0]?.replace(/\"/g, '').trim()
            endISO = parts[1]?.replace(/\"/g, '').trim()
          }
        } else if (rawRange && typeof rawRange === 'object' && rawRange.lower && rawRange.upper) {
          startISO = rawRange.lower
          endISO = rawRange.upper
        }

        const startDate = startISO ? new Date(startISO) : null
        const endDate = endISO ? new Date(endISO) : null
        const startStr = startDate ? `${startDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''
        const endStr = endDate ? `${endDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''

        if (to && startStr && endStr) {
          await sendAppointmentRescheduled({
            to,
            systemName,
            studentName: student?.full_name,
            matricNumber: student?.matric_number,
            start: startStr,
            end: endStr,
          })
        }
      } catch (notifyError) {
        console.error('Failed to send appointment rescheduled email:', notifyError)
      }
    }

    // If we reverted to pending, notify the student that the appointment was undone
    if (updatePayload.status === 'pending') {
      try {
        const student = data?.students
        const to = student?.institutional_email
        const systemName = process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler'
        if (to) {
          await sendAppointmentReverted({
            to,
            systemName,
            studentName: student?.full_name,
            matricNumber: student?.matric_number,
            note: 'Your appointment has been reverted to pending. You will receive a new schedule soon.',
          })
        }
      } catch (notifyError) {
        console.error('Failed to send appointment reverted email:', notifyError)
      }
    }

    return NextResponse.json({ appointment: data, message: 'Appointment updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error in handleUpdateAppointment:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

// POST: Complete an appointment -> create result_notifications row and mark appointment completed
async function handleCompleteAppointment(request, supabase) {
  try {
    const body = await request.json()
    const appointmentId = body?.appointment_id || body?.appointmentId || body?.id
    if (!appointmentId) {
      return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 })
    }

    // Load appointment and student details
    const { data: appt, error: fetchErr } = await supabase
      .from('appointments')
      .select(`
        id,
        student_id,
        status,
        time_range,
        completed_at,
        students (
          id,
          full_name,
          matric_number
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (fetchErr) {
      return NextResponse.json({ error: 'Failed to load appointment' }, { status: 500 })
    }
    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Only scheduled appointments can be completed and must have time_range
    if (String(appt.status).toLowerCase() !== 'scheduled') {
      return NextResponse.json({ error: 'Only scheduled appointments can be completed' }, { status: 400 })
    }
    if (!appt.time_range) {
      return NextResponse.json({ error: 'Cannot complete an appointment without a scheduled time' }, { status: 400 })
    }

    // Ensure student_id not already in result_notifications
    const { count: existsCount, error: existsErr } = await supabase
      .from('result_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', appt.student_id)

    if (existsErr) {
      return NextResponse.json({ error: 'Failed to validate existing notification' }, { status: 500 })
    }
    if ((existsCount || 0) > 0) {
      return NextResponse.json({ error: 'A notification already exists for this student' }, { status: 409 })
    }

    const nowISO = new Date().toISOString()

    // Insert notification row
    const insertPayload = {
      appointment_id: appt.id,
      student_id: appt.student_id,
      notified: false,
      result_ready: true,
      student_name: appt?.students?.full_name || null,
      matric_number: appt?.students?.matric_number || null,
      appointment_done_at: nowISO,
      created_at: nowISO,
      updated_at: nowISO,
    }

    const { data: notification, error: insertErr } = await supabase
      .from('result_notifications')
      .insert(insertPayload)
      .select('*')
      .single()

    if (insertErr) {
      // 23505 unique_violation possibly on appointment_id
      const status = insertErr.code === '23505' ? 409 : 500
      return NextResponse.json({ error: insertErr.message || 'Failed to create notification' }, { status })
    }

    // Mark appointment completed (do not delete due to FK constraint)
    const { data: updatedAppt, error: updateErr } = await supabase
      .from('appointments')
      .update({ status: 'completed', completed_at: nowISO, updated_at: nowISO })
      .eq('id', appt.id)
      .select('id, status, completed_at')
      .single()

    if (updateErr) {
      // If this fails, we still created a notification; log and return partial success
      console.error('Failed to mark appointment completed:', updateErr)
    }

    return NextResponse.json({
      message: 'Appointment completed and notification created',
      notification,
      appointment: updatedAppt || { id: appt.id, status: 'completed', completed_at: nowISO },
    }, { status: 201 })

  } catch (error) {
    console.error('Error in handleCompleteAppointment:', error)
    return NextResponse.json({ error: 'Failed to complete appointment' }, { status: 500 })
  }
}
