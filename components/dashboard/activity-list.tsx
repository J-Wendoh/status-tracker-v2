"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Search, Calendar, MessageCircle } from "lucide-react"
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
      status?: string
      hod_comment?: string | null
      hod_reviewed?: boolean
      hod_reviewed_at?: string | null
    }[]
  })[]
}

export function ActivityList({ activities }: ActivityListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedActivity, setSelectedActivity] = useState<ActivityListProps["activities"][0] | null>(null)
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
              <TableHead>HOD Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>File</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedActivities.map((activity) => {
              const commentCount = activity?.activity_status?.[0]?.hod_comment ? 1 : 0

              return (
                <TableRow
                  key={activity.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{activity?.service?.name || 'Unknown Service'}</div>
                      {activity?.description && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{activity.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{activity?.count || 0}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(activity)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{commentCount} {commentCount === 1 ? 'reply' : 'replies'}</span>
                    </div>
                  </TableCell>
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(activity.file_url!, `activity-${activity.id}`)
                        }}
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
              )
            })}
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

      {/* Activity Details Popup */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#BE6400] to-[#BE6400]/80 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedActivity.service?.name}</h2>
                  <p className="text-white/90 mt-1">Activity Report Details</p>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Count</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{selectedActivity.count}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedActivity)}</div>
                </div>
              </div>

              {/* Description */}
              {selectedActivity.description && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{selectedActivity.description}</p>
                </div>
              )}

              {/* Date */}
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Submitted On</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedActivity.created_at ? format(new Date(selectedActivity.created_at), "MMMM dd, yyyy 'at' HH:mm") : 'N/A'}</span>
                </div>
              </div>

              {/* HOD Comment */}
              {selectedActivity.activity_status && selectedActivity.activity_status.length > 0 && selectedActivity.activity_status[0]?.hod_comment && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">HOD Review Comment</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-700">{selectedActivity.activity_status[0].hod_comment}</p>
                        {selectedActivity.activity_status[0].hod_reviewed_at && (
                          <p className="text-sm text-blue-600 mt-2">
                            Reviewed on {format(new Date(selectedActivity.activity_status[0].hod_reviewed_at), "MMMM dd, yyyy 'at' HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File */}
              {selectedActivity.file_url && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Attached Document</p>
                  <Button
                    onClick={() => handleDownload(selectedActivity.file_url!, `activity-${selectedActivity.id}`)}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#BE6400] to-[#BE6400]/80 hover:from-[#BE6400]/90 hover:to-[#BE6400]/70"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
