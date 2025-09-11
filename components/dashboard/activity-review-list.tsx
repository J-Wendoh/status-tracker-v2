"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Search, Calendar, Edit, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

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

interface ActivityReviewListProps {
  activities: ActivityWithDetails[]
  showActions: boolean
  onStatusUpdate: () => void
}

export function ActivityReviewList({ activities, showActions, onStatusUpdate }: ActivityReviewListProps) {
  
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithDetails | null>(null)
  const [statusForm, setStatusForm] = useState({
    pendingCount: "",
    completedCount: "",
    status: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 10

  // Filter activities based on search term with null checks
  const filteredActivities = activities.filter(
    (activity) =>
      activity?.officer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity?.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity?.officer?.county?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity?.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginate activities
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (activity: ActivityWithDetails) => {
    if (activity.activity_status.length === 0) {
      return <Badge variant="secondary">Pending Review</Badge>
    }

    const latestStatus = activity.activity_status[0]
    
    // Check for explicit status first
    if (latestStatus.status === 'approved') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          ✓ Approved ({activity.count})
        </Badge>
      )
    } else if (latestStatus.status === 'rejected') {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          ✗ Rejected
        </Badge>
      )
    } else if (latestStatus.status === 'in_progress') {
      const completed = latestStatus.completed_count || 0
      const pending = latestStatus.pending_count || 0
      return (
        <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50">
          ⏳ In Progress ({completed}/{activity.count})
        </Badge>
      )
    }

    // Fallback to legacy count-based logic
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

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'in_progress') => {
    if (!selectedActivity) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      let pendingCount = 0
      let completedCount = 0

      // Set counts based on status
      if (newStatus === 'approved') {
        completedCount = selectedActivity.count
        pendingCount = 0
      } else if (newStatus === 'rejected') {
        completedCount = 0
        pendingCount = 0
      } else if (newStatus === 'in_progress') {
        pendingCount = Number.parseInt(statusForm.pendingCount) || selectedActivity.count
        completedCount = Number.parseInt(statusForm.completedCount) || 0
        
        if (pendingCount + completedCount > selectedActivity.count) {
          alert("Total pending and completed count cannot exceed the original count")
          setIsLoading(false)
          return
        }
      }

      console.log("[STATUS-UPDATE] Attempting to update status:", {
        activityId: selectedActivity.id,
        status: newStatus,
        pendingCount,
        completedCount,
        totalCount: selectedActivity.count,
        notes: statusForm.notes
      })

      // Query database for existing status
      const { data: existingStatuses, error: fetchError } = await supabase
        .from("activity_status")
        .select("*")
        .eq("activity_id", selectedActivity.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (fetchError) {
        throw new Error(`Failed to check existing status: ${fetchError.message}`)
      }

      const existingStatus = existingStatuses?.[0]
      const statusData = {
        pending_count: pendingCount,
        completed_count: completedCount,
        status: newStatus,
        notes: statusForm.notes || null,
      }

      if (existingStatus) {
        // Update existing status
        const { error } = await supabase
          .from("activity_status")
          .update(statusData)
          .eq("id", existingStatus.id)

        if (error) throw error
      } else {
        // Create new status
        const { error } = await supabase.from("activity_status").insert({
          activity_id: selectedActivity.id,
          ...statusData
        })

        if (error) throw error
      }

      console.log("[STATUS-UPDATE] Status update successful, refreshing...")
      setSelectedActivity(null)
      setStatusForm({ pendingCount: "", completedCount: "", status: "", notes: "" })
      onStatusUpdate()
    } catch (error) {
      console.error("[STATUS-UPDATE] Error updating status:", error)
      alert(`Failed to update status: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const openStatusDialog = (activity: ActivityWithDetails) => {
    setSelectedActivity(activity)
    const existingStatus = activity.activity_status[0]
    if (existingStatus) {
      setStatusForm({
        pendingCount: (existingStatus.pending_count || 0).toString(),
        completedCount: (existingStatus.completed_count || 0).toString(),
        status: existingStatus.status || "",
        notes: existingStatus.notes || "",
      })
    } else {
      setStatusForm({ pendingCount: "", completedCount: "", status: "", notes: "" })
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    window.open(fileUrl, "_blank")
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No activities to review</h3>
          <p className="text-muted-foreground text-center">
            Activities submitted by officers in your department will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {showActions && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by officer, service, county, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

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
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{activity.officer.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.officer.county}
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
                      onClick={() => handleDownload(activity.file_url!, `activity-${activity.id}`)}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-sm">No file</span>
                  )}
                </TableCell>
                {showActions && (
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openStatusDialog(activity)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Activity Status</DialogTitle>
                          <DialogDescription>
                            Update the progress status for {activity.officer.full_name}'s activity: {activity.service.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Activity Details</Label>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                              <p><strong>Officer:</strong> {activity.officer.full_name}</p>
                              <p><strong>Service:</strong> {activity.service.name}</p>
                              <p><strong>Total Count:</strong> {activity.count}</p>
                              {activity.description && <p><strong>Description:</strong> {activity.description}</p>}
                              <p><strong>Submitted:</strong> {format(new Date(activity.created_at), "MMM dd, yyyy 'at' h:mm a")}</p>
                            </div>
                          </div>

                          <div className="grid gap-3">
                            <Label>Choose Action</Label>
                            <div className="grid gap-3">
                              {/* Approved Button */}
                              <Button
                                onClick={() => handleStatusUpdate('approved')}
                                disabled={isLoading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                size="lg"
                              >
                                {isLoading ? "Processing..." : "✓ Approve Activity"}
                                <span className="ml-2 text-xs opacity-75">({activity.count} items completed)</span>
                              </Button>

                              {/* Rejected Button */}
                              <Button
                                onClick={() => handleStatusUpdate('rejected')}
                                disabled={isLoading}
                                variant="destructive"
                                className="w-full"
                                size="lg"
                              >
                                {isLoading ? "Processing..." : "✗ Reject Activity"}
                                <span className="ml-2 text-xs opacity-75">(Mark as not completed)</span>
                              </Button>

                              {/* In Progress Button - Expandable */}
                              <div className="space-y-3">
                                <Button
                                  onClick={() => setStatusForm(prev => ({ ...prev, status: prev.status === 'in_progress' ? '' : 'in_progress' }))}
                                  disabled={isLoading}
                                  variant={statusForm.status === 'in_progress' ? 'default' : 'outline'}
                                  className="w-full"
                                  size="lg"
                                >
                                  ⏳ Mark as In Progress
                                  <span className="ml-2 text-xs opacity-75">(Partial completion)</span>
                                </Button>

                                {/* In Progress Details */}
                                {statusForm.status === 'in_progress' && (
                                  <div className="space-y-3 p-4 border rounded-md bg-blue-50/50">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="completed">Completed Count</Label>
                                        <Input
                                          id="completed"
                                          type="number"
                                          min="0"
                                          max={activity.count}
                                          value={statusForm.completedCount}
                                          onChange={(e) => setStatusForm((prev) => ({ ...prev, completedCount: e.target.value }))}
                                          placeholder="0"
                                        />
                                        <p className="text-xs text-muted-foreground">Items already completed</p>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="pending">Remaining Count</Label>
                                        <Input
                                          id="pending"
                                          type="number"
                                          min="0"
                                          max={activity.count}
                                          value={statusForm.pendingCount}
                                          onChange={(e) => setStatusForm((prev) => ({ ...prev, pendingCount: e.target.value }))}
                                          placeholder={activity.count.toString()}
                                        />
                                        <p className="text-xs text-muted-foreground">Items still in progress</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid gap-2">
                                      <Label htmlFor="notes">Progress Notes (Optional)</Label>
                                      <Textarea
                                        id="notes"
                                        value={statusForm.notes}
                                        onChange={(e) => setStatusForm((prev) => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Add notes about the current progress..."
                                        rows={2}
                                      />
                                    </div>

                                    <Button
                                      onClick={() => handleStatusUpdate('in_progress')}
                                      disabled={isLoading}
                                      className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                      {isLoading ? "Updating..." : "Update Progress Status"}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Current Status Display */}
                          {activity.activity_status?.[0] && (
                            <div className="grid gap-2">
                              <Label>Current Status</Label>
                              <div className="p-3 border rounded-md bg-muted/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={
                                    activity.activity_status[0].status === 'approved' ? 'default' :
                                    activity.activity_status[0].status === 'rejected' ? 'destructive' :
                                    activity.activity_status[0].status === 'in_progress' ? 'secondary' : 'outline'
                                  }>
                                    {activity.activity_status[0].status || 'pending'}
                                  </Badge>
                                </div>
                                {activity.activity_status[0].status === 'in_progress' && (
                                  <div className="text-sm text-muted-foreground">
                                    <p>Completed: {activity.activity_status[0].completed_count || 0}</p>
                                    <p>Remaining: {activity.activity_status[0].pending_count || 0}</p>
                                  </div>
                                )}
                                {activity.activity_status[0].notes && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    <strong>Notes:</strong> {activity.activity_status[0].notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedActivity(null)} className="w-full">
                            Cancel
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showActions && totalPages > 1 && (
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
