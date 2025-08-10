const BASE_URL = '/api/admin'

export const ADMIN_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
  },
   DASHBOARD: `${BASE_URL}/dashboard`,
   STUDENTS: `${BASE_URL}/students`,
   DEPARTMENTS: `${BASE_URL}/departments`,
   FACULTIES: `${BASE_URL}/faculties`,
   MEDICAL_FORMS: `${BASE_URL}/medical_forms`,
}

export default ADMIN_ENDPOINTS
