import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Supabase auth error:", error)
      redirect("/auth/login")
    }

    if (user) {
      redirect("/dashboard")
    } else {
      redirect("/auth/login")
    }
  } catch (error) {
    console.error("HomePage error:", error)
    redirect("/auth/login")
  }
}
