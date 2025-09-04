"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { Building, Users, FileText, TrendingUp, Award, Calendar, Target } from "lucide-react"
import { format, subDays, eachDayOfInterval } from "date-fns"
import type { DepartmentSaga, Service } from "@/lib/supabase/types"

interface ActivityWithFullDetails {
  id: number
  user_id: string
  service_id: number
  description: string
  count: number
  file_url?: string | null
  created_at: string
  updated_at: string
  user: {
    id: string
    full_name: string
    email: string
    county: string
    category: string
    department_saga_id: number
  }
  service: {
    id: number
    name: string
    department_saga_id: number
  }
  activity_status: {
    id: number
    pending_count: number | null
    completed_count: number | null
    updated_by: string | null
    created_at: string
  }[]
}

interface OfficerWithDepartment {
  id: string
  email: string
  full_name: string
  county: string
  category: string
  department_saga_id: number | null
  created_at: string
  updated_at: string
  departments_sagas: {
    id: number
    name: string
    type: string
  } | null
}


interface AgAnalyticsProps {
  activities: ActivityWithFullDetails[]
  officers: OfficerWithDepartment[]
  departmentsSagas: DepartmentSaga[]
  services: Service[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export function AgAnalytics({ activities, officers, departmentsSagas, services }: AgAnalyticsProps) {
  // Overall statistics
  const totalActivities = activities.length
  const totalOfficers = officers.length
  const totalDepartments = departmentsSagas.filter((item) => item.type === "Department").length
  const totalSagas = departmentsSagas.filter((item) => item.type === "SAGA").length

  const pendingActivities = activities.filter((activity) => activity.activity_status.length === 0).length
  const inProgressActivities = activities.filter((activity) =>
    activity.activity_status.some((status) => status.pending_count && status.pending_count > 0 && !status.completed_count),
  ).length
  const completedActivities = activities.filter((activity) =>
    activity.activity_status.some((status) => status.completed_count && status.completed_count > 0),
  ).length

  // Department/SAGA performance
  const departmentPerformance = departmentsSagas.map((dept) => {
    const deptActivities = activities.filter((activity) => activity.service.department_saga_id === dept.id)
    const deptOfficers = officers.filter((officer) => officer.department_saga_id === dept.id)
    const totalCount = deptActivities.reduce((sum, activity) => sum + activity.count, 0)
    const completedCount = deptActivities.reduce((sum, activity) => {
      const completed = activity.activity_status.reduce((statusSum, status) => statusSum + (status.completed_count || 0), 0)
      return sum + completed
    }, 0)

    return {
      name: dept.name.length > 20 ? dept.name.substring(0, 20) + "..." : dept.name,
      fullName: dept.name,
      type: dept.type,
      activities: deptActivities.length,
      officers: deptOfficers.length,
      totalCount,
      completedCount,
      completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    }
  })

  // County distribution
  const countyStats = officers.reduce(
    (acc, officer) => {
      const existing = acc.find((item) => item.county === officer.county)
      if (existing) {
        existing.count += 1
        existing.activities += activities.filter((activity) => activity.user_id === officer.id).length
      } else {
        acc.push({
          county: officer.county,
          count: 1,
          activities: activities.filter((activity) => activity.user_id === officer.id).length,
        })
      }
      return acc
    },
    [] as { county: string; count: number; activities: number }[],
  )

  // Activity timeline (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  })

  const activityTimeline = last30Days.map((date) => {
    const dayActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.created_at)
      return activityDate.toDateString() === date.toDateString()
    })

    return {
      date: format(date, "MMM dd"),
      activities: dayActivities.length,
      count: dayActivities.reduce((sum, activity) => sum + activity.count, 0),
    }
  })

  // Status distribution
  const statusDistribution = [
    { name: "Pending Review", value: pendingActivities, color: "#FF8042" },
    { name: "In Progress", value: inProgressActivities, color: "#FFBB28" },
    { name: "Completed", value: completedActivities, color: "#00C49F" },
  ]

  // Top performing counties
  const topCounties = countyStats.sort((a, b) => b.activities - a.activities).slice(0, 8)

  // Most active departments/SAGAs
  const mostActiveDepartments = departmentPerformance.sort((a, b) => b.activities - a.activities).slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">Across all departments & SAGAs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOfficers}</div>
            <p className="text-xs text-muted-foreground">Active system users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
            <p className="text-xs text-muted-foreground">{totalSagas} SAGAs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Activities completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline (Last 30 Days)</CardTitle>
            <CardDescription>Daily activity submissions across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="activities" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Status Distribution</CardTitle>
            <CardDescription>Current status of all activities system-wide</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department & SAGA Performance</CardTitle>
          <CardDescription>Activity volume and completion rates across all departments and SAGAs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mostActiveDepartments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name === "activities" ? "Activities" : "Officers"]}
                labelFormatter={(label) => {
                  const dept = departmentPerformance.find((d) => d.name === label)
                  return dept?.fullName || label
                }}
              />
              <Bar dataKey="activities" fill="#8884d8" name="activities" />
              <Bar dataKey="officers" fill="#82ca9d" name="officers" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Counties */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Counties</CardTitle>
            <CardDescription>Counties with highest activity submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCounties.map((county, index) => (
                <div key={county.county} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{county.county}</div>
                      <div className="text-sm text-muted-foreground">{county.count} officers</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{county.activities}</div>
                    <div className="text-sm text-muted-foreground">activities</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rates by Department/SAGA</CardTitle>
            <CardDescription>Performance efficiency across different units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance
                .sort((a, b) => b.completionRate - a.completionRate)
                .slice(0, 8)
                .map((dept) => (
                  <div key={dept.fullName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={dept.type === "Department" ? "default" : "secondary"} className="text-xs">
                          {dept.type}
                        </Badge>
                        <span className="font-medium text-sm">{dept.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{dept.completionRate}%</span>
                    </div>
                    <Progress value={dept.completionRate} className="h-2" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Summary</CardTitle>
          <CardDescription>Key metrics and insights across the OAG activity system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Performance Highlights
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• {completedActivities} activities completed successfully</p>
                <p>• {Math.round((completedActivities / totalActivities) * 100)}% overall completion rate</p>
                <p>• {topCounties[0]?.county} is the most active county</p>
                <p>• {mostActiveDepartments[0]?.fullName} leads in activity volume</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-blue-600" />
                Current Status
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• {pendingActivities} activities pending review</p>
                <p>• {inProgressActivities} activities in progress</p>
                <p>• {totalOfficers} active officers in the system</p>
                <p>• {services.length} services available across all units</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Award className="h-4 w-4 text-orange-600" />
                System Coverage
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• {totalDepartments} departments operational</p>
                <p>• {totalSagas} SAGAs integrated</p>
                <p>• {countyStats.length} counties represented</p>
                <p>• {Math.round(totalActivities / totalOfficers)} avg activities per officer</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
