"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Search, FileText, Users, TrendingUp, Calendar, ExternalLink, Building } from "lucide-react"
import { format } from "date-fns"
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

interface AgDepartmentViewProps {
  departmentSaga: DepartmentSaga
  activities: ActivityWithFullDetails[]
  officers: OfficerWithDepartment[]
  services: Service[]
}

export function AgDepartmentView({ departmentSaga, activities, officers, services }: AgDepartmentViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Statistics
  const totalActivities = activities.length
  const totalOfficers = officers.length
  const totalServices = services.length

  const pendingActivities = activities.filter((activity) => activity.activity_status.length === 0).length
  const completedActivities = activities.filter((activity) =>
    activity.activity_status.some((status) => status.completed_count && status.completed_count > 0),
  ).length

  // Officer performance
  const officerPerformance = officers.map((officer) => {
    const officerActivities = activities.filter((activity) => activity.user_id === officer.id)
    const totalCount = officerActivities.reduce((sum, activity) => sum + activity.count, 0)
    const completedCount = officerActivities.reduce((sum, activity) => {
      const completed = activity.activity_status.reduce((statusSum, status) => statusSum + (status.completed_count || 0), 0)
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

  // Service usage
  const serviceUsage = services.map((service) => {
    const serviceActivities = activities.filter((activity) => activity.service.id === service.id)
    const totalCount = serviceActivities.reduce((sum, activity) => sum + activity.count, 0)

    return {
      name: service.name.length > 40 ? service.name.substring(0, 40) + "..." : service.name,
      fullName: service.name,
      activities: serviceActivities.length,
      totalCount,
    }
  })

  // Filter activities for table
  const filteredActivities = activities.filter(
    (activity) =>
      activity.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginate activities
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (activity: ActivityWithFullDetails) => {
    if (activity.activity_status.length === 0) {
      return <Badge variant="secondary">Pending Review</Badge>
    }

    const latestStatus = activity.activity_status[0]
    if (latestStatus.completed_count && latestStatus.completed_count > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Completed ({latestStatus.completed_count})
        </Badge>
      )
    } else if (latestStatus.pending_count && latestStatus.pending_count > 0) {
      return (
        <Badge variant="outline" className="border-orange-200 text-orange-800">
          In Progress ({latestStatus.pending_count})
        </Badge>
      )
    }

    return <Badge variant="secondary">Pending Review</Badge>
  }

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">Submitted activities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOfficers}</div>
            <p className="text-xs text-muted-foreground">Active officers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">Available services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Activities completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">All Activities</TabsTrigger>
          <TabsTrigger value="officers">Officers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Service Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Service Usage Distribution</CardTitle>
                <CardDescription>Activity volume across different services in {departmentSaga.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceUsage.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, "Activities"]}
                      labelFormatter={(label) => {
                        const service = serviceUsage.find((s) => s.name === label)
                        return service?.fullName || label
                      }}
                    />
                    <Bar dataKey="activities" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest activity submissions from officers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{activity.service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          by {activity.user.full_name} • {activity.user.county} • Count: {activity.count}
                        </div>
                        {activity.description && (
                          <div className="text-sm text-muted-foreground mt-1">{activity.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(activity)}
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(activity.created_at), "MMM dd")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>All Activities</CardTitle>
              <CardDescription>Complete list of activities submitted in {departmentSaga.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Activities Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Officer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>File</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedActivities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{activity.user.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {activity.user.county} • {activity.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{activity.service.name}</div>
                              {activity.description && (
                                <div className="text-sm text-muted-foreground mt-1">{activity.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{activity.count}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(activity)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(activity.created_at), "MMM dd, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {activity.file_url ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(activity.file_url!)}
                                className="gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">No file</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredActivities.length)} of{" "}
                      {filteredActivities.length} activities
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officers">
          <Card>
            <CardHeader>
              <CardTitle>Officer Performance</CardTitle>
              <CardDescription>Performance metrics for officers in {departmentSaga.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {officerPerformance.map((officer) => (
                  <div key={officer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{officer.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {officer.county} • {officer.email}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold">{officer.totalActivities} activities</div>
                      <div className="text-sm text-muted-foreground">Total count: {officer.totalCount}</div>
                      <div className="flex items-center gap-2">
                        <Progress value={officer.completionRate} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">{officer.completionRate}% complete</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Utilization</CardTitle>
              <CardDescription>Usage statistics for services in {departmentSaga.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceUsage.map((service) => (
                  <div key={service.fullName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{service.fullName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{service.activities} activities</div>
                      <div className="text-sm text-muted-foreground">Total count: {service.totalCount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
