import NotificationsContainer from './NotificationsContainer'
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = { title: 'NSUK MedSched - Notifications' }

export default async function NotificationsPage() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: studentRow } = await supabase
    .from('students')
    .select(`
      id,
      full_name,
      institutional_email,
      gender,
      signup_status
    `)
    .eq('auth_user_id', user.id)
    .single()

  if (!studentRow || studentRow.signup_status !== 'verified') return null
   
  // Fetch notifications for the student
  const { data: notifications, error: notificationsError } = await supabase
    .from('notifications')
    .select(`
      id,
      title,
      message,
      type,
      category,
      is_read,
      created_at,
      updated_at,
      appointment_id
    `)
    .eq('student_id', studentRow.id)
    .order('created_at', { ascending: false })


  const initialData = {
   student: {
      id: studentRow.id,
      fullName: studentRow.full_name,
      email: studentRow.institutional_email,
      gender: studentRow.gender,
    },
    notifications: notifications || [],
    notificationsError: notificationsError?.message || null
  }


  return <NotificationsContainer initialData={initialData} />
}
