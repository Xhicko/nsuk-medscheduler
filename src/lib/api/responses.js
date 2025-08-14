import { NextResponse } from 'next/server'

export function unauthorized(message = 'Not authenticated') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = 'You are not permitted to perform this action') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function methodNotAllowed(message = 'Method not allowed') {
  return NextResponse.json({ error: message }, { status: 405 })
}

export function internalServerError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 })
}
