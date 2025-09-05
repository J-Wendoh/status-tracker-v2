"use client"

import { motion, useSpring, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'

interface KPICardProps {
  title: string
  value: number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: React.ReactNode
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
  description?: string
  className?: string
}

const KPICard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'primary',
  description,
  className = ''
}: KPICardProps) => {
  const [displayValue, setDisplayValue] = useState(0)
  
  // Animated number counter
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(Math.floor(latest))
    })

    return () => controls.stop()
  }, [value])

  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-500',
      border: 'border-primary-100'
    },
    secondary: {
      bg: 'bg-secondary-50',
      icon: 'text-secondary-500', 
      border: 'border-secondary-100'
    },
    accent: {
      bg: 'bg-accent-50',
      icon: 'text-accent-500',
      border: 'border-accent-100'
    },
    success: {
      bg: 'bg-green-50',
      icon: 'text-green-500',
      border: 'border-green-100'
    },
    warning: {
      bg: 'bg-orange-50',
      icon: 'text-orange-500',
      border: 'border-orange-100'
    },
    error: {
      bg: 'bg-red-50',
      icon: 'text-red-500',
      border: 'border-red-100'
    }
  }

  const currentColor = colorClasses[color]

  const cardVariants = {
    hover: {
      y: -4,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  }

  return (
    <motion.div
      className={`relative bg-white rounded-2xl p-6 border border-neutral-200 shadow-card hover:shadow-card-hover transition-all duration-300 ${className}`}
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-50/50 rounded-2xl" />
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${currentColor.bg} ${currentColor.border} border rounded-xl flex items-center justify-center`}>
            <div className={`w-6 h-6 ${currentColor.icon}`}>
              {icon}
            </div>
          </div>
          
          {change && (
            <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
              change.type === 'increase' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <span className={`mr-1 ${change.type === 'increase' ? '↗' : '↘'}`}>
                {change.type === 'increase' ? '↗' : '↘'}
              </span>
              {Math.abs(change.value)}%
            </div>
          )}
        </div>

        {/* Main metric */}
        <div className="mb-2">
          <motion.div 
            className="text-3xl font-bold text-neutral-900"
            key={displayValue}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {displayValue.toLocaleString()}
          </motion.div>
          <h3 className="text-sm font-medium text-neutral-600 mt-1">
            {title}
          </h3>
        </div>

        {/* Description or change period */}
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-neutral-500">
              {description}
            </p>
          )}
          {change && (
            <p className="text-xs text-neutral-500">
              vs {change.period}
            </p>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      <motion.div
        className={`absolute inset-0 ${currentColor.bg}/20 rounded-2xl opacity-0`}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default KPICard