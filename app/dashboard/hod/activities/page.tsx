import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HodActivitiesView } from "@/components/dashboard/hod-activities-view"

export default async function HodActivitiesPage() {
  const timestamp = new Date().toISOString()
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Activities page started`)

  const supabase = await createClient()
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Activities: Supabase client created`)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  console.log(`[AUTH-DEBUG] ${timestamp} - HOD Activities: Auth getUser result:`, {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  })

  if (error || !user) {
    console.log(`[AUTH-DEBUG] ${timestamp} - HOD Activities: No valid user, redirecting to login`)
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

  console.log("[AG-TRACKER] HOD Activities - User profile query result:", {
    userProfile,
    profileError: profileError?.message,
    hasProfile: !!userProfile,
    hasDepartmentSaga: !!userProfile?.departments_sagas,
  })

  if (profileError || !userProfile) {
    console.log("[AG-TRACKER] HOD Activities - Profile error or missing profile, redirecting to dashboard")
    redirect("/dashboard")
  }

  if (!["HOD", "CEO"].includes(userProfile.category)) {
    console.log("[AG-TRACKER] HOD Activities - User category is not HOD/CEO:", userProfile.category)
    redirect("/dashboard")
  }

  // Check if user has department assignment
  if (!userProfile.department_saga_id) {
    console.log("[AG-TRACKER] HOD Activities - User has no department assignment, redirecting to dashboard")
    redirect("/dashboard")
  }

  // Get services for this department/SAGA
  const { data: departmentServices, error: servicesError } = await supabase
    .from("services")
    .select("id")
    .eq("department_saga_id", userProfile.department_saga_id)

  console.log("[AG-TRACKER] HOD Activities - Department services query result:", {
    departmentServices,
    servicesError: servicesError?.message,
    servicesCount: departmentServices?.length || 0,
    departmentSagaId: userProfile.department_saga_id,
  })

  const serviceIds = departmentServices?.map(service => service.id) || []

  // Get detailed activities with all related data
  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select(`
      *,
      service:service_id (
        id,
        name
      ),
      users:user_id (
        id,
        full_name,
        county
      ),
      activity_status (
        id,
        pending_count,
        completed_count,
        status,
        notes,
        updated_by,
        created_at
      )
    `)
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false })
  
  console.log("[AG-TRACKER] HOD Activities - Detailed activities query result:", {
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

  console.log("[AG-TRACKER] HOD Activities - Officers query result:", {
    officers,
    officersError: officersError?.message,
    officersCount: officers?.length || 0,
  })

  const { data: services, error: allServicesError } = await supabase
    .from("services")
    .select("*")
    .eq("department_saga_id", userProfile.department_saga_id)
    .order("name")

  console.log("[AG-TRACKER] HOD Activities - All services query result:", {
    services,
    allServicesError: allServicesError?.message,
    allServicesCount: services?.length || 0,
  })

  // Final validation before rendering
  if (!userProfile.departments_sagas) {
    console.log("[AG-TRACKER] HOD Activities - Missing departments_sagas relation, redirecting to dashboard")
    redirect("/dashboard")
  }

  return (
    <HodActivitiesView
      user={userProfile}
      activities={activities || []}
      officers={officers || []}
      services={services || []}
    />
  )
}