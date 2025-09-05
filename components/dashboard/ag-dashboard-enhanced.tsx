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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 flex relative">
      {/* Background pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/background02.png')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30" />
      </div>

      {/* Floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200/20 rounded-full blur-3xl"
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
      </div>

      {/* Sidebar */}
      <motion.div 
        className="w-80 border-r bg-neutral-900/95 backdrop-blur-sm shadow-xl border-neutral-700 relative z-10"
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-luxury-gradient rounded-xl flex items-center justify-center shadow-lg">
              <Image
                src="/courtofarms.jpeg"
                alt="Kenya Coat of Arms"
                width={28}
                height={28}
                className="rounded-md object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-400">
                Attorney General
              </h1>
              <p className="text-xs text-neutral-400">System Analytics & Management</p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-4">
            {/* Analytics Overview */}
            <div>
              <Button
                variant={selectedView === "analytics" ? "default" : "ghost"}
                className={`w-full justify-start gap-2 transition-all duration-200 ${
                  selectedView === "analytics"
                    ? 'bg-luxury-gradient text-white shadow-lg'
                    : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
                onClick={() => setSelectedView("analytics")}
              >
                <BarChart3 className={`h-4 w-4 ${
                  selectedView === "analytics" ? 'text-white' : 'text-neutral-400'
                }`} />
                System Analytics
              </Button>
            </div>

            <Separator />

            {/* Departments */}
            <div>
              <h3 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Departments ({departments.length})
              </h3>
              <div className="space-y-2">
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
                          ? 'bg-luxury-gradient text-white shadow-lg border border-primary-300'
                          : 'text-neutral-300 hover:bg-neutral-800 hover:text-primary-400 border border-transparent'
                      }`}
                      onClick={() => setSelectedView(dept.id.toString())}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{dept.name}</div>
                        <div className={`text-xs flex items-center gap-2 mt-1 ${
                          selectedView === dept.id.toString() ? 'text-white/90' : 'text-neutral-400'
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
            </div>

            <Separator />

            {/* SAGAs */}
            <div>
              <h3 className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                SAGAs ({sagas.length})
              </h3>
              <div className="space-y-2">
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
                          ? 'bg-luxury-gradient text-white shadow-lg border border-primary-300'
                          : 'text-neutral-300 hover:bg-neutral-800 hover:text-primary-400 border border-transparent'
                      }`}
                      onClick={() => setSelectedView(saga.id.toString())}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{saga.name}</div>
                        <div className={`text-xs flex items-center gap-2 mt-1 ${
                          selectedView === saga.id.toString() ? 'text-white/90' : 'text-neutral-400'
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
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-neutral-700">
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            className="w-full gap-2 text-red-700 border-red-200 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Header */}
        <motion.header 
          className="border-b border-neutral-700 bg-neutral-900/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary-400">
                  {selectedView === "analytics"
                    ? "System Analytics Overview"
                    : selectedDepartmentSaga?.name || "Department/SAGA Details"}
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {selectedView === "analytics"
                    ? "Comprehensive view of all OAG activities and performance"
                    : `${selectedDepartmentSaga?.type.toUpperCase()} • ${selectedActivities.length} activities • ${selectedOfficers.length} officers`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 bg-luxury-gradient rounded-lg shadow-md">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-semibold">Attorney General</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>
        </main>
      </div>
    </div>
  )
}