// src/middleware.ts
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

const ADMIN_PUBLIC_PATHS     = ['/admin/login']
const ADMIN_PROTECTED_PATHS  = 
[
   '/admin/dashboard', 
   '/admin/students',
   '/admin/faculties',
   '/admin/departments',
   '/admin/medical-forms',
   '/admin/appointments',
   '/admin/students-results',
   '/admin/admin-management',
]
const ADMIN_RESTRICTED_PATHS = ['/admin/change-password', '/admin/users']

const STUDENT_PUBLIC_PATHS    = ['/student/login']
const STUDENT_PROTECTED_PATHS = 
[
   '/student/dashboard',
   '/student/medical-forms',
   '/student/notifications',

]

export const config = {
  matcher: [
    // Only run middleware on routes that actually need auth checks
    '/admin/((?!login$).*)',
    '/student/((?!login$|register$).*)',
    '/'
  ],
}

export default async function middleware(request) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Dev: disable cache
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Cache-Control', 'no-store, max-age=0')
  }

  // 1) Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/student/login', request.url))
  }

  // 2) Get Supabase session (faster than getUser)
  const supabase = createMiddlewareClient({ req: request, res: response })
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  // 3) Determine role safely
  const role = user?.user_metadata?.role ?? 'anon'

  // 4) Admin protected: must be logged in as admin or superadmin
  if (ADMIN_PROTECTED_PATHS.includes(pathname)) {
    if (!user || (role !== 'admin' && role !== 'superadmin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return response
  }

  // 5) Admin restricted: only superadmins
  if (ADMIN_RESTRICTED_PATHS.includes(pathname)) {
    // if not superadmin, bounce them back to dashboard
    if (role !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return response
  }

  // 6) Admin public: if already admin/superadmin, send them away from login
  if (ADMIN_PUBLIC_PATHS.includes(pathname)) {
    if (role === 'admin' || role === 'superadmin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return response
  }


  // 7) Student protected: must be student
  if (STUDENT_PROTECTED_PATHS.includes(pathname)) {
    if (!user || role !== 'student') {
      return NextResponse.redirect(new URL('/student/login', request.url))
    }
    return response
  }

  // 8) Student public: if already student, send to dashboard
  if (STUDENT_PUBLIC_PATHS.includes(pathname)) {
    if (role === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
    return response
  }

  // 9) All other routes: allow through
  return response
}
