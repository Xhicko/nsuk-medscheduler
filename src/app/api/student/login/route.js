import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// POST /api/student/login
// Body: { matric_number: string, password: string }
export async function POST(request) {
	const cookieStore = await cookies()
	const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

	try {
		const { matric_number, password } = await request.json()

		// Basic type checks
		if (typeof matric_number !== 'string' || typeof password !== 'string') {
			return NextResponse.json({ error: 'Invalid input types.' }, { status: 400 })
		}

		const cleanMatric = matric_number.trim()
		const cleanPassword = password.trim()

		if (!cleanMatric || !cleanPassword) {
			return NextResponse.json(
				{ error: 'Matric number and password are required.' },
				{ status: 400 }
			)
		}

		// Service client for privileged lookups
		const service = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL,
			process.env.SUPABASE_SERVICE_ROLE_KEY
		)

		// 1) Lookup student by matric number
		const { data: student, error: studentErr } = await service
			.from('students')
			.select('id, full_name, matric_number, institutional_email, faculty_id, department_id, signup_status, auth_user_id')
			.eq('matric_number', cleanMatric)
			.single()

		if (studentErr || !student) {
			return NextResponse.json({ error: 'Invalid matric number or password.' }, { status: 401 })
		}

		// 2) Only verified students can login
		if (student.signup_status !== 'verified') {
			return NextResponse.json(
				{ error: 'Your signup is not verified yet. Please complete verification.' },
				{ status: 403 }
			)
		}

		// 3) Student must be linked to an auth user
		if (!student.auth_user_id) {
			return NextResponse.json(
				{ error: 'Your account is not fully set up. Contact support.' },
				{ status: 403 }
			)
		}

		// 4) Resolve the email from Auth using the auth_user_id
		const { data: userResp, error: userErr } = await service.auth.admin.getUserById(student.auth_user_id)

		if (userErr || !userResp?.user?.email) {
			return NextResponse.json(
				{ error: 'Authentication service unavailable.' },
				{ status: 500 }
			)
		}

		// 5) Clear any existing session, then sign in with email/password
		try { await supabase.auth.signOut() } catch (_) {}

		const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
			email: userResp.user.email,
			password: cleanPassword,
		})

		if (authError || !authData?.session || !authData?.user) {
			return NextResponse.json(
				{ error: 'Authentication failed - no session created.' },
				{ status: 401 }
			)
		}

		// 6) Sanity check: ensure the session user matches the mapped auth_user_id
		if (authData.user.id !== student.auth_user_id) {
			return NextResponse.json(
				{ error: 'Account mismatch. Please contact support.' },
				{ status: 403 }
			)
		}

		return NextResponse.json(
			{
				message: 'Login successful',
				user: authData.user,
				session: authData.session,
				profile: {
					role: 'student',
					id: student.id,
					full_name: student.full_name,
					matric_number: student.matric_number,
					email: authData.user.email,
					faculty_id: student.faculty_id,
					department_id: student.department_id,
					signup_status: student.signup_status,
				},
			},
			{ status: 200 }
		)
	} catch (err) {
		console.error('Student login error:', err)
		return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
	}
}

