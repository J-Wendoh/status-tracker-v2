"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const timestamp = new Date().toISOString()
    console.log(`[AUTH-DEBUG] ${timestamp} - Login attempt started for email:`, email)
    
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log(`[AUTH-DEBUG] ${timestamp} - Calling signInWithPassword`)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log(`[AUTH-DEBUG] ${timestamp} - signInWithPassword result:`, {
        user: data?.user ? {
          id: data.user.id,
          email: data.user.email,
          aud: data.user.aud,
        } : null,
        session: data?.session ? {
          access_token: data.session.access_token?.substring(0, 20) + '...',
          refresh_token: data.session.refresh_token?.substring(0, 20) + '...',
        } : null,
        error: error?.message,
        errorStatus: error?.status,
      })

      if (error) throw error
      
      console.log(`[AUTH-DEBUG] ${timestamp} - Login successful, refreshing router`)
      // Refresh the router to ensure cookies are synced
      router.refresh()
      
      console.log(`[AUTH-DEBUG] ${timestamp} - Scheduling redirect to dashboard`)
      // Small delay to ensure cookies are properly set
      setTimeout(() => {
        console.log(`[AUTH-DEBUG] ${new Date().toISOString()} - Executing redirect to dashboard`)
        router.push("/dashboard")
      }, 100)
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred"
      console.log(`[AUTH-DEBUG] ${timestamp} - Login failed:`, errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">OAG Activity System</CardTitle>
              <CardDescription>Sign in to your account to access the activity logging system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@oag.go.ke"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="underline underline-offset-4">
                    Register here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
