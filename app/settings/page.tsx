import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsView } from "@/components/settings/settings-view"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select(`
      *,
      departments_sagas:department_saga_id (
        id,
        name,
        type
      )
    `)
    .eq("id", user.id)
    .single()

  if (profileError || !userProfile) {
    redirect("/dashboard")
  }

  return (
    <SettingsView
      user={userProfile}
    />
  )
}