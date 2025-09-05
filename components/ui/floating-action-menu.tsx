"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface FloatingAction {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
}

interface FloatingActionMenuProps {
  actions?: FloatingAction[]
  className?: string
}

const defaultActions: FloatingAction[] = [
  {
    icon: <DocumentTextIcon />,
    label: 'New Activity',
    onClick: () => console.log('New Activity'),
    color: 'bg-primary-500'
  },
  {
    icon: <ChartBarIcon />,
    label: 'View Reports',
    onClick: () => console.log('View Reports'),
    color: 'bg-secondary-500'
  },
  {
    icon: <UserGroupIcon />,
    label: 'Team Overview',
    onClick: () => console.log('Team Overview'),
    color: 'bg-accent-500'
  },
  {
    icon: <ClockIcon />,
    label: 'Schedule',
    onClick: () => console.log('Schedule'),
    color: 'bg-gold-500'
  }
]

export function FloatingActionMenu({ 
  actions = defaultActions, 
  className = '' 
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuVariants = {
    closed: {
      scale: 1,
      rotate: 0
    },
    open: {
      scale: 1.1,
      rotate: 45
    }
  }

  const actionVariants = {
    closed: {
      scale: 0,
      opacity: 0,
      y: 20
    },
    open: (index: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    })
  }

  const backgroundVariants = {
    closed: {
      scale: 0,
      opacity: 0
    },
    open: {
      scale: 1,
      opacity: 0.1,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <>
      {/* Background overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            variants={backgroundVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`fixed bottom-8 right-8 z-50 ${className}`}>
        {/* Action buttons */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-20 right-0 space-y-4">
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  custom={index}
                  variants={actionVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="flex items-center space-x-4"
                >
                  {/* Action label */}
                  <motion.div
                    className="bg-white text-neutral-800 px-3 py-2 rounded-lg shadow-lg border border-neutral-200 text-sm font-medium whitespace-nowrap"
                    whileHover={{ scale: 1.05 }}
                  >
                    {action.label}
                  </motion.div>
                  
                  {/* Action button */}
                  <motion.button
                    onClick={() => {
                      action.onClick()
                      setIsOpen(false)
                    }}
                    className={`w-12 h-12 rounded-full ${action.color || 'bg-primary-500'} text-white shadow-luxury hover:shadow-gold flex items-center justify-center transition-all duration-300`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      boxShadow: '0 8px 32px rgba(210,105,30,0.3)'
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="w-5 h-5">
                      {action.icon}
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-luxury-gradient text-white rounded-full shadow-luxury hover:shadow-gold flex items-center justify-center relative overflow-hidden group transition-all duration-300 border border-primary-400/20"
          variants={menuVariants}
          animate={isOpen ? 'open' : 'closed'}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 20px 60px rgba(210,105,30,0.3)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary-400/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          />

          {/* Icon */}
          <motion.div
            className="w-8 h-8 relative z-10"
            animate={{
              rotate: isOpen ? 45 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
          >
            <PlusIcon />
          </motion.div>

          {/* Ripple effect on click */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: isOpen ? 2 : 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        {/* Status indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 rounded-full border-2 border-white"
          animate={{
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </div>
    </>
  )
}

// Simplified version for specific use cases
interface QuickActionFABProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  className?: string
}

export function QuickActionFAB({ 
  onClick, 
  icon = <PlusIcon />, 
  label = "Quick Action",
  className = '' 
}: QuickActionFABProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed bottom-8 right-8 w-14 h-14 bg-luxury-gradient text-white rounded-full shadow-luxury hover:shadow-gold flex items-center justify-center z-50 transition-all duration-300 border border-primary-400/20 ${className}`}
      whileHover={{ 
        scale: 1.1, 
        rotate: 5,
        boxShadow: '0 20px 60px rgba(210,105,30,0.3)'
      }}
      whileTap={{ scale: 0.9 }}
      title={label}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/0 via-gold-400/30 to-primary-400/0"
        animate={{
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1
        }}
      />
      
      <div className="w-6 h-6 relative z-10">
        {icon}
      </div>
    </motion.button>
  )
}