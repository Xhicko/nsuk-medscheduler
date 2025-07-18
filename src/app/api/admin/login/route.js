// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request) {

   // 0) Check if the request method is POST
   if (request.method !== "POST") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      )
    }

  // 1) Prepare Supabase client with cookie support
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { medical_id, password } = await request.json()

    if (!medical_id || !password) {
      return NextResponse.json(
        { error: 'Medical ID and password are required.' },
        { status: 400 }
      )
    }

    // ) Sign-in via Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ medical_id, password })

    if (authError || !authData.session) {
      // invalid credentials or other auth failure
      return NextResponse.json(
        { error: 'Invalid medical ID or password.' },
        { status: 401 }
      )
    }

    const userId = authData.user.id

    // 3) Fetch admin record (need a service-role client)
    //    so we can read the `admins` table regardless of RLS
    const { createClient } = await import('@supabase/supabase-js')
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: admin, error: fetchError } = await service
      .from('admins')
      .select('role,is_active,is_email_verified')
      .eq('auth_user_id', userId)
      .single()

    if (fetchError || !admin) {
      // user exists but isn’t in admins table
      return NextResponse.json(
        { error: 'You are not authorized to access the admin portal.' },
        { status: 403 }
      )
    }

    // 4) Validate admin flags
    if (!['admin','superadmin'].includes(admin.role)) {
      return NextResponse.json(
        { error: 'Your account does not have admin privileges.' },
        { status: 403 }
      )
    }

    if (!admin.is_email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in.' },
        { status: 401 }
      )
    }

    if (!admin.is_active) {
      return NextResponse.json(
        { error: 'Your account is inactive. Contact support.' },
        { status: 403 }
      )
    }

    // 5) Success → the cookie is already set by createRouteHandlerClient()
    return NextResponse.json(
      { message: 'Login successful', role: admin.role },
      { status: 200 }
    )

  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 }
    )
  }
}
