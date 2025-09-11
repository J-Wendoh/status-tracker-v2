"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NetworkTestPage() {
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    const result = `${timestamp} ${emoji} ${message}`
    console.log(result)
    setResults(prev => [...prev, result])
  }

  const testBasicConnectivity = async () => {
    addResult('Testing basic network connectivity...')
    
    try {
      // Test 1: Basic fetch to Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      addResult(`Testing connection to: ${supabaseUrl}`)
      
      const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      })
      
      if (response.ok) {
        addResult('Basic Supabase connectivity: OK', 'success')
      } else {
        addResult(`Basic connectivity failed: ${response.status} ${response.statusText}`, 'error')
      }
      
      // Test 2: Network timing
      const start = Date.now()
      await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      })
      const end = Date.now()
      addResult(`Network latency: ${end - start}ms`, 'info')
      
    } catch (error) {
      addResult(`Network error: ${error}`, 'error')
    }
  }

  const testSupabaseAuth = async () => {
    addResult('Testing Supabase authentication...')
    
    try {
      const supabase = createClient()
      
      // Test 1: Get session (should be null initially)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        addResult(`Session check failed: ${sessionError.message}`, 'error')
      } else {
        addResult(`Session check: ${sessionData.session ? 'Active session found' : 'No session'}`, 'success')
      }
      
      // Test 2: Try a simple auth operation
      addResult('Attempting login test...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ag@ag.go.ke',
        password: 'ke.AG001.AG'
      })
      
      if (error) {
        addResult(`Login test failed: ${error.message}`, 'error')
        addResult(`Error details: Status=${error.status}, Code=${(error as any).__isAuthError}`)
      } else {
        addResult(`Login test successful: ${data.user.email}`, 'success')
        
        // Clean up - sign out
        await supabase.auth.signOut()
        addResult('Signed out after test', 'info')
      }
      
    } catch (error) {
      addResult(`Supabase test failed: ${error}`, 'error')
    }
  }

  const testEnvironment = () => {
    addResult('Testing environment variables...')
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    addResult(`SUPABASE_URL: ${url ? '✅ Set' : '❌ Missing'}`)
    addResult(`SUPABASE_KEY: ${key ? '✅ Set' : '❌ Missing'}`)
    
    if (url) {
      addResult(`URL length: ${url.length} chars`)
      addResult(`URL format: ${url.startsWith('https://') ? '✅ HTTPS' : '❌ Invalid'}`)
    }
    
    if (key) {
      addResult(`Key length: ${key.length} chars`)
      addResult(`Key format: ${key.includes('.') ? '✅ JWT-like' : '❌ Invalid'}`)
    }
    
    addResult(`User Agent: ${navigator.userAgent}`)
    addResult(`Browser: ${navigator.appName} ${navigator.appVersion}`)
  }

  const runAllTests = async () => {
    setIsLoading(true)
    setResults([])
    
    try {
      testEnvironment()
      await testBasicConnectivity()
      await testSupabaseAuth()
    } catch (error) {
      addResult(`Test suite failed: ${error}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Network & Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={testEnvironment}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Environment
            </button>
            <button
              onClick={testBasicConnectivity}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Test Connectivity
            </button>
            <button
              onClick={testSupabaseAuth}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Auth
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-gray-500">No tests run yet. Click "Run All Tests" to begin.</div>
            ) : (
              results.map((result, index) => (
                <div key={index}>{result}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}