import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const body = await request.json()
    const matric_number = String(body?.matric_number || '').trim()
    const password = String(body?.password || '').trim()

    if (!matric_number || !password) {
      return NextResponse.json({ error: 'Matric number and password are required' }, { status: 400 })
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    // 1) Find student by matric number
    const { data: student, error: studentErr } = await admin
      .from('students')
      .select('id, matric_number, institutional_email, signup_status, auth_user_id')
      .eq('matric_number', matric_number)
      .single()

    if (studentErr || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // 2) Already verified?
    if (student.signup_status === 'verified') {
      return NextResponse.json({ error: 'Account is already verified. You can login.' }, { status: 409 })
    }

    // 3) Create auth user for the student using institutional email
    const email = (student.institutional_email || '').trim()
    if (!email) {
      return NextResponse.json({ error: 'Student record has no institutional email' }, { status: 400 })
    }

    // If an auth user already exists/linked, prevent duplicate
    if (student.auth_user_id) {
      return NextResponse.json({ error: 'Account already linked. Contact support.' }, { status: 409 })
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'student' },
    })

    if (createErr) {
      // Email may already exist in auth
      const msg = createErr?.message || 'Failed to create account'
      const status = /already|exists/i.test(msg) ? 409 : 500
      return NextResponse.json({ error: msg }, { status })
    }

    const authUserId = created?.user?.id
    if (!authUserId) {
      return NextResponse.json({ error: 'Auth user creation returned no id' }, { status: 500 })
    }

    // 5) Mark student as verified and link auth user
    const { error: updErr } = await admin
      .from('students')
      .update({ signup_status: 'verified', auth_user_id: authUserId, updated_at: new Date().toISOString() })
      .eq('id', student.id)

    if (updErr) {
      console.log('Failed to update student after creating auth user:', updErr)
      return NextResponse.json({ error: 'Failed to update student verification' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Verification successful. You can login now.' }, { status: 200 })
  } catch (e) {
    console.error('Student verify error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
