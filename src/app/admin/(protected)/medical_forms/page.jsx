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
  const { data: medical_forms, error } = await supabase
    .from('medical_forms')
    .select(`
      id,
      student_id,
      submitted_at,
      updated_at,
      completed,
      general_health,
      inpatient_admit,
      inpatient_details,
      family_history,
      prev_tuberculosis,
      prev_hypertension,
      prev_epilepsy,
      prev_mental_illness,
      prev_cardiovascular,
      prev_arthritis,
      prev_asthma,
      prev_bronchitis,
      prev_hay_fever,
      prev_diabetes,
      prev_eye_ear_nose,
      prev_throat_trouble,
      prev_drug_sensitivity,
      prev_dysentery,
      prev_dizziness,
      prev_jaundice,
      prev_kidney_disease,
      prev_gonorrhea,
      prev_parasitic_disease,
      prev_heart_disease,
      prev_ulcer,
      prev_haemorrhoids,
      prev_skin_disease,
      prev_schistosomiasis,
      prev_other_condition,
      prev_other_details,
      smoke,
      alcohol,
      alcohol_since,
      alcohol_qty_per_day,
      leisure_activities,
      current_treatments,
      menses_regular,
      menses_painful,
      menses_duration_days,
      last_period_date,
      breast_sexual_disease,
      breast_sexual_details,
      imm_yellow_fever,
      imm_smallpox,
      imm_typhoid,
      imm_tetanus,
      imm_tuberculosis,
      imm_cholera,
      imm_polio,
      imm_others,
      imm_others_details,
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
    medicalForms: error ? [] : (medical_forms || []),
    pagination: { page, limit, total: total || 0 },
    faculties: faculties || [],
    filters: { searchTerm: '', faculty: 'all', department: 'all', completed: 'all' },
  }

  return <MedicalFormsContainer initialData={initialData} />
}
