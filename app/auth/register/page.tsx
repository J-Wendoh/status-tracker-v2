"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { createUserProfile } from "@/app/auth/actions"

interface DepartmentSaga {
  id: string
  name: string
  type: "department" | "saga"
}

const KENYAN_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    idNumber: "",
    county: "",
    category: "",
    departmentOrSagaId: "",
  })
  const [departmentsSagas, setDepartmentsSagas] = useState<DepartmentSaga[]>([])
  const [filteredOptions, setFilteredOptions] = useState<DepartmentSaga[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch departments and SAGAs on component mount
  useEffect(() => {
    const fetchDepartmentsSagas = async () => {
      console.log("[v0] Fetching departments and SAGAs...")
      const supabase = createClient()
      const { data, error } = await supabase.from("departments_sagas").select("id, name, type").order("name")

      console.log("[v0] Supabase response:", { data, error })

      if (error) {
        console.error("[v0] Error fetching departments/SAGAs:", error)
        setError(`Failed to load departments/SAGAs: ${error.message}`)
        return
      }

      if (data) {
        console.log("[v0] Successfully fetched departments/SAGAs:", data)
        setDepartmentsSagas(data)
      } else {
        console.log("[v0] No data returned from departments_sagas table")
        setError("No departments or SAGAs found in the database")
      }
    }

    fetchDepartmentsSagas()
  }, [])

  // Filter options based on selected category
  useEffect(() => {
    console.log("[v0] Category changed:", formData.category)
    console.log("[v0] Available departments/SAGAs:", departmentsSagas)

    if (formData.category) {
      const categoryMap = {
        department: "Department",
        saga: "SAGA",
      }
      const dbCategoryValue = categoryMap[formData.category as keyof typeof categoryMap]
      const filtered = departmentsSagas.filter((item) => item.type === dbCategoryValue)
      console.log("[v0] Filtered options:", filtered)
      setFilteredOptions(filtered)
      // Reset department/saga selection when category changes
      setFormData((prev) => ({ ...prev, departmentOrSagaId: "" }))
    } else {
      setFilteredOptions([])
    }
  }, [formData.category, departmentsSagas])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        console.log("[v0] Creating user profile for:", authData.user.id)

        const profileResult = await createUserProfile({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.name,
          county: formData.county,
          category: "Officer", // Default category for new registrations
          department_saga_id: Number.parseInt(formData.departmentOrSagaId),
        })

        if (!profileResult.success) {
          console.error("[v0] Error creating user profile:", profileResult.error)
          // If profile creation fails, we should still proceed since auth user exists
          // The complete-profile flow can handle this
        } else {
          console.log("[v0] User profile created successfully")
        }
      }

      router.push("/auth/check-email")
    } catch (error: unknown) {
      console.error("[v0] Registration error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Register for OAG System</CardTitle>
              <CardDescription>Create your account to access the activity logging system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@oag.go.ke"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="12345678"
                      required
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange("idNumber", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="county">County</Label>
                    <Select value={formData.county} onValueChange={(value) => handleInputChange("county", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your county" />
                      </SelectTrigger>
                      <SelectContent>
                        {KENYAN_COUNTIES.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="saga">SAGA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.category && (
                    <div className="grid gap-2">
                      <Label htmlFor="departmentSaga">
                        {formData.category === "department" ? "Department" : "SAGA"}
                      </Label>
                      <Select
                        value={formData.departmentOrSagaId}
                        onValueChange={(value) => handleInputChange("departmentOrSagaId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${formData.category}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Register"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4">
                    Sign in here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
