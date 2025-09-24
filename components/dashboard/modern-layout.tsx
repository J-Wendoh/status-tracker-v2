"use client"

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ChartBarIcon, 
  HomeIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: any
  current?: boolean
}

interface ModernLayoutProps {
  children: ReactNode
  navigation: NavigationItem[]
  userInfo: {
    name: string
    role: string
    department?: string
  }
}

const ModernLayout = ({ children, navigation, userInfo }: ModernLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    },
    closed: {
      x: '-100%',
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
  }

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div 
              className="absolute inset-0 bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg"
              onClick={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
            <motion.div
              className="flex h-full flex-col bg-white shadow-xl border-r border-neutral-200"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Mobile sidebar content will be added here */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 hidden lg:block">
        <motion.div
          className="flex h-full flex-col bg-white shadow-xl lg:shadow-lg border-r border-neutral-200"
          variants={sidebarVariants}
          initial="open"
          animate="open"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Image
                  src="/courtofarms.jpeg"
                  alt="Kenya Coat of Arms"
                  width={24}
                  height={24}
                  className="rounded-md object-cover"
                />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-lg font-bold text-neutral-900">AG Status Tracker</h1>
                <p className="text-xs text-neutral-600">Attorney General Office</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <IconComponent 
                    className={`mr-3 h-5 w-5 transition-colors ${
                      item.current ? 'text-primary-500' : 'text-neutral-600 group-hover:text-neutral-700'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-neutral-100 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {userInfo.name}
                </p>
                <p className="text-xs text-neutral-600 truncate">
                  {userInfo.role}
                </p>
                {userInfo.department && (
                  <p className="text-xs text-neutral-500 truncate">
                    {userInfo.department}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <Link
                href="/settings"
                className="flex items-center px-3 py-2 text-sm text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Cog6ToothIcon className="w-4 h-4 mr-2 text-neutral-600" />
                Settings
              </Link>
              <Link
                href="/auth/logout"
                className="flex items-center px-3 py-2 text-sm text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-red-400" />
                Sign out
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-neutral-200 bg-white/80 backdrop-blur-sm px-4 shadow-sm sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-neutral-900">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notification bell could go here */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-neutral-200" />
              
              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {userInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-neutral-900">{userInfo.name}</p>
                  <p className="text-xs text-neutral-600">{userInfo.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default ModernLayout