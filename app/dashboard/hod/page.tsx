import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HodDashboard } from "@/components/dashboard/hod-dashboard"

export default async function HodDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase
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

  if (!userProfile || !["HOD", "CEO"].includes(userProfile.category)) {
    redirect("/dashboard")
  }

  const { data: activities } = await supabase
    .from("activities")
    .select(`
      *,
      officer:user_id (
        id,
        full_name,
        county
      ),
      service:service_id (
        id,
        name
      ),
      activity_status (
        id,
        pending_count,
        completed_count,
        updated_by,
        updated_at
      )
    `)
    .eq("officer.department_saga_id", userProfile.department_saga_id)
    .order("created_at", { ascending: false })

  const { data: officers } = await supabase
    .from("users")
    .select("id, full_name, county")
    .eq("department_saga_id", userProfile.department_saga_id)
    .eq("category", "Officer")
    .order("full_name")

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("department_saga_id", userProfile.department_saga_id)
    .order("name")

  return (
    <HodDashboard
      user={userProfile}
      activities={activities || []}
      officers={officers || []}
      services={services || []}
    />
  )
}
