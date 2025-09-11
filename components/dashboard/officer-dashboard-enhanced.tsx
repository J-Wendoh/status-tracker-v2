"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline"
import { ActivityForm } from "./activity-form"
import { ActivityList } from "./activity-list"
import ModernLayout from "./modern-layout-v2"
import KPICard from "./KPICard"
import { EnhancedKPICard } from "../ui/enhanced-kpi-card"
import { CardSkeleton, LoadingDots } from "../ui/loading"
import type { Service, Activity } from "@/lib/supabase/types"
import type { UserWithDepartmentSaga } from "@/lib/supabase/types"

interface OfficerDashboardProps {
  user: UserWithDepartmentSaga
  services: Service[]
  activities: (Activity & {
    service: {
      id: string
      name: string
    }
    activity_status: {
      pending_count: number
      completed_count: number
      created_at: string
    }[]
  })[]
}

export function OfficerDashboard({ user, services, activities }: OfficerDashboardProps) {
  const router = useRouter()
  const [showActivityForm, setShowActivityForm] = useState(false)

  const totalActivities = activities?.length || 0
  const pendingActivities = activities?.filter(
    (activity) =>
      !activity.activity_status || 
      activity.activity_status.length === 0 || 
      (Array.isArray(activity.activity_status) && activity.activity_status.some((status) => status?.pending_count > 0)),
  ).length || 0
  const completedActivities = activities?.filter((activity) =>
    Array.isArray(activity.activity_status) && activity.activity_status.some((status) => status?.completed_count > 0),
  ).length || 0

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/officer', icon: HomeIcon, current: true },
    { name: 'Activities', href: '/dashboard/officer/activities', icon: DocumentTextIcon, current: false },
  ]

  const userInfo = {
    name: user.full_name,
    role: 'Officer',
    department: user.departments_sagas?.name
  }

  return (
    <ModernLayout 
      navigation={navigation} 
      userInfo={userInfo}
      backgroundImage="/background02.png"
      pageTitle="Officer Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          {/* Enhanced floating background elements with Kenyan flag colors */}
          <motion.div
            className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-300/30 via-[#BE6400]/20 to-red-300/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-6 -right-8 w-24 h-24 bg-gradient-to-br from-red-200/30 via-white/40 to-green-200/30 rounded-full blur-2xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute -top-8 -right-4 w-16 h-16 bg-[#BE6400]/20 rounded-full blur-xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          <div className="relative z-10">
            <motion.h1 
              className="text-display-md font-bold text-neutral-900 mb-3"
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
                  className="w-2 h-2 bg-secondary-500 rounded-full mr-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {user.departments_sagas?.name}
              </span>
              <span className="mx-2 text-neutral-500">•</span>
              <span className="text-primary-600 font-semibold">{user.county} County</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced KPI Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EnhancedKPICard
            title="Total Activities"
            value={totalActivities}
            target={50}
            icon={<DocumentTextIcon />}
            color="primary"
            description="Activities logged this month"
            trend="up"
            trendValue={8}
            trendPeriod="vs last month"
            showProgress={true}
            animated={true}
          />
          <EnhancedKPICard
            title="Pending Review"
            value={pendingActivities}
            target={20}
            icon={<ClockIcon />}
            color="warning"
            description="Awaiting supervisor approval"
            trend={pendingActivities > 5 ? "up" : "stable"}
            trendValue={pendingActivities > 5 ? 15 : 0}
            trendPeriod="vs last week"
            showProgress={true}
            animated={true}
          />
          <EnhancedKPICard
            title="Completed"
            value={completedActivities}
            previousValue={completedActivities - 3}
            icon={<CheckCircleIcon />}
            color="success"
            description="Successfully completed activities"
            trend="up"
            trendValue={12}
            trendPeriod="vs last month"
            target={40}
            showProgress={true}
            animated={true}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Quick Actions</h2>
          </div>
          <div className="flex gap-4">
            <motion.button
              onClick={() => setShowActivityForm(true)}
              className="group flex items-center px-8 py-4 bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 text-white rounded-2xl font-semibold shadow-luxury hover:shadow-gold transition-all duration-300 border border-neutral-700/50 relative overflow-hidden"
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
              <motion.div
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <PlusIcon className="w-6 h-6 mr-3 text-white" />
              </motion.div>
              <span className="relative z-10 text-white font-bold">Log New Activity</span>
              
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/0 via-gold-400/20 to-primary-400/0"
                animate={{
                  opacity: [0, 0.3, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            </motion.button>
            
            {/* Additional Quick Action Buttons */}
            <motion.button
              onClick={() => router.push('/dashboard/officer/activities')}
              className="group flex items-center px-6 py-4 bg-white text-neutral-700 rounded-2xl font-medium border border-neutral-200 hover:border-neutral-300 shadow-card hover:shadow-card-hover transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChartBarIcon className="w-5 h-5 mr-2 text-neutral-500 group-hover:text-primary-500 transition-colors" />
              View Reports
            </motion.button>
          </div>
        </motion.div>

      </div>

      {/* Activity Form Modal */}
      {showActivityForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-lg flex items-start justify-center p-4 pt-20 overflow-y-auto"
          onClick={() => setShowActivityForm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8 shadow-2xl border border-primary-100 relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 border-b border-primary-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Log New Activity</h3>
                <p className="text-sm text-primary-600 mt-1">Submit your department activity for review</p>
              </div>
              <button
                onClick={() => setShowActivityForm(false)}
                className="p-2 hover:bg-accent-50 hover:text-accent-600 rounded-xl transition-all duration-200 text-neutral-500 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ActivityForm
              services={services}
              userId={user.id}
              onSuccess={() => {
                setShowActivityForm(false)
                window.location.reload()
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </ModernLayout>
  )
}
