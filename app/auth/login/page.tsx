"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from "next/navigation"
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { createClient } from "@/lib/supabase/client"
import { LoginPopup } from '@/components/ui/login-popup'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      console.log('[LOGIN] Attempting login for:', email)
      console.log('[LOGIN] Environment check:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        userAgent: navigator.userAgent
      })

      // Test basic connectivity first
      console.log('[LOGIN] Testing basic Supabase connectivity...')
      const connectivityTest = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      })
      console.log('[LOGIN] Connectivity test result:', connectivityTest.status, connectivityTest.statusText)

      if (!connectivityTest.ok) {
        throw new Error(`Network connectivity failed: ${connectivityTest.status} ${connectivityTest.statusText}`)
      }

      console.log('[LOGIN] Connectivity OK, proceeding with authentication...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[LOGIN] Authentication error:', error)
        console.error('[LOGIN] Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        throw error
      }
      
      console.log('[LOGIN] Authentication successful, user:', data.user.email)
      
      // Get user profile to determine redirect
      console.log('[LOGIN] Fetching user profile...')
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('category')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        console.error('[LOGIN] Profile fetch error:', profileError)
        throw new Error('Could not load user profile')
      }

      console.log('[LOGIN] User profile loaded:', profile.category)

      // Direct redirect based on user category
      let redirectPath = '/dashboard'
      switch (profile.category) {
        case 'Officer':
          redirectPath = '/dashboard/officer'
          break
        case 'HOD':
        case 'CEO':
          redirectPath = '/dashboard/hod'
          break
        case 'AG':
          redirectPath = '/dashboard/ag'
          break
      }

      console.log('[LOGIN] Redirecting to:', redirectPath)
      
      // Use window.location for more reliable redirect
      window.location.href = redirectPath
      
    } catch (error: unknown) {
      console.error('[LOGIN] Login failed:', error)
      
      let errorMsg = "An error occurred"
      
      if (error instanceof Error) {
        errorMsg = error.message
        
        // Provide more helpful error messages
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMsg = "Network connection failed. Please check your internet connection and try again. If the problem persists, please contact support."
        } else if (error.message.includes('Invalid login credentials')) {
          errorMsg = "Invalid email or password. Please check your credentials and try again."
        } else if (error.message.includes('too many requests')) {
          errorMsg = "Too many login attempts. Please wait a moment and try again."
        } else if (error.message.includes('Network connectivity failed')) {
          errorMsg = error.message + " Please check your internet connection or try again later."
        }
      }
      
      console.error('[LOGIN] Final error message:', errorMsg)
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const imageVariants = {
    hidden: { scale: 1.1, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  }

  const errorVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col lg:flex-row"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Form Section */}
      <div className="flex-1 min-h-screen lg:min-h-0 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative">
        {/* Sophisticated background with Kenyan flag gradients */}
        <div className="absolute inset-0 bg-gradient-to-bl from-primary-50 via-white to-gold-50/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-accent-500/3 via-transparent to-secondary-500/3" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-16 left-20 w-28 h-28 bg-primary-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-24 right-16 w-20 h-20 bg-gold-300/15 rounded-full blur-2xl animate-pulse-soft" />
        <div className="w-full max-w-md relative z-10 px-2">
          {/* Logo */}
          <motion.div 
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="mx-auto mb-4 w-16 h-16 bg-luxury-gradient rounded-2xl flex items-center justify-center shadow-luxury">
              <Image
                src="/courtofarms.jpeg"
                alt="Kenya Coat of Arms"
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Office of the Attorney General
            </h1>
            <p className="text-neutral-600 text-sm">
              Activity Tracking System
            </p>
          </motion.div>

          {/* Form Container */}
          <motion.div 
            className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-luxury border border-primary-200/50"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,247,242,0.9) 100%)'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-800 via-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">Welcome Back</h2>
                <p className="text-neutral-700 font-medium">Sign in to access your dashboard</p>
                <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full mx-auto mt-3 mb-4"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-primary-800 mb-2">
                    Email Address
                  </label>
                  <motion.input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                    placeholder="your.email@oag.go.ke"
                    variants={inputVariants}
                    whileFocus="focus"
                    initial="blur"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-primary-800 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <motion.input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 px-4 pr-12 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                      placeholder="Enter your password"
                      variants={inputVariants}
                      whileFocus="focus"
                      initial="blur"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-luxury-gradient text-neutral-800 rounded-xl font-semibold hover:shadow-luxury disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-gold hover:shadow-gold border border-primary-400/20"
                  whileHover={{ scale: isLoading ? 1 : 1.02, y: -2 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-neutral-800/30 border-t-neutral-800 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>

              {/* Support Message */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-primary-50 to-gold-50 rounded-lg p-4 border border-primary-100">
                  <p className="text-sm text-primary-700 font-medium mb-1">
                    Don't have an account?
                  </p>
                  <p className="text-xs text-primary-600">
                    Please reach out to the development team for account access
                  </p>
                  <div className="mt-2 text-xs text-neutral-600">
                    📧 Contact: <span className="font-medium text-primary-700">dev.team@oag.go.ke</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Section */}
      <motion.div 
        className="hidden lg:flex flex-1 relative overflow-hidden"
        variants={imageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-black/10 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 via-transparent to-accent-500/5 z-10" />
        <Image
          src="/loginpage.jpg"
          alt="Kenya Government Building"
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-12">
          <motion.div
            className="max-w-lg"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Streamlined Activity Management
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Efficiently track, monitor, and report on activities across all departments 
              and Semi-Autonomous Government Agencies under the Office of the Attorney General.
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 right-40 w-20 h-20 rounded-xl bg-accent-400/20 backdrop-blur-sm"
          animate={{ 
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Cute Login Popup */}
      <LoginPopup 
        isVisible={isLoading} 
        message="Authenticating your credentials..." 
      />
    </motion.div>
  )
}
