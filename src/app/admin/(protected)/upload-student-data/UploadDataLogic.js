'use client'

import {useState, useEffect} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import axios from "axios"
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import {toast} from 'react-hot-toast'
import useDepartmentsStore from '@/store/admin/departmentsStore'

const studentSchema = z.object({
  matricNumber: z
    .string()
    .min(10, { message: "Matric Number is required" })
    .max(25, { message: "Matric Number is too long" })
    .regex(/^[A-Za-z0-9\/]+$/, {
      message: "Matric Number must contain only alphanumeric characters and forward slashes",
    }),

  fullName: z
    .string()
    .min(10, { message: "Full name is required" })
    .max(30, { message: "Full name is too long" }),

  gender: z.enum(["Male", "Female"], {
    required_error: "Gender is required",
  }),

  religion: z.enum(["Christian", "Muslim"], {
    required_error: "Religion is required",
  }),

  institute_email: z
    .string()
    .min(1, { message: "Institutional email is required" })
    .email({ message: "Invalid email format" }),

  department: z
    .string()
    .min(1, { message: "Department is required" }),

  faculty: z
    .string()
    .min(1, { message: "Faculty is required" }),
});

const formSchema = z.object({
  students: z.array(studentSchema)
});


export default function UploadDataLogic(){
   // Manual entry states
   const [students, setStudents] = useState([{ id: crypto.randomUUID() }])
   const [isMatricNumberFocused, setIsMatricNumberFocused] = useState({});
   const [isFullNameFocused, setIsFullNameFocused] = useState({});
   const [isInstituteEmailFocused, setIsInstituteEmailFocused] = useState({});
   const [showManualEntry, setShowManualEntry] = useState(true)
   const [refreshKey, setRefreshKey] = useState(0)
   const [buttonLoading, setButtonLoading] = useState(false)
   const [submissionStatus, setSubmissionStatus] = useState("idle")

   // Bulk upload states
   const [selectedFile, setSelectedFile] = useState(null)
   const [filePreview, setFilePreview] = useState(null)
   const [bulkUploadLoading, setBulkUploadLoading] = useState(false)

   // Get departments data from store
   const { 
      faculties, 
      loading,
      getDepartmentsByFaculty 
   } = useDepartmentsStore()
   
   // Derived state for UI (backward compatibility)
   const facultiesData = faculties
   const getDepartments = getDepartmentsByFaculty
   // Bulk upload logic
   const handleBulkFileChange = (e) => {
     const file = e.target.files?.[0] || null
     if (file) {
       setSelectedFile(file)
       readFileForPreview(file)
     } else {
       setSelectedFile(null)
       setFilePreview(null)
     }
   }

   const handleBulkDrop = (e) => {
     e.preventDefault()
     e.stopPropagation()
     const file = e.dataTransfer.files?.[0] || null
     if (file) {
       setSelectedFile(file)
       readFileForPreview(file)
     }
   }

   const handleBulkDragOver = (e) => {
     e.preventDefault()
     e.stopPropagation()
   }

   const readFileForPreview = (file) => {
     const reader = new FileReader()
     reader.onload = (event) => {
       const content = event.target?.result
       let parsedData = []
       try {
         if (file.type === "application/json") {
           const json = JSON.parse(content)
           // Require all fields for JSON as well
           const requiredFields = ["matric_number", "full_name", "gender", "religion", "institute_email", "department", "faculty"];
           if (
             Array.isArray(json) &&
             json.every((item) => typeof item === "object" && requiredFields.every(f => f in item))
           ) {
             parsedData = json.slice(0, 5)
           } else {
             throw new Error("Invalid JSON structure. Each record must include: " + requiredFields.join(", "))
           }
         } else if (file.type === "text/csv") {
           const lines = content.split("\n").filter((line) => line.trim() !== "")
           if (lines.length > 1) {
             const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
             const requiredHeaders = ["matric_number", "full_name", "gender", "religion", "institute_email", "department", "faculty"]
             const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
             if (missingHeaders.length > 0) {
               throw new Error(`Missing required CSV headers: ${missingHeaders.join(", ")}`)
             }
             parsedData = lines.slice(1, 6).map((line) => {
               const values = line.split(",")
               const record = {}
               headers.forEach((header, index) => {
                 if (requiredHeaders.includes(header)) {
                   record[header] = values[index]?.trim() || ""
                 }
               })
               return record
             })
           } else {
             throw new Error("CSV file is empty or has no data rows.")
           }
         } else if (file.type === "application/sql" || file.name.endsWith(".sql")) {
           // Simple but effective SQL parsing for the specific format
           try {
             // Find the column definitions
             const columnMatch = content.match(/INSERT\s+INTO\s+[\w.]+\s*\(\s*([^)]+)\s*\)/i);
             if (!columnMatch) {
               throw new Error("Could not find INSERT columns");
             }
             
             const columns = columnMatch[1]
               .split(',')
               .map(col => col.trim().replace(/[`'"]/g, '').toLowerCase());
             
             // Find all value sets between parentheses
             const valuePattern = /\(\s*([^)]+)\s*\)/g;
             const allValues = content.match(valuePattern);
             
             if (!allValues) {
               throw new Error("Could not find VALUES");
             }
             
             const records = [];
             for (let i = 0; i < Math.min(allValues.length, 5); i++) {
               const valueString = allValues[i];
               // Remove outer parentheses and split by comma, handling quotes
               const innerValues = valueString.slice(1, -1); // Remove ( and )
               
               const values = [];
               let current = '';
               let inQuotes = false;
               
               for (let j = 0; j < innerValues.length; j++) {
                 const char = innerValues[j];
                 if (char === "'" && (j === 0 || innerValues[j-1] !== '\\')) {
                   inQuotes = !inQuotes;
                 } else if (char === ',' && !inQuotes) {
                   values.push(current.trim().replace(/^'|'$/g, '').trim());
                   current = '';
                   continue;
                 }
                 current += char;
               }
               if (current.trim()) {
                 values.push(current.trim().replace(/^'|'$/g, '').trim());
               }
               
               // Map columns to values for display
               const record = {};
               columns.forEach((col, idx) => {
                 let displayCol = col;
                 // Map database column names to display names
                 if (col === 'institutional_email') displayCol = 'institute_email';
                 if (col === 'faculty_id') displayCol = 'faculty';
                 if (col === 'department_id') displayCol = 'department';
                 
                 record[displayCol] = values[idx] || '';
               });
               records.push(record);
             }
             
             setFilePreview(records);
           } catch (sqlError) {
             console.error('SQL parsing error:', sqlError);
             setFilePreview([
               {
                 matric_number: "SQL Preview",
                 full_name: content.substring(0, 50) + "...",
                 department: "N/A",
                 faculty: "N/A",
               },
             ]);
           }
           return
         } else {
           throw new Error("Unsupported file type. Please upload CSV, JSON, or SQL.")
         }
         setFilePreview(parsedData)
       } catch (error) {
         setFilePreview(null)
         setSelectedFile(null)
         toast.error(`File parsing error: ${error.message}`)
       }
     }
     reader.readAsText(file)
   }

   const handleBulkUpload = async () => {
     if (!selectedFile) {
       toast.error("Please select a file to upload.")
       return
     }
     
     setBulkUploadLoading(true)
     try {
       const formData = new FormData()
       formData.append("file", selectedFile)
       const response = await axios.post(ADMIN_ENDPOINTS.UPLOAD_STUDENT_DATA, formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
       })
       if (response.status === 200) {
         toast.success(response.data.message || "Bulk upload completed.")
       } else {
         toast.error(response.data.message || "Bulk upload failed.")
       }
     } catch (error) {
       toast.error("Bulk upload failed. Please try again.")
     } finally {
       setBulkUploadLoading(false)
       setSelectedFile(null)
       setFilePreview(null)
     }
   }

   const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors, dirtyFields },
   } = useForm({
      resolver: zodResolver(formSchema),
      mode: "onChange",
      defaultValues: {
         students: [{
            matricNumber: "",
            fullName: "",
            gender: "",
            religion: "",
            institute_email: "",
            department: "",
            faculty: "",
         }]
      },
   })

   // Watch values for floating labels
   const getWatchedValue = (index, field) => watch(`students.${index}.${field}`);

   // Helper function to check field validity
   const isFieldValid = (index, field) => {
      return dirtyFields.students?.[index]?.[field] && !errors.students?.[index]?.[field];
   }

   // Check if all forms are valid (per student)
   const areAllFormsValid = students.every((student, index) => {
      const isMatricNumberValid = isFieldValid(index, "matricNumber");
      const isFullNameValid = isFieldValid(index, "fullName");
      const isGenderValid = getWatchedValue(index, "gender") && !errors.students?.[index]?.gender;
      const isReligionValid = getWatchedValue(index, "religion") && !errors.students?.[index]?.religion;
      const isInstituteEmailValid = isFieldValid(index, "institute_email");
      const isDepartmentValid = getWatchedValue(index, "department") && !errors.students?.[index]?.department;
      const isFacultyValid = getWatchedValue(index, "faculty") && !errors.students?.[index]?.faculty;

      return (
         isMatricNumberValid &&
         isFullNameValid &&
         isGenderValid &&
         isReligionValid &&
         isInstituteEmailValid &&
         isDepartmentValid &&
         isFacultyValid
      );
   });



   // Per-student faculty/department change handlers
   const handleFacultyChange = (index, value) => {
      setValue(`students.${index}.faculty`, value)
      // Reset department when faculty changes
      setValue(`students.${index}.department`, "")
   }

   const handleDepartmentChange = (index, value) => {
      setValue(`students.${index}.department`, value)
   }

   // Form submit handler
   const onSubmit = async (data) => {
      setButtonLoading(true)
      setSubmissionStatus("idle")
      try {
         // Each student's faculty/department is now unique
         const studentsData = data.students.map(student => ({ ...student }))
         console.log('Submitting multiple students:', studentsData)
         const response = await axios.post(ADMIN_ENDPOINTS.UPLOAD_STUDENT_DATA, studentsData)
         if (response.status === 200) {
            const { results, message } = response.data;
            const hasError = Array.isArray(results) && results.some(r => r.status === 'error');
            if (hasError) {
               // Show all error messages
               const errorMsgs = results.filter(r => r.status === 'error').map(r => r.message + (r.error ? `: ${r.error}` : ''));
               toast.error(errorMsgs.join('\n'));
               setSubmissionStatus("error");
            } else {
               setSubmissionStatus("success");
               setStudents([{ id: (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : Math.random().toString(36).slice(2) }]);
               // Reset form values
               setValue("students", [{
                  matricNumber: "",
                  fullName: "",
                  gender: "",
                  religion: "",
                  institute_email: "",
                  department: "",
                  faculty: "",
               }]);
               toast.success(message || "Student(s) data sent successfully");
            }
         }
      } catch (error) {
         if (error.response) {
            const errorMessage = error.response.data.error || error.response.data.message || "Upload Student Data Error. Please try again.";
            toast.error(errorMessage);
         } else if (error.request) {
            toast.error("No response from server. Please check your connection.");
         } else {
            toast.error("An error occurred while setting up the request");
         }
         setSubmissionStatus("error");
      } finally {
         setButtonLoading(false);
      }
   }

   const handleAddStudent = () => {
      setStudents(prev => [...prev, { id: crypto.randomUUID() }])
   }

   const handleRemoveStudent = (studentId) => {
      if (students.length > 1) {
         setStudents(prev => prev.filter(student => student.id !== studentId))
      }
   }

   const handleFocusChange = (studentId, field, focused) => {
      switch(field) {
         case 'matricNumber':
            setIsMatricNumberFocused(prev => ({ ...prev, [studentId]: focused }))
            break
         case 'fullName':
            setIsFullNameFocused(prev => ({ ...prev, [studentId]: focused }))
            break
         case 'institute_email':
            setIsInstituteEmailFocused(prev => ({ ...prev, [studentId]: focused }))
            break
      }
   }

   const handleReloadData = () => {
      setRefreshKey((prevKey) => prevKey + 1)
   }

   return {
      handleReloadData,
      showManualEntry, 
      setShowManualEntry,
      refreshKey,
      setRefreshKey,
      students,
      handleAddStudent,
      handleRemoveStudent,
      handleFocusChange,
      register,
      handleSubmit,
      onSubmit,
      errors,
      isMatricNumberFocused,
      isFullNameFocused,
      isInstituteEmailFocused,
      getWatchedValue,
      isFieldValid,
      setValue,
      watch,
      handleFacultyChange,
      handleDepartmentChange,
      faculties,
      getDepartments,
      loading,
      areAllFormsValid,
      submissionStatus,
      buttonLoading,
      // Bulk upload
      selectedFile,
      filePreview,
      bulkUploadLoading,
      handleBulkFileChange,
      handleBulkDrop,
      handleBulkDragOver,
      handleBulkUpload
    }
}