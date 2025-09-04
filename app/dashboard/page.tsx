import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  console.log("[v0] Dashboard - Starting authentication check")

  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log("[v0] Dashboard - Auth user:", {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  })

  if (error || !user) {
    console.log("[v0] Dashboard - No user found, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] Dashboard - Fetching user profile for ID:", user.id)

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("category, full_name")
    .eq("id", user.id)
    .single()

  console.log("[v0] Dashboard - User profile query result:", {
    userProfile,
    profileError: profileError?.message,
    hasProfile: !!userProfile,
  })

  if (!userProfile) {
    console.log("[v0] Dashboard - No user profile found, error:", profileError?.message)
    console.log("[v0] Dashboard - Redirecting to login due to missing profile")
    redirect("/auth/login")
  }

  console.log("[v0] Dashboard - User category:", userProfile.category)

  switch (userProfile.category) {
    case "Officer":
      console.log("[v0] Dashboard - Redirecting to officer dashboard")
      redirect("/dashboard/officer")
    case "HOD":
    case "CEO":
      console.log("[v0] Dashboard - Redirecting to HOD dashboard")
      redirect("/dashboard/hod")
    case "AG":
      console.log("[v0] Dashboard - Redirecting to AG dashboard")
      redirect("/dashboard/ag")
    default:
      console.log("[v0] Dashboard - Unknown category, redirecting to login")
      redirect("/auth/login")
  }
}
