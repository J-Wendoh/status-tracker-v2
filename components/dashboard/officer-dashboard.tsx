"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Plus, FileText, Calendar, UserIcon, Building } from "lucide-react"
import { ActivityForm } from "./activity-form"
import { ActivityList } from "./activity-list"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Service, Activity } from "@/lib/supabase/types"
import type { UserWithDepartmentSaga } from "@/lib/supabase/types"

interface OfficerDashboardProps {
  user: UserWithDepartmentSaga
  services: Service[]
  activities: (Activity & {
    service: {
      id: string
      name: string
    }
    activity_status: {
      pending_count: number
      completed_count: number
      created_at: string
    }[]
  })[]
}

export function OfficerDashboard({ user, services, activities }: OfficerDashboardProps) {
  const [activeTab, setActiveTab] = useState("log-activity")
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const totalActivities = activities?.length || 0
  const pendingActivities = activities?.filter(
    (activity) =>
      !activity.activity_status || 
      activity.activity_status.length === 0 || 
      activity.activity_status.some((status) => status?.pending_count > 0),
  ).length || 0
  const completedActivities = activities?.filter((activity) =>
    activity.activity_status?.some((status) => status?.completed_count > 0),
  ).length || 0

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
              <Badge variant="secondary">Officer Dashboard</Badge>
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
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Welcome, {user.full_name}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>ID: {user.id}</span>
            <span>County: {user.county}</span>
            {user.departments_sagas && (
              <span>
                {user.departments_sagas.type === "Department" ? "Department" : "SAGA"}: {user.departments_sagas.name}
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities}</div>
              <p className="text-xs text-muted-foreground">Activities logged to date</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingActivities}</div>
              <p className="text-xs text-muted-foreground">Awaiting HOD/CEO review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Badge className="h-4 w-4 rounded-full bg-green-100 text-green-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedActivities}</div>
              <p className="text-xs text-muted-foreground">Activities completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log-activity" className="gap-2">
              <Plus className="h-4 w-4" />
              Log Activity
            </TabsTrigger>
            <TabsTrigger value="my-activities" className="gap-2">
              <FileText className="h-4 w-4" />
              My Activities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log-activity">
            <Card>
              <CardHeader>
                <CardTitle>Log New Activity</CardTitle>
                <CardDescription>Record your work activities and upload supporting documents</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityForm
                  services={services}
                  userId={user.id}
                  onSuccess={() => {
                    setActiveTab("my-activities")
                    router.refresh()
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-activities">
            <Card>
              <CardHeader>
                <CardTitle>My Activity History</CardTitle>
                <CardDescription>View all your logged activities and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityList activities={activities} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
