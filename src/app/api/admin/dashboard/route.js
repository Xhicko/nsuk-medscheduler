import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    // Call the PostgreSQL function that returns all dashboard data
    const { data, error } = await supabase.rpc('get_admin_dashboard')

    if (error) {
      console.error('Dashboard function error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      )
    }

    // The PostgreSQL function returns properly structured JSON
    const dashboardData = {
      stats: {
        appointmentsToday: data.appointmentsToday || 0,
        appointmentsThisWeek: data.appointmentsThisWeek || 0,
        appointmentsThisMonth: data.appointmentsThisMonth || 0,
        approvedBloodResults: data.approvedBloodResults || 0,
        totalUnactivatedStudentsThisWeek: data.totalUnactivatedStudentsThisWeek || 0,
        totalActivatedStudentsThisWeek: data.totalActivatedStudentsThisWeek || 0,
        totalMissedAppointments: data.totalMissedAppointments || 0,
        upcomingAppointments: data.upcomingAppointments || 0,
        pendingBloodResults: data.pendingBloodResults || 0
      },
      
      // These arrays are already properly formatted by the SQL function
      recentMedicalForms: data.recentMedicalForms || [],
      todaysAppointments: data.todaysAppointments || [],
      recentMissedAppointments: data.recentMissedAppointments || [],
      
      lastUpdated: data.lastUpdated
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}