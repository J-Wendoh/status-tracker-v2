"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Search, Calendar } from "lucide-react"
import { format } from "date-fns"
import type { Activity } from "@/lib/supabase/types"

interface ActivityListProps {
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

export function ActivityList({ activities }: ActivityListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter activities based on search term
  const filteredActivities = activities?.filter(
    (activity) =>
      activity?.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity?.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  ) || []

  // Paginate activities
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (activity: ActivityListProps["activities"][0]) => {
    if (!activity?.activity_status || activity.activity_status.length === 0) {
      return <Badge variant="secondary">Pending Review</Badge>
    }

    const latestStatus = activity.activity_status[0]
    if (latestStatus?.completed_count > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      )
    } else if (latestStatus?.pending_count > 0) {
      return (
        <Badge variant="outline" className="border-orange-200 text-orange-800">
          In Progress
        </Badge>
      )
    }

    return <Badge variant="secondary">Pending Review</Badge>
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No activities logged yet</h3>
          <p className="text-muted-foreground text-center">
            Start by logging your first activity using the "Log Activity" tab.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
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
                    <div className="font-medium">{activity?.service?.name || 'Unknown Service'}</div>
                    {activity?.description && (
                      <div className="text-sm text-muted-foreground mt-1">{activity.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{activity?.count || 0}</span>
                </TableCell>
                <TableCell>{getStatusBadge(activity)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {activity?.created_at ? format(new Date(activity.created_at), "MMM dd, yyyy") : 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  {activity.file_url ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(activity.file_url!, `activity-${activity.id}`)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
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
  )
}
