"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LogOut, BarChart3, Building, Users, Crown } from "lucide-react"
import { AgAnalytics } from "./ag-analytics"
import { AgDepartmentView } from "./ag-department-view"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Attorney General</h1>
          </div>
          <p className="text-sm text-muted-foreground">System-wide Analytics & Management</p>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-4">
            {/* Analytics Overview */}
            <div>
              <Button
                variant={selectedView === "analytics" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setSelectedView("analytics")}
              >
                <BarChart3 className="h-4 w-4" />
                System Analytics
              </Button>
            </div>

            <Separator />

            {/* Departments */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Departments ({departments.length})
              </h3>
              <div className="space-y-1">
                {departments.map((dept) => {
                  const deptActivities = activities.filter(
                    (activity) => activity.service.department_saga_id === dept.id,
                  ).length
                  const deptOfficers = officers.filter((officer) => officer.departments_sagas?.id === dept.id).length

                  return (
                    <Button
                      key={dept.id}
                      variant={selectedView === dept.id.toString() ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setSelectedView(dept.id.toString())}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{dept.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
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
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                SAGAs ({sagas.length})
              </h3>
              <div className="space-y-1">
                {sagas.map((saga) => {
                  const sagaActivities = activities.filter(
                    (activity) => activity.service.department_saga_id === saga.id,
                  ).length
                  const sagaOfficers = officers.filter((officer) => officer.departments_sagas?.id === saga.id).length

                  return (
                    <Button
                      key={saga.id}
                      variant={selectedView === saga.id.toString() ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setSelectedView(saga.id.toString())}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{saga.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
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

        <div className="p-4 border-t">
          <Button variant="outline" onClick={handleSignOut} className="w-full gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedView === "analytics"
                    ? "System Analytics Overview"
                    : selectedDepartmentSaga?.name || "Department/SAGA Details"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedView === "analytics"
                    ? "Comprehensive view of all OAG activities and performance"
                    : `${selectedDepartmentSaga?.type.toUpperCase()} • ${selectedActivities.length} activities • ${selectedOfficers.length} officers`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <Crown className="h-3 w-3" />
                  Attorney General
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {selectedView === "analytics" ? (
            <AgAnalytics
              activities={activities}
              officers={officers}
              departmentsSagas={departmentsSagas}
              services={services}
            />
          ) : selectedDepartmentSaga ? (
            <AgDepartmentView
              departmentSaga={selectedDepartmentSaga}
              activities={selectedActivities}
              officers={selectedOfficers}
              services={selectedServices}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
