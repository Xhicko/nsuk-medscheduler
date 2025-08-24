import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  unauthorized,
  forbidden,
  methodNotAllowed,
  internalServerError,
} from '@/lib/api/responses';

/* -------------------- Helpers (keep these for basic data normalization) -------------------- */
const parseBoolean = (rawValue) => {
  if (typeof rawValue === 'boolean') return rawValue;
  if (typeof rawValue === 'string') {
    const lower = rawValue.toLowerCase().trim();
    if (['true', '1', 'yes'].includes(lower)) return true;
    if (['false', '0', 'no'].includes(lower)) return false;
  }
  return undefined;
};

const parseInteger = (rawValue) => {
  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) return Math.floor(rawValue);
  if (typeof rawValue === 'string' && rawValue.trim() !== '') {
    const parsedInteger = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsedInteger) ? undefined : parsedInteger;
  }
  return undefined;
};

const formatDateToISO = (rawValue) => {
  if (!rawValue) return undefined;
  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
};

/* -------------------- Supabase client factory -------------------- */
const createSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
};

/* -------------------- Disabled methods -------------------- */
export function GET() {
  return methodNotAllowed();
}

export function PUT() {
  return methodNotAllowed();
}

export function DELETE() {
  return methodNotAllowed();
}

/* -------------------- POST handler -------------------- */
export async function POST(request) {
  try {
    const supabaseClient = await createSupabaseClient();

    // Authenticate and ensure student role
    const authResult = await supabaseClient.auth.getUser();
    const authenticatedUser = authResult?.data?.user;
    if (authResult.error || !authenticatedUser) return unauthorized();

    const currentUserRole = (authenticatedUser.user_metadata?.role) || 'student';
    if (currentUserRole !== 'student') return forbidden();

    // Parse and validate request body
    const requestBody = await request.json().catch(() => null);
    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const requestedSection = String(requestBody.section || '').trim();
    if (!requestedSection) {
      return NextResponse.json({ error: 'Missing section name' }, { status: 400 });
    }

    // Get student info to verify they exist
    const { data: studentRow, error: selectStudentError } = await supabaseClient
      .from('students')
      .select('id')
      .eq('auth_user_id', authenticatedUser.id)
      .maybeSingle();

    if (selectStudentError) {
      console.error('DB error fetching student row:', selectStudentError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    if (!studentRow) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Basic payload normalization (let RPC handle validation)
    const normalizedPayload = {};
    for (const [fieldName, fieldValue] of Object.entries(requestBody)) {
      if (fieldName === 'section') continue;
      
      // Skip null or empty string values
      if (fieldValue === null) continue;
      if (typeof fieldValue === 'string' && fieldValue.trim() === '') continue;

      // Basic type coercion for common cases
      if (typeof fieldValue === 'string') {
        const maybeBool = parseBoolean(fieldValue);
        if (maybeBool !== undefined) {
          normalizedPayload[fieldName] = maybeBool;
          continue;
        }
        
        // Handle date fields
        if (fieldName.includes('date') || fieldName.includes('since')) {
          const maybeDate = formatDateToISO(fieldValue);
          if (maybeDate !== undefined) {
            normalizedPayload[fieldName] = maybeDate;
            continue;
          }
        }
        
        // Handle integer fields
        if (/(days|duration|qty|_days|_qty)/i.test(fieldName)) {
          const maybeInt = parseInteger(fieldValue);
          if (maybeInt !== undefined) {
            normalizedPayload[fieldName] = maybeInt;
            continue;
          }
        }
      }

      normalizedPayload[fieldName] = fieldValue;
    }

    const { data: rpcResult, error: rpcError } = await supabaseClient.rpc('submit_medical_section', {
      p_student_id: studentRow.id,
      p_section: requestedSection,
      p_fields: normalizedPayload
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      
      // Handle specific RPC error codes
      switch (rpcError.code) {
        case 'P0001':
          return NextResponse.json({ error: 'Student not found or invalid data' }, { status: 404 });
        case 'P0002':
          return NextResponse.json({ 
            error: 'Invalid section order', 
            message: rpcError.message 
          }, { status: 400 });
        case 'P0003':
          return NextResponse.json({ 
            error: 'Invalid field data', 
            message: rpcError.message 
          }, { status: 400 });
        case 'P0004':
          return NextResponse.json({ 
            error: 'Conflict: section submission failed due to concurrent update. Please retry.' 
          }, { status: 409 });
        case '42501':
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        default:
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    // Return the RPC result
    return NextResponse.json(rpcResult, { status: 201 });

  } catch (error) {
    console.error('Unhandled error in POST /api/medical-form:', error);
    return internalServerError();
  }
}