"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LogOut, BarChart3, Building, Users, Crown } from "lucide-react"
import { AgAnalytics } from "./ag-analytics"
import { AgDepartmentView } from "./ag-department-view"
import { LoadingPopup } from "../ui/loading-popup"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { User, DepartmentSaga, Service } from "@/lib/supabase/types"

interface ActivityWithFullDetails {
  id: number
  user_id: string
  service_id: number
  description: string
  count: number
  file_url?: string | null
  created_at: string
  updated_at: string
  user: {
    id: string
    full_name: string
    email: string
    county: string
    category: string
    department_saga_id: number
  }
  service: {
    id: number
    name: string
    department_saga_id: number
  }
  activity_status: {
    id: number
    pending_count: number | null
    completed_count: number | null
    updated_by: string | null
    created_at: string
  }[]
}

interface OfficerWithDepartment extends User {
  departments_sagas: {
    id: number
    name: string
    type: string
  } | null
}

interface AgDashboardProps {
  user: User
  departmentsSagas: DepartmentSaga[]
  activities: ActivityWithFullDetails[]
  officers: OfficerWithDepartment[]
  services: Service[]
}

export function AgDashboard({ user, departmentsSagas, activities, officers, services }: AgDashboardProps) {
  const [selectedView, setSelectedView] = useState<"analytics" | string>("analytics")
  const [departmentsExpanded, setDepartmentsExpanded] = useState(true)
  const [sagasExpanded, setSagasExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // Group departments and SAGAs
  const departments = departmentsSagas.filter((item) => item.type === "Department")
  const sagas = departmentsSagas.filter((item) => item.type === "SAGA")

  // Calculate overall statistics
  const totalActivities = activities.length
  const totalOfficers = officers.length
  const totalDepartmentsSagas = departmentsSagas.length

  const pendingActivities = activities.filter((activity) => activity.activity_status.length === 0).length
  const completedActivities = activities.filter((activity) =>
    activity.activity_status.some((status) => status.completed_count && status.completed_count > 0),
  ).length

  // Get selected department/SAGA data
  const selectedDepartmentSaga = departmentsSagas.find((item) => item.id.toString() === selectedView)
  const selectedActivities = selectedDepartmentSaga
    ? activities.filter((activity) => activity.service.department_saga_id === selectedDepartmentSaga.id)
    : []
  const selectedOfficers = selectedDepartmentSaga
    ? officers.filter((officer) => officer.departments_sagas?.id === selectedDepartmentSaga.id)
    : []
  const selectedServices = selectedDepartmentSaga
    ? services.filter((service) => service.department_saga_id === selectedDepartmentSaga.id)
    : []

  const handleViewChange = async (view: string) => {
    setIsLoading(true)
    // Simulate loading with different messages based on view type
    const loadingMessage = view === "analytics" 
      ? "Loading system analytics..." 
      : `Loading ${departmentsSagas.find(d => d.id.toString() === view)?.name || "department"} data...`
    
    await new Promise(resolve => setTimeout(resolve, 1200)) // Simulate loading
    setSelectedView(view)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-orange-100 flex relative">
      {/* Warm Orange-Brown Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-6"
          style={{ backgroundImage: `url('/background03.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-amber-50/60 to-orange-200/20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-200/20 via-transparent to-amber-100/15" />
        <div className="absolute inset-0 backdrop-blur-[0.5px]" />
      </div>

      {/* Warm Orange-Brown floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/25 via-amber-300/20 to-orange-400/25 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 via-orange-100/30 to-amber-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-orange-300/20 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Orange-Brown Themed Sidebar */}
      <motion.div 
        className="w-80 border-r bg-gradient-to-b from-amber-50/95 to-orange-50/95 backdrop-blur-xl shadow-2xl border-orange-200/60 relative z-10"
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Warm orange accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 via-amber-50/70 to-orange-200/30" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600" />
        <div className="p-6 border-b border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-orange-900">
                Attorney General
              </h1>
              <p className="text-xs text-orange-700 font-medium">System Analytics & Management</p>
            </div>
          </div>
          
          {/* Enhanced Welcome message */}
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-3 border border-orange-200">
            <p className="text-sm text-orange-800 font-medium">Welcome, {user.full_name}</p>
            <p className="text-xs text-orange-700 mt-1">Managing {totalOfficers} officers across {totalDepartmentsSagas} departments</p>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-4">
            {/* Analytics Overview */}
            <div>
              <Button
                variant={selectedView === "analytics" ? "default" : "ghost"}
                className={`w-full justify-start gap-2 transition-all duration-300 hover:scale-[1.02] ${
                  selectedView === "analytics"
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg border border-orange-400'
                    : 'text-orange-800 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 hover:text-orange-900 border border-transparent'
                }`}
                onClick={() => handleViewChange("analytics")}
              >
                <BarChart3 className={`h-4 w-4 ${
                  selectedView === "analytics" ? 'text-white' : 'text-orange-600'
                }`} />
                System Analytics
              </Button>
            </div>

            <Separator />

            {/* Collapsible Departments */}
            <div>
              <button
                onClick={() => setDepartmentsExpanded(!departmentsExpanded)}
                className="w-full flex items-center justify-between text-sm font-medium text-orange-800 mb-2 p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Departments ({departments.length})
                </div>
                <motion.div
                  animate={{ rotate: departmentsExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: departmentsExpanded ? 'auto' : 0, opacity: departmentsExpanded ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pb-2">
                  {departments.map((dept) => {
                    const deptActivities = activities.filter(
                      (activity) => activity.service.department_saga_id === dept.id,
                    ).length
                    const deptOfficers = officers.filter((officer) => officer.departments_sagas?.id === dept.id).length

                    return (
                      <Button
                        key={dept.id}
                        variant={selectedView === dept.id.toString() ? "default" : "ghost"}
                        className={`w-full justify-start text-left h-auto p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                          selectedView === dept.id.toString()
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg border border-orange-400'
                            : 'text-orange-800 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 hover:text-orange-900 border border-transparent'
                        }`}
                        onClick={() => handleViewChange(dept.id.toString())}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{dept.name}</div>
                          <div className={`text-xs flex items-center gap-2 mt-1 ${
                            selectedView === dept.id.toString() ? 'text-white/90' : 'text-orange-600'
                          }`}>
                            <span>{deptOfficers} officers</span>
                            <span>•</span>
                            <span>{deptActivities} activities</span>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            <Separator />

            {/* Collapsible SAGAs */}
            <div>
              <button
                onClick={() => setSagasExpanded(!sagasExpanded)}
                className="w-full flex items-center justify-between text-sm font-medium text-orange-800 mb-2 p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  SAGAs ({sagas.length})
                </div>
                <motion.div
                  animate={{ rotate: sagasExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{ height: sagasExpanded ? 'auto' : 0, opacity: sagasExpanded ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pb-2">
                  {sagas.map((saga) => {
                    const sagaActivities = activities.filter(
                      (activity) => activity.service.department_saga_id === saga.id,
                    ).length
                    const sagaOfficers = officers.filter((officer) => officer.departments_sagas?.id === saga.id).length

                    return (
                      <Button
                        key={saga.id}
                        variant={selectedView === saga.id.toString() ? "default" : "ghost"}
                        className={`w-full justify-start text-left h-auto p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                          selectedView === saga.id.toString()
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg border border-orange-400'
                            : 'text-orange-800 hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100 hover:text-orange-900 border border-transparent'
                        }`}
                        onClick={() => handleViewChange(saga.id.toString())}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{saga.name}</div>
                          <div className={`text-xs flex items-center gap-2 mt-1 ${
                            selectedView === saga.id.toString() ? 'text-white/90' : 'text-orange-600'
                          }`}>
                            <span>{sagaOfficers} officers</span>
                            <span>•</span>
                            <span>{sagaActivities} activities</span>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </ScrollArea>

        {/* Orange-Brown Sign Out Section */}
        <div className="p-4 border-t border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            className="w-full gap-2 text-orange-700 border-orange-300 hover:bg-orange-100 hover:border-orange-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-md font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Enhanced Main Content with Kenyan Branding */}
      <div className="flex-1 relative z-10 overflow-hidden">
        {/* Background Enhancement */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-8"
            style={{ backgroundImage: `url('/background.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-100/40 via-white/60 to-accent-100/40" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-50/30 via-transparent to-gold-50/30" />
        </div>

        {/* Orange-Brown Themed Header */}
        <motion.header 
          className="border-b border-orange-200/60 bg-gradient-to-r from-amber-50/95 via-orange-50/90 to-amber-100/80 backdrop-blur-xl shadow-lg relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Orange-Brown Accent Stripe */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600" />
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400/40 via-amber-500/50 to-orange-400/40" />
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              {/* Enhanced Title Section with Logo */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/50">
                  <Image
                    src="/courtofarms.jpeg"
                    alt="Kenya Coat of Arms"
                    width={32}
                    height={32}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-800 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {selectedView === "analytics"
                      ? "System Analytics Overview"
                      : selectedDepartmentSaga?.name || "Department/SAGA Details"}
                  </h2>
                  <p className="text-sm text-orange-700 mt-1 font-medium">
                    {selectedView === "analytics"
                      ? "Comprehensive view of all OAG activities and performance"
                      : `${selectedDepartmentSaga?.type.toUpperCase()} • ${selectedActivities.length} activities • ${selectedOfficers.length} officers`}
                  </p>
                </div>
              </div>
              
              {/* Enhanced Right Header with Brown Touches */}
              <div className="flex items-center gap-4">
                <div className="px-4 py-2.5 bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 rounded-xl shadow-lg border border-orange-400/30 relative overflow-hidden">
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-white text-sm font-bold block">Attorney General</span>
                      <span className="text-amber-200 text-xs font-medium">System Administrator</span>
                    </div>
                  </div>
                </div>
                
                {/* Orange Theme Indicator */}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                  <div className="w-2 h-8 bg-amber-600 rounded-full"></div>
                  <div className="w-2 h-8 bg-orange-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Enhanced Content with Vibrant Background */}
        <main className="p-6 relative z-10 min-h-screen">
          {/* Floating Kenyan Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-3 h-3 rounded-full ${
                  i % 3 === 0 ? 'bg-secondary-300/30' : 
                  i % 3 === 1 ? 'bg-primary-300/30' : 'bg-accent-300/30'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          {/* Content Wrapper with Enhanced Styling */}
          <motion.div
            className="relative z-10 bg-white/40 backdrop-blur-sm rounded-2xl border border-primary-100/50 shadow-luxury p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Content Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-primary-25/60 to-gold-25/40 rounded-2xl" />
            <div className="relative z-10">
            <AnimatePresence mode="wait">
              {selectedView === "analytics" ? (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AgAnalytics
                    activities={activities}
                    officers={officers}
                    departmentsSagas={departmentsSagas}
                    services={services}
                  />
                </motion.div>
              ) : selectedDepartmentSaga ? (
                <motion.div
                  key={selectedDepartmentSaga.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AgDepartmentView
                    departmentSaga={selectedDepartmentSaga}
                    activities={selectedActivities}
                    officers={selectedOfficers}
                    services={selectedServices}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Cool Loading Popup */}
      <LoadingPopup 
        isVisible={isLoading} 
        message={selectedView === "analytics" 
          ? "Loading system analytics..." 
          : `Loading ${departmentsSagas.find(d => d.id.toString() === selectedView)?.name || "department"} data...`
        }
      />
    </div>
  )
}