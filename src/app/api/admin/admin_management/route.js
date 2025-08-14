'use server'

import { NextResponse } from 'next/server'
import { unauthorized, forbidden, methodNotAllowed, internalServerError } from '@/lib/api/responses'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { generateMedicalId } from '@/lib/utils'
import { sendAdminWelcome } from '@/lib/email'

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

async function handleRequest(request, method){
  try{
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session }, error: sessErr } = await supabase.auth.getSession()
  if (sessErr || !session) return unauthorized()

  const role = session.user?.user_metadata?.role

  switch(method){
      case 'GET':
  if (role !== 'admin' && role !== 'superadmin') return forbidden()
    return await handleGetAdmins(request, supabase)
      case 'POST':
  if (role !== 'superadmin') return forbidden()
    return await handleCreateAdmin(request, supabase)
      case 'PUT':
  if (role !== 'superadmin') return forbidden()
    return await handleUpdateAdmin(request, supabase)
      case 'DELETE':
  if (role !== 'superadmin') return forbidden()
    return await handleDeleteAdmin(request, supabase)
      default:
  return methodNotAllowed()
    }
  } catch (error){
    console.error('Admins API error:', error)
  return internalServerError()
  }
}

async function handleGetAdmins(request, supabase){
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page')) || 1
  const limit = parseInt(searchParams.get('limit')) || 10
  const offset = (page - 1) * limit

  const search = searchParams.get('search') || ''
  const roleFilter = searchParams.get('role')
  const statusFilter = searchParams.get('status')

  let query = supabase.from('admins').select(`
    id,
    full_name,
    role,
    is_active,
    is_email_verified,
    medical_id,
    created_at,
    last_login
  `)

  if (search){
    const term = String(search).trim()
    if (term){
      query = query.or(`full_name.ilike.*${term}*,medical_id.ilike.*${term}*`)
    }
  }

  if (roleFilter && roleFilter !== 'all'){
    query = query.eq('role', roleFilter)
  }

  if (statusFilter && statusFilter !== 'all'){
    const isActive = statusFilter === 'active'
    query = query.eq('is_active', isActive)
  }

  let countQuery = supabase.from('admins').select('id', { count: 'exact', head: true })
  if (search){
    const term = String(search).trim()
    if (term){
      countQuery = countQuery.or(`full_name.ilike.*${term}*,medical_id.ilike.*${term}*`)
    }
  }
  if (roleFilter && roleFilter !== 'all'){
    countQuery = countQuery.eq('role', roleFilter)
  }
  if (statusFilter && statusFilter !== 'all'){
    const isActive = statusFilter === 'active'
    countQuery = countQuery.eq('is_active', isActive)
  }

  const { count } = await countQuery

  const { data: admins, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error){
    console.error('Error fetching admins:', error)
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    admins,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }, { status: 200 })
}

