"use client"

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LoadingPopup } from '../ui/loading-popup'
import { 
  ChartBarIcon, 
  HomeIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: any
  current?: boolean
  badge?: string
}

interface ModernLayoutProps {
  children: ReactNode
  navigation: NavigationItem[]
  userInfo: {
    name: string
    role: string
    department?: string
  }
  backgroundImage?: string
  pageTitle?: string
  onNavigationClick?: (href: string) => void
}

const ModernLayout = ({ children, navigation, userInfo, backgroundImage = '/background02.png', pageTitle = 'Dashboard', onNavigationClick }: ModernLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      // Force redirect regardless of error
      window.location.href = "/auth/login"
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect on any error
      window.location.href = "/auth/login"
    } finally {
      setIsSigningOut(false)
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
      {/* Luxurious Header */}
      <div className="relative px-6 py-8 border-b border-white/20 bg-gradient-to-r from-white/5 to-[#BE6400]/5">
        {/* Premium backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-white/10 to-red-500/3" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="relative w-12 h-12 bg-luxury-gradient rounded-2xl flex items-center justify-center shadow-2xl ring-1 ring-white/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-luxury-gradient rounded-2xl blur-lg opacity-50" />
              <Image
                src="/courtofarms.jpeg"
                alt="Kenya Coat of Arms"
                width={28}
                height={28}
                className="rounded-lg object-cover relative z-10"
              />
            </motion.div>
            <div>
              <motion.h1
                className="text-xl font-bold bg-gradient-to-r from-neutral-800 via-[#BE6400] to-neutral-800 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                AG Status Tracker
              </motion.h1>
              <motion.p
                className="text-sm text-neutral-600 font-medium tracking-wide"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Attorney General Office System
              </motion.p>
            </div>
          </div>
          <motion.button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300 hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <XMarkIcon className="w-5 h-5 text-neutral-700" />
          </motion.button>
        </div>
      </div>

      {/* Luxurious Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
        {navigation.map((item, index) => {
          const IconComponent = item.icon
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
{onNavigationClick ? (
                <button
                  onClick={() => onNavigationClick(item.href)}
                  className={`group relative flex items-center px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-500 hover:scale-[1.02] hover:shadow-xl overflow-hidden w-full text-left ${
                    item.current
                      ? 'bg-gradient-to-r from-[#BE6400] to-[#BE6400]/80 text-white shadow-2xl ring-1 ring-[#BE6400]/20 hover:shadow-2xl hover:shadow-[#BE6400]/25'
                      : 'text-neutral-700 hover:bg-white/50 hover:text-[#BE6400] backdrop-blur-sm border border-white/10 hover:border-[#BE6400]/20'
                  }`}
                >
                  {/* Glow effect for active item */}
                  {item.current && (
                    <motion.div
                      className="absolute inset-0 bg-[#BE6400] opacity-40 blur-md"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Hover shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{
                      x: '100%',
                      opacity: 1,
                      transition: { duration: 0.6 }
                    }}
                  />

                  <motion.div
                    className="relative z-10 flex items-center justify-between w-full"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <IconComponent
                        className={`mr-4 h-5 w-5 transition-all duration-300 ${
                          item.current
                            ? 'text-white drop-shadow-sm'
                            : 'text-neutral-600 group-hover:text-[#BE6400] group-hover:scale-110'
                        }`}
                      />
                      <div>
                        <div className="relative">
                          {item.name}
                          {item.current && (
                            <motion.div
                              className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-white/30 rounded-full"
                              layoutId="activeIndicator"
                            />
                          )}
                        </div>
                        {item.badge && (
                          <div className={`text-xs mt-1 ${
                            item.current ? 'text-white/80' : 'text-neutral-500'
                          }`}>
                            {item.badge}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`group relative flex items-center px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-500 hover:scale-[1.02] hover:shadow-xl overflow-hidden ${
                    item.current
                      ? 'bg-gradient-to-r from-[#BE6400] to-[#BE6400]/80 text-white shadow-2xl ring-1 ring-[#BE6400]/20 hover:shadow-2xl hover:shadow-[#BE6400]/25'
                      : 'text-neutral-700 hover:bg-white/50 hover:text-[#BE6400] backdrop-blur-sm border border-white/10 hover:border-[#BE6400]/20'
                  }`}
                >
                  {/* Glow effect for active item */}
                  {item.current && (
                    <motion.div
                      className="absolute inset-0 bg-[#BE6400] opacity-40 blur-md"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Hover shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%', opacity: 0 }}
                    whileHover={{
                      x: '100%',
                      opacity: 1,
                      transition: { duration: 0.6 }
                    }}
                  />

                  <motion.div
                    className="relative z-10 flex items-center justify-between w-full"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <IconComponent
                        className={`mr-4 h-5 w-5 transition-all duration-300 ${
                          item.current
                            ? 'text-white drop-shadow-sm'
                            : 'text-neutral-600 group-hover:text-[#BE6400] group-hover:scale-110'
                        }`}
                      />
                      <div>
                        <div className="relative">
                          {item.name}
                          {item.current && (
                            <motion.div
                              className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-white/30 rounded-full"
                              layoutId="activeIndicator"
                            />
                          )}
                        </div>
                        {item.badge && (
                          <div className={`text-xs mt-1 ${
                            item.current ? 'text-white/80' : 'text-neutral-500'
                          }`}>
                            {item.badge}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          )
        })}
      </nav>

      {/* Luxurious User Profile */}
      <div className="relative border-t border-white/20 p-6 bg-gradient-to-br from-white/5 via-transparent to-[#BE6400]/5">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
        
        <motion.div 
          className="flex items-center space-x-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div 
            className="relative w-12 h-12 bg-luxury-gradient rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/30"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Avatar glow effect */}
            <div className="absolute inset-0 bg-luxury-gradient rounded-2xl blur-lg opacity-50" />
            <span className="relative z-10 text-[#BE6400] font-bold text-lg drop-shadow-sm">
              {userInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <motion.p 
              className="text-base font-bold bg-gradient-to-r from-neutral-800 via-[#BE6400] to-neutral-800 bg-clip-text text-transparent truncate"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              {userInfo.name}
            </motion.p>
            <motion.p 
              className="text-sm text-[#BE6400] font-semibold truncate"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              {userInfo.role}
            </motion.p>
            {userInfo.department && (
              <motion.p 
                className="text-xs text-neutral-600 truncate font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                {userInfo.department}
              </motion.p>
            )}
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <motion.button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="group relative flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 rounded-2xl hover:bg-red-50/50 hover:text-red-700 transition-all duration-300 backdrop-blur-sm border border-red-100/20 hover:border-red-200/40 hover:shadow-lg overflow-hidden disabled:opacity-50"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <ArrowRightOnRectangleIcon className={`w-5 h-5 mr-3 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-300 ${isSigningOut ? 'animate-spin' : ''}`} />
            <span className="relative z-10">{isSigningOut ? 'Signing Out...' : 'Sign out'}</span>
          </motion.button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-[#BE6400]/5">
      {/* Enhanced Background pattern with glassmorphism */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-3"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-white/60 to-red-500/3" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#BE6400]/8 via-transparent to-black/2" />
        <div className="absolute inset-0 backdrop-blur-[0.5px]" />
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
              className="absolute inset-0 bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl"
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
            <div className="flex h-full flex-col bg-white/85 backdrop-blur-xl shadow-2xl border-r border-white/30 relative">
              {/* Subtle Kenyan flag accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/2 via-transparent to-red-500/2" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-[#BE6400] to-red-600" />
              <div className="relative z-10">
                <SidebarContent />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
        <div className="flex h-full flex-col bg-white/85 backdrop-blur-xl shadow-2xl border-r border-white/30 relative">
          {/* Subtle Kenyan flag accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/2 via-transparent to-red-500/2" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-[#BE6400] to-red-600" />
          <div className="relative z-10">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Floating Luxurious Top bar */}
        <motion.div 
          className="sticky top-4 z-30 mx-4 flex h-20 items-center gap-x-4 border border-white/30 bg-white/90 backdrop-blur-2xl px-4 shadow-2xl sm:px-6 lg:px-8 relative rounded-3xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Premium background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-[#BE6400]/5 to-white/10 rounded-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-600/30 via-[#BE6400]/50 to-red-600/30 rounded-b-3xl" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-t-3xl" />
          
          <div className="relative z-10 flex items-center w-full">
            <motion.button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-neutral-700 hover:text-[#BE6400] transition-all duration-300 hover:shadow-lg hover:scale-105"
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bars3Icon className="h-5 w-5" />
            </motion.button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
              <div className="flex flex-1 items-center">
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-black via-[#BE6400] to-black bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {pageTitle}
                </motion.h1>
              </div>
              
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Elegant separator */}
                <div className="hidden lg:block lg:h-8 lg:w-px bg-gradient-to-b from-transparent via-[#BE6400]/30 to-transparent" />
                
                {/* Luxurious User menu */}
                <motion.div 
                  className="flex items-center space-x-4 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -1 }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div 
                    className="relative w-10 h-10 bg-luxury-gradient rounded-2xl flex items-center justify-center shadow-xl ring-1 ring-white/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Avatar glow */}
                    <div className="absolute inset-0 bg-luxury-gradient rounded-2xl blur-md opacity-50" />
                    <span className="relative z-10 text-[#BE6400] font-bold text-sm drop-shadow-sm">
                      {userInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </motion.div>
                  <div className="hidden sm:block">
                    <motion.p 
                      className="text-sm font-bold bg-gradient-to-r from-neutral-800 via-[#BE6400] to-neutral-800 bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {userInfo.name}
                    </motion.p>
                    <motion.p 
                      className="text-xs text-[#BE6400] font-semibold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {userInfo.role}
                    </motion.p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page content with background */}
        <main className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Sign Out Loading Popup */}
      <LoadingPopup 
        isVisible={isSigningOut} 
        message="Signing out securely..."
      />
    </div>
  )
}

export default ModernLayout