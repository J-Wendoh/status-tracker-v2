"use client"

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect even if there's an error
      router.push('/auth/login')
    }
  }

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

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-luxury-gradient rounded-xl flex items-center justify-center shadow-lg">
            <Image
              src="/courtofarms.jpeg"
              alt="Kenya Coat of Arms"
              width={24}
              height={24}
              className="rounded-md object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary-400">OAG System</h1>
            <p className="text-xs text-neutral-400">Activity Tracking</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                item.current
                  ? 'bg-luxury-gradient text-white shadow-lg border border-primary-300'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-primary-400 border border-transparent'
              }`}
            >
              <IconComponent 
                className={`mr-3 h-5 w-5 transition-all duration-300 ${
                  item.current ? 'text-white' : 'text-neutral-400 group-hover:text-primary-400'
                }`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-neutral-700 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {userInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-200 truncate">
              {userInfo.name}
            </p>
            <p className="text-xs text-neutral-400 truncate">
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
          <button
            onClick={() => {/* Settings functionality can be added later */}}
            className="flex items-center w-full px-3 py-2 text-sm text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-2 text-neutral-400" />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 text-sm text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-red-400" />
            Sign out
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Background pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/background02.png')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20" />
      </div>

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
              className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="flex h-full flex-col bg-neutral-900 shadow-xl border-r border-neutral-700">
              <SidebarContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
        <div className="flex h-full flex-col bg-neutral-900/95 backdrop-blur-sm shadow-xl border-r border-neutral-700">
          <SidebarContent />
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-neutral-700 bg-neutral-900/80 backdrop-blur-sm px-4 shadow-sm sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:bg-neutral-800 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-primary-400">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notification bell could go here */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-neutral-600" />
              
              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-luxury-gradient rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-neutral-800 font-bold text-xs">
                    {userInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-neutral-200">{userInfo.name}</p>
                  <p className="text-xs text-neutral-400">{userInfo.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content with background */}
        <main className="relative z-10 py-6 px-4 sm:px-6 lg:px-8">
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