"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function QuickTestPage() {
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testConnectivity = async () => {
    setIsLoading(true)
    setResult('Starting tests...\n')
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      setResult(prev => prev + `Testing connection to: ${supabaseUrl}\n`)
      
      // Test 1: Basic fetch
      setResult(prev => prev + 'Test 1: Basic fetch to Supabase...\n')
      const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': supabaseKey
        }
      })
      setResult(prev => prev + `Basic fetch: ${response.status} ${response.statusText}\n`)
      
      // Test 2: Supabase client test
      setResult(prev => prev + 'Test 2: Supabase client test...\n')
      const supabase = createClient()
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setResult(prev => prev + `Session error: ${sessionError.message}\n`)
      } else {
        setResult(prev => prev + `Session check: ${session.session ? 'Active' : 'No session'}\n`)
      }
      
      // Test 3: Login attempt
      setResult(prev => prev + 'Test 3: Login attempt...\n')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'ag@ag.go.ke',
        password: 'ke.AG001.AG'
      })
      
      if (loginError) {
        setResult(prev => prev + `Login error: ${loginError.message}\n`)
        setResult(prev => prev + `Error status: ${loginError.status}\n`)
      } else {
        setResult(prev => prev + `Login successful: ${loginData.user.email}\n`)
        
        // Clean up - sign out
        await supabase.auth.signOut()
        setResult(prev => prev + 'Signed out after test\n')
      }
      
      setResult(prev => prev + 'All tests completed successfully!\n')
      
    } catch (error) {
      setResult(prev => prev + `ERROR: ${error}\n`)
      console.error('Test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quick Connectivity Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnectivity}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Run Quick Test'}
          </button>
          
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm min-h-96 whitespace-pre-wrap">
            {result || 'Click "Run Quick Test" to start...'}
          </div>
          
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Environment Info:</h3>
            <div className="text-sm space-y-1">
              <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
              <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}</div>
              <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}