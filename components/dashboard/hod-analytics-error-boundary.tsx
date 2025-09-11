"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class HodAnalyticsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HOD Analytics Error Boundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Analytics Dashboard</h1>
                <p className="text-neutral-600">Comprehensive insights into department performance</p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          <div className="bg-white rounded-xl p-8 shadow-card border border-neutral-200">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Analytics Temporarily Unavailable</h2>
              <p className="text-neutral-600 mb-6">
                We're experiencing a temporary issue loading the analytics data. Please try refreshing the page.
              </p>
              <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-neutral-700 mb-2">
                  <strong>What you can do:</strong>
                </p>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Refresh the page to try loading again</li>
                  <li>• Navigate to Activities or Team tabs which are working normally</li>
                  <li>• Contact the development team if this issue persists</li>
                </ul>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Refresh Page
              </button>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-neutral-500 cursor-pointer hover:text-neutral-700">
                    Technical Details (for developers)
                  </summary>
                  <pre className="mt-2 text-xs text-neutral-500 bg-neutral-100 p-2 rounded overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}