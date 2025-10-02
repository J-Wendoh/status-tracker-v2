"use client"

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ProgressBar } from './loading'

interface EnhancedKPICardProps {
  title: string
  value: number
  target?: number
  previousValue?: number
  icon: React.ReactNode
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
  description?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  trendPeriod?: string
  className?: string
  animated?: boolean
  showProgress?: boolean
  prefix?: string
  suffix?: string
  format?: 'number' | 'currency' | 'percentage'
}

export function EnhancedKPICard({
  title,
  value,
  target,
  previousValue,
  icon,
  color = 'primary',
  description,
  trend,
  trendValue,
  trendPeriod = 'vs last month',
  className = '',
  animated = true,
  showProgress = false,
  prefix = '',
  suffix = '',
  format = 'number'
}: EnhancedKPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Color mappings
  const colorClasses = {
    primary: {
      bg: 'from-primary-50 to-primary-100/50',
      icon: 'text-primary-600',
      border: 'border-primary-200',
      glow: 'shadow-primary-500/20'
    },
    secondary: {
      bg: 'from-secondary-50 to-secondary-100/50',
      icon: 'text-secondary-600',
      border: 'border-secondary-200',
      glow: 'shadow-secondary-500/20'
    },
    accent: {
      bg: 'from-accent-50 to-accent-100/50',
      icon: 'text-accent-600',
      border: 'border-accent-200',
      glow: 'shadow-accent-500/20'
    },
    success: {
      bg: 'from-green-50 to-green-100/50',
      icon: 'text-green-600',
      border: 'border-green-200',
      glow: 'shadow-green-500/20'
    },
    warning: {
      bg: 'from-yellow-50 to-yellow-100/50',
      icon: 'text-yellow-600',
      border: 'border-yellow-200',
      glow: 'shadow-yellow-500/20'
    },
    error: {
      bg: 'from-red-50 to-red-100/50',
      icon: 'text-red-600',
      border: 'border-red-200',
      glow: 'shadow-red-500/20'
    }
  }

  const currentColor = colorClasses[color]

  // Animated number counter
  useEffect(() => {
    if (!animated) {
      setDisplayValue(value)
      return
    }

    let startTime: number
    let animationId: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / 1500, 1)
      
      // Easing function for smooth animation
      const easeOutExpo = 1 - Math.pow(2, -10 * progress)
      const currentValue = Math.floor(easeOutExpo * value)
      
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [value, animated])

  // Format display value
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `${prefix}${val.toLocaleString()}${suffix}`
      case 'percentage':
        return `${val}%`
      default:
        return `${prefix}${val.toLocaleString()}${suffix}`
    }
  }

  // Calculate trend
  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend) {
      case 'up':
        return (
          <motion.div 
            className="text-green-600"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ↗
          </motion.div>
        )
      case 'down':
        return (
          <motion.div 
            className="text-red-600"
            animate={{ y: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ↘
          </motion.div>
        )
      case 'stable':
        return <div className="text-neutral-500">→</div>
    }
  }

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    hover: { 
      y: -8,
      scale: 1.02,
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    tap: { scale: 0.98 }
  }

  const progressPercentage = target ? Math.min((value / target) * 100, 100) : 0

  return (
    <motion.div
      className={cn(
        'relative group cursor-pointer',
        className
      )}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Background with sophisticated gradients */}
      <div className={cn(
        'relative bg-white rounded-2xl p-6 border transition-all duration-500',
        currentColor.border,
        'hover:shadow-2xl hover:shadow-primary-500/10',
        'backdrop-blur-sm bg-gradient-to-br from-white via-white/95 to-neutral-50/80'
      )}>
        
        {/* Animated background gradient */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500',
            currentColor.bg
          )}
          animate={{ 
            opacity: isHovered ? 0.05 : 0,
          }}
        />

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: isHovered 
              ? '0 0 40px rgba(210, 105, 30, 0.1)' 
              : '0 0 0px rgba(210, 105, 30, 0)'
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              className={cn(
                'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center transition-all duration-300',
                currentColor.bg,
                currentColor.border,
                'border shadow-lg'
              )}
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn('w-7 h-7', currentColor.icon)}>
                {icon}
              </div>
            </motion.div>

            {/* Trend indicator */}
            {trend && trendValue && (
              <motion.div 
                className={cn(
                  'flex items-center px-3 py-1.5 rounded-xl text-sm font-medium border',
                  trend === 'up' ? 'bg-green-50 text-green-700 border-green-200' :
                  trend === 'down' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-neutral-50 text-neutral-600 border-neutral-200'
                )}
                whileHover={{ scale: 1.05 }}
              >
                {getTrendIcon()}
                <span className="ml-1">{Math.abs(trendValue)}%</span>
              </motion.div>
            )}
          </div>

          {/* Main metric */}
          <div className="mb-4">
            <motion.div 
              className="text-4xl font-bold text-neutral-900 mb-1"
              key={displayValue}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {formatValue(displayValue)}
            </motion.div>
            
            <motion.h3 
              className="text-lg font-semibold text-neutral-700"
              animate={{ color: isHovered ? '#374151' : '#6b7280' }}
            >
              {title}
            </motion.h3>
          </div>

          {/* Progress bar for targets */}
          {showProgress && target && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-neutral-600 mb-2">
                <span>Progress to Target</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <ProgressBar
                progress={progressPercentage}
                animated={animated}
                variant="executive"
              />
            </div>
          )}

          {/* Description and trend period */}
          <div className="space-y-2">
            {description && (
              <p className="text-sm text-neutral-600">
                {description}
              </p>
            )}
            
            {trend && trendPeriod && (
              <p className="text-xs text-neutral-500">
                {trendPeriod}
              </p>
            )}

            {target && (
              <p className="text-xs text-neutral-500">
                Target: {formatValue(target)}
              </p>
            )}
          </div>
        </div>

        {/* Interactive hover overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/5"
          animate={{ 
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Floating action indicator */}
      <motion.div
        className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isHovered ? 1 : 0, 
          opacity: isHovered ? 1 : 0 
        }}
        transition={{ duration: 0.2 }}
      >
        ↗
      </motion.div>
    </motion.div>
  )
}