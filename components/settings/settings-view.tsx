"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline"
import ModernLayout from "../dashboard/modern-layout-v2"
import type { User } from "@/lib/supabase/types"

interface UserWithDepartment extends User {
  departments_sagas: {
    id: string
    name: string
    type: string
  }
}

interface SettingsViewProps {
  user: UserWithDepartment
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile')

  // Navigation based on user category
  const getNavigation = () => {
    const basePath = user.category === 'Officer' ? '/dashboard/officer' 
                   : user.category === 'HOD' || user.category === 'CEO' ? '/dashboard/hod'
                   : '/dashboard/ag'
    
    return [
      { name: 'Dashboard', href: basePath, icon: HomeIcon, current: false },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, current: true },
    ]
  }

  const userInfo = {
    name: user.full_name,
    role: user.category === 'HOD' ? 'Head of Department' 
          : user.category === 'CEO' ? 'Chief Executive Officer'
          : user.category === 'AG' ? 'Attorney General'
          : 'Officer',
    department: user.departments_sagas?.name
  }

  const handleGoBack = () => {
    const basePath = user.category === 'Officer' ? '/dashboard/officer' 
                   : user.category === 'HOD' || user.category === 'CEO' ? '/dashboard/hod'
                   : '/dashboard/ag'
    router.push(basePath)
  }

  return (
    <ModernLayout 
      navigation={getNavigation()} 
      userInfo={userInfo}
      backgroundImage="/background03.jpg"
      pageTitle="Settings"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <motion.button
              onClick={handleGoBack}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-neutral-700 hover:text-primary-600 transition-all duration-300"
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
              <p className="text-neutral-600">Manage your account and preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200 sticky top-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Settings</h2>
              <nav className="space-y-2">
                {[
                  { key: 'profile', label: 'Profile', icon: UserCircleIcon },
                  { key: 'notifications', label: 'Notifications', icon: BellIcon },
                  { key: 'security', label: 'Security', icon: ShieldCheckIcon },
                ].map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key as typeof activeTab)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === item.key
                          ? 'bg-primary-50 text-primary-600 border border-primary-200'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 mr-3 ${
                        activeTab === item.key ? 'text-primary-600' : 'text-neutral-400'
                      }`} />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl p-6 shadow-card border border-neutral-200">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-neutral-900">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user.full_name}
                        readOnly
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user.category}
                        readOnly
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        County
                      </label>
                      <input
                        type="text"
                        value={user.county}
                        readOnly
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                      />
                    </div>
                    
                    {user.departments_sagas && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Department/SAGA
                          </label>
                          <input
                            type="text"
                            value={user.departments_sagas.name}
                            readOnly
                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Department Type
                          </label>
                          <input
                            type="text"
                            value={user.departments_sagas.type}
                            readOnly
                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-600 cursor-not-allowed"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-200">
                    <p className="text-sm text-neutral-600">
                      <strong>Note:</strong> Profile information is managed by system administrators. 
                      Contact your supervisor if you need to update any information.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-neutral-900">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-neutral-900">Email Notifications</h4>
                        <p className="text-sm text-neutral-600">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-neutral-900">Activity Updates</h4>
                        <p className="text-sm text-neutral-600">Get notified when activities are reviewed</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-neutral-900">Weekly Reports</h4>
                        <p className="text-sm text-neutral-600">Receive weekly activity summaries</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-neutral-600">
                      Note: Notification preferences are currently for display only. 
                      Actual notification system will be implemented in a future update.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-neutral-900">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Password</h4>
                      <p className="text-sm text-neutral-600 mb-4">
                        Password changes are managed through the authentication system.
                      </p>
                      <button
                        disabled
                        className="px-4 py-2 bg-neutral-100 text-neutral-500 rounded-lg cursor-not-allowed"
                      >
                        Change Password (Coming Soon)
                      </button>
                    </div>
                    
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Two-Factor Authentication</h4>
                      <p className="text-sm text-neutral-600 mb-4">
                        Add an extra layer of security to your account.
                      </p>
                      <button
                        disabled
                        className="px-4 py-2 bg-neutral-100 text-neutral-500 rounded-lg cursor-not-allowed"
                      >
                        Enable 2FA (Coming Soon)
                      </button>
                    </div>
                    
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h4 className="font-medium text-neutral-900 mb-2">Session Management</h4>
                      <p className="text-sm text-neutral-600 mb-4">
                        Manage your active sessions across devices.
                      </p>
                      <button
                        disabled
                        className="px-4 py-2 bg-neutral-100 text-neutral-500 rounded-lg cursor-not-allowed"
                      >
                        View Active Sessions (Coming Soon)
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-200">
                    <p className="text-sm text-neutral-600">
                      Security features are currently in development. 
                      Contact system administrators for immediate security concerns.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </ModernLayout>
  )
}