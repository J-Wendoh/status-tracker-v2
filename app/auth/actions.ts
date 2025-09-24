"use server"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function createUserProfile(userData: {
  id: string
  email: string
  full_name: string
  county: string
  category: string
  department_saga_id: number
}) {
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    console.log("[AG-TRACKER] Creating user profile on server:", userData)

    // Insert the user profile
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) {
      console.log("[AG-TRACKER] Server error creating user profile:", error)
      throw error
    }

    console.log("[AG-TRACKER] Successfully created user profile on server:", data)
    return { success: true, data }
  } catch (error) {
    console.log("[AG-TRACKER] Server action error:", error)
    return { success: false, error: error.message }
  }
}
