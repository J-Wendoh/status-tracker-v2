import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OfficerActivitiesPage } from "@/components/dashboard/officer-activities-page"

export const dynamic = 'force-dynamic'

export default async function OfficerActivitiesRoute() {
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

  if (profileError || !userProfile) {
    redirect("/dashboard")
  }

  if (userProfile.category !== "Officer") {
    redirect("/dashboard")
  }

  const { data: services, error: servicesError } = await supabase
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

  if (!userProfile.departments_sagas) {
    redirect("/dashboard")
  }

  return <OfficerActivitiesPage user={userProfile} services={services || []} activities={activities || []} />
}