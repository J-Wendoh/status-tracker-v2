"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-skeleton bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 bg-[length:200px_100%] bg-no-repeat rounded-xl shadow-inner border border-slate-100/50',
        className
      )}
      {...props}
    />
  )
}

// Executive-Grade Loading Spinner with Kenya Court of Arms
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  text?: string
  variant?: 'standard' | 'premium' | 'executive'
}

export function LoadingSpinner({
  size = 'md',
  showText = false,
  text = 'Processing...',
  variant = 'executive'
}: LoadingSpinnerProps) {
  // Generate stable unique ID for gradient to prevent conflicts
  const gradientId = React.useMemo(() =>
    `executiveGradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  )

  const dimensions = {
    sm: { container: 60, logo: 26, border: 2, shadow: 'shadow-lg' },
    md: { container: 80, logo: 36, border: 3, shadow: 'shadow-xl' },
    lg: { container: 100, logo: 46, border: 3, shadow: 'shadow-2xl' },
    xl: { container: 140, logo: 68, border: 4, shadow: 'shadow-2xl' }
  }

  const dim = dimensions[size]

  const variants = {
    standard: {
      bgGradient: 'from-slate-50 to-white',
      ringColors: ['#e5e7eb', '#dc2626'],
      borderColor: 'border-slate-200',
      textColor: 'text-slate-700'
    },
    premium: {
      bgGradient: 'from-slate-50 via-white to-slate-50',
      ringColors: ['#f1f5f9', '#b91c1c', '#166534'],
      borderColor: 'border-slate-300/50',
      textColor: 'text-slate-800'
    },
    executive: {
      bgGradient: 'from-slate-50/95 via-white to-slate-50/95',
      ringColors: ['#f8fafc', '#dc2626', '#166534', '#d97706'],
      borderColor: 'border-slate-200/60',
      textColor: 'text-slate-900'
    }
  }

  const config = variants[variant]

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={cn(
          "relative rounded-full bg-gradient-to-br backdrop-blur-sm flex items-center justify-center",
          config.bgGradient,
          config.borderColor,
          dim.shadow,
          "border-2"
        )}
        style={{
          width: dim.container + 24,
          height: dim.container + 24,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Outer Decorative Ring with Kenya Flag Colors - Non-overlapping */}
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${config.ringColors[1]} 0deg, ${config.ringColors[2]} 120deg, #000000 240deg, ${config.ringColors[1]} 360deg)`,
            padding: '1px'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-white via-slate-50 to-white" />
        </motion.div>

        {/* Court of Arms Container - Centered and properly spaced */}
        <motion.div
          className="relative z-20 flex items-center justify-center"
          animate={{
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Executive backdrop with subtle glow - smaller to prevent overlap */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-yellow-200/15 via-transparent to-transparent rounded-full blur-md"
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="relative bg-white rounded-lg p-1.5 shadow-inner border border-slate-200/50 backdrop-blur-sm">
            <Image
              src="/courtofarms.jpeg"
              alt="Republic of Kenya Coat of Arms"
              width={dim.logo}
              height={dim.logo}
              className="object-contain rounded-md"
              priority
            />
          </div>
        </motion.div>

        {/* Precision Loading Ring - Properly positioned */}
        <svg
          className="absolute inset-0"
          viewBox={`0 0 ${dim.container + 24} ${dim.container + 24}`}
          style={{ width: dim.container + 24, height: dim.container + 24 }}
        >
          {/* Background track */}
          <circle
            cx={(dim.container + 24) / 2}
            cy={(dim.container + 24) / 2}
            r={dim.container / 2 - 6}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={dim.border}
            className="opacity-40"
          />

          {/* Animated progress ring */}
          <motion.circle
            cx={(dim.container + 24) / 2}
            cy={(dim.container + 24) / 2}
            r={dim.container / 2 - 6}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={dim.border}
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * (dim.container - 12) * 0.25} ${Math.PI * (dim.container - 12) * 0.75}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: 'center' }}
          />

          {/* Premium gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="33%" stopColor="#166534" />
              <stop offset="66%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle pulsing ring for executive feel - Non-overlapping */}
        <motion.div
          className="absolute inset-2 rounded-full border border-slate-300/20 pointer-events-none"
          animate={{ scale: [1, 1.02, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {showText && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className={cn("text-sm font-semibold tracking-wide", config.textColor)}>
            {text}
          </p>
          <div className="flex justify-center mt-2 space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-slate-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Executive Page Loading with Premium Backdrop
export function PageLoading({ message = "Initializing System..." }: { message?: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.95) 50%, rgba(248,250,252,0.98) 100%)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Executive Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-slate-900/5" />
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.1) 0%, transparent 30%),
                              radial-gradient(circle at 75% 75%, rgba(239, 68, 68, 0.1) 0%, transparent 30%),
                              radial-gradient(circle at 75% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 30%)`
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <LoadingSpinner size="xl" showText={true} text={message} variant="executive" />

        {/* Executive Status Indicator */}
        <motion.div
          className="mt-8 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className="text-sm font-semibold text-slate-700 tracking-wide">
              Office of the Attorney General
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// Executive Loading Dots for Premium Inline Use
export function LoadingDots({ variant = 'executive' }: { variant?: 'standard' | 'executive' }) {
  const dotVariants = {
    standard: {
      size: 'w-1.5 h-1.5',
      color: 'bg-slate-400',
      spacing: 'space-x-1'
    },
    executive: {
      size: 'w-2 h-2',
      color: 'bg-gradient-to-r from-red-600 via-green-600 to-yellow-600',
      spacing: 'space-x-2'
    }
  }

  const config = dotVariants[variant]

  return (
    <span className={cn("inline-flex items-center", config.spacing)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn("rounded-full", config.size, config.color)}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </span>
  )
}

// Executive-Grade Progress Bar with Premium Styling
interface ProgressBarProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  variant?: 'standard' | 'executive'
  label?: string
}

export function ProgressBar({
  progress,
  size = 'md',
  showLabel = false,
  animated = true,
  variant = 'executive',
  label = 'Progress'
}: ProgressBarProps) {
  const barHeight = {
    sm: { height: 'h-2', padding: 'p-0.5' },
    md: { height: 'h-3', padding: 'p-1' },
    lg: { height: 'h-4', padding: 'p-1' }
  }

  const variants = {
    standard: {
      track: 'bg-slate-200',
      bar: 'bg-gradient-to-r from-red-600 to-red-500',
      shadow: 'shadow-sm'
    },
    executive: {
      track: 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border border-slate-200/60',
      bar: 'bg-gradient-to-r from-red-700 via-green-600 to-yellow-600',
      shadow: 'shadow-inner'
    }
  }

  const config = variants[variant]
  const dim = barHeight[size]

  return (
    <div className="w-full">
      {showLabel && (
        <motion.div
          className="flex justify-between items-center mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm font-semibold text-slate-700 tracking-wide">{label}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900">{Math.round(progress)}%</span>
            {variant === 'executive' && (
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
      )}

      <div className={cn(
        'w-full rounded-full overflow-hidden backdrop-blur-sm',
        dim.height,
        config.track,
        config.shadow
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full relative overflow-hidden',
            config.bar
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={animated ? {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          } : { duration: 0 }}
        >
          {variant === 'executive' && (
            <>
              {/* Shimmer effect for executive variant */}
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

              {/* Premium glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent blur-sm"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          )}
        </motion.div>
      </div>

      {variant === 'executive' && (
        <motion.div
          className="mt-2 text-xs text-slate-500 font-medium tracking-wider text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          GOVERNMENT OF KENYA
        </motion.div>
      )}
    </div>
  )
}

// Executive Loading Pulse with Premium Effects
interface LoadingPulseProps {
  children: React.ReactNode
  isLoading?: boolean
  variant?: 'standard' | 'executive'
}

export function LoadingPulse({
  children,
  isLoading = false,
  variant = 'executive'
}: LoadingPulseProps) {
  const pulseEffects = {
    standard: {
      opacity: [1, 0.5, 1],
      duration: 1.5
    },
    executive: {
      opacity: [1, 0.7, 1],
      scale: [1, 1.005, 1],
      duration: 2
    }
  }

  const effect = pulseEffects[variant]

  return (
    <motion.div
      animate={isLoading ? effect : { opacity: 1, scale: 1 }}
      transition={isLoading ? {
        duration: effect.duration,
        repeat: Infinity,
        ease: 'easeInOut'
      } : {}}
      className={variant === 'executive' ? 'relative' : ''}
    >
      {variant === 'executive' && isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent rounded-lg"
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
      {children}
    </motion.div>
  )
}

// Executive Card Skeleton with Premium Government Styling
export function CardSkeleton({
  className,
  variant = 'executive'
}: {
  className?: string
  variant?: 'standard' | 'executive'
}) {
  const variants = {
    standard: {
      card: 'bg-white rounded-lg border border-gray-200 shadow-sm',
      avatar: 'rounded',
      title: 'h-4',
      subtitle: 'h-3'
    },
    executive: {
      card: 'bg-gradient-to-br from-white via-slate-50/50 to-white rounded-2xl border border-slate-200/60 shadow-xl backdrop-blur-sm',
      avatar: 'rounded-xl',
      title: 'h-5',
      subtitle: 'h-3'
    }
  }

  const config = variants[variant]

  return (
    <motion.div
      className={cn(config.card, 'p-8', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton className={cn("w-12 h-12", config.avatar)} />
          <div className="space-y-3">
            <Skeleton className={cn(config.title, "w-28")} />
            <Skeleton className={cn(config.subtitle, "w-20")} />
          </div>
        </div>
        {variant === 'executive' && (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* Progress Section for Executive */}
        {variant === 'executive' && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
        <div className="flex space-x-3">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
        {variant === 'executive' && (
          <Skeleton className="h-6 w-6 rounded-full" />
        )}
      </div>
    </motion.div>
  )
}

// Executive Table Skeleton with Government Premium Styling
export function TableSkeleton({
  rows = 5,
  columns = 4,
  variant = 'executive'
}: {
  rows?: number
  columns?: number
  variant?: 'standard' | 'executive'
}) {
  const variants = {
    standard: {
      container: 'bg-white rounded-lg border border-gray-200 shadow-sm',
      header: 'border-b border-gray-200 bg-gray-50',
      divider: 'divide-gray-100'
    },
    executive: {
      container: 'bg-gradient-to-br from-white via-slate-50/30 to-white rounded-2xl border border-slate-200/60 shadow-xl backdrop-blur-sm',
      header: 'border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white',
      divider: 'divide-slate-100/60'
    }
  }

  const config = variants[variant]

  return (
    <motion.div
      className={cn(config.container, "overflow-hidden")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Executive Header */}
      <div className={cn(config.header, "p-6")}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            {variant === 'executive' && (
              <Skeleton className="w-8 h-8 rounded-full" />
            )}
            <Skeleton className="h-5 w-32" />
          </div>
          {variant === 'executive' && (
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>

      {/* Executive Table Rows */}
      <div className={cn("divide-y", config.divider)}>
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            className="p-6 hover:bg-slate-50/30 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <div className="flex items-center space-x-4">
              {variant === 'executive' && (
                <Skeleton className="w-10 h-10 rounded-xl" />
              )}
              {Array.from({ length: columns - (variant === 'executive' ? 1 : 0) }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
              {variant === 'executive' && (
                <div className="flex space-x-2">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Executive Footer */}
      {variant === 'executive' && (
        <motion.div
          className="border-t border-slate-100 bg-slate-50/30 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-40" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Executive Form Skeleton with Premium Government Styling
export function FormSkeleton({ variant = 'executive' }: { variant?: 'standard' | 'executive' }) {
  const variants = {
    standard: {
      container: 'space-y-4',
      field: 'space-y-2'
    },
    executive: {
      container: 'space-y-6 p-8 bg-gradient-to-br from-white via-slate-50/30 to-white rounded-2xl border border-slate-200/60 shadow-xl',
      field: 'space-y-3'
    }
  }

  const config = variants[variant]

  return (
    <motion.div
      className={config.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Executive Header */}
      {variant === 'executive' && (
        <div className="mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <motion.div
        className={config.field}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </motion.div>

      <motion.div
        className={config.field}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className={config.field}>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className={config.field}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </motion.div>

      {variant === 'executive' && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        className={variant === 'executive' ? "pt-6 border-t border-slate-100" : ""}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <Skeleton className="h-12 w-24 rounded-xl" />
            <Skeleton className="h-12 w-20 rounded-xl" />
          </div>
          {variant === 'executive' && (
            <Skeleton className="h-12 w-32 rounded-xl" />
          )}
        </div>
      </motion.div>

      {/* Executive Footer */}
      {variant === 'executive' && (
        <motion.div
          className="pt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <Skeleton className="h-3 w-48 mx-auto" />
        </motion.div>
      )}
    </motion.div>
  )
}