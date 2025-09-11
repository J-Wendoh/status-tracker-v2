"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"

// Safe motion wrapper with error boundary
const SafeMotion = ({ children, initial, animate, transition, className, ...props }: any) => {
  try {
    // Sanitize animation props
    const safeProps = {
      ...props,
      className,
      ...(initial && { initial }),
      ...(animate && { animate }),
      ...(transition && { transition })
    }
    return <motion.div {...safeProps}>{children}</motion.div>
  } catch (error) {
    console.warn('Motion component error, falling back to static div:', error)
    return <div className={className} {...props}>{children}</div>
  }
}
import { 
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon
} from "@heroicons/react/24/outline"
import { TrendingUpIcon } from "@heroicons/react/20/solid"
import ModernLayout from "./modern-layout-v2"
import type { User } from "@/lib/supabase/types"

interface ActivityData {
  id: number
  user_id: string
  service_id: number
  count: number
  created_at: string
  service: {
    id: number
    name: string
  }
  users: {
    id: string
    full_name: string
  }
  activity_status: {
    status: string
    completed_count: number
    pending_count: number
    created_at: string
  }[]
}

interface ServiceData {
  id: number
  name: string
}

interface TeamMember {
  id: string
  full_name: string
  category: string
}

interface UserWithDepartment extends User {
  departments_sagas: {
    id: string
    name: string
    type: string
  }
}

interface HodAnalyticsViewProps {
  user: UserWithDepartment
  activities: ActivityData[]
  services: ServiceData[]
  teamMembers: TeamMember[]
}

