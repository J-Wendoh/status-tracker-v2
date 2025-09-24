import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HodTeamView } from "@/components/dashboard/hod-team-view"

export default async function HodTeamPage() {
  const timestamp = new Date().toISOString()
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Team page started`)

  const supabase = await createClient()
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Team: Supabase client created`)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Team: Auth getUser result:`, {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  })

  if (error || !user) {
    console.log(`[AUTH-DEBUG] ${timestamp} - HOD Team: No valid user, redirecting to login`)
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

  console.log("[AG-TRACKER] HOD Team - User profile query result:", {
    userProfile,
    profileError: profileError?.message,
    hasProfile: !!userProfile,
    hasDepartmentSaga: !!userProfile?.departments_sagas,
  })

  if (profileError || !userProfile) {
    console.log("[AG-TRACKER] HOD Team - Profile error or missing profile, redirecting to dashboard")
    redirect("/dashboard")
  }

  if (!["HOD", "CEO"].includes(userProfile.category)) {
    console.log("[AG-TRACKER] HOD Team - User category is not HOD/CEO:", userProfile.category)
    redirect("/dashboard")
  }

  // Check if user has department assignment
  if (!userProfile.department_saga_id) {
    console.log("[AG-TRACKER] HOD Team - User has no department assignment, redirecting to dashboard")
    redirect("/dashboard")
  }

  // Get all team members in this department
  const { data: teamMembers, error: teamError } = await supabase
    .from("users")
    .select(`
      id,
      full_name,
      email,
      county,
      category,
      created_at,
      updated_at
    `)
    .eq("department_saga_id", userProfile.department_saga_id)
    .in("category", ["Officer", "HOD", "CEO"])
    .order("full_name")

  console.log("[AG-TRACKER] HOD Team - Team members query result:", {
    teamMembers,
    teamError: teamError?.message,
    teamCount: teamMembers?.length || 0,
  })

  // Get services for this department
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id")
    .eq("department_saga_id", userProfile.department_saga_id)

  const serviceIds = services?.map(service => service.id) || []

  // Get activity statistics for each team member
  const { data: activityStats, error: statsError } = await supabase
    .from("activities")
    .select(`
      user_id,
      id,
      created_at,
      activity_status (
        status,
        completed_count,
        pending_count
      )
    `)
    .in("service_id", serviceIds)

  console.log("[AG-TRACKER] HOD Team - Activity stats query result:", {
    activityStats,
    statsError: statsError?.message,
    statsCount: activityStats?.length || 0,
  })

  // Final validation before rendering
  if (!userProfile.departments_sagas) {
    console.log("[AG-TRACKER] HOD Team - Missing departments_sagas relation, redirecting to dashboard")
    redirect("/dashboard")
  }

  return (
    <HodTeamView
      user={userProfile}
      teamMembers={teamMembers || []}
      activityStats={activityStats || []}
    />
  )
}