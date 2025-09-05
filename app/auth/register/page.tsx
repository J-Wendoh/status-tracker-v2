"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { createClient } from "@/lib/supabase/client"
import { createUserProfile } from "@/app/auth/actions"

interface DepartmentSaga {
  id: string
  name: string
  type: "department" | "saga"
}

const KENYAN_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    idNumber: "",
    county: "",
    category: "",
    departmentOrSagaId: "",
  })
  const [departmentsSagas, setDepartmentsSagas] = useState<DepartmentSaga[]>([])
  const [filteredOptions, setFilteredOptions] = useState<DepartmentSaga[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch departments and SAGAs on component mount
  useEffect(() => {
    const fetchDepartmentsSagas = async () => {
      console.log("[v0] Fetching departments and SAGAs...")
      const supabase = createClient()
      const { data, error } = await supabase.from("departments_sagas").select("id, name, type").order("name")

      console.log("[v0] Supabase response:", { data, error })

      if (error) {
        console.error("[v0] Error fetching departments/SAGAs:", error)
        setError(`Failed to load departments/SAGAs: ${error.message}`)
        return
      }

      if (data) {
        console.log("[v0] Successfully fetched departments/SAGAs:", data)
        setDepartmentsSagas(data)
      } else {
        console.log("[v0] No data returned from departments_sagas table")
        setError("No departments or SAGAs found in the database")
      }
    }

    fetchDepartmentsSagas()
  }, [])

  // Filter options based on selected category
  useEffect(() => {
    console.log("[v0] Category changed:", formData.category)
    console.log("[v0] Available departments/SAGAs:", departmentsSagas)

    if (formData.category) {
      const categoryMap = {
        department: "Department",
        saga: "SAGA",
      }
      const dbCategoryValue = categoryMap[formData.category as keyof typeof categoryMap]
      const filtered = departmentsSagas.filter((item) => item.type === dbCategoryValue)
      console.log("[v0] Filtered options:", filtered)
      setFilteredOptions(filtered)
      // Reset department/saga selection when category changes
      setFormData((prev) => ({ ...prev, departmentOrSagaId: "" }))
    } else {
      setFilteredOptions([])
    }
  }, [formData.category, departmentsSagas])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        console.log("[v0] Creating user profile for:", authData.user.id)

        const profileResult = await createUserProfile({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.name,
          county: formData.county,
          category: "Officer", // Default category for new registrations
          department_saga_id: Number.parseInt(formData.departmentOrSagaId),
        })

        if (!profileResult.success) {
          console.error("[v0] Error creating user profile:", profileResult.error)
          // If profile creation fails, we should still proceed since auth user exists
          // The complete-profile flow can handle this
        } else {
          console.log("[v0] User profile created successfully")
        }
      }

      router.push("/auth/check-email")
    } catch (error: unknown) {
      console.error("[v0] Registration error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
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
      {/* Image Section - Left side for registration */}
      <motion.div 
        className="hidden lg:flex flex-1 relative overflow-hidden"
        variants={imageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-bl from-accent-500/5 via-transparent to-secondary-500/5 z-10" />
        <Image
          src="/signuppage.jpg"
          alt="Kenya Government Service"
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-12">
          <motion.div
            className="max-w-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Join Our Team
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Register to become part of Kenya's dedicated public service team. 
              Track your activities, contribute to transparency, and help build a better nation.
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm"
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
          className="absolute bottom-40 left-40 w-20 h-20 rounded-xl bg-accent-400/20 backdrop-blur-sm"
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

      {/* Form Section - Right side for registration */}
      <div className="flex-1 min-h-screen lg:min-h-0 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative">
        {/* Sophisticated background with Kenyan flag gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-gold-50/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-500/3 via-transparent to-accent-500/3" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-gold-300/15 rounded-full blur-2xl animate-pulse-soft" />
        <div className="w-full max-w-lg">
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
            className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-luxury border border-primary-200/50 z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,247,242,0.9) 100%)'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-800 via-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">Create Your Account</h2>
                <p className="text-neutral-700 font-medium">Register to access your dashboard</p>
                <div className="w-24 h-1 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full mx-auto mt-3 mb-4"></div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-primary-800 mb-2">
                    Email Address
                  </label>
                  <motion.input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full h-12 px-4 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                    placeholder="your.email@oag.go.ke"
                    variants={inputVariants}
                    whileFocus="focus"
                    initial="blur"
                  />
                </div>

                {/* Full Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-primary-800 mb-2">
                    Full Name
                  </label>
                  <motion.input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full h-12 px-4 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                    placeholder="John Doe"
                    variants={inputVariants}
                    whileFocus="focus"
                    initial="blur"
                  />
                </div>

                {/* ID Number Field */}
                <div>
                  <label htmlFor="idNumber" className="block text-sm font-semibold text-primary-800 mb-2">
                    ID Number
                  </label>
                  <motion.input
                    id="idNumber"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange("idNumber", e.target.value)}
                    className="w-full h-12 px-4 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                    placeholder="12345678"
                    variants={inputVariants}
                    whileFocus="focus"
                    initial="blur"
                  />
                </div>

                {/* County Field */}
                <div>
                  <label htmlFor="county" className="block text-sm font-semibold text-primary-800 mb-2">
                    County
                  </label>
                  <motion.select
                    id="county"
                    value={formData.county}
                    onChange={(e) => handleInputChange("county", e.target.value)}
                    className="w-full h-12 px-4 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                    variants={inputVariants}
                    whileFocus="focus"
                    initial="blur"
                    required
                  >
                    <option value="">Select your county</option>
                    {KENYAN_COUNTIES.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </motion.select>
                </div>

                {/* Category Field */}
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-primary-800 mb-2">
                    Category
                  </label>
                  <motion.select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full h-12 px-4 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                    variants={inputVariants}
                    whileFocus="focus"
                    initial="blur"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="department">Department</option>
                    <option value="saga">SAGA</option>
                  </motion.select>
                </div>

                {/* Department/SAGA Field */}
                <AnimatePresence>
                  {formData.category && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="departmentSaga" className="block text-sm font-semibold text-primary-800 mb-2">
                        {formData.category === "department" ? "Department" : "SAGA"}
                      </label>
                      <motion.select
                        id="departmentSaga"
                        value={formData.departmentOrSagaId}
                        onChange={(e) => handleInputChange("departmentOrSagaId", e.target.value)}
                        className="w-full h-12 px-4 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                        variants={inputVariants}
                        whileFocus="focus"
                        initial="blur"
                        required
                      >
                        <option value="">{`Select ${formData.category}`}</option>
                        {filteredOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </motion.select>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
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

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary-800 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <motion.input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="w-full h-12 px-4 pr-12 border-2 border-primary-200/60 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-300 bg-white/95 backdrop-blur-sm hover:bg-primary-50/70 hover:border-primary-300/70 shadow-sm text-neutral-800"
                      placeholder="Confirm your password"
                      variants={inputVariants}
                      whileFocus="focus"
                      initial="blur"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showConfirmPassword ? (
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
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </form>

              {/* Toggle Link */}
              <div className="text-center">
                <p className="text-sm text-neutral-700 font-medium">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors hover:underline decoration-primary-500 decoration-2 underline-offset-2"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
