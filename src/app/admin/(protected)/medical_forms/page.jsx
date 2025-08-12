import MedicalFormsContainer from './MedicalFormsContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Manage Medical Forms',
}

export default async function MedicalFormsPage() {
  const supabase = await getServerSupabase()

  const page = 1
  const limit = 10
  const from = 0
  const to = limit - 1

  // Initial fetch: recent forms with student join
  const { data: forms, error } = await supabase
    .from('medical_forms')
    .select(`
      id,
      student_id,
      submitted_at,
      completed,
      students (
        id,
        matric_number,
        full_name,
        faculty_id,
        department_id,
        faculties ( id, name ),
        departments ( id, name )
      )
    `)
    .order('submitted_at', { ascending: false })
    .range(from, to)

  const { count: total } = await supabase
    .from('medical_forms')
    .select('id', { count: 'exact', head: true })

  // Verified faculties for filters
  const { data: faculties } = await supabase
    .from('faculties')
    .select('id, name, status')
    .eq('status', 'verified')
    .order('name', { ascending: true })

  const initialData = {
    medicalForms: error ? [] : (forms || []),
    pagination: { page, limit, total: total || 0 },
    faculties: faculties || [],
    filters: { searchTerm: '', faculty: 'all', department: 'all', completed: 'all' },
  }

  return <MedicalFormsContainer initialData={initialData} />
}
