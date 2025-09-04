import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AgDashboard } from "@/components/dashboard/ag-dashboard"

export default async function AgDashboardPage() {
  const timestamp = new Date().toISOString()
  console.log(`[AUTH-DEBUG] ${timestamp} - AG Dashboard page started`)

  const supabase = await createClient()
  console.log(`[AUTH-DEBUG] ${timestamp} - AG Dashboard: Supabase client created`)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  console.log(`[AUTH-DEBUG] ${timestamp} - AG Dashboard: Auth getUser result:`, {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  })

  if (error || !user) {
    console.log(`[AUTH-DEBUG] ${timestamp} - AG Dashboard: No valid user, redirecting to login`)
    redirect("/auth/login")
  }

  console.log(`[AUTH-DEBUG] ${timestamp} - AG Dashboard: Fetching user profile for:`, user.id)
  const { data: userProfile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

  console.log(`[AUTH-DEBUG] ${timestamp} - AG Dashboard: User profile result:`, {
    userProfile: userProfile ? { 
      id: userProfile.id, 
      category: userProfile.category, 
      email: userProfile.email 
    } : null,
    profileError: profileError?.message,
    profileErrorCode: profileError?.code,
  })

  if (!userProfile || userProfile.category !== "AG") {
    console.log(`[AUTH-DEBUG] ${timestamp} - AG Dashboard: Invalid profile or not AG. Category:`, userProfile?.category)
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
      user:user_id (
        id,
        full_name,
        email,
        county,
        category,
        department_saga_id
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
        created_at
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
    .in("category", ["Officer", "HOD", "CEO"])
    .order("full_name")

  const { data: services } = await supabase
    .from("services")
    .select(`
      *
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
