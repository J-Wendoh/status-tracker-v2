"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline"
import { ActivityReviewList } from "./activity-review-list"
import ModernLayout from "./modern-layout-v2"
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
    county: string
  }
  activity_status: {
    id: number
    pending_count: number | null
    completed_count: number | null
    status: string
    notes: string | null
    updated_by: string | null
    created_at: string
  }[]
}

interface UserWithDepartment extends User {
  departments_sagas: {
    id: string
    name: string
    type: string
  }
}

interface HodActivitiesViewProps {
  user: UserWithDepartment
  activities: ActivityWithDetails[]
  officers: Pick<User, "id" | "full_name" | "county">[]
  services: Service[]
}

export function HodActivitiesView({ user, activities, officers, services }: HodActivitiesViewProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithDetails | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  // Filter activities based on status
  const filteredActivities = activities.filter(activity => {
    if (filterStatus === 'all') return true
    
    const latestStatus = activity.activity_status?.[0]
    if (!latestStatus) return filterStatus === 'pending'
    
    switch (filterStatus) {
      case 'pending':
        return latestStatus.status === 'pending' || !latestStatus.status
      case 'approved':
        return latestStatus.status === 'approved'
      case 'rejected':
        return latestStatus.status === 'rejected'
      default:
        return true
    }
  })

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/hod', icon: HomeIcon, current: false },
    { name: 'Activities', href: '/dashboard/hod/activities', icon: DocumentTextIcon, current: true },
    { name: 'Team', href: '/dashboard/hod/team', icon: UserGroupIcon, current: false },
    { name: 'Analytics', href: '/dashboard/hod/analytics', icon: ChartBarIcon, current: false },
  ]

  const userInfo = {
    name: user.full_name,
    role: 'Head of Department',
    department: user.departments_sagas?.name
  }

  const pendingCount = activities.filter(activity => 
    !activity.activity_status?.length || 
    activity.activity_status?.[0]?.status === 'pending' || 
    !activity.activity_status?.[0]?.status
  ).length

  const approvedCount = activities.filter(activity => 
    activity.activity_status?.[0]?.status === 'approved'
  ).length

  const rejectedCount = activities.filter(activity => 
    activity.activity_status?.[0]?.status === 'rejected'
  ).length

  return (
    <ModernLayout 
      navigation={navigation} 
      userInfo={userInfo}
      backgroundImage="/background03.jpg"
      pageTitle="Activity Management"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Activity Management</h1>
          <p className="text-neutral-600">Review and approve activities from your team members</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
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
                <p className="text-2xl font-bold text-neutral-900">{activities.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-warning-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Pending Review</p>
                <p className="text-2xl font-bold text-neutral-900">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-success-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Approved</p>
                <p className="text-2xl font-bold text-neutral-900">{approvedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">✕</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Rejected</p>
                <p className="text-2xl font-bold text-neutral-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-neutral-100 p-1 rounded-xl">
            {[
              { key: 'all', label: 'All Activities', count: activities.length },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'approved', label: 'Approved', count: approvedCount },
              { key: 'rejected', label: 'Rejected', count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key as typeof filterStatus)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filterStatus === tab.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-card border border-neutral-200"
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Activities List</h2>
            {filteredActivities.length > 0 ? (
              <ActivityReviewList 
                activities={filteredActivities.map(activity => ({
                  ...activity,
                  officer: activity.users
                }))}
                showActions={true}
                onStatusUpdate={() => window.location.reload()}
              />
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No Activities Found</h3>
                <p className="text-neutral-600">
                  {filterStatus === 'all' 
                    ? "No activities have been submitted yet."
                    : `No ${filterStatus} activities found.`
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-lg flex items-center justify-center p-4"
          onClick={() => setSelectedActivity(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-primary-100 relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Activity Details</h3>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Officer</label>
                <p className="text-neutral-900">{selectedActivity.users.full_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Service</label>
                <p className="text-neutral-900">{selectedActivity.service.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <p className="text-neutral-900">{selectedActivity.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Count</label>
                <p className="text-neutral-900">{selectedActivity.count}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Submitted Date</label>
                <p className="text-neutral-900">{new Date(selectedActivity.created_at).toLocaleDateString()}</p>
              </div>
              
              {selectedActivity.activity_status?.[0] && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedActivity.activity_status[0].status === 'approved'
                      ? 'bg-success-100 text-success-800'
                      : selectedActivity.activity_status[0].status === 'rejected'
                      ? 'bg-error-100 text-error-800'
                      : 'bg-warning-100 text-warning-800'
                  }`}>
                    {selectedActivity.activity_status[0].status || 'pending'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </ModernLayout>
  )
}