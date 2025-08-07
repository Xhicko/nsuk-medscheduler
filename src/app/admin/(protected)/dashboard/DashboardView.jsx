'use client'

import {
   ArrowDownRight, 
   ArrowUpRight, 
   Calendar,
   UserRoundCheck,
   UserRoundX,
   FileText,
   Clock,
} from 'lucide-react'
import DashboardLogic from './DashboardLogic'
import {  
   Card,
   CardContent,
   CardHeader,
} from '@/components/ui/card';
import {Badge}  from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {DataTable} from '@/components/custom/admin/data-table'
export default function DashboardView(){

   const {
       profile,
       stats, 
       growthMetrics,
       recentMedicalForms,
       recentMedicalFormsColumns,
       todaysAppointments,
       todaysAppointmentsColumns,
       recentMissedAppointments,
       missedAppointmentsColumns,
       loading,
       } = DashboardLogic()
      
   return (
      <div className="min-h-[calc(100vh-49px)] bg-white">
         
         <div className="mb-8">
            <div className="relative p-6 overflow-hidden text-white shadow-lg bg-gradient-to-r from-[#0077B6]/90 to-[#0077B6] rounded-2xl md:p-8">
               {/* Background decorative elements */}
               <div className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 rounded-full bg-white/10"></div>
               <div className="absolute bottom-0 left-0 w-48 h-48 -mb-24 -ml-24 rounded-full bg-white/5"></div>

               <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-6 lg:mb-0 lg:flex-1">
                     <h1 className="mb-3 text-3xl font-bold md:text-4xl">Welcome back Dr. {profile?.full_name || 'Admin'}</h1>
                     <p className="mb-4 text-lg text-white md:text-xl">Here's what's happening with  your students today</p>

                     {/* Unified info panel */}
                     <div className="p-4 border bg-white/15 backdrop-blur-sm rounded-xl border-white/20">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center space-x-3">
                           <div className="p-2 rounded-lg bg-white/20">
                              <Calendar className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-medium text-white">Today's Appointment</p>
                              {loading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                  <span className="text-xs text-white/80">Loading...</span>
                                </div>
                              ) : (
                                <p className="text-xl font-bold text-white">{stats.appointmentsToday}</p>
                              )}
                           </div>
                        </div>

                        <div className="flex items-center space-x-3">
                           <div className="p-2 rounded-lg bg-white/20">
                              <Calendar className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-medium text-white">Today's Date</p>
                              <p className="text-lg font-semibold text-white">
                              {new Date().toLocaleDateString("en-US", {
                                 weekday: "short",
                                 month: "short",
                                 day: "numeric",
                                 year: "numeric",
                              })}
                              </p>
                           </div>
                        </div>
                        </div>
                     </div>
                  </div>

                  {/* Quick stats on the right */}
                  <div className="flex flex-col space-y-3 lg:ml-8">
                     <div className="px-4 py-3 text-center border rounded-lg bg-white/10 backdrop-blur-sm border-white/20">
                        <p className="text-sm text-white">This Week</p>
                        {loading ? (
                          <div className="flex items-center justify-center mt-1 space-x-2">
                            <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                            <span className="text-xs text-white/80">Loading...</span>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-white">{stats.appointmentsThisWeek}</p>
                        )}
                     </div>
                     <div className="px-4 py-3 text-center border rounded-lg bg-white/10 backdrop-blur-sm border-white/20">
                        <div className="flex items-center justify-center mb-1">
                        <p className="text-sm text-white">This Month</p>
                        </div>
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                            <span className="text-xs text-white/80">Loading...</span>
                          </div>
                        ) : (
                          <p className="text-xl font-bold text-white">{stats.appointmentsThisMonth}</p>
                        )}
                     </div>
                  </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Key metrics  Section*/}
        <div className="mt-8 mb-10">
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"> 
            {loading ? (
              // Loading skeleton for growth metrics
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-[#0077B6]/10 to-[#0077B6]/15">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 bg-[#0077B6] rounded-full opacity-25"></div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="rounded-full p-2.5 bg-[#0077B6]/80 text-white">
                            <div className="w-5 h-5 rounded bg-white/20 animate-pulse"></div>
                          </div>
                          <div className="w-16 h-6 bg-[#0077B6]/60 rounded animate-pulse"></div>
                        </div>
                        <div className="w-24 h-4 bg-[#0077B6]/95 rounded animate-pulse mb-2"></div>
                        <div className="w-16 h-8 bg-[#0077B6] rounded animate-pulse mb-3"></div>
                        <div className="w-full h-1 bg-[#0077B6]/30 rounded-full">
                          <div className="h-full bg-[#0077B6] rounded-full animate-pulse" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              growthMetrics.map((metric) => (
                 <Card key={metric.id} className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-[#0077B6]/10 to-[#0077B6]/15" >
                 <CardContent className="p-0">
                    <div className="relative">
                    <div className="absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 bg-[#0077B6] rounded-full opacity-25"></div>
                    <div className="p-5">
                       <div className="flex items-center justify-between mb-3">
                          <div className="rounded-full p-2.5 bg-[#0077B6]/80 text-white">
                          <metric.icon className="w-5 h-5" />
                          </div>
                          {metric.trend === "up" && (
                          <Badge className="text-white border-0 px-2.5 py-1 bg-[#0077B6]/60">
                             {metric.change} <ArrowUpRight style={{ color: metric.color }} className="w-5 h-5 ml-1" />
                          </Badge>
                          )}
                          {metric.trend === "down" && (
                          <Badge className="text-white border-0 px-2.5 py-1 bg-[#0077B6]/60">
                             {metric.change} <ArrowDownRight style={{ color: metric.color }} className="w-5 h-5 ml-1" />
                          </Badge>
                          )}
                       </div>
                       <h3 className="text-sm font-medium text-[#0077B6]/95">{metric.title}</h3>
                       <p className="mt-1 text-3xl font-bold text-[#0077B6]">{metric.value}</p>
                       <div className="w-full h-1 mt-3 overflow-hidden rouded-full bg-[#0077B6]/30">
                          <div className="h-full bg-[#0077B6] rounded-full" style={{ width: metric.progress + "%"}}></div>
                       </div>
                    </div>
                    </div>
                 </CardContent>
               </Card>
              ))
            )}
          </div>
        </div>

         {/* Activated and Unactivated Students Section */}
         <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2">
          {/* Active Students Card */}
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-[#0077B6]/10 to-[#0077B6]/15">
            <CardContent className="p-0">
              <div className="p-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 mr-4 text-white bg-[#0077B6]/60 rounded-full">
                      <UserRoundCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#0077B6]">Approved Students Account</h3>
                      {loading ? (
                        <div className="flex items-center mt-1 space-x-2">
                          <div className="w-4 h-4 border-2 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-[#0077B6]/80">Loading...</span>
                        </div>
                      ) : (
                        <p className="mt-1 text-3xl font-bold text-[#0077B6]/90">{stats.totalActivatedStudentsThisWeek}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#0077B6]">Verified Students Account Activation This Week</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className=" cursor-pointer h-auto px-3 py-1 mt-2 text-[#0077B6] hover:bg-[#0077B6]/20 hover:text-[#0077B6]/95"
                    >
                      Manage Students →
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inactive Students Card */}
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-gray-100 to-gray-150">
            <CardContent className="p-0">
              <div className="p-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 mr-4 text-white bg-gray-600 rounded-full">
                      <UserRoundX  className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Inactive Students Account</h3>
                      {loading ? (
                        <div className="flex items-center mt-1 space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-600 rounded-full border-t-transparent animate-spin"></div>
                          <span className="text-xs text-gray-600/80">Loading...</span>
                        </div>
                      ) : (
                        <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalUnactivatedStudentsThisWeek}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Pending Students Account Activation This Week</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-3 py-1 mt-2 text-gray-700 cursor-pointer hover:bg-gray-200 hover:text-gray-800"
                    >
                      Manage Studentss →
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
         </div>

          {/* Recent Submissions - Section*/}
        <div className="mb-8">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
               <CardHeader className="px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                     <div>
                     <h2 className="text-xl font-semibold text-[#0077B6]">Recent Medical Form Submissions</h2>
                     <p className="mt-1 text-sm text-[#0077B6]">Latest student form submissions requiring attention</p>
                     </div>
                     <div className="flex items-center gap-3">
                     <Button className="bg-[#0077B6] hover:bg-[#0077B6] text-white shadow-sm rounded cursor-pointer px-6 py-3 font-medium">
                       Manage Medical Forms
                     </Button>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-[#0077B6]">Loading medical forms...</p>
                    </div>
                  ) : recentMedicalForms.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-[#0077B6]/30 rounded-full">
                        <FileText className="w-6 h-6 text-[#0077B6]" />
                      </div>
                        <h3 className="mb-1 text-sm font-medium text-[#0077B6]">No Medical Forms</h3>
                        <p className="text-sm text-[#0077B6]">No recent medical form submissions found.</p>
                     </div>
                  ) : (
                    <DataTable data={recentMedicalForms} columns={recentMedicalFormsColumns} itemsPerPage={10} numbered={true} showPagination={false} />
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Today's Appointments - Section */}
         <div className="mb-8">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
               <CardHeader className="px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                     <div>
                     <h2 className="text-xl font-semibold text-[#0077B6]">Today's Appointments</h2>
                     <p className="mt-1 text-sm text-[#0077B6]">All scheduled appointments for today</p>
                     </div>
                     <div className="flex items-center gap-3">
                     <Button className="bg-[#0077B6] hover:bg-[#0077B6] text-white shadow-sm rounded cursor-pointer px-6 py-3 font-medium">
                       Manage Todays Appointments
                     </Button>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  {loading ? (
                     <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-sm text-[#0077B6]">Loading today's appointments...</p>
                     </div>
                     ) : todaysAppointments.length === 0 ? (
                        <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-[#0077B6]/30 rounded-full">
                           <Clock className="w-6 h-6 text-[#0077B6]" />
                        </div>
                        <h3 className="mb-1 text-sm font-medium text-[#0077B6]">No Appointments Today</h3>
                        <p className="text-sm text-[#0077B6]">No appointments scheduled for today.</p>
                     </div>
                     ) : (
                    <DataTable data={todaysAppointments} columns={todaysAppointmentsColumns} itemsPerPage={10} numbered={true} showPagination={false} />
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Recent Missed Appointments - Section */}
         <div className="mb-8">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
               <CardHeader className="px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                     <div>
                     <h2 className="text-xl font-semibold text-[#0077B6]">Recent Missed Appointments</h2>
                     <p className="mt-1 text-sm text-[#0077B6]">Appointments that were missed by students</p>
                     </div>
                     <div className="flex items-center gap-3">
                     <Button className="bg-[#0077B6] hover:bg-[#0077B6] text-white shadow-sm rounded cursor-pointer px-6 py-3 font-medium">
                      Manage Missed Appointments
                     </Button>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-[#0077B6]">Loading missed appointments...</p>
                    </div>
                  ) : recentMissedAppointments.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-[#0077B6]/30 rounded-full">
                           <Clock className="w-6 h-6 text-[#0077B6]" />
                        </div>
                        <h3 className="mb-1 text-sm font-medium text-[#0077B6]">No Missed Appointments</h3>
                        <p className="text-sm text-[#0077B6]">Great! No missed appointments found.</p>
                     </div>
                  ) : (
                    <DataTable data={recentMissedAppointments} columns={missedAppointmentsColumns} itemsPerPage={10} numbered={true} showPagination={false} />
                  )}
               </CardContent>
            </Card>
         </div>
      </div>
   )
}