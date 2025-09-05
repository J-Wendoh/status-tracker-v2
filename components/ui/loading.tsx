"use client"

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-skeleton bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200px_100%] bg-no-repeat rounded-lg',
        className
      )}
      {...props}
    />
  )
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function LoadingDots({ size = 'md', color = 'primary-500' }: LoadingDotsProps) {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const dotColor = `bg-${color}`

  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full', dotSize[size], dotColor)}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: [0.16, 1, 0.3, 1]
          }}
        />
      ))}
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
}

export function LoadingSpinner({ size = 'md', color = 'primary-500' }: LoadingSpinnerProps) {
  const spinnerSize = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const borderColor = `border-${color}/20 border-t-${color}`

  return (
    <motion.div
      className={cn(
        'rounded-full border-2',
        spinnerSize[size],
        borderColor
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  )
}

interface LoadingPulseProps {
  children: React.ReactNode
  isLoading?: boolean
}

export function LoadingPulse({ children, isLoading = false }: LoadingPulseProps) {
  return (
    <motion.div
      animate={isLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
      transition={isLoading ? {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      } : {}}
    >
      {children}
    </motion.div>
  )
}

// Card skeleton for dashboard
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl p-6 border border-neutral-200', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-full mb-4" />
      <div className="flex space-x-2">
        <Skeleton className="h-2 flex-1 rounded-full" />
        <Skeleton className="h-2 flex-1 rounded-full" />
        <Skeleton className="h-2 flex-1 rounded-full" />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number, columns?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-4 w-18 mb-2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

// Progress bar with sophisticated animation
interface ProgressBarProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  animated?: boolean
}

export function ProgressBar({ 
  progress, 
  size = 'md', 
  color = 'primary',
  showLabel = false,
  animated = true 
}: ProgressBarProps) {
  const barHeight = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorMap = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500', 
    accent: 'bg-accent-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-neutral-200 rounded-full overflow-hidden', barHeight[size])}>
        <motion.div
          className={cn('h-full rounded-full', colorMap[color])}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={animated ? {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          } : { duration: 0 }}
        />
      </div>
    </div>
  )
}