"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
      status?: string
      hod_comment?: string | null
      hod_reviewed?: boolean
      hod_reviewed_at?: string | null
    }[]
  })[]
}

export function OfficerDashboard({ user, services, activities }: OfficerDashboardProps) {
  const router = useRouter()
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }, [])

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
        {/* Executive Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 relative overflow-hidden"
        >
          {/* Executive Background with Kenya Flag Pattern */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="absolute -top-8 -left-8 w-96 h-96 opacity-10"
              style={{
                background: `conic-gradient(from 0deg, #dc2626 0deg, #16a34a 120deg, #eab308 240deg, #dc2626 360deg)`,
                borderRadius: '50%',
                filter: 'blur(60px)'
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute -bottom-12 -right-12 w-72 h-72 bg-gradient-to-br from-slate-200/30 via-white/20 to-slate-100/30 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Executive Header Card */}
          <motion.div
            className="relative bg-gradient-to-br from-white/95 via-slate-50/80 to-white/95 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/60 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Government Seal Watermark */}
            <div className="absolute top-4 right-4 opacity-5">
              <motion.div
                className="w-24 h-24"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                <Image
                  src="/courtofarms.jpeg"
                  alt="Kenya Coat of Arms"
                  width={96}
                  height={96}
                  className="object-contain grayscale"
                />
              </motion.div>
            </div>

            <div className="relative z-10">
              <motion.div
                className="flex items-start justify-between mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div>
                  <motion.h1
                    className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Welcome, {user.full_name}
                  </motion.h1>
                  <motion.p
                    className="text-lg text-slate-600 font-semibold tracking-wide"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <span className="inline-flex items-center">
                      <motion.span
                        className="w-3 h-3 bg-gradient-to-r from-red-600 via-green-600 to-yellow-600 rounded-full mr-3 shadow-sm"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      {user.departments_sagas?.name}
                    </span>
                  </motion.p>
                </div>

                {/* Executive Status Badge */}
                <motion.div
                  className="bg-gradient-to-r from-green-100 via-white to-red-100 border border-slate-200/60 rounded-2xl px-4 py-2 shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm font-bold text-slate-700">ACTIVE</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Executive Location and Time */}
              <motion.div
                className="flex items-center justify-between pt-4 border-t border-slate-200/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{user.county} County</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-1 h-1 bg-white rounded-full" />
                    </motion.div>
                    <span className="text-sm font-semibold text-slate-700">
                      {currentDate || 'Loading date...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Executive Accent Line */}
            <motion.div
              className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-red-600 to-yellow-600 rounded-b-3xl"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </motion.div>
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

        {/* Executive Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <motion.div
            className="bg-gradient-to-br from-white/90 via-slate-50/60 to-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/60 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-sm" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Executive Actions</h2>
              </div>
              <motion.div
                className="text-xs font-semibold text-slate-500 tracking-wider uppercase"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Government Operations
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Action - Log New Activity */}
              <motion.button
                onClick={() => setShowActivityForm(true)}
                className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-slate-700/50 overflow-hidden"
                whileHover={{
                  scale: 1.03,
                  y: -4,
                  rotateY: 5,
                  boxShadow: '0 25px 80px rgba(0,0,0,0.3)'
                }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {/* Executive Background Pattern */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `conic-gradient(from 45deg, #dc2626 0deg, #16a34a 120deg, #eab308 240deg, #dc2626 360deg)`
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-red-500 via-green-500 to-yellow-500 rounded-xl flex items-center justify-center"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <PlusIcon className="w-6 h-6 text-white" />
                    </motion.div>
                    <motion.div
                      className="w-6 h-6 bg-white/20 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Log New Activity</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Submit official department activities for review and approval
                  </p>
                </div>

                {/* Executive Border Accent */}
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-green-500 to-yellow-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </motion.button>

              {/* Secondary Action - View Reports */}
              <motion.button
                onClick={() => router.push('/dashboard/officer/activities')}
                className="group relative bg-gradient-to-br from-white via-slate-50 to-white text-slate-700 rounded-2xl p-6 border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 5 }}
                    >
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </motion.div>
                    <motion.div
                      className="text-slate-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">View Reports</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Access comprehensive analytics and activity reports
                  </p>
                </div>
              </motion.button>

              {/* Tertiary Action - System Status */}
              <motion.div
                className="group relative bg-gradient-to-br from-green-50 via-white to-green-50 text-slate-700 rounded-2xl p-6 border border-green-200/60 shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </motion.div>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      ONLINE
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">System Status</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    All government systems operational and secure
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Executive Footer */}
            <motion.div
              className="mt-8 pt-6 border-t border-slate-200/50 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-red-600 via-green-600 to-yellow-600 rounded-full" />
                <span className="text-sm font-semibold text-slate-600 tracking-wide">
                  Republic of Kenya • Office of the Attorney General
                </span>
              </div>
              <motion.div
                className="text-xs text-slate-400 font-medium"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Secured Connection
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

      </div>

      {/* Executive Activity Form Modal */}
      {showActivityForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(15,23,42,0.7) 50%, rgba(0,0,0,0.5) 100%)'
          }}
          onClick={() => setShowActivityForm(false)}
        >
          {/* Executive Background Blur Elements */}
          <div className="absolute inset-0 backdrop-blur-xl" />
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 opacity-20"
            style={{
              background: `conic-gradient(from 0deg, #dc2626 0deg, #16a34a 120deg, #eab308 240deg, #dc2626 360deg)`,
              borderRadius: '50%',
              filter: 'blur(60px)'
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-4xl my-8 shadow-2xl border border-slate-200/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Executive Header with Kenya Colors */}
            <div className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/60 p-8">
              {/* Government Seal Background */}
              <div className="absolute top-2 right-2 opacity-5">
                <Image
                  src="/courtofarms.jpeg"
                  alt="Kenya Coat of Arms"
                  width={80}
                  height={80}
                  className="object-contain grayscale"
                />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-xl"
                    animate={{ rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <PlusIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                      Log New Activity
                    </h3>
                    <p className="text-slate-600 font-semibold mt-2 tracking-wide">
                      Official Department Activity Submission Portal
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                        Secured Government Portal
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => setShowActivityForm(false)}
                  className="group relative w-12 h-12 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg border border-red-200/60"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-6 h-6 text-red-600 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Executive Kenya Flag Accent */}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-600 via-red-600 to-yellow-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>

            {/* Enhanced Form Container */}
            <div className="relative p-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-slate-900/10" />
              </div>

              <div className="relative z-10">
                <ActivityForm
                  services={services}
                  userId={user.id}
                  onSuccess={() => {
                    setShowActivityForm(false)
                    window.location.reload()
                  }}
                />
              </div>
            </div>

            {/* Executive Footer */}
            <motion.div
              className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-200/60 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-600 via-green-600 to-yellow-600 rounded-full" />
                  <span className="text-sm font-semibold text-slate-600 tracking-wide">
                    Republic of Kenya • Government Operations Portal
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    Encrypted & Secure
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </ModernLayout>
  )
}
