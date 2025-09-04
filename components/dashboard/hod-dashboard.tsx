"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, FileText, TrendingUp, Building, UserCheck } from "lucide-react"
import { ActivityReviewList } from "./activity-review-list"
import { DepartmentStats } from "./department-stats"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Service, User } from "@/lib/supabase/types"

interface ActivityWithDetails {
  id: number
  user_id: string
  service_id: number
  description: string
  count: number
  file_url?: string
  created_at: string
  officer: {
    id: string
    full_name: string
    county: string
  }
  service: {
    id: number
    name: string
  }
  activity_status: {
    id: number
    pending_count: number | null
    completed_count: number | null
    updated_by: string | null
    updated_at: string
  }[]
}

interface UserWithDepartment extends User {
  departments_sagas: {
    id: string
    name: string
    type: string
  }
}

interface HodDashboardProps {
  user: UserWithDepartment
  activities: ActivityWithDetails[]
  officers: Pick<User, "id" | "full_name" | "county">[]
  services: Service[]
}

export function HodDashboard({ user, activities, officers, services }: HodDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // Calculate statistics
  const totalActivities = activities.length
  const pendingReview = activities.filter((activity) => activity.activity_status.length === 0).length
  const inProgress = activities.filter((activity) =>
    activity.activity_status.some((status) => (status.pending_count || 0) > 0 && (status.completed_count || 0) === 0),
  ).length
  const completed = activities.filter((activity) =>
    activity.activity_status.some((status) => (status.completed_count || 0) > 0),
  ).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">OAG Activity System</h1>
              </div>
              <Badge variant="secondary">HOD/CEO Dashboard</Badge>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Welcome, {user.full_name}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>ID: {user.id}</span>
            <span>County: {user.county}</span>
            <span>
              Managing: {user.departments_sagas.name} ({user.departments_sagas.type.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities}</div>
              <p className="text-xs text-muted-foreground">All submitted activities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingReview}</div>
              <p className="text-xs text-muted-foreground">Awaiting your review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
              <p className="text-xs text-muted-foreground">Currently being worked on</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Badge className="h-4 w-4 rounded-full bg-green-100 text-green-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completed}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="review-activities" className="gap-2">
              <FileText className="h-4 w-4" />
              Review Activities
            </TabsTrigger>
            <TabsTrigger value="department-stats" className="gap-2">
              <Users className="h-4 w-4" />
              Department Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity Submissions</CardTitle>
                  <CardDescription>Latest activities submitted by your team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityReviewList
                    activities={activities.slice(0, 5)}
                    showActions={false}
                    onStatusUpdate={() => router.refresh()}
                  />
                  {activities.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setActiveTab("review-activities")}>
                        View All Activities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="review-activities">
            <Card>
              <CardHeader>
                <CardTitle>Activity Review & Management</CardTitle>
                <CardDescription>
                  Review and update the status of activities submitted by officers in your {user.departments_sagas.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityReviewList
                  activities={activities}
                  showActions={true}
                  onStatusUpdate={() => router.refresh()}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="department-stats">
            <DepartmentStats
              activities={activities}
              officers={officers}
              services={services}
              departmentName={user.departments_sagas.name}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
