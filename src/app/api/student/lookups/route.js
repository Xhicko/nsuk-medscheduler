import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/student/lookups
// Optional query: faculty_only=true to only fetch faculties
export async function GET(request) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
    }

    const url = new URL(request.url)
    const facultyOnly = url.searchParams.get('faculty_only') === 'true'
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)

    const lookups = {}

    const { data: faculties, error: facErr } = await admin
      .from('faculties')
      .select('id, name, status')
      .eq('status', 'verified')
      .order('name')

    if (facErr) {
      return NextResponse.json({ error: 'Failed to load faculties' }, { status: 500 })
    }

    lookups.faculties = faculties || []

    if (!facultyOnly) {
      const { data: departments, error: depErr } = await admin
        .from('departments')
        .select('id, name, faculty_id, status')
        .eq('status', 'verified')
        .order('name')

      if (depErr) {
        return NextResponse.json({ error: 'Failed to load departments' }, { status: 500 })
      }
      lookups.departments = departments || []
    }

    return NextResponse.json(lookups, { status: 200 })
  } catch (e) {
    console.error('Student lookups error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
