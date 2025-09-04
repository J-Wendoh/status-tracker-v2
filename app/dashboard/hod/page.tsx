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

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select(`
      *,
      officer:user_id!inner (
        id,
        full_name,
        county
      ),
      service:service_id!inner (
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
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false })

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
      activities={activities || []}
      officers={officers || []}
      services={services || []}
    />
  )
}
