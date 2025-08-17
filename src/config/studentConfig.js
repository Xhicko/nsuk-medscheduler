const BASE_URL = '/api/student'

export const STUDENT_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
    VERIFY: `${BASE_URL}/verify`,
  },
  LOOKUPS: `${BASE_URL}/lookups`,
  DASHBOARD: `${BASE_URL}/dashboard`,
  MEDICAL_FORMS: `${BASE_URL}/medical-forms`,
}

export default STUDENT_ENDPOINTS
