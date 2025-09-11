"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"
import ModernLayout from "./modern-layout-v2"
import type { User } from "@/lib/supabase/types"

interface TeamMember {
  id: string
  full_name: string
  email: string
  county: string
  category: string
  created_at: string
  updated_at: string
}

interface ActivityStat {
  user_id: string
  id: number
  created_at: string
  activity_status: {
    status: string
    completed_count: number
    pending_count: number
  }[]
}

interface UserWithDepartment extends User {
  departments_sagas: {
    id: string
    name: string
    type: string
  }
}

interface HodTeamViewProps {
  user: UserWithDepartment
  teamMembers: TeamMember[]
  activityStats: ActivityStat[]
}

export function HodTeamView({ user, teamMembers, activityStats }: HodTeamViewProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [filterRole, setFilterRole] = useState<'all' | 'Officer' | 'HOD' | 'CEO'>('all')

  // Filter team members based on role
  const filteredMembers = teamMembers.filter(member => {
    if (filterRole === 'all') return true
    return member.category === filterRole
  })

  // Calculate stats for each member
  const memberStats = teamMembers.map(member => {
    const memberActivities = activityStats.filter(stat => stat.user_id === member.id)
    const totalActivities = memberActivities.length
    const completedActivities = memberActivities.filter(activity => 
      activity.activity_status?.some(status => status.completed_count > 0)
    ).length
    const pendingActivities = memberActivities.filter(activity => 
      activity.activity_status?.some(status => status.pending_count > 0) ||
      activity.activity_status?.length === 0
    ).length

    return {
      ...member,
      totalActivities,
      completedActivities,
      pendingActivities,
      lastActivity: memberActivities.length > 0 
        ? new Date(Math.max(...memberActivities.map(a => new Date(a.created_at).getTime())))
        : null
    }
  })

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/hod', icon: HomeIcon, current: false },
    { name: 'Activities', href: '/dashboard/hod/activities', icon: DocumentTextIcon, current: false },
    { name: 'Team', href: '/dashboard/hod/team', icon: UserGroupIcon, current: true },
    { name: 'Analytics', href: '/dashboard/hod/analytics', icon: ChartBarIcon, current: false },
  ]

  const userInfo = {
    name: user.full_name,
    role: 'Head of Department',
    department: user.departments_sagas?.name
  }

  const officerCount = teamMembers.filter(m => m.category === 'Officer').length
  const hodCount = teamMembers.filter(m => m.category === 'HOD').length
  const ceoCount = teamMembers.filter(m => m.category === 'CEO').length

  return (
    <ModernLayout 
      navigation={navigation} 
      userInfo={userInfo}
      backgroundImage="/background03.jpg"
      pageTitle="Team Management"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Team Management</h1>
          <p className="text-neutral-600">Manage and monitor your department team members</p>
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
              <UserGroupIcon className="w-8 h-8 text-primary-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Members</p>
                <p className="text-2xl font-bold text-neutral-900">{teamMembers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Officers</p>
                <p className="text-2xl font-bold text-neutral-900">{officerCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">H</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">HODs</p>
                <p className="text-2xl font-bold text-neutral-900">{hodCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center">
                <span className="text-gold-600 font-bold text-sm">C</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">CEOs</p>
                <p className="text-2xl font-bold text-neutral-900">{ceoCount}</p>
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
              { key: 'all', label: 'All Members', count: teamMembers.length },
              { key: 'Officer', label: 'Officers', count: officerCount },
              { key: 'HOD', label: 'HODs', count: hodCount },
              { key: 'CEO', label: 'CEOs', count: ceoCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterRole(tab.key as typeof filterRole)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filterRole === tab.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Team Members Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {memberStats
            .filter(member => filterRole === 'all' || member.category === filterRole)
            .map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-card border border-neutral-200 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedMember(member)}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-lg">
                    {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{member.full_name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.category === 'CEO'
                      ? 'bg-gold-100 text-gold-800'
                      : member.category === 'HOD'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {member.category}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  <span>{member.county} County</span>
                </div>
                <div className="flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  <span>{member.totalActivities} Activities</span>
                </div>
                {member.lastActivity && (
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>Last: {member.lastActivity.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex justify-between text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-success-600">{member.completedActivities}</p>
                    <p className="text-neutral-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-warning-600">{member.pendingActivities}</p>
                    <p className="text-neutral-600">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-primary-600">{member.totalActivities}</p>
                    <p className="text-neutral-600">Total</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No Team Members Found</h3>
            <p className="text-neutral-600">
              {filterRole === 'all' 
                ? "No team members in this department."
                : `No ${filterRole}s found in this department.`
              }
            </p>
          </div>
        )}

      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-lg flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Team Member Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xl">
                    {selectedMember.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-neutral-900">{selectedMember.full_name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMember.category === 'CEO'
                      ? 'bg-gold-100 text-gold-800'
                      : selectedMember.category === 'HOD'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedMember.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <p className="text-neutral-900">{selectedMember.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">County</label>
                  <p className="text-neutral-900">{selectedMember.county}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Joined Date</label>
                  <p className="text-neutral-900">{new Date(selectedMember.created_at).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Last Updated</label>
                  <p className="text-neutral-900">{new Date(selectedMember.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="text-lg font-semibold text-neutral-900 mb-4">Activity Summary</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-success-50 rounded-lg">
                    <p className="text-2xl font-bold text-success-600">
                      {memberStats.find(m => m.id === selectedMember.id)?.completedActivities || 0}
                    </p>
                    <p className="text-sm text-neutral-600">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-warning-50 rounded-lg">
                    <p className="text-2xl font-bold text-warning-600">
                      {memberStats.find(m => m.id === selectedMember.id)?.pendingActivities || 0}
                    </p>
                    <p className="text-sm text-neutral-600">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-600">
                      {memberStats.find(m => m.id === selectedMember.id)?.totalActivities || 0}
                    </p>
                    <p className="text-sm text-neutral-600">Total</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </ModernLayout>
  )
}