"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { ActivityReviewList } from "./activity-review-list"
import { DepartmentStats } from "./department-stats"
import ModernLayout from "./modern-layout-v2"
import { EnhancedKPICard } from "../ui/enhanced-kpi-card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Service, User } from "@/lib/supabase/types"

interface ActivityWithDetails {
  id: number
  user_id: string
  service_id: number
  description: string
  count: number
  activity_date: string
  created_at: string
  updated_at: string
  service: {
    id: number
    name: string
  }
  users: {
    id: string
    full_name: string
  }
  activity_status: {
    id: number
    pending_count: number | null
    completed_count: number | null
    updated_by: string | null
    updated_at: string
  }[]
}

interface UserWithDepartment extends User {
  departments_sagas: {
    id: string
    name: string
    type: string
  }
}

interface HodDashboardProps {
  user: UserWithDepartment
  activities: ActivityWithDetails[]
  officers: Pick<User, "id" | "full_name" | "county">[]
  services: Service[]
}

export function HodDashboard({ user, activities, officers, services }: HodDashboardProps) {
  const router = useRouter()

  // Calculate statistics
  const totalActivities = activities?.length || 0
  const pendingReview = activities?.filter((activity) => !activity?.activity_status || activity.activity_status.length === 0).length || 0
  const inProgress = activities?.filter((activity) =>
    activity?.activity_status?.some((status) => (status?.pending_count || 0) > 0 && (status?.completed_count || 0) === 0),
  ).length || 0
  const completed = activities?.filter((activity) =>
    activity?.activity_status?.some((status) => (status?.completed_count || 0) > 0),
  ).length || 0

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/hod', icon: HomeIcon, current: true },
    { name: 'Activities', href: '/dashboard/hod', icon: DocumentTextIcon, current: false },
    { name: 'Team', href: '/dashboard/hod', icon: UserGroupIcon, current: false },
    { name: 'Analytics', href: '/dashboard/hod', icon: ChartBarIcon, current: false },
  ]

  const userInfo = {
    name: user.full_name,
    role: 'Head of Department',
    department: user.departments_sagas?.name
  }

  return (
    <ModernLayout navigation={navigation} userInfo={userInfo}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          {/* Floating background elements */}
          <motion.div
            className="absolute -top-4 -left-4 w-32 h-32 bg-primary-100/50 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-6 -right-8 w-24 h-24 bg-secondary-200/40 rounded-full blur-2xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          <div className="relative z-10">
            <motion.h1 
              className="text-display-md font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-800 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome back, {user.full_name}
            </motion.h1>
            <motion.p 
              className="text-xl text-neutral-600 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="inline-flex items-center">
                <motion.span
                  className="w-2 h-2 bg-primary-500 rounded-full mr-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Head of {user.departments_sagas?.name}
              </span>
              <span className="mx-2 text-neutral-400">•</span>
              <span className="text-secondary-600 font-semibold">{user.county} County</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced KPI Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EnhancedKPICard
            title="Total Activities"
            value={totalActivities}
            target={100}
            icon={<DocumentTextIcon />}
            color="primary"
            description="All department activities"
            trend="up"
            trendValue={12}
            trendPeriod="vs last month"
            showProgress={true}
            animated={true}
          />
          <EnhancedKPICard
            title="Pending Review"
            value={pendingReview}
            target={20}
            icon={<CheckCircleIcon />}
            color="warning"
            description="Awaiting your approval"
            trend={pendingReview > 5 ? "up" : "stable"}
            trendValue={pendingReview > 5 ? 8 : 0}
            trendPeriod="this week"
            showProgress={true}
            animated={true}
          />
          <EnhancedKPICard
            title="Team Members"
            value={officers.length}
            icon={<UserGroupIcon />}
            color="secondary"
            description="Active officers"
            trend="stable"
            trendValue={0}
            trendPeriod="no change"
            animated={true}
          />
          <EnhancedKPICard
            title="Completed"
            value={completed}
            previousValue={completed - 5}
            icon={<BuildingOfficeIcon />}
            color="success"
            description="Successfully completed"
            trend="up"
            trendValue={15}
            trendPeriod="vs last month"
            target={80}
            showProgress={true}
            animated={true}
          />
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Review Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-500" />
                Recent Activities for Review
              </h2>
            </div>
            <ActivityReviewList 
              activities={activities.slice(0, 5)}
              services={services}
              showActions={true}
              onStatusUpdate={() => router.refresh()}
            />
          </motion.div>

          {/* Department Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-secondary-500" />
                Department Statistics
              </h2>
            </div>
            <DepartmentStats
              activities={activities}
              officers={officers}
              services={services}
              departmentName={user.departments_sagas?.name || 'Department'}
            />
          </motion.div>
        </div>
      </div>
    </ModernLayout>
  )
}