'use client'

// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { Progress } from "@/components/ui/progress"
// import { SectionCard } from "@/components/custom/section-card"
// import { YesNoSegment } from "@/components/custom/yes-no-segment"
// import { FloatingLabelInput } from "@/components/custom/floating-label-input"
import { useStudentDashboardStore } from '@/store/Client/studentDashboardStore'
import StudentHeader from '@/components/custom/client/StudentHeader'
import MedicalFormsSkeleton from './MedicalFormsSkeleton'


export default function MedicalFormsView({ initialData, loading }) {
   const storeData = useStudentDashboardStore((state) => state.data)
  const student = storeData || initialData || null

     if (loading) {
       return <MedicalFormsSkeleton />
     }
   
   return (
      <div className="min-h-screen bg-background">
         <StudentHeader student={student} />
      </div>
   )
}
