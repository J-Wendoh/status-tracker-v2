"use client"

import { useEffect } from 'react'
import { createClient } from "@/lib/supabase/client"

export function EnvDebug() {
  useEffect(() => {
    console.log('🔍 Browser Environment Debug:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌')
    
    const supabase = createClient()
    console.log('Supabase client:', supabase)
    console.log('Supabase URL from client:', (supabase as any).supabaseUrl)
    console.log('Supabase Key from client:', (supabase as any).supabaseKey ? 'Set ✅' : 'Missing ❌')
    
    // Test a simple operation
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Current session:', { data, error })
    })
  }, [])

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs z-50">
      <div>Check browser console for debug info</div>
      <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
      <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</div>
    </div>
  )
}