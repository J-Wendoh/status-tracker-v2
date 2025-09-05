"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { ActivityReviewList } from "./activity-review-list"
import { DepartmentStats } from "./department-stats"
import ModernLayout from "./modern-layout"
import { EnhancedKPICard } from "../ui/enhanced-kpi-card"
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
  const totalActivities = activities?.length || 0
  const pendingReview = activities?.filter((activity) => !activity?.activity_status || activity.activity_status.length === 0).length || 0
  const inProgress = activities?.filter((activity) =>
    activity?.activity_status?.some((status) => (status?.pending_count || 0) > 0 && (status?.completed_count || 0) === 0),
  ).length || 0
  const completed = activities?.filter((activity) =>
    activity?.activity_status?.some((status) => (status?.completed_count || 0) > 0),
  ).length || 0

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/hod', icon: HomeIcon, current: true },
    { name: 'Activities', href: '/dashboard/hod/activities', icon: DocumentTextIcon, current: false },
    { name: 'Team', href: '/dashboard/hod/team', icon: UserGroupIcon, current: false },
    { name: 'Analytics', href: '/dashboard/hod/analytics', icon: ChartBarIcon, current: false },
  ]

  const userInfo = {
    name: user.full_name,
    role: 'Head of Department',
    department: user.departments_sagas?.name
  }

  return (
    <ModernLayout navigation={navigation} userInfo={userInfo}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          {/* Floating background elements */}
          <motion.div
            className="absolute -top-4 -left-4 w-32 h-32 bg-primary-100/50 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-6 -right-8 w-24 h-24 bg-secondary-200/40 rounded-full blur-2xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          <div className="relative z-10">
            <motion.h1 
              className="text-display-md font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-neutral-800 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome back, {user.full_name}
            </motion.h1>
            <motion.p 
              className="text-xl text-neutral-600 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="inline-flex items-center">
                <motion.span
                  className="w-2 h-2 bg-primary-500 rounded-full mr-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Head of {user.departments_sagas?.name}
              </span>
              <span className="mx-2 text-neutral-400">•</span>
              <span className="text-secondary-600 font-semibold">{user.county} County</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced KPI Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EnhancedKPICard
            title="Total Activities"
            value={totalActivities}
            target={100}
            icon={<DocumentTextIcon />}
            color="primary"
            description="All department activities"
            trend="up"
            trendValue={12}
            trendPeriod="vs last month"
            showProgress={true}
            animated={true}
          />
          <EnhancedKPICard
            title="Pending Review"
            value={pendingReview}
            target={20}
            icon={<CheckCircleIcon />}
            color="warning"
            description="Awaiting your approval"
            trend={pendingReview > 5 ? "up" : "stable"}
            trendValue={pendingReview > 5 ? 8 : 0}
            trendPeriod="this week"
            showProgress={true}
            animated={true}
          />
          <EnhancedKPICard
            title="Team Members"
            value={officers.length}
            icon={<UserGroupIcon />}
            color="secondary"
            description="Active officers"
            trend="stable"
            trendValue={0}
            trendPeriod="no change"
            animated={true}
          />
          <EnhancedKPICard
            title="Completed"
            value={completed}
            previousValue={completed - 5}
            icon={<BuildingOfficeIcon />}
            color="success"
            description="Successfully completed"
            trend="up"
            trendValue={15}
            trendPeriod="vs last month"
            target={80}
            showProgress={true}
            animated={true}
          />
        </motion.div>

        {/* Content sections would continue here... */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {user.departments_sagas && (
              <span>
                Managing: {user.departments_sagas.name} ({user.departments_sagas.type.toUpperCase()})
              </span>
            )}
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
                  Review and update the status of activities submitted by officers in your {user.departments_sagas?.type || 'department'}
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
              departmentName={user.departments_sagas?.name || 'Department'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
