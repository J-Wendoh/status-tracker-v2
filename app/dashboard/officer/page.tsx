import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OfficerDashboard } from "@/components/dashboard/officer-dashboard-enhanced"

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

  console.log("[AG-TRACKER] Officer - User profile query result:", {
    userProfile,
    profileError: profileError?.message,
    hasProfile: !!userProfile,
    hasDepartmentSaga: !!userProfile?.departments_sagas,
  })

  if (profileError || !userProfile) {
    console.log("[AG-TRACKER] Officer - Profile error or missing profile, redirecting to dashboard")
    redirect("/dashboard")
  }

  if (userProfile.category !== "Officer") {
    console.log("[AG-TRACKER] Officer - User category is not Officer:", userProfile.category)
    redirect("/dashboard")
  }

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("*")
    .eq("department_saga_id", userProfile.department_saga_id)
    .order("name")

  console.log("[AG-TRACKER] Officer - Services query result:", {
    services,
    servicesError: servicesError?.message,
    servicesCount: services?.length || 0,
    departmentSagaId: userProfile.department_saga_id,
  })

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
        created_at,
        status,
        hod_comment,
        hod_reviewed,
        hod_reviewed_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  console.log("[AG-TRACKER] Officer - Activities query result:", {
    activities,
    activitiesError: activitiesError?.message,
    activitiesCount: activities?.length || 0,
  })

  // Ensure we have the minimum required data
  if (!userProfile.departments_sagas) {
    console.log("[AG-TRACKER] Officer - Missing department/saga data, redirecting to dashboard")
    redirect("/dashboard")
  }

  return <OfficerDashboard user={userProfile} services={services || []} activities={activities || []} />
}
