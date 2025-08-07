const BASE_URL = '/api/admin'

export const ADMIN_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
  },
   DASHBOARD: `${BASE_URL}/dashboard`,
   UPLOAD_STUDENT_DATA: `${BASE_URL}/upload-student-data`,
   STUDENTS: `${BASE_URL}/students`,
   DEPARTMENTS: `${BASE_URL}/departments`,
   FACULTIES: `${BASE_URL}/faculties`,
}

export default ADMIN_ENDPOINTS
