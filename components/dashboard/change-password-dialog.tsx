"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { X, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

interface ChangePasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  isForced?: boolean
}

export function ChangePasswordDialog({ isOpen, onClose, isForced = false }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      // Mark password as changed in users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ password_changed: true })
        .eq('id', user.id)

      if (dbError) {
        console.error('Failed to update password_changed flag:', dbError)
      }

      setSuccess(true)

      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Close dialog and reload page after 2 seconds
      setTimeout(() => {
        onClose()
        setSuccess(false)
        window.location.reload()
      }, 2000)

    } catch (err: any) {
      console.error('Password change error:', err)
      setError(err.message || 'Failed to change password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isForced ? undefined : onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              {!isForced && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#BE6400]/10 to-[#BE6400]/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#BE6400]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    {isForced ? 'Password Change Required' : 'Change Password'}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    {isForced
                      ? 'Please change your password to continue'
                      : 'Update your account security'
                    }
                  </p>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <motion.div
                  className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    Password changed successfully!
                  </p>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Enter new password"
                      required
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Minimum 8 characters</p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                      required
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  {!isForced && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl text-neutral-700 font-semibold hover:bg-neutral-50 transition-colors"
                      disabled={isLoading || success}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`${isForced ? 'w-full' : 'flex-1'} px-4 py-3 bg-gradient-to-r from-[#BE6400] to-[#BE6400]/80 text-white rounded-xl font-semibold hover:from-[#BE6400]/90 hover:to-[#BE6400]/70 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isLoading || success}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
