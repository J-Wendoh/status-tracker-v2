"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { LoadingSpinner } from "./loading"

interface LoginPopupProps {
  isVisible: boolean
  message?: string
}

export function LoginPopup({ isVisible, message = "Authenticating..." }: LoginPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 max-w-md w-full mx-auto text-center relative overflow-visible"
            style={{
              maxHeight: 'calc(100vh - 2rem)',
              minHeight: 'auto'
            }}
          >
            {/* Header with Logo */}
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Image
                  src="/courtofarms.jpeg"
                  alt="Kenya Coat of Arms"
                  width={32}
                  height={32}
                  className="rounded-lg object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Attorney General System
              </h3>
              <p className="text-gray-500 text-sm">
                Secure Access Portal
              </p>
            </div>

            {/* Professional Loading Spinner */}
            <div className="mb-6">
              <LoadingSpinner size="lg" />
            </div>

            {/* Login message */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 font-medium text-sm">
                {message}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}