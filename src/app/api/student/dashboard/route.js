import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { unauthorized, forbidden, internalServerError } from '@/lib/api/responses'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  // Use verified user to avoid relying on cookie-only session payload
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return unauthorized()
  const role = user.user_metadata?.role
    if (!role || !['student', 'admin','superadmin'].includes(role)) return forbidden()
    // Fetch readonly dashboard profile details for the current student
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        gender,
        matric_number,
        institutional_email,
        medical_form_status,
        signup_status,
        faculties:faculty_id ( name ),
        departments:department_id ( name )
      `)
  .eq('auth_user_id', user.id)
      .single()

    if (error || !student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    if (student.signup_status !== 'verified') {
      return forbidden('Account not verified')
    }
    const payload = {
      fullName: student.full_name,
      gender: student.gender,
      matricNumber: student.matric_number,
      email: student.institutional_email,
      facultyName: student.faculties?.name || null,
      departmentName: student.departments?.name || null,
      medicalFormStatus: student.medical_form_status || { status: 'not_started', progress_percentage: 0, current_step: 0 },
    }
    return NextResponse.json({ data: payload })
  } catch (e) {
    console.error('Student dashboard API error:', e)
    return internalServerError()
  }
}
