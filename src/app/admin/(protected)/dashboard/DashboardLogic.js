import {useState} from 'react'
import { useAdminStore } from '@/store/admin/adminStore'
import { useDashboardStore } from '@/store/admin/dashboardStore'
import { BadgeCheck, BadgeX, Clock, Calendar, Cog} from 'lucide-react'
export default function DashboardLogic(){
   // Get profile data from admin store
   const profile = useAdminStore(state => state.profile)
   const { 
      fetchIfNeeded, 
      loading, 
      error, 
      getStats, 
      getRecentMedicalForms, 
      getTodaysAppointments, 
      getRecentMissedAppointments, 
      initialized, 
      isDataStale 
   } = useDashboardStore()
   const stats = getStats()
   const recentMedicalForms = getRecentMedicalForms()
   const todaysAppointments = getTodaysAppointments()
   const recentMissedAppointments = getRecentMissedAppointments()

   if (!initialized || isDataStale()) {
      Promise.resolve().then(() => fetchIfNeeded())
   }

    //  Stats for the progress bar
    const MAX = 30000;
    const approveprogress = Math.min(stats.approvedBloodResults / MAX * 100, 100); 
    const pendingprogress = Math.min(stats.pendingBloodResults / MAX * 100, 100); 
    const upcomingprogress = Math.min(stats.upcomingAppointments / MAX * 100, 100); 
    const missedprogress = Math.min(stats.totalMissedAppointments / MAX * 100, 100); 

   const growthMetrics = [
      {
        id: 1,
        title: "Approved Blood Results",
        value: stats.approvedBloodResults,
        change: stats.approvedBloodResults - stats.pendingBloodResults,
        trend: stats.approvedBloodResults > stats.pendingBloodResults ? "up" : "down",
        icon: BadgeCheck,
        color: stats.approvedBloodResults > stats.pendingBloodResults ? "#2ECC71" : "#E74C3C",
        progress: approveprogress,
      },
      {
       id: 2,
        title: "Pending Blood Results",
        value: stats.pendingBloodResults,
        change: stats.pendingBloodResults - stats.approvedBloodResults,
        trend: stats.pendingBloodResults > stats.approvedBloodResults ? "up" : "down",
        icon: Clock,
        color: stats.pendingBloodResults > stats.approvedBloodResults ? "#2ECC71" : "#E74C3C",
        progress: pendingprogress,
      },
      {
        id: 3,
        title: "Upcoming Appointments",
        value: stats.upcomingAppointments,
        change: stats.upcomingAppointments - stats.totalCompletedAppointments,
        trend: stats.upcomingAppointments > stats.totalCompletedAppointments ? "up" : "down",
        icon: Calendar,
        color: stats.upcomingAppointments > stats.totalCompletedAppointments ? "#2ECC71" : "#E74C3C",
        progress: upcomingprogress,
      },
      {
        id: 4,
        title: "Missed Appointments",
        value: stats.totalMissedAppointments,
        change: stats.totalMissedAppointments - stats.totalCompletedAppointments,
        trend: stats.totalMissedAppointments > stats.totalCompletedAppointments ? "up" : "down",
        icon: BadgeX,
        color: stats.totalMissedAppointments > stats.totalCompletedAppointments ? "#2ECC71" : "#E74C3C",
        progress: missedprogress
      },

    ]

    const recentMedicalFormsColumns = [
      {
        key: "studentname",
        header: "Student Name",
        render: (item) => <span className="font-medium text-gray-900">{item.studentname}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "matricnumber",
        header: "Matric Number",
        render: (item) => <span className="text-gray-600">{item.matricnumber}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "faculty",
        header: "Faculty",
        render: (item) => <span className="text-gray-600">{item.faculty}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "department",
        header: "Department",
        render: (item) => <span className="text-gray-600">{item.department}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "submittedat",
        header: "Submitted At",
        render: (item) => (
          <span className="text-sm text-gray-500">
            {new Date(item.submittedat).toLocaleDateString()}
          </span>
        ),
        className: "whitespace-nowrap",
      },
      {
        key: "completed",
        header: "Status",
        render: (item) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.completed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {item.completed ? 'Completed' : 'Pending'}
          </span>
        ),
        className: "whitespace-nowrap",
      },
    ]

    const todaysAppointmentsColumns = [
      {
        key: "studentname",
        header: "Student Name",
        render: (item) => <span className="font-medium text-gray-900">{item.studentname}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "matricnumber",
        header: "Matric Number",
        render: (item) => <span className="text-gray-600">{item.matricnumber}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "faculty",
        header: "Faculty",
        render: (item) => <span className="text-gray-600">{item.faculty}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "department",
        header: "Department",
        render: (item) => <span className="text-gray-600">{item.department}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "timerange",
        header: "Appointment Time",
        render: (item) => (
          <span className="text-gray-600">
            {new Date(item.timerange).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        ),
        className: "whitespace-nowrap",
      },
      {
        key: "status",
        header: "Status",
        render: (item) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === 'scheduled' 
              ? 'bg-blue-100 text-blue-800' 
              : item.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        ),
        className: "whitespace-nowrap",
      },
    ]

    const missedAppointmentsColumns = [
      {
        key: "studentname",
        header: "Student Name",
        render: (item) => <span className="font-medium text-gray-900">{item.studentname}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "matricnumber",
        header: "Matric Number",
        render: (item) => <span className="text-gray-600">{item.matricnumber}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "faculty",
        header: "Faculty",
        render: (item) => <span className="text-gray-600">{item.faculty}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "department",
        header: "Department",
        render: (item) => <span className="text-gray-600">{item.department}</span>,
        className: "whitespace-nowrap",
      },
      {
        key: "timerange",
        header: "Missed Time",
        render: (item) => (
          <span className="text-[#E74C3C]">
            {new Date(item.timerange).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        ),
        className: "whitespace-nowrap",
      },
      {
        key: "updatedat",
        header: "Updated At",
        render: (item) => (
          <span className="text-sm text-gray-500">
            {new Date(item.updatedat).toLocaleDateString()}
          </span>
        ),
        className: "whitespace-nowrap",
      },
    ]

   return{
      profile,
      stats,
      loading,
      error,
      growthMetrics,
      recentMedicalForms,
      recentMedicalFormsColumns,
      todaysAppointments,
      todaysAppointmentsColumns,
      recentMissedAppointments,
      missedAppointmentsColumns,
   }
}