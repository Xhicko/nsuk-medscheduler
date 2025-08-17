// Utility to format student data for StudentHeader
export default function formatStudentForHeader(storeData) {
  if (!storeData) return null;
  return {
    fullName: storeData.fullName,
    email: storeData.email,
  };
}
