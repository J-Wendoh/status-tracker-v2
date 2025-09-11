import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HodAnalyticsView } from "@/components/dashboard/hod-analytics-view"

export default async function HodAnalyticsPage() {
  const timestamp = new Date().toISOString()
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Analytics page started`)

  const supabase = await createClient()
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Analytics: Supabase client created`)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Analytics: Auth getUser result:`, {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  })

  if (error || !user) {
    console.log(`[AUTH-DEBUG] ${timestamp} - HOD Analytics: No valid user, redirecting to login`)
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

  console.log("[v0] HOD Analytics - User profile query result:", {
    userProfile,
    profileError: profileError?.message,
    hasProfile: !!userProfile,
    hasDepartmentSaga: !!userProfile?.departments_sagas,
  })

  if (profileError || !userProfile) {
    console.log("[v0] HOD Analytics - Profile error or missing profile, redirecting to dashboard")
    redirect("/dashboard")
  }

  if (!["HOD", "CEO"].includes(userProfile.category)) {
    console.log("[v0] HOD Analytics - User category is not HOD/CEO:", userProfile.category)
    redirect("/dashboard")
  }

  // Check if user has department assignment
  if (!userProfile.department_saga_id) {
    console.log("[v0] HOD Analytics - User has no department assignment, redirecting to dashboard")
    redirect("/dashboard")
  }

  // Get services for this department
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, name")
    .eq("department_saga_id", userProfile.department_saga_id)

  const serviceIds = services?.map(service => service.id) || []

  // Get detailed analytics data
  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select(`
      id,
      user_id,
      service_id,
      count,
      created_at,
      service:service_id (
        id,
        name
      ),
      users:user_id (
        id,
        full_name
      ),
      activity_status (
        status,
        completed_count,
        pending_count,
        created_at
      )
    `)
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false })

  console.log("[v0] HOD Analytics - Activities query result:", {
    activities,
    activitiesError: activitiesError?.message,
    activitiesCount: activities?.length || 0,
  })

  // Get team members
  const { data: teamMembers, error: teamError } = await supabase
    .from("users")
    .select("id, full_name, category")
    .eq("department_saga_id", userProfile.department_saga_id)
    .in("category", ["Officer", "HOD", "CEO"])
    .order("full_name")

  console.log("[v0] HOD Analytics - Team members query result:", {
    teamMembers,
    teamError: teamError?.message,
    teamCount: teamMembers?.length || 0,
  })

  // Final validation before rendering
  if (!userProfile.departments_sagas) {
    console.log("[v0] HOD Analytics - Missing departments_sagas relation, redirecting to dashboard")
    redirect("/dashboard")
  }

  return (
    <HodAnalyticsView
      user={userProfile}
      activities={activities || []}
      services={services || []}
      teamMembers={teamMembers || []}
    />
  )
}