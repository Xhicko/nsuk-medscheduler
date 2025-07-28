// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { medical_id, password } = await request.json()
    
    // Validate input types
    if (typeof medical_id !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Invalid input types." },
        { status: 400 }
      )
    }

    // Trim and validate presence
    const cleanMedicalId = medical_id.trim()
    const cleanPassword = password.trim()
    
    if (!cleanMedicalId || !cleanPassword) {
      return NextResponse.json(
        { error: "Medical ID and password are required." },
        { status: 400 }
      )
    }

    // Create service client to lookup email by medical_id
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    // First, get the auth_user_id from medical_id

    const { data: adminLookup, error: lookupError } = await service
      .from('admins')
      .select('auth_user_id')
      .eq('medical_id', cleanMedicalId)
      .single()

    if (lookupError || !adminLookup) {
      return NextResponse.json(
        { error: 'Invalid medical ID or password.' },
        { status: 401 }
      )
    }

    // Get the user's email from Auth
    const { data: userResponse, error: userError } = await service.auth.admin.getUserById(adminLookup.auth_user_id)
    
    if (userError || !userResponse.user?.email) {
      return NextResponse.json(
        { error: 'Authentication service unavailable.' },
        { status: 500 }
      )
    }

    // Now authenticate with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userResponse.user.email,
      password: cleanPassword
    })

    console.log('→ userResponse:', userResponse.user.email)
    console.log('Auth Error:', authError)

    if (authError || !authData.session) {
      return NextResponse.json(
        { error: 'Authentication failed - no session created.' },
        { status: 401 }
      )
    }

    // Log the JWT token after successful authentication
    console.log('→ Authentication successful!')
    console.log('→ User ID:', authData.user.id)
    console.log('→ Session Token:', authData.session.access_token)
    console.log('→ Refresh Token:', authData.session.refresh_token)
    console.log('→ Token Expires:', new Date(authData.session.expires_at * 1000).toISOString())

    // Fetch full admin record for validation
    const { data: admin, error: fetchError } = await service
      .from('admins')
      .select('role, is_active, is_email_verified')
      .eq('auth_user_id', authData.user.id)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json(
        { error: 'You are not authorized to access the admin portal.' },
        { status: 403 }
      )
    }

    // Validate admin permissions
    if (!['admin', 'superadmin'].includes(admin.role)) {
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