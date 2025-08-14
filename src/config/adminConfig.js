const BASE_URL = '/api/admin'

export const ADMIN_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
  },
   DASHBOARD: `${BASE_URL}/dashboard`,
   STUDENTS: `${BASE_URL}/students`,
  ADMIN_MANAGEMENT: `${BASE_URL}/admin_management`,
  VERIFY_EMAIL: `${BASE_URL}/verify_email`,
   DEPARTMENTS: `${BASE_URL}/departments`,
   FACULTIES: `${BASE_URL}/faculties`,
   MEDICAL_FORMS: `${BASE_URL}/medical_forms`,
  APPOINTMENTS: `${BASE_URL}/appointment`,
  STUDENTS_RESULTS: `${BASE_URL}/students_results`,
}

export default ADMIN_ENDPOINTS
