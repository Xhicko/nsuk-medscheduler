import AppointmentContainer from './AppointmentContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Manage Appointments',
}

export default async function AppointmentPage() {
  const supabase = await getServerSupabase()

  const page = 1
  const limit = 10
  const from = 0
  const to = limit - 1

  // Default panel: pending
  const { data: appts } = await supabase
    .from('appointments')
    .select(`
      id,
      student_id,
      status,
      time_range,
      created_at,
      updated_at,
      students (
        id,
        matric_number,
        full_name,
        institutional_email,
        faculty_id,
        department_id,
        faculties ( id, name ),
        departments ( id, name )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .range(from, to)

  const [{ count: pending }, { count: scheduled }, { count: total }] = await Promise.all([
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('appointments').select('id', { count: 'exact', head: true }),
  ])

  // Verified faculties for filters
  const { data: faculties } = await supabase
    .from('faculties')
    .select('id, name, status')
    .eq('status', 'verified')
    .order('name', { ascending: true })

  const initialData = {
    status: 'pending',
    appointments: appts || [],
    counts: { pending: pending || 0, scheduled: scheduled || 0 },
    pagination: { page, limit, total: total || 0 },
    faculties: faculties || [],
    filters: { searchTerm: '', faculty: 'all', department: 'all' },
  }

  return <AppointmentContainer initialData={initialData} />
}
