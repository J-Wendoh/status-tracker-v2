"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { LockClosedIcon, UserIcon, ArrowRightIcon } from "@heroicons/react/24/outline"

interface LoginPopupProps {
  isVisible: boolean
  message?: string
}

export function LoginPopup({ isVisible, message = "Logging you in..." }: LoginPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
        >
          {/* Floating background elements with Kenyan flag colors */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-20 w-32 h-32 bg-green-300/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-24 h-24 bg-red-300/20 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#BE6400]/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.16, 1, 0.3, 1],
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="bg-gradient-to-br from-white/95 via-green-50/90 to-red-50/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-green-200/60 max-w-md w-full mx-4 relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 1,
                ease: "linear"
              }}
            />

            {/* Kenyan flag accent border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-red-600 to-black rounded-t-3xl" />
            
            <div className="relative z-10 text-center">
              {/* Logo Section */}
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-green-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/50"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Image
                    src="/courtofarms.jpeg"
                    alt="Kenya Coat of Arms"
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                  />
                </motion.div>
              </div>

              {/* Authentication Animation */}
              <div className="mb-6">
                <motion.div className="w-20 h-20 mx-auto relative">
                  {/* Outer security ring */}
                  <motion.div
                    className="absolute inset-0 border-4 border-green-200 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Inner authentication ring */}
                  <motion.div
                    className="absolute inset-2 border-3 border-transparent border-t-green-600 border-r-red-600 border-b-[#BE6400] rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Center lock icon */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-red-600 rounded-lg flex items-center justify-center">
                      <LockClosedIcon className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Title */}
              <motion.h3
                className="text-xl font-bold bg-gradient-to-r from-green-800 via-[#BE6400] to-red-800 bg-clip-text text-transparent mb-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🇰🇪 Attorney General System
              </motion.h3>

              {/* Login message */}
              <motion.p
                className="text-neutral-700 font-medium mb-4 flex items-center justify-center gap-2"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <UserIcon className="w-4 h-4" />
                {message}
                <ArrowRightIcon className="w-4 h-4" />
              </motion.p>

              {/* Animated progress bar */}
              <div className="w-full bg-neutral-200 rounded-full h-2 mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 via-[#BE6400] to-red-600"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Cute bouncing dots */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 via-[#BE6400] to-red-600 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                      y: [0, -8, 0]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Cute emoji animation */}
              <motion.div
                className="mt-4 text-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                👋
              </motion.div>
            </div>

            {/* Bottom Kenyan flag accent */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-red-600 to-black rounded-b-3xl opacity-60" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}