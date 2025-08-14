import AdminManagementContainer from './AdminManagementContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Manage Admins',
  description: 'Create, edit, and manage administrators for NSUK MedSched.',
}

export default async function Page() {
  const supabase = await getServerSupabase()

  const page = 1
  const limit = 10
  const from = 0
  const to = limit - 1

  // Fetch initial admins
  const { data: admins, error } = await supabase
    .from('admins')
    .select(`
      id,
      full_name,
      role,
      is_active,
      is_email_verified,
      medical_id,
      created_at,
      last_login
    `)
    .order('created_at', { ascending: false })
    .range(from, to)

  const { count: total } = await supabase
    .from('admins')
    .select('id', { count: 'exact', head: true })

  const initialData = {
    admins: error ? [] : (admins || []),
    pagination: { page, limit, total: total || 0 },
    filters: {
      searchTerm: '',
      role: 'all',
      status: 'all',
    },
  }

  return <AdminManagementContainer initialData={initialData} />
}
