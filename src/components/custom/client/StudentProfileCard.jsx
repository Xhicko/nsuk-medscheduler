"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

/**
 * Small presentational field for a read-only profile value.
 * @param {{ label: string, value?: string, fieldKey: string }} props
 */
function ProfileField({ label, value, fieldKey }) {
  return (
    <div className="space-y-2">
      <label className="text-white text-sm font-medium" htmlFor={fieldKey}>
        {label}
      </label>
      <div className="p-3 bg-white rounded-md">
        <span id={fieldKey} className="text-[#0077B6] text-sm font-medium break-all" aria-label={`${label}: ${value || '-'}`}>
          {value || '-'}
        </span>
      </div>
    </div>
  )
}

/**
 * Render medical form status card.
 * Expected shape: { status: string, progress_percentage?: number, current_step?: number, total_steps?: number }
 * @param {{ status: any }} props
 */
function MedicalFormStatus({ status }) {
  if (!status) return null

  const normalizedStatus = String(status.status || '').toLowerCase()
  const isNotStartedStatus = ["not started", "not_started", "pending", "none"].includes(normalizedStatus)
  const isInProgressStatus = ["inprogress", "in_progress", "progress", "ongoing"].includes(normalizedStatus)
  const isCompletedStatus = ["completed", "complete", "done", "finished"].includes(normalizedStatus)

  const statusConfig = isCompletedStatus
    ? { label: "Complete", color: "text-green-600", bgColor: "bg-green-100", Icon: CheckCircle }
    : isInProgressStatus
    ? { label: "In Progress", color: "text-orange-600", bgColor: "bg-orange-100", Icon: AlertCircle }
    : { label: "Not Started", color: "text-gray-900", bgColor: "bg-gray-400", Icon: Clock }

  const progressPercentage = typeof status.progress_percentage === 'number' ? status.progress_percentage : 0
  const currentStep = typeof status.current_step === 'number' ? status.current_step : 0
  const totalSteps = typeof status.total_steps === 'number' ? status.total_steps : undefined

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">Medical Form Status</label>
      <div className={`p-3 rounded-md ${statusConfig.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <statusConfig.Icon className={`h-4 w-4 ${statusConfig.color}`} />
            <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
          {!isNotStartedStatus && <span className={`text-xs font-medium ${statusConfig.color}`}>{progressPercentage}%</span>}
        </div>
        {isInProgressStatus && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Step {currentStep}{typeof totalSteps === 'number' ? ` of ${totalSteps}` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Expected student shape (from dashboard API/store):
// {
//   fullName, gender, matricNumber, email, facultyName, departmentName, medicalFormStatus
// }
/**
 * Student Profile Card for the dashboard.
 * @param {{ student: {
 *   fullName?: string,
 *   gender?: string,
 *   matricNumber?: string,
 *   email?: string,
 *   facultyName?: string,
 *   departmentName?: string,
 *   medicalFormStatus?: { status: string, progress_percentage?: number, current_step?: number, total_steps?: number }
 * } }} props
 */
export default function StudentProfileCard({ student }) {
  const router = useRouter()
  const formattedGender = student?.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : ''

  return (
    <Card className="w-full bg-[#0077B6]">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-xl xs:text-lg font-semibold">Student Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xs:gap-3">
          <ProfileField label="Full Name" value={student?.fullName} fieldKey="full-name" />

          {student?.gender && (
            <ProfileField label="Gender" value={formattedGender} fieldKey="gender" />
          )}

          <ProfileField label="Matric Number" value={student?.matricNumber} fieldKey="matric-number" />

          <ProfileField label="Email" value={student?.email} fieldKey="email" />

          <ProfileField label="Faculty" value={student?.facultyName} fieldKey="faculty" />

          <ProfileField label="Department" value={student?.departmentName} fieldKey="department" />

          <MedicalFormStatus status={student?.medicalFormStatus} />
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={() => router.push('/student/medical_forms')}
            className="cursor-pointer w-full bg-white hover:bg-white/90  text-[#0077B6] hover:text-[#0077B6]/90"
            size="lg"
          >
            <FileText className="h-5 w-5 mr-2" />
            Fill Medical Form
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-white">
            Profile information is read-only. Contact administration for updates.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
