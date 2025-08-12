import FacultiesContainer from './FacultiesContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Manage Faculties',
}

export default async function Page() {
  const supabase = await getServerSupabase()
  const { data: faculties, error } = await supabase
    .from('faculties')
    .select('id, name, code, status, created_at')
    .order('created_at', { ascending: false })

  const initialData = {
    faculties: error ? [] : (faculties || []),
    filters: { searchTerm: '', status: 'all' },
  }

  return <FacultiesContainer initialData={initialData} />
}
