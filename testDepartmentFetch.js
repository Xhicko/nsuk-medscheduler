// This file contains a test function to verify the department fetching functionality
// Run this in your browser console when the upload modal is open to check if departments are being correctly fetched

function testDepartmentFetching() {
  // Check if we're in the right context
  if (!window.uploadModalLogic) {
    console.error("Upload modal logic not available. Make sure you're on the students page with the modal open.");
    return;
  }
  
  const logic = window.uploadModalLogic;
  
  // Log current state
  console.log("Current faculties:", logic.faculties);
  console.log("Current departments state:", logic.departments);
  
  // Test faculty selection
  if (logic.faculties.length > 0) {
    const testFacultyId = logic.faculties[0].id;
    console.log(`Testing department fetch for faculty: ${logic.faculties[0].name} (${testFacultyId})`);
    
    // Manually trigger department fetching
    logic.handleFacultyChange(0, testFacultyId);
    
    // Check after a short delay
    setTimeout(() => {
      console.log("Departments after fetch:", logic.departments);
      const depts = logic.getDepartments(testFacultyId);
      console.log(`Found ${depts.length} departments for faculty ${testFacultyId}:`, depts);
    }, 1000);
  } else {
    console.error("No faculties available to test with");
  }
}

// Expose the test function globally
window.testDepartmentFetching = testDepartmentFetching;
console.log("Department fetch test ready. Run window.testDepartmentFetching() to execute.");
