'use server'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Main handler to process all requests
export async function POST(request) {
  return handleRequest(request, 'POST')
}

export async function GET(request) {
  return handleRequest(request, 'GET')
}

async function handleRequest(request, method) {
    try {
         const cookieStore = await cookies()
         const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

         // Check authentication and authorization
         const { data: { session }, error: sessErr } = await supabase.auth.getSession()
         if (sessErr || !session) {
            return NextResponse.json(
               { error: 'Not authenticated' },
               { status: 401 }
            )
         }

         const role = session.user?.user_metadata?.role 
         if (role !== 'admin' && role !== 'superadmin') {
            return NextResponse.json(
               { error: 'Forbidden' }, 
               { status: 403 }
            )
         }

                   // Handle GET requests
          if (method === 'GET') {
             // Get all departments with their faculty names in a single query
             const { data, error } = await supabase
                .from('departments')
                .select(`
                   id,
                   name,
                   faculty_id,
                   faculties (
                      id,
                      name
                   )
                `)
                .order('name')

             if (error) {
                console.error('Error fetching data:', error)
                return NextResponse.json(
                   { error: 'Failed to fetch data' },
                   { status: 500 }
                )
             }

             // Organize the data by faculties
             const faculties = {}
             data.forEach(dept => {
                const faculty = dept.faculties
                if (!faculties[faculty.id]) {
                   faculties[faculty.id] = {
                      id: faculty.id,
                      name: faculty.name,
                      departments: []
                   }
                }
                faculties[faculty.id].departments.push({
                   id: dept.id,
                   name: dept.name,
                   faculty_id: dept.faculty_id
                })
             })


             return NextResponse.json(
               { faculties: Object.values(faculties) },
               { status: 200 }
             )
          }

         // Handle POST requests
         if (method === 'POST') {
            const contentType = request.headers.get('content-type');
            let students = [];
            
            // Check if this is a file upload (bulk) or JSON data (manual)
            if (contentType && contentType.includes('multipart/form-data')) {
                // Handle bulk file upload
                const formData = await request.formData();
                const file = formData.get('file');
                
                if (!file) {
                    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
                }
                
                const fileContent = await file.text();
                
                try {
                    // Parse different file types
                    if (file.type === 'application/json' || file.name.endsWith('.json')) {
                        const jsonData = JSON.parse(fileContent);
                        if (Array.isArray(jsonData)) {
                            students = jsonData.map(student => ({
                                id: crypto.randomUUID(), // Generate ID for bulk upload
                                matricNumber: student.matric_number,
                                fullName: student.full_name,
                                gender: student.gender,
                                religion: student.religion,
                                institute_email: student.institute_email,
                                department: student.department,
                                faculty: student.faculty,
                            }));
                        } else {
                            return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
                        }
                    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
                        if (lines.length <= 1) {
                            return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
                        }
                        
                        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                        const requiredHeaders = ['matric_number', 'full_name', 'gender', 'religion', 'institute_email', 'department', 'faculty'];
                        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
                        
                        if (missingHeaders.length > 0) {
                            return NextResponse.json({ 
                                error: `Missing required CSV headers: ${missingHeaders.join(', ')}` 
                            }, { status: 400 });
                        }
                        
                        students = lines.slice(1).map(line => {
                            const values = line.split(',').map(v => v.trim());
                            const student = {};
                            headers.forEach((header, index) => {
                                student[header] = values[index] || '';
                            });
                            
                            return {
                                id: crypto.randomUUID(),
                                matricNumber: student.matric_number,
                                fullName: student.full_name,
                                gender: student.gender,
                                religion: student.religion,
                                institute_email: student.institute_email,
                                department: student.department,
                                faculty: student.faculty,
                            };
                        });
                    } else if (file.type === 'application/sql' || file.name.endsWith('.sql')) {
                        // Parse SQL INSERT statements
                        const columnMatch = fileContent.match(/INSERT\s+INTO\s+[\w.]+\s*\(\s*([^)]+)\s*\)/i);
                        if (!columnMatch) {
                            return NextResponse.json({ error: 'Could not parse SQL file' }, { status: 400 });
                        }
                        
                        const columns = columnMatch[1].split(',').map(col => col.trim().replace(/[`'"]/g, '').toLowerCase());
                        const valuePattern = /\(\s*([^)]+)\s*\)/g;
                        const allValues = fileContent.match(valuePattern);
                        
                        if (!allValues) {
                            return NextResponse.json({ error: 'Could not find VALUES in SQL file' }, { status: 400 });
                        }
                        
                        students = [];
                        for (const valueString of allValues) {
                            const innerValues = valueString.slice(1, -1);
                            const values = [];
                            let current = '';
                            let inQuotes = false;
                            
                            for (let j = 0; j < innerValues.length; j++) {
                                const char = innerValues[j];
                                if (char === "'" && (j === 0 || innerValues[j-1] !== '\\')) {
                                    inQuotes = !inQuotes;
                                } else if (char === ',' && !inQuotes) {
                                    values.push(current.trim().replace(/^'|'$/g, '').trim());
                                    current = '';
                                    continue;
                                }
                                current += char;
                            }
                            if (current.trim()) {
                                values.push(current.trim().replace(/^'|'$/g, '').trim());
                            }
                            
                            // Map columns to values
                            const student = {};
                            columns.forEach((col, idx) => {
                                student[col] = values[idx] || '';
                            });
                            
                            students.push({
                                id: crypto.randomUUID(),
                                matricNumber: student.matric_number,
                                fullName: student.full_name,
                                gender: student.gender,
                                religion: student.religion,
                                institute_email: student.institutional_email || student.institute_email,
                                department: student.department_id || student.department,
                                faculty: student.faculty_id || student.faculty,
                            });
                        }
                    } else {
                        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
                    }
                } catch (parseError) {
                    return NextResponse.json({ 
                        error: `File parsing error: ${parseError.message}` 
                    }, { status: 400 });
                }
            } else {
                // Handle manual JSON data
                const body = await request.json();
                students = Array.isArray(body) ? body : body.students;
            }
            
            if (!Array.isArray(students) || students.length === 0) {
                return NextResponse.json({ error: 'No students provided' }, { status: 400 });
            }
            
            const results = [];
            let successCount = 0;
            
            for (const student of students) {
                // 1. Check faculty exists
                const { data: faculty, error: facultyErr } = await supabase
                    .from('faculties')
                    .select('id')
                    .eq('id', student.faculty)
                    .single();
                if (facultyErr || !faculty) {
                    results.push({
                        matric_number: student.matricNumber,
                        status: 'error',
                        message: 'Faculty does not exist',
                    });
                    continue;
                }
                // 2. Check department exists and belongs to faculty
                const { data: department, error: deptErr } = await supabase
                    .from('departments')
                    .select('id')
                    .eq('id', student.department)
                    .eq('faculty_id', student.faculty)
                    .single();
                if (deptErr || !department) {
                    results.push({
                        matric_number: student.matricNumber,
                        status: 'error',
                        message: 'Department does not exist or does not belong to faculty',
                    });
                    continue;
                }
                // 3. Check if student already exists by matric number
                const { data: existingStudent, error: existErr } = await supabase
                    .from('students')
                    .select('id')
                    .eq('matric_number', student.matricNumber)
                    .single();
                if (existingStudent) {
                    results.push({
                        matric_number: student.matricNumber,
                        status: 'error',
                        message: 'Student with this matric number already exists',
                    });
                    continue;
                }
                // 4. Insert student (with explicit id, check for id uniqueness)
                let studentId = student.id;
                if (!studentId) {
                    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                        studentId = crypto.randomUUID();
                    } else {
                        studentId = undefined;
                    }
                }
                if (studentId) {
                    // Check if id already exists
                    const { data: idExists, error: idErr } = await supabase
                        .from('students')
                        .select('id')
                        .eq('id', studentId)
                        .single();
                    if (idExists) {
                        results.push({
                            matric_number: student.matricNumber,
                            status: 'error',
                            message: 'Student with this id already exists',
                        });
                        continue;
                    }
                }
                const { error: insertErr } = await supabase
                    .from('students')
                    .insert({
                        id: studentId,
                        matric_number: student.matricNumber,
                        full_name: student.fullName,
                        institutional_email: student.institute_email,
                        faculty_id: student.faculty,
                        department_id: student.department,
                        gender: student.gender ? student.gender.toLowerCase() : null,
                        religion: student.religion,
                        signup_status: 'pending',
                    });
                if (insertErr) {
                    console.error('Insert error for student', student.matricNumber, insertErr);
                    results.push({
                        matric_number: student.matricNumber,
                        status: 'error',
                        message: 'Failed to insert student',
                        error: insertErr.message || insertErr,
                    });
                    continue;
                }
                
                // Successfully inserted
                results.push({
                    matric_number: student.matricNumber,
                    status: 'success',
                    message: 'Student added successfully',
                });
                successCount++;
            }
            
            // Determine overall message based on results
            const totalStudents = students.length;
            const errorCount = totalStudents - successCount;
            let message;
            
            if (successCount === totalStudents) {
                message = `All ${totalStudents} student(s) processed successfully`;
            } else if (successCount === 0) {
                message = `Failed to process any students (${errorCount} errors)`;
            } else {
                message = `Processed ${successCount}/${totalStudents} students successfully (${errorCount} errors)`;
            }
            
               return NextResponse.json(
                 { message, results, success: successCount, errors: errorCount },
                 { status: 200 }
               );
            }
    }
    catch(error){
    console.error('Student Data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    }
}