async function handleCreateAdmin(request, supabase){
  try{
    const body = await request.json()
    const { fullName, role, email, password, adminId } = body

    if (!fullName || !role || !['admin','superadmin'].includes(role)){
      return NextResponse.json({ error: 'fullName and valid role are required' }, { status: 400 })
    }
    // Enforce email + password creation path only
    if (!email || !password){
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
    }
    if (password.length < 8){
      return NextResponse.json({ error: 'password must be at least 8 characters' }, { status: 400 })
    }

  let createdAuthUserId = null

    // Before creating, ensure email has been verified via token on admins table using the provided adminId
    let targetAdminsRowId = null
    {
      if (!adminId){
        return NextResponse.json({ error: 'adminId is required (verify email first)' }, { status: 400 })
      }
      const supabaseServiceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseServiceUrl || !supabaseServiceRoleKey){
        return NextResponse.json({ error: 'Server not configured for verification' }, { status: 500 })
      }
      const serviceClient = createClient(supabaseServiceUrl, supabaseServiceRoleKey)
      const { data: verifiedAdminRow, error: verifiedAdminError } = await serviceClient
        .from('admins')
        .select('id, is_email_verified')
        .eq('id', adminId)
        .single()
      if (verifiedAdminError || !verifiedAdminRow){
        return NextResponse.json({ error: 'Admin row not found' }, { status: 404 })
      }
      if (!verifiedAdminRow.is_email_verified){
        return NextResponse.json({ error: 'Email not verified' }, { status: 400 })
      }
      targetAdminsRowId = verifiedAdminRow.id
    }

    // Create the auth user using service role
    {
      const supabaseServiceUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseServiceUrl || !supabaseServiceRoleKey){
        return NextResponse.json({ error: 'Server not configured for auth user creation' }, { status: 500 })
      }

      const serviceClient = createClient(supabaseServiceUrl, supabaseServiceRoleKey)

      // Create the user directly with email + password
      const { data: createdUserResponse, error: createUserError } = await serviceClient.auth.admin.createUser({
        email,
        password,
        user_metadata: { role },
        email_confirm: true,
      })
      if (createUserError) {
        const status = createUserError?.status || 500
        const message = (createUserError?.message || '').toLowerCase()
        if (status === 422 || status === 409 || message.includes('already') || message.includes('registered')){
          return NextResponse.json({ error: 'Email already exists in authentication.' }, { status: 409 })
        }
        return NextResponse.json({ error: createUserError.message || 'Failed to create auth user' }, { status })
      }
      const createdUser = createdUserResponse?.user || null

      if (!createdUser?.id){
        return NextResponse.json({ error: 'Auth user could not be created' }, { status: 500 })
      }
      createdAuthUserId = createdUser.id
    }

   // Generate a unique medical ID with a small retry to avoid rare collisions
   let candidateMedicalID = null
   for (let i = 0; i < 3; i++) {
     const candidate = generateMedicalId()
     const { data: exists, error: existsErr } = await supabase
       .from('admins')
       .select('id')
       .eq('medical_id', candidate)
       .limit(1)
     if (!existsErr && (!Array.isArray(exists) || exists.length === 0)) {
       candidateMedicalID = candidate
       break
     }
   }
   // Fallback if still null (very unlikely)
   if (!candidateMedicalID) {
     candidateMedicalID = generateMedicalId()
   }

  const { data: newAdmin, error } = await supabase
      .from('admins')
      .update({
        auth_user_id: createdAuthUserId,
        full_name: fullName,
        role,
        is_active: true,
        is_email_verified: true,
        medical_id: candidateMedicalID,
        created_by: (await supabase.auth.getUser()).data?.user?.id || null,
        token: null,
        token_expires_at: null,
      })
      .eq('id', targetAdminsRowId)
      .select(`
        id, full_name, role, is_active, is_email_verified, medical_id, created_at, last_login
      `)
      .single()

    if (error){
      console.error('Error creating admin:', error)
      return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
    }

  // Try to send a welcome email; do not fail the request if email sending fails
    try {
      await sendAdminWelcome({
        to: email,
        systemName: process.env.NEXT_PUBLIC_SYSTEM_NAME || process.env.SYSTEM_NAME || 'NSUK Medical Scheduler',
        fullName: fullName,
        role,
        medicalId: candidateMedicalID,
        password,
        loginUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/login` : undefined,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER,
      })
    } catch (e) {
      console.warn('Failed to send admin welcome email:', e?.message || e)
    }

    return NextResponse.json({ message: 'Admin created successfully', admin: newAdmin }, { status: 201 })
  } catch (e){
    console.error('Create admin error:', e)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}

async function handleUpdateAdmin(request, supabase){
  try{
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('id')
    if (!adminId){
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { fullName, role, isActive, isEmailVerified, medicalId, password: newPassword } = body

    // Ensure admin exists
    const { data: existing, error: existErr } = await supabase
      .from('admins')
      .select('id, auth_user_id')
      .eq('id', adminId)
      .single()

    if (existErr || !existing){
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    if (role && !['admin','superadmin'].includes(role)){
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updateData = {}
    if (fullName !== undefined) updateData.full_name = fullName
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.is_active = !!isActive
    if (isEmailVerified !== undefined) updateData.is_email_verified = !!isEmailVerified
    if (medicalId !== undefined) updateData.medical_id = medicalId || null

    // If a new password is provided, update the Supabase Auth user using service role
    if (typeof newPassword === 'string') {
      const trimmed = newPassword.trim()
      if (trimmed.length < 8) {
        return NextResponse.json({ error: 'password must be at least 8 characters' }, { status: 400 })
      }
      if (!existing.auth_user_id) {
        return NextResponse.json({ error: 'Admin is missing auth user link' }, { status: 409 })
      }

      const supabaseServiceUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseServiceUrl || !supabaseServiceRoleKey){
        return NextResponse.json({ error: 'Server not configured for password update' }, { status: 500 })
      }

      try {
        const serviceClient = createClient(supabaseServiceUrl, supabaseServiceRoleKey)
        const { error: updateErr } = await serviceClient.auth.admin.updateUserById(
          existing.auth_user_id,
          { password: trimmed }
        )
        if (updateErr) {
          const status = updateErr?.status || 500
          return NextResponse.json({ error: updateErr.message || 'Failed to update password' }, { status })
        }

        // Revoke all refresh tokens to force re-login on existing sessions
        try { await serviceClient.auth.admin.invalidateRefreshTokens(existing.auth_user_id) } catch (_) {}

        // Optional server-side verification if anon key is configured
        try {
          const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          if (anonKey) {
            // Lookup email
            const { data: userResp, error: getErr } = await serviceClient.auth.admin.getUserById(existing.auth_user_id)
            const email = userResp?.user?.email
            if (!getErr && email) {
              const anonClient = createClient(supabaseServiceUrl, anonKey)
              const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({ email, password: trimmed })
              if (signInErr || !signInData?.session) {
                console.warn('Password update verification failed for user:', existing.auth_user_id, signInErr?.message)
                // If strict verification desired, uncomment to fail:
                // return NextResponse.json({ error: 'Password update did not verify.' }, { status: 500 })
              }
            }
          }
        } catch (verifyErr) {
          console.warn('Password verification skipped/failure:', verifyErr?.message)
        }
      } catch (e) {
        console.error('Service password update error:', e)
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
      }
    }

    // Only update DB row if there are actual fields to change
    let updated = null
    if (Object.keys(updateData).length > 0) {
      const { data: updatedRow, error } = await supabase
        .from('admins')
        .update(updateData)
        .eq('id', adminId)
        .select('id, full_name, role, is_active, is_email_verified, medical_id, created_at, last_login')
        .single()
      if(error){
        console.error('Error updating admin:', error)
        return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
      }
      updated = updatedRow
    } else {
      // No DB field changes; fetch current for response if only password changed
      const { data: adminRow } = await supabase
        .from('admins')
        .select('id, full_name, role, is_active, is_email_verified, medical_id, created_at, last_login')
        .eq('id', adminId)
        .single()
      updated = adminRow || null
    }

    const message = typeof newPassword === 'string' && Object.keys(updateData).length === 0
      ? 'Password updated successfully'
      : (typeof newPassword === 'string' ? 'Admin and password updated successfully' : 'Admin updated successfully')

    return NextResponse.json({ message, admin: updated }, { status: 200 })
  } catch (e){
    console.error('Update admin error:', e)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}

async function handleDeleteAdmin(request, supabase){
  try{
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('id')

    if (!adminId){
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 })
    }

    const { data: existing, error: existErr } = await supabase
      .from('admins')
      .select('id, full_name')
      .eq('id', adminId)
      .single()

    if (existErr || !existing){
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', adminId)

    if (error){
      console.error('Error deleting admin:', error)
      return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 })
    }

    return NextResponse.json({ message: `${existing.full_name} was successfully deleted` }, { status: 200 })
  } catch (e){
    console.error('Delete admin error:', e)
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 })
  }
}
