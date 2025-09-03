import ResultContainer from './ResultContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Students Results',
}

export default async function StudentsResultsPage() {
  const supabase = await getServerSupabase()

  const page = 1
  const limit = 10
  const from = 0
  const to = limit - 1

  // Initial status: ready (result_ready = true AND notified = false)
  const { data: results, error: resultsErr } = await supabase
    .from('result_notifications')
    .select(`
      id,
      student_id,
      appointment_id,
      result_ready,
      notified,
      appointment_done_at,
      notified_at,
      created_at,
      updated_at,
      blood_group,
      genotype,
      hemoglobin_status,
      hemoglobin_value,
      wbc_status,
      wbc_value,
      platelets_status,
      platelets_value,
      blood_sugar_status,
      blood_sugar_value,
      hiv_result,
      hepatitis_b_result,
      hepatitis_c_result,
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
    .eq('result_ready', true)
    .eq('notified', false)
    .order('created_at', { ascending: false })
    .range(from, to)

  // Counts
  const [{ count: readyCount }, { count: notifiedCount }] = await Promise.all([
    supabase
      .from('result_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('result_ready', true)
      .eq('notified', false),
    supabase
      .from('result_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('notified', true),
  ])

  // Total for current status view (ready)
  const { count: totalForReady } = await supabase
    .from('result_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('result_ready', true)
    .eq('notified', false)

  // Faculties (verified)
  const { data: faculties } = await supabase
    .from('faculties')
    .select('id, name, status')
    .eq('status', 'verified')
    .order('name', { ascending: true })

  const initialData = {
    status: 'ready',
    results: resultsErr ? [] : (results || []),
    counts: {
      ready: readyCount || 0,
      notified: notifiedCount || 0,
    },
    pagination: {
      page,
      limit,
      total: totalForReady || 0,
    },
    faculties: faculties || [],
    filters: {
      searchTerm: '',
      faculty: 'all',
      department: 'all',
    },
  }

  return <ResultContainer initialData={initialData} />
}