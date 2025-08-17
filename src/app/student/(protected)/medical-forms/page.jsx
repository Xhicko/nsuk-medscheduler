import MedicalFormsContainer from './MedicalFormsContainer';
import { getServerSupabase } from '@/lib/supabaseServer'

export const metadata = {
  title: 'NSUK MedSched - Medical Forms',
};
 
export default async function Page() {

   const supabase = await getServerSupabase()
     // Use verified user from Auth server
     const { data: { user }, error: userError } = await supabase.auth.getUser()
   
     // If no session, the middleware/route guards should handle redirect; return null to avoid rendering
     if (userError || !user) return null
   
     let initialData = null
     try {
       const { data: student, error } = await supabase
         .from('students')
         .select(`
            id,
            full_name,
            institutional_email,
            signup_status
         `)
     .eq('auth_user_id', user.id)
         .single()
   
       if (!error && student && student.signup_status === 'verified') {
         initialData = {
           fullName: student.full_name,
           email: student.institutional_email,
         }
       }
     } catch {}
  return <MedicalFormsContainer initialData={initialData} />;
}
