"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DebugSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  const router = useRouter()

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const supabase = createClient()
    
    addLog('🔍 Checking current session...')
    
    try {
      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        addLog(`❌ Session error: ${sessionError.message}`)
        setSessionInfo({ error: sessionError.message })
        return
      }

      if (!sessionData.session) {
        addLog('ℹ️ No session found')
        setSessionInfo({ message: 'No session' })
        return
      }

      const session = sessionData.session
      addLog(`✅ Session found for: ${session.user.email}`)
      addLog(`   Token expires: ${new Date(session.expires_at * 1000).toLocaleString()}`)
      
      setSessionInfo({
        user_id: session.user.id,
        email: session.user.email,
        expires_at: new Date(session.expires_at * 1000).toLocaleString(),
        access_token: session.access_token ? 'Present' : 'Missing',
        refresh_token: session.refresh_token ? 'Present' : 'Missing'
      })

      // Check user profile
      addLog('👤 Fetching user profile...')
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        addLog(`❌ Profile error: ${profileError.message}`)
        setUserInfo({ error: profileError.message })
      } else {
        addLog(`✅ Profile loaded: ${profile.full_name} (${profile.category})`)
        setUserInfo(profile)
      }

    } catch (error) {
      addLog(`❌ Unexpected error: ${error}`)
    }
  }

  const testLogin = async () => {
    const supabase = createClient()
    addLog('🔐 Testing login...')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ag@ag.go.ke',
        password: 'ke.AG001.AG'
      })

      if (error) {
        addLog(`❌ Login failed: ${error.message}`)
        return
      }

      addLog(`✅ Login successful!`)
      
      // Wait a moment then recheck session
      setTimeout(() => {
        addLog('🔄 Rechecking session after login...')
        checkSession()
      }, 1000)

    } catch (error) {
      addLog(`❌ Login error: ${error}`)
    }
  }

  const testDashboardAccess = async () => {
    addLog('🚪 Testing dashboard access...')
    
    try {
      const response = await fetch('/dashboard/ag', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Accept': 'text/html',
        }
      })

      addLog(`   Response status: ${response.status}`)
      addLog(`   Response headers: ${JSON.stringify([...response.headers.entries()])}`)
      
      if (response.redirected) {
        addLog(`   Redirected to: ${response.url}`)
      }

    } catch (error) {
      addLog(`❌ Dashboard test error: ${error}`)
    }
  }

  const signOut = async () => {
    const supabase = createClient()
    addLog('🚪 Signing out...')
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      addLog(`❌ Sign out error: ${error.message}`)
    } else {
      addLog('✅ Signed out successfully')
      setSessionInfo(null)
      setUserInfo(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Session Debug Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="space-y-2">
              <button
                onClick={checkSession}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Check Session
              </button>
              <button
                onClick={testLogin}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Test Login
              </button>
              <button
                onClick={testDashboardAccess}
                className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
              >
                Test Dashboard Access
              </button>
              <button
                onClick={signOut}
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Info</h2>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-64">
              {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : 'No session data'}
            </pre>
          </div>

          {/* User Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto max-h-64">
              {userInfo ? JSON.stringify(userInfo, null, 2) : 'No user data'}
            </pre>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}