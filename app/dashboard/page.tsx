import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const timestamp = new Date().toISOString()
  console.log(`[AUTH-DEBUG] ${timestamp} - Dashboard page started`)

  try {
    const supabase = await createClient()
    console.log(`[AUTH-DEBUG] ${timestamp} - Supabase client created`)

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    console.log(`[AUTH-DEBUG] ${timestamp} - Auth getUser result:`, {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      aud: user?.aud,
      role: user?.role,
      error: error?.message,
      errorCode: error?.status,
    })

    if (error || !user) {
      console.log(`[AUTH-DEBUG] ${timestamp} - No valid user, redirecting to login. Error:`, error)
      redirect("/auth/login")
    }

    console.log(`[AUTH-DEBUG] ${timestamp} - Fetching user profile for ID:`, user.id)

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("category, full_name")
      .eq("id", user.id)
      .single()

    console.log(`[AUTH-DEBUG] ${timestamp} - User profile query result:`, {
      userProfile,
      profileError: profileError?.message,
      profileErrorCode: profileError?.code,
      profileErrorDetails: profileError?.details,
      hasProfile: !!userProfile,
      category: userProfile?.category,
      fullName: userProfile?.full_name,
    })

    if (!userProfile) {
      console.log(`[AUTH-DEBUG] ${timestamp} - No user profile found. Error details:`, {
        message: profileError?.message,
        code: profileError?.code,
        details: profileError?.details,
        hint: profileError?.hint,
      })
      console.log(`[AUTH-DEBUG] ${timestamp} - Redirecting to login due to missing profile`)
      redirect("/auth/login")
    }

    console.log(`[AUTH-DEBUG] ${timestamp} - User category determined:`, userProfile.category)

    switch (userProfile.category) {
      case "Officer":
        console.log(`[AUTH-DEBUG] ${timestamp} - Redirecting to officer dashboard`)
        redirect("/dashboard/officer")
        break
      case "HOD":
      case "CEO":
        console.log(`[AUTH-DEBUG] ${timestamp} - Redirecting to HOD dashboard`)
        redirect("/dashboard/hod")
        break
      case "AG":
        console.log(`[AUTH-DEBUG] ${timestamp} - Redirecting to AG dashboard`)
        redirect("/dashboard/ag")
        break
      default:
        console.log(`[AUTH-DEBUG] ${timestamp} - Unknown category '${userProfile.category}', redirecting to login`)
        redirect("/auth/login")
    }
  } catch (error) {
    console.error(`[AUTH-DEBUG] ${timestamp} - Unexpected error in dashboard routing:`, error)
    redirect("/auth/login")
  }
}