export function HodAnalyticsView({ user, activities, services, teamMembers }: HodAnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  
  // Early validation
  if (!user) {
    console.error('HodAnalyticsView: user prop is missing')
    return <div className="p-6 text-center text-red-600">Error: User data is required</div>
  }

  // Calculate analytics data with error handling
  const analyticsData = useMemo(() => {
    try {
      // Validate inputs
      if (!Array.isArray(activities)) {
        console.warn('HodAnalyticsView: activities is not an array:', activities)
        return {
          totalActivities: 0,
          totalValue: 0,
          completedActivities: 0,
          pendingActivities: 0,
          serviceStats: [],
          teamStats: [],
          dailyTrend: []
        }
      }
      
      if (!Array.isArray(services)) {
        console.warn('HodAnalyticsView: services is not an array:', services)
        return {
          totalActivities: 0,
          totalValue: 0,
          completedActivities: 0,
          pendingActivities: 0,
          serviceStats: [],
          teamStats: [],
          dailyTrend: []
        }
      }
      
      if (!Array.isArray(teamMembers)) {
        console.warn('HodAnalyticsView: teamMembers is not an array:', teamMembers)
        return {
          totalActivities: 0,
          totalValue: 0,
          completedActivities: 0,
          pendingActivities: 0,
          serviceStats: [],
          teamStats: [],
          dailyTrend: []
        }
      }
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const filteredActivities = (activities || []).filter(activity => 
      activity?.created_at && new Date(activity.created_at) >= startDate
    )

    // Service performance
    const serviceStats = (services || []).map(service => {
      const serviceActivities = filteredActivities.filter(a => a?.service_id === service?.id)
      const totalCount = serviceActivities.reduce((sum, a) => sum + (a?.count || 0), 0)
      const completedActivities = serviceActivities.filter(a => 
        a?.activity_status && Array.isArray(a.activity_status) && a.activity_status.some(s => s?.status === 'approved' || (s?.completed_count || 0) > 0)
      ).length
      const pendingActivities = serviceActivities.filter(a => 
        !a?.activity_status || !a.activity_status.length || a.activity_status.some(s => s?.status === 'pending' || !s?.status)
      ).length

      return {
        ...service,
        totalActivities: serviceActivities.length,
        totalCount,
        completedActivities,
        pendingActivities,
        completionRate: serviceActivities.length > 0 ? (completedActivities / serviceActivities.length) * 100 : 0
      }
    })

    // Team performance
    const teamStats = (teamMembers || []).map(member => {
      const memberActivities = filteredActivities.filter(a => a?.user_id === member?.id)
      const totalCount = memberActivities.reduce((sum, a) => sum + (a?.count || 0), 0)
      const completedActivities = memberActivities.filter(a => 
        a?.activity_status && Array.isArray(a.activity_status) && a.activity_status.some(s => s?.status === 'approved' || (s?.completed_count || 0) > 0)
      ).length

      return {
        ...member,
        totalActivities: memberActivities.length,
        totalCount,
        completedActivities,
        averagePerActivity: memberActivities.length > 0 ? totalCount / memberActivities.length : 0
      }
    })

    // Daily activity trend (last 30 days)
    const dailyTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayActivities = (activities || []).filter(a => 
        a?.created_at && a.created_at.startsWith(dateStr)
      )
      
      return {
        date: dateStr,
        count: dayActivities.length,
        totalValue: dayActivities.reduce((sum, a) => sum + (a?.count || 0), 0)
      }
    }).reverse()

    return {
      totalActivities: filteredActivities.length,
      totalValue: filteredActivities.reduce((sum, a) => sum + (a?.count || 0), 0),
      completedActivities: filteredActivities.filter(a => 
        a?.activity_status && Array.isArray(a.activity_status) && a.activity_status.some(s => s?.status === 'approved' || (s?.completed_count || 0) > 0)
      ).length,
      pendingActivities: filteredActivities.filter(a => 
        !a?.activity_status || !a.activity_status.length || a.activity_status.some(s => s?.status === 'pending' || !s?.status)
      ).length,
      serviceStats,
      teamStats,
      dailyTrend
    }
    } catch (error) {
      console.error('Error in HodAnalyticsView useMemo calculation:', error)
      return {
        totalActivities: 0,
        totalValue: 0,
        completedActivities: 0,
        pendingActivities: 0,
        serviceStats: [],
        teamStats: [],
        dailyTrend: []
      }
    }
  }, [activities, services, teamMembers, timeRange])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/hod', icon: HomeIcon, current: false },
    { name: 'Activities', href: '/dashboard/hod/activities', icon: DocumentTextIcon, current: false },
    { name: 'Team', href: '/dashboard/hod/team', icon: UserGroupIcon, current: false },
    { name: 'Analytics', href: '/dashboard/hod/analytics', icon: ChartBarIcon, current: true },
  ]

  const userInfo = {
    name: user?.full_name || 'Unknown User',
    role: 'Head of Department',
    department: (user?.departments_sagas && typeof user.departments_sagas === 'object') 
      ? user.departments_sagas.name || 'Unknown Department'
      : 'Unknown Department'
  }

  // Additional safety check before rendering
  if (!analyticsData) {
    return (
      <ModernLayout 
        navigation={navigation} 
        userInfo={userInfo}
        backgroundImage="/background03.jpg"
        pageTitle="Analytics Dashboard"
      >
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Loading Analytics...</h2>
            <p className="text-neutral-600">Please wait while we prepare your analytics data.</p>
          </div>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout 
      navigation={navigation} 
      userInfo={userInfo}
      backgroundImage="/background03.jpg"
      pageTitle="Analytics Dashboard"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <SafeMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Analytics Dashboard</h1>
              <p className="text-neutral-600">Comprehensive insights into department performance</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex space-x-1 bg-neutral-100 p-1 rounded-xl">
              {[
                { key: 'week', label: '7D' },
                { key: 'month', label: '30D' },
                { key: 'quarter', label: '90D' },
                { key: 'year', label: '1Y' },
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key as typeof timeRange)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    timeRange === range.key
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </SafeMotion>

        {/* KPI Cards */}
        <SafeMotion 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-primary-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Activities</p>
                <p className="text-2xl font-bold text-neutral-900">{analyticsData.totalActivities}</p>
                <p className="text-xs text-neutral-500">Last {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : timeRange === 'quarter' ? '90 days' : 'year'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <TrendingUpIcon className="w-8 h-8 text-success-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Output</p>
                <p className="text-2xl font-bold text-neutral-900">{analyticsData.totalValue}</p>
                <p className="text-xs text-neutral-500">Combined activity count</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <span className="text-success-600 font-bold">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Completed</p>
                <p className="text-2xl font-bold text-neutral-900">{analyticsData.completedActivities}</p>
                <p className="text-xs text-success-600">
                  {analyticsData.totalActivities > 0 
                    ? `${Math.round((analyticsData.completedActivities / analyticsData.totalActivities) * 100)}% completion rate`
                    : '0% completion rate'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                <span className="text-warning-600 font-bold">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Pending</p>
                <p className="text-2xl font-bold text-neutral-900">{analyticsData.pendingActivities}</p>
                <p className="text-xs text-warning-600">Awaiting approval</p>
              </div>
            </div>
          </div>
        </SafeMotion>

        {/* Service Performance Chart */}
        <SafeMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-card border border-neutral-200 mb-8"
        >
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Service Performance</h2>
          <div className="space-y-4">
            {(analyticsData?.serviceStats || []).length > 0 ? (
              analyticsData.serviceStats
                .sort((a, b) => (b?.totalActivities || 0) - (a?.totalActivities || 0))
                .map((service, index) => (
              <div key={service?.id || index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-neutral-700">{service?.name || 'Unknown Service'}</span>
                    <span className="text-sm text-neutral-500">{service?.totalActivities || 0} activities</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(
                          analyticsData?.serviceStats && analyticsData.serviceStats.length > 0 
                            ? (() => {
                                try {
                                  const maxActivities = Math.max(...analyticsData.serviceStats.map(s => s?.totalActivities || 0))
                                  const percentage = maxActivities > 0 ? ((service?.totalActivities || 0) / maxActivities) * 100 : 0
                                  return isNaN(percentage) ? 0 : percentage
                                } catch (error) {
                                  console.warn('Error calculating service progress:', error)
                                  return 0
                                }
                              })()
                            : 0, 
                          100
                        )}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">{service?.totalCount || 0}</p>
                  <p className="text-xs text-neutral-500">Total output</p>
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No Service Data</h3>
                <p className="text-neutral-600">Service performance data will appear here when activities are available.</p>
              </div>
            )}
          </div>
        </SafeMotion>

        {/* Team Performance */}
        <SafeMotion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-card border border-neutral-200"
        >
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Team Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(analyticsData?.teamStats || []).length > 0 ? (
              analyticsData.teamStats
                .sort((a, b) => (b?.totalActivities || 0) - (a?.totalActivities || 0))
                .map((member, index) => (
              <div key={member?.id || index} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {(member?.full_name || '').split(' ').map(n => n?.[0] || '').join('').slice(0, 2) || 'NA'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">{member?.full_name || 'Unknown'}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member?.category === 'CEO'
                        ? 'bg-gold-100 text-gold-800'
                        : member?.category === 'HOD'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member?.category || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Activities:</span>
                    <span className="text-sm font-semibold">{member?.totalActivities || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Total Output:</span>
                    <span className="text-sm font-semibold">{member?.totalCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Avg per Activity:</span>
                    <span className="text-sm font-semibold">{(member?.averagePerActivity || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Completed:</span>
                    <span className="text-sm font-semibold text-success-600">{member?.completedActivities || 0}</span>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No Team Data</h3>
                <p className="text-neutral-600">Team performance data will appear here when team members are active.</p>
              </div>
            )}
          </div>
        </SafeMotion>

      </div>
    </ModernLayout>
  )
}