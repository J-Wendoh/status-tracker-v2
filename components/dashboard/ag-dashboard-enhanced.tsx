"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, Building, Users, Activity, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { AgAnalytics } from "./ag-analytics"
import { AgDepartmentView } from "./ag-department-view"
import ModernLayout from "./modern-layout-v2"
import { EnhancedKPICard } from "../ui/enhanced-kpi-card"
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

  // Group departments and SAGAs
  const departments = departmentsSagas.filter((item) => item.type === "Department")
  const sagas = departmentsSagas.filter((item) => item.type === "SAGA")

  // Calculate overall statistics
  const totalActivities = activities.length
  const totalOfficers = officers.length
  const totalDepartmentsSagas = departmentsSagas.length

  // Calculate activity statistics
  const pendingActivities = activities.filter(activity =>
    !activity.activity_status || activity.activity_status.length === 0
  ).length

  const completedActivities = activities.filter(activity =>
    activity.activity_status?.some(status => (status?.completed_count || 0) > 0)
  ).length

  const inProgressActivities = activities.filter(activity =>
    activity.activity_status?.some(status => (status?.pending_count || 0) > 0 && (status?.completed_count || 0) === 0)
  ).length

  // Build navigation array with departments and sagas
  const navigation = [
    {
      name: 'System Analytics',
      href: '/dashboard/ag',
      icon: BarChart3,
      current: selectedView === "analytics"
    },
    ...departments.map(dept => {
      const deptActivities = activities.filter(
        activity => activity.service.department_saga_id === dept.id
      ).length
      const deptOfficers = officers.filter(officer => officer.departments_sagas?.id === dept.id).length

      return {
        name: dept.name,
        href: `/dashboard/ag/department/${dept.id}`,
        icon: Building,
        current: selectedView === dept.id.toString(),
        badge: `${deptOfficers} officers • ${deptActivities} activities`
      }
    }),
    ...sagas.map(saga => {
      const sagaActivities = activities.filter(
        activity => activity.service.department_saga_id === saga.id
      ).length
      const sagaOfficers = officers.filter(officer => officer.departments_sagas?.id === saga.id).length

      return {
        name: saga.name,
        href: `/dashboard/ag/saga/${saga.id}`,
        icon: Users,
        current: selectedView === saga.id.toString(),
        badge: `${sagaOfficers} officers • ${sagaActivities} activities`
      }
    })
  ]

  const userInfo = {
    name: user.full_name,
    role: 'Attorney General',
    department: 'System Administrator'
  }

  const handleViewChange = (href: string) => {
    // Extract the view ID from the href
    if (href === '/dashboard/ag') {
      setSelectedView('analytics')
    } else if (href.includes('/department/')) {
      const deptId = href.split('/department/')[1]
      setSelectedView(deptId)
    } else if (href.includes('/saga/')) {
      const sagaId = href.split('/saga/')[1]
      setSelectedView(sagaId)
    }
  }

  // Get selected department or saga data
  const selectedDepartmentSaga = departmentsSagas.find(ds => ds.id.toString() === selectedView)
  const selectedActivities = selectedDepartmentSaga
    ? activities.filter(activity => activity.service.department_saga_id === selectedDepartmentSaga.id)
    : []
  const selectedOfficers = selectedDepartmentSaga
    ? officers.filter(officer => officer.departments_sagas?.id === selectedDepartmentSaga.id)
    : []
  const selectedServices = selectedDepartmentSaga
    ? services.filter(service => service.department_saga_id === selectedDepartmentSaga.id)
    : []

  return (
    <ModernLayout
      navigation={navigation}
      userInfo={userInfo}
      backgroundImage="/background03.jpg"
      pageTitle="Attorney General Dashboard"
      onNavigationClick={handleViewChange}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 border border-orange-200/50 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {user.full_name}
              </h1>
              <p className="text-gray-700 font-medium">
                Managing {totalOfficers} officers across {totalDepartmentsSagas} departments and SAGAs
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Overseeing {totalActivities} total activities system-wide
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Overview KPIs */}
        {selectedView === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <EnhancedKPICard
              title="Total Activities"
              value={totalActivities}
              icon={Activity}
              trend={{ value: 15, isPositive: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
            />
            <EnhancedKPICard
              title="Pending Review"
              value={pendingActivities}
              icon={Clock}
              trend={{ value: -8, isPositive: true }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
            />
            <EnhancedKPICard
              title="In Progress"
              value={inProgressActivities}
              icon={AlertCircle}
              trend={{ value: 12, isPositive: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
            />
            <EnhancedKPICard
              title="Completed"
              value={completedActivities}
              icon={CheckCircle}
              trend={{ value: 23, isPositive: true }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
            />
          </motion.div>
        )}

        {/* Content Based on Selected View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
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
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View Not Found</h3>
              <p className="text-gray-600">Please select a valid department or SAGA from the navigation.</p>
            </div>
          )}
        </motion.div>
      </div>
    </ModernLayout>
  )
}