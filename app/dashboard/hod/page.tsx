import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HodDashboard } from "@/components/dashboard/hod-dashboard-enhanced"

export default async function HodDashboardPage() {
  const timestamp = new Date().toISOString()
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Dashboard page started`)

  const supabase = await createClient()
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Dashboard: Supabase client created`)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Dashboard: Auth getUser result:`, {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  })

  if (error || !user) {
    console.log(`[AUTH-DEBUG] ${timestamp} - HOD Dashboard: No valid user, redirecting to login`)
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

  console.log("[v0] HOD - User profile query result:", {
    userProfile,
    profileError: profileError?.message,
    hasProfile: !!userProfile,
    hasDepartmentSaga: !!userProfile?.departments_sagas,
  })

  if (profileError || !userProfile) {
    console.log("[v0] HOD - Profile error or missing profile, redirecting to dashboard")
    redirect("/dashboard")
  }

  if (!["HOD", "CEO"].includes(userProfile.category)) {
    console.log("[v0] HOD - User category is not HOD/CEO:", userProfile.category)
    redirect("/dashboard")
  }

  // Check if user has department assignment
  if (!userProfile.department_saga_id) {
    console.log("[v0] HOD - User has no department assignment, redirecting to dashboard")
    redirect("/dashboard")
  }

  // First get services for this department/SAGA
  const { data: departmentServices, error: servicesError } = await supabase
    .from("services")
    .select("id")
    .eq("department_saga_id", userProfile.department_saga_id)

  console.log("[v0] HOD - Department services query result:", {
    departmentServices,
    servicesError: servicesError?.message,
    servicesCount: departmentServices?.length || 0,
    departmentSagaId: userProfile.department_saga_id,
  })

  const serviceIds = departmentServices?.map(service => service.id) || []

  // Try direct query without complex joins first
  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("*")
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false })
  
  console.log("[v0] HOD - Simple activities query result:", {
    activities,
    activitiesError: activitiesError?.message,
    activitiesCount: activities?.length || 0,
  })

  // If we got activities, then fetch the related data separately
  let activitiesWithDetails = []
  if (activities && activities.length > 0) {
    // Get user details for officers
    const userIds = [...new Set(activities.map(a => a.user_id))]
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, county")
      .in("id", userIds)
    
    // Get service details
    const { data: servicesDetails } = await supabase
      .from("services")
      .select("id, name")
      .in("id", serviceIds)
    
    // Get activity statuses - get the latest status per activity
    const activityIds = activities.map(a => a.id)
    const { data: allStatuses } = await supabase
      .from("activity_status")
      .select("*")
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false })
    
    // Group statuses by activity_id and keep only the latest one per activity
    const latestStatusPerActivity = new Map()
    allStatuses?.forEach(status => {
      if (!latestStatusPerActivity.has(status.activity_id)) {
        latestStatusPerActivity.set(status.activity_id, status)
      }
    })
    
    console.log("[v0] HOD - Latest status per activity:", Object.fromEntries(latestStatusPerActivity))
    
    // Combine the data
    activitiesWithDetails = activities.map(activity => ({
      ...activity,
      officer: users?.find(u => u.id === activity.user_id) || { id: activity.user_id, full_name: "Unknown", county: "Unknown" },
      service: servicesDetails?.find(s => s.id === activity.service_id) || { id: activity.service_id, name: "Unknown Service" },
      activity_status: latestStatusPerActivity.has(activity.id) ? [latestStatusPerActivity.get(activity.id)] : []
    }))
  }

  console.log("[v0] HOD - Activities query result:", {
    activities,
    activitiesError: activitiesError?.message,
    activitiesCount: activities?.length || 0,
  })

  const { data: officers, error: officersError } = await supabase
    .from("users")
    .select("id, full_name, county")
    .eq("department_saga_id", userProfile.department_saga_id)
    .in("category", ["Officer", "HOD", "CEO"])
    .order("full_name")

  console.log("[v0] HOD - Officers query result:", {
    officers,
    officersError: officersError?.message,
    officersCount: officers?.length || 0,
  })

  const { data: services, error: allServicesError } = await supabase
    .from("services")
    .select("*")
    .eq("department_saga_id", userProfile.department_saga_id)
    .order("name")

  console.log("[v0] HOD - All services query result:", {
    services,
    allServicesError: allServicesError?.message,
    allServicesCount: services?.length || 0,
  })

  // Final validation before rendering
  if (!userProfile.departments_sagas) {
    console.log("[v0] HOD - Missing departments_sagas relation, redirecting to dashboard")
    redirect("/dashboard")
  }

  return (
    <HodDashboard
      user={userProfile}
      activities={activitiesWithDetails || []}
      officers={officers || []}
      services={services || []}
    />
  )
}
