import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OfficerDashboard } from "@/components/dashboard/officer-dashboard"

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'

export default async function OfficerDashboardPage() {
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

  if (!userProfile || userProfile.category !== "Officer") {
    redirect("/dashboard")
  }

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("department_saga_id", userProfile.department_saga_id)
    .order("name")

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select(`
      *,
      service:service_id (
        id,
        name
      ),
      activity_status (
        pending_count,
        completed_count,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  console.log("[v0] Officer - Activities query result:", {
    activities,
    activitiesError: activitiesError?.message,
    activitiesCount: activities?.length || 0,
  })

  return <OfficerDashboard user={userProfile} services={services || []} activities={activities || []} />
}
