"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface LoadingPopupProps {
  isVisible: boolean
  message?: string
}

export function LoadingPopup({ isVisible, message = "Loading..." }: LoadingPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
        >
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-20 w-32 h-32 bg-orange-300/20 rounded-full blur-3xl"
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
              className="absolute bottom-20 right-20 w-24 h-24 bg-amber-300/20 rounded-full blur-2xl"
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
            className="bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-200/60 max-w-md w-full mx-4 relative overflow-hidden"
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

            {/* Orange accent border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 rounded-t-3xl" />
            
            <div className="relative z-10 text-center">
              {/* Logo Section */}
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/50"
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

              {/* Spinning Loader */}
              <div className="mb-6">
                <motion.div
                  className="w-16 h-16 mx-auto relative"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {/* Outer ring */}
                  <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                  {/* Inner spinning arc */}
                  <div className="absolute inset-0 border-4 border-transparent border-t-orange-600 border-r-amber-600 rounded-full"></div>
                  
                  {/* Center dot */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h3
                className="text-xl font-bold bg-gradient-to-r from-orange-800 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Attorney General System
              </motion.h3>

              {/* Loading message */}
              <motion.p
                className="text-orange-700 font-medium mb-4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {message}
              </motion.p>

              {/* Loading dots */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 rounded-b-3xl opacity-60" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}