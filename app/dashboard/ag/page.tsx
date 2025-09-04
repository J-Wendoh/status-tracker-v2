import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AgDashboard } from "@/components/dashboard/ag-dashboard"

export default async function AgDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userProfile || userProfile.category !== "AG") {
    redirect("/dashboard")
  }

  const { data: departmentsSagas } = await supabase
    .from("departments_sagas")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true })

  const { data: activities } = await supabase
    .from("activities")
    .select(`
      *,
      officer:user_id (
        id,
        full_name,
        county,
        department_saga_id,
        departments_sagas:department_saga_id (
          id,
          name,
          type
        )
      ),
      service:service_id (
        id,
        name,
        department_saga_id
      ),
      activity_status (
        id,
        pending_count,
        completed_count,
        updated_by,
        updated_at
      )
    `)
    .order("created_at", { ascending: false })

  const { data: officers } = await supabase
    .from("users")
    .select(`
      *,
      departments_sagas:department_saga_id (
        id,
        name,
        type
      )
    `)
    .eq("category", "Officer")
    .order("full_name")

  const { data: services } = await supabase
    .from("services")
    .select(`
      *,
      departments_sagas:department_saga_id (
        id,
        name,
        type
      )
    `)
    .order("name")

  return (
    <AgDashboard
      user={userProfile}
      departmentsSagas={departmentsSagas || []}
      activities={activities || []}
      officers={officers || []}
      services={services || []}
    />
  )
}
