"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
import { EnhancedKPICard } from "../ui/enhanced-kpi-card"
import type { Service, Activity } from "@/lib/supabase/types"
import type { UserWithDepartmentSaga } from "@/lib/supabase/types"

interface OfficerActivitiesPageProps {
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

export function OfficerActivitiesPage({ user, services, activities }: OfficerActivitiesPageProps) {
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
    { name: 'Dashboard', href: '/dashboard/officer', icon: HomeIcon, current: false },
    { name: 'Activities', href: '/dashboard/officer/activities', icon: DocumentTextIcon, current: true },
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
      pageTitle="Activities"
    >
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          {/* Floating background elements with Kenyan flag gradient */}
          <motion.div
            className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-200/30 via-red-200/30 to-black/10 rounded-full blur-3xl"
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
            className="absolute -bottom-6 -right-8 w-24 h-24 bg-gradient-to-br from-red-200/40 via-white/20 to-green-200/40 rounded-full blur-2xl"
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
              className="text-display-md font-bold text-neutral-900 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Activities
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
                Manage your activities and track progress
              </span>
            </motion.p>
          </div>
        </motion.div>

        {/* KPI Cards */}
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
              className="group flex items-center px-8 py-4 bg-luxury-gradient text-white rounded-2xl font-semibold shadow-luxury hover:shadow-gold transition-all duration-300 border border-primary-400/20 relative overflow-hidden"
              whileHover={{ 
                scale: 1.02, 
                y: -2,
                boxShadow: '0 20px 60px rgba(210,105,30,0.25)'
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
                <PlusIcon className="w-6 h-6 mr-3" />
              </motion.div>
              <span className="relative z-10">Log New Activity</span>
              
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
              className="group flex items-center px-6 py-4 bg-white text-neutral-700 rounded-2xl font-medium border border-neutral-200 hover:border-neutral-300 shadow-card hover:shadow-card-hover transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChartBarIcon className="w-5 h-5 mr-2 text-neutral-500 group-hover:text-primary-500 transition-colors" />
              View Reports
            </motion.button>
          </div>
        </motion.div>

        {/* All Activities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-card relative overflow-hidden"
        >
          {/* Kenyan flag gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-red-500/5 to-black/5 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/10 rounded-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">All Activities</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-full border border-primary-200">
                  All
                </button>
                <button className="px-3 py-1 text-xs font-medium text-neutral-600 bg-white rounded-full border border-neutral-200">
                  Pending
                </button>
                <button className="px-3 py-1 text-xs font-medium text-neutral-600 bg-white rounded-full border border-neutral-200">
                  Completed
                </button>
              </div>
            </div>
            <ActivityList activities={activities} />
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
            className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8 shadow-2xl border border-primary-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Log New Activity</h3>
              <button
                onClick={() => setShowActivityForm(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                ✕
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