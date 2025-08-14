'use server'

import { NextResponse } from 'next/server'
import { unauthorized, forbidden, internalServerError, methodNotAllowed } from '@/lib/api/responses'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import validator from 'validator'
import { sendAdminVerificationToken } from '@/lib/email'

function generateToken() {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return bytes[0].toString().padStart(8, '0').slice(0, 8)
}

/**
 * Checks if an email already exists in Supabase Auth by paginating listUsers.
 * Limits pagination to a few pages to avoid heavy scans.
 * Returns true if found, false otherwise.
 */
async function authEmailExists(adminClient, email) {
  const target = (email || '').toLowerCase()
  const perPage = 200
  const maxPages = 5
  for (let page = 1; page <= maxPages; page++) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('verify_email: listUsers error:', error)
      return false
    }
    const users = data?.users || []
    if (users.some(u => (u.email || '').toLowerCase() === target)) {
      return true
    }
    if (users.length < perPage) break // no more pages
  }
  return false
}

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()
  if (!session) return unauthorized()
  const role = session.user?.user_metadata?.role
  if (role !== 'superadmin') return forbidden()

  const { action, email, token, adminId } = await request.json()
    if (!action) return NextResponse.json({ error: 'action is required' }, { status: 400 })

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SERVICE_KEY) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

  if (action === 'send') {
      if (!email || !validator.isEmail(email)) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
      const normalized = validator.normalizeEmail(email) || email

      // 0) Do not proceed if the email already exists in Supabase Auth
      const exists = await authEmailExists(admin, normalized)
      if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

      // Generate token and create a fresh placeholder admin row with explicit UUID
      const code = generateToken()
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString()
      const newId = crypto.randomUUID()

      const { error: insErr } = await admin
        .from('admins')
        .insert({
          id: newId,
          full_name: null,
          role: null,
          medical_id: null,
          created_by: null,
          last_login: null,
          auth_user_id: null,
          is_active: null,
          token: code,
          token_expires_at: expiresAt,
          is_email_verified: null,
        })
      if (insErr) {
        console.error('verify_email: insert placeholder admin error:', insErr)
        return NextResponse.json({ error: 'Failed to store token' }, { status: 500 })
      }

      try {
        await sendAdminVerificationToken({ to: normalized, token: code })
      } catch (mailErr) {
        console.error('verify_email: email send error:', mailErr)
      }

      return NextResponse.json({ message: 'Verification token sent', adminId: newId }, { status: 200 })
    }

    if (action === 'resend') {
      if (!adminId) return NextResponse.json({ error: 'adminId is required' }, { status: 400 })
      if (!email || !validator.isEmail(email)) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
      const normalized = validator.normalizeEmail(email) || email

      const code = generateToken()
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString()

      const { error: updErr } = await admin
        .from('admins')
        .update({ token: code, token_expires_at: expiresAt})
        .eq('id', adminId)
      if (updErr) {
        console.error('verify_email: resend update token error:', updErr)
        return NextResponse.json({ error: 'Failed to update token' }, { status: 500 })
      }

      try {
        await sendAdminVerificationToken({ to: normalized, token: code })
      } catch (mailErr) {
        console.error('verify_email: email send error (resend):', mailErr)
      }

      return NextResponse.json({ message: 'Verification token resent', adminId }, { status: 200 })
    }

    if (action === 'verify') {
      if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 })
      if (!adminId) return NextResponse.json({ error: 'adminId is required' }, { status: 400 })

      const { data: row, error: selErr } = await admin
        .from('admins')
        .select('id, token, token_expires_at')
        .eq('id', adminId)
        .single()
      if (selErr || !row) {
        console.error('verify_email: select token row error:', selErr)
        return NextResponse.json({ error: 'Invalid email/token' }, { status: 400 })
      }

      const expired = !row.token_expires_at || new Date(row.token_expires_at).getTime() < Date.now()
      if (expired) return NextResponse.json({ error: 'Token expired' }, { status: 400 })

      if (String(row.token) !== String(token)) return NextResponse.json({ error: 'Invalid token' }, { status: 400 })

      // Mark email verified and clear token
      // Mark email verified on admins and clear token
      const { error: updErr } = await admin
        .from('admins')
        .update({ is_email_verified: true, token: null, token_expires_at: null })
        .eq('id', row.id)
      if (updErr) {
        console.error('verify_email: update verification error:', updErr)
        return NextResponse.json({ error: 'Failed to update verification', details: updErr.message }, { status: 500 })
      }

      return NextResponse.json({ message: 'Email verified' }, { status: 200 })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (e) {
    console.error('verify_email API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
