import DashboardContainer from './DashboardContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Dashboard',
}

export default async function Page() {
  // Seed minimal dashboard data from DB via RPC for initial render
  const supabase = await getServerSupabase()
  const { data } = await supabase.rpc('get_admin_dashboard')
  const initialData = data ? {
    stats: {
      appointmentsToday: data.appointmentsToday || 0,
      appointmentsThisWeek: data.appointmentsThisWeek || 0,
      appointmentsThisMonth: data.appointmentsThisMonth || 0,
      approvedBloodResults: data.approvedBloodResults || 0,
      totalUnactivatedStudentsThisWeek: data.totalUnactivatedStudentsThisWeek || 0,
      totalActivatedStudentsThisWeek: data.totalActivatedStudentsThisWeek || 0,
      totalMissedAppointments: data.totalMissedAppointments || 0,
      upcomingAppointments: data.upcomingAppointments || 0,
      pendingBloodResults: data.pendingBloodResults || 0,
    },
    recentMedicalForms: data.recentMedicalForms || [],
    todaysAppointments: data.todaysAppointments || [],
    recentMissedAppointments: data.recentMissedAppointments || [],
    lastUpdated: data.lastUpdated,
  } : null
  return <DashboardContainer initialData={initialData} />
}