"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, AlertCircle, FileText, XCircle } from "lucide-react"


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


function ResultStatus({ resultStatus }) {
  const isReady = Boolean(resultStatus)
  
  const statusConfig = isReady
    ? { 
        label: "Ready", 
        color: "text-green-900", 
        bgColor: "bg-green-300", 
        Icon: CheckCircle,
      }
    : { 
        label: "Not Ready", 
        color: "text-gray-900", 
        bgColor: "bg-gray-300", 
        Icon: XCircle,
      }

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-white">Medical Results Status</label>
      <div className={`p-3 rounded-md ${statusConfig.bgColor}`}>
        <div className="flex items-center gap-2">
          <statusConfig.Icon className={`h-4 w-4 ${statusConfig.color}`} />
          <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
        </div>
      </div>
    </div>
  )
}


function MedicalFormStatus({ status }) {
  if (!status) return null

  const normalizedStatus = String(status.status || '').toLowerCase()
  const isNotStartedStatus = ["not started", "not_started", "pending", "none"].includes(normalizedStatus)
  const isInProgressStatus = ["inprogress", "in_progress", "progress", "ongoing"].includes(normalizedStatus)
  const isCompletedStatus = ["completed", "complete", "done", "finished"].includes(normalizedStatus)

  const statusConfig = isCompletedStatus
    ? { label: "Complete", color: "text-green-900", bgColor: "bg-green-300", Icon: CheckCircle }
    : isInProgressStatus
    ? { label: "In Progress", color: "text-orange-900", bgColor: "bg-orange-300", Icon: AlertCircle }
    : { label: "Not Started", color: "text-gray-900", bgColor: "bg-gray-300", Icon: Clock }

  const progressPercentage = typeof status.progress_percentage === 'number' ? status.progress_percentage : 0
  const currentStep = typeof status.current_step === 'number' ? status.current_step : 0
  const totalSteps = typeof status.total_steps === 'number' ? status.total_steps : undefined

  return (
    <div className="space-y-1">
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


export default function StudentProfileCard({ student }) {
  const formattedGender = student?.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : ''

  return (
    <Card className="w-full bg-[#0077B6] border-none">
      <CardHeader>
        <CardTitle className="text-white text-xl xs:text-lg font-semibold">Student Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid gap-3 xs:gap-2">
          <ProfileField label="Full Name" value={student?.fullName} fieldKey="full-name" />

          {student?.gender && (
            <ProfileField label="Gender" value={formattedGender} fieldKey="gender" />
          )}

          <ProfileField label="Matric Number" value={student?.matricNumber} fieldKey="matric-number" />

          <ProfileField label="Email" value={student?.email} fieldKey="email" />

          <ProfileField label="Faculty" value={student?.facultyName} fieldKey="faculty" />

          <ProfileField label="Department" value={student?.departmentName} fieldKey="department" />

          <MedicalFormStatus status={student?.medicalFormStatus} />

          <ResultStatus resultStatus={student?.resultStatus} />

        </div>

        <div className="mt-4 pt-4 border-t border-white">
          <p className="text-xs text-white">
            Profile information is read-only. Contact administration for updates.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
