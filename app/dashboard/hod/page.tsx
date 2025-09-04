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

  // First get services for this department/SAGA
  const { data: departmentServices } = await supabase
    .from("services")
    .select("id")
    .eq("department_saga_id", userProfile.department_saga_id)

  const serviceIds = departmentServices?.map(service => service.id) || []

  const { data: activities } = await supabase
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

  const { data: officers } = await supabase
    .from("users")
    .select("id, full_name, county")
    .eq("department_saga_id", userProfile.department_saga_id)
    .in("category", ["Officer", "HOD", "CEO"])
    .order("full_name")

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("department_saga_id", userProfile.department_saga_id)
    .order("name")

  // Debug logging (remove after fixing)
  console.log("HOD Dashboard Debug:")
  console.log("Department Services:", departmentServices)
  console.log("Service IDs:", serviceIds)
  console.log("Activities:", activities)
  console.log("Activities length:", activities?.length || 0)

  return (
    <HodDashboard
      user={userProfile}
      activities={activities || []}
      officers={officers || []}
      services={services || []}
    />
  )
}
