import DepartmentsContainer from './DepartmentsContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Manage Departments',
} 

export default async function DepartmentsPage() {
  const supabase = await getServerSupabase()
  // Fetch departments with faculty name for initial table
  const { data: departments, error } = await supabase
    .from('departments')
    .select('id, name, code, status, faculty_id, created_at, faculties ( id, name )')
    .order('created_at', { ascending: false })

  // Fetch verified faculties for filter options
  const { data: faculties } = await supabase
    .from('faculties')
    .select('id, name, status')
    .eq('status', 'verified')
    .order('name', { ascending: true })

  const initialData = {
    departments: (error ? [] : (departments || [])).map((d) => ({
      ...d,
      faculty_name: d?.faculties?.name || null,
    })),
    faculties: faculties || [],
    filters: { searchTerm: '', status: 'all', faculty: 'all' },
  }

  return <DepartmentsContainer initialData={initialData} />
}
