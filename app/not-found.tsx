"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

export default function NotFound() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push("/auth/login")
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{ backgroundImage: `url('/background.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-50/20 via-white/70 to-accent-50/20" />
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-secondary-200/20 via-primary-200/15 to-accent-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent-100/15 via-white/25 to-secondary-100/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Kenyan Coat of Arms */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-gold-500 rounded-full flex items-center justify-center shadow-luxury mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
          </div>
        </motion.div>

        {/* 404 Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-8xl font-bold text-transparent bg-gradient-to-r from-primary-500 to-gold-500 bg-clip-text mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-neutral-600 mb-2">
            We can't seem to find the page you're looking for.
          </p>
          <p className="text-base text-primary-600 font-medium">
            That's on us - we're getting it fixed!
          </p>
        </motion.div>

        {/* Error Message Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-primary-100 shadow-luxury mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⚖️</span>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800">Office of the Attorney General</h3>
              <p className="text-sm text-primary-600">Activity Tracking System</p>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            Don't worry! Let's get you back to managing your activities safely.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-primary-500 to-gold-500 text-white hover:from-primary-600 hover:to-gold-600 shadow-luxury hover:shadow-gold transition-all duration-300 px-8 py-3 font-semibold border-0"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go to Login Page
          </Button>
          
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 px-8 py-3 font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 text-sm text-neutral-500"
        >
          <p>If you continue to experience issues, please contact your system administrator.</p>
        </motion.div>

        {/* Animated Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-300/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}