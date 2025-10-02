import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Check basic app health
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    }

    // Try to ping Supabase
    try {
      const supabase = createClient()
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true })

      healthCheck['database'] = error ? 'disconnected' : 'connected'
    } catch (dbError) {
      healthCheck['database'] = 'error'
    }

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}