"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [status, setStatus] = useState<string>('Initializing...')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    testAuth()
  }, [])

  const testAuth = async () => {
    const supabase = createClient()
    
    addLog('🔧 Environment Check:')
    addLog(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    addLog(`Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}`)
    
    try {
      // Test 1: Check current session
      addLog('📋 Checking current session...')
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`)
      } else if (session.session) {
        addLog(`✅ Active session found for: ${session.session.user.email}`)
      } else {
        addLog('ℹ️ No active session')
      }

      // Test 2: Try to sign in
      addLog('🔐 Testing login...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'ag@ag.go.ke',
        password: 'ke.AG001.AG'
      })

      if (signInError) {
        addLog(`❌ Sign in failed: ${signInError.message}`)
        setStatus('Authentication Failed')
        return
      }

      addLog(`✅ Sign in successful for: ${signInData.user.email}`)

      // Test 3: Get user profile
      addLog('👤 Fetching profile...')
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('full_name, category')
        .eq('id', signInData.user.id)
        .single()

      if (profileError) {
        addLog(`❌ Profile fetch failed: ${profileError.message}`)
      } else {
        addLog(`✅ Profile: ${profile.full_name} (${profile.category})`)
      }

      setStatus('All Tests Passed ✅')

    } catch (error) {
      addLog(`❌ Unexpected error: ${error}`)
      setStatus('Test Failed ❌')
    }
  }

  const testManualLogin = async () => {
    const email = (document.getElementById('email') as HTMLInputElement).value
    const password = (document.getElementById('password') as HTMLInputElement).value
    
    if (!email || !password) {
      addLog('❌ Please enter both email and password')
      return
    }

    const supabase = createClient()
    addLog(`🔐 Attempting manual login for: ${email}`)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        addLog(`❌ Manual login failed: ${error.message}`)
        addLog(`   Status: ${error.status || 'Unknown'}`)
        addLog(`   Code: ${(error as any).__isAuthError ? 'AuthError' : 'Unknown'}`)
      } else {
        addLog(`✅ Manual login successful for: ${data.user.email}`)
        addLog(`   Redirecting to dashboard...`)
        window.location.href = '/dashboard'
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Status: {status}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Manual Login Test</h3>
              <div className="space-y-3">
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  defaultValue="ag@ag.go.ke"
                  className="w-full p-2 border rounded"
                />
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  defaultValue="ke.AG001.AG"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={testManualLogin}
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Test Login
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Environment Info</h3>
              <div className="text-sm space-y-1">
                <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
                <div>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</div>
                <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-medium mb-3">Test Logs</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}