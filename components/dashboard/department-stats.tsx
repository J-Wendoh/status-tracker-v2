"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, FileText, TrendingUp, Award } from "lucide-react"
import type { Service, User } from "@/lib/supabase/types"

interface ActivityWithDetails {
  id: string
  officer_id: string
  service_id: string
  description: string
  count: number
  file_url?: string
  created_at: string
  officer: {
    id: string
    name: string
    id_number: string
    county: string
  }
  service: {
    id: string
    name: string
  }
  activity_status: {
    id: string
    pending_count: number
    completed_count: number
    updated_by: string
    updated_at: string
  }[]
}

interface DepartmentStatsProps {
  activities: ActivityWithDetails[]
  officers: Pick<User, "id" | "full_name" | "county">[]
  services: Service[]
  departmentName: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function DepartmentStats({ activities, officers, services, departmentName }: DepartmentStatsProps) {
  // Officer performance stats
  const officerStats = officers.map((officer) => {
    const officerActivities = activities.filter((activity) => activity.officer_id === officer.id)
    const totalCount = officerActivities.reduce((sum, activity) => sum + activity.count, 0)
    const completedCount = officerActivities.reduce((sum, activity) => {
      const completed = activity.activity_status.reduce((statusSum, status) => statusSum + status.completed_count, 0)
      return sum + completed
    }, 0)

    return {
      ...officer,
      totalActivities: officerActivities.length,
      totalCount,
      completedCount,
      completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    }
  })

  // Service performance stats
  const serviceStats = services.map((service) => {
    const serviceActivities = activities.filter((activity) => activity.service_id === service.id)
    const totalCount = serviceActivities.reduce((sum, activity) => sum + activity.count, 0)

    return {
      name: service.name.length > 30 ? service.name.substring(0, 30) + "..." : service.name,
      fullName: service.name,
      activities: serviceActivities.length,
      totalCount,
    }
  })

  // County distribution
  const countyStats = officers.reduce(
    (acc, officer) => {
      const existing = acc.find((item) => item.county === officer.county)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ county: officer.county, count: 1 })
      }
      return acc
    },
    [] as { county: string; count: number }[],
  )

  // Status distribution
  const statusStats = [
    {
      name: "Pending Review",
      value: activities.filter((activity) => activity.activity_status.length === 0).length,
    },
    {
      name: "In Progress",
      value: activities.filter((activity) =>
        activity.activity_status.some((status) => status.pending_count > 0 && status.completed_count === 0),
      ).length,
    },
    {
      name: "Completed",
      value: activities.filter((activity) => activity.activity_status.some((status) => status.completed_count > 0))
        .length,
    },
  ]

  // Top performers
  const topPerformers = officerStats.sort((a, b) => b.totalCount - a.totalCount).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officers.length}</div>
            <p className="text-xs text-muted-foreground">Active officers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">Available services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Activities/Officer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {officers.length > 0 ? Math.round(activities.length / officers.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per officer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Counties Covered</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countyStats.length}</div>
            <p className="text-xs text-muted-foreground">Different counties</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Service Activity Distribution</CardTitle>
            <CardDescription>Number of activities per service</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, "Activities"]}
                  labelFormatter={(label) => {
                    const service = serviceStats.find((s) => s.name === label)
                    return service?.fullName || label
                  }}
                />
                <Bar dataKey="activities" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Status Distribution</CardTitle>
            <CardDescription>Current status of all activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Officers</CardTitle>
          <CardDescription>Officers with highest activity counts in {departmentName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((officer, index) => (
              <div key={officer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{officer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {officer.county} • ID: {officer.id_number}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{officer.totalCount} total count</div>
                  <div className="text-sm text-muted-foreground">{officer.totalActivities} activities</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={officer.completionRate} className="w-20 h-2" />
                    <span className="text-xs text-muted-foreground">{officer.completionRate}% complete</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* County Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Officer Distribution by County</CardTitle>
          <CardDescription>Geographic distribution of officers in {departmentName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countyStats.map((county) => (
              <div key={county.county} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{county.county}</span>
                <Badge variant="secondary">{county.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
