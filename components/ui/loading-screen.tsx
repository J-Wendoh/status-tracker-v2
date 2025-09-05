"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const inspirationalQuotes = [
  "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "Quality is not an act, it is a habit. - Aristotle",
  "Diligence is the mother of good fortune, and idleness, its opposite, never brought a man to the goal of any of his best wishes.",
  "Hard work beats talent when talent doesn't work hard. - Tim Notke",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Progress, not perfection, is the goal. Every step forward counts.",
  "Dedication and commitment are the pillars of exceptional service.",
  "Great things never come from comfort zones. Push your boundaries today."
]

interface LoadingScreenProps {
  isLoading: boolean
  progress?: number
  message?: string
}

export function LoadingScreen({ isLoading, progress = 0, message }: LoadingScreenProps) {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [displayedProgress, setDisplayedProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length)
    }, 4000)

    return () => clearInterval(quoteInterval)
  }, [isLoading])

  useEffect(() => {
    if (!isLoading) return

    const progressInterval = setInterval(() => {
      setDisplayedProgress((prev) => {
        const target = progress || Math.min(prev + Math.random() * 15, 95)
        return Math.min(prev + (target - prev) * 0.1, target)
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isLoading, progress])

  if (!isLoading) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-white via-white/95 to-[#BE6400]/10 backdrop-blur-md flex items-center justify-center"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/background02.png')] bg-cover bg-center opacity-2" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-white/60 to-red-500/3" />
        
        {/* Floating Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#BE6400]/10 to-green-500/10 rounded-full blur-3xl"
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
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-500/10 to-[#BE6400]/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Loading Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          {/* Logo Section */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="relative w-20 h-20 mx-auto mb-6 bg-luxury-gradient rounded-3xl flex items-center justify-center shadow-2xl ring-2 ring-[#BE6400]/20">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-luxury-gradient rounded-3xl blur-xl opacity-50" />
              <motion.div
                className="relative z-10 text-white font-bold text-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                OAG
              </motion.div>
            </div>
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-neutral-800 via-[#BE6400] to-neutral-800 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              OAG Activity Tracker
            </motion.h1>
            <motion.p 
              className="text-lg text-[#BE6400] font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Loading your dashboard...
            </motion.p>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10"
          >
            <div className="relative w-full h-3 bg-white/30 rounded-full backdrop-blur-sm border border-white/20 overflow-hidden mb-4">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#BE6400] via-green-500 to-red-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${displayedProgress}%` }}
                transition={{ duration: 0.3 }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600 font-medium">
                {message || "Initializing application..."}
              </span>
              <span className="text-[#BE6400] font-bold">
                {Math.round(displayedProgress)}%
              </span>
            </div>
          </motion.div>

          {/* Inspirational Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl"
              >
                <div className="mb-3">
                  <motion.div
                    className="w-8 h-1 bg-gradient-to-r from-[#BE6400] to-green-500 rounded-full mx-auto"
                    animate={{ scaleX: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <blockquote className="text-neutral-700 font-medium text-lg leading-relaxed italic">
                  "{inspirationalQuotes[currentQuote]}"
                </blockquote>
                <div className="mt-4">
                  <div className="flex justify-center space-x-1">
                    {inspirationalQuotes.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentQuote ? 'bg-[#BE6400]' : 'bg-neutral-300'
                        }`}
                        animate={index === currentQuote ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Loading Spinner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <div className="relative">
              <motion.div
                className="w-12 h-12 border-4 border-[#BE6400]/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-[#BE6400] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 w-8 h-8 border-2 border-transparent border-t-green-500 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}