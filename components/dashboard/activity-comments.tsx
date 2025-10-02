"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Send, Edit2, Trash2, Reply } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import type { Comment, User } from "@/lib/supabase/types"

interface ActivityCommentsProps {
  activityId: number
  currentUserId: string
}

export function ActivityComments({ activityId, currentUserId }: ActivityCommentsProps) {
  const [comments, setComments] = useState<(Comment & { user: User; replies: (Comment & { user: User })[] })[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchComments()

    // Set up real-time subscription
    const channel = supabase
      .channel(`comments:${activityId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `activity_id=eq.${activityId}`,
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activityId])

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        user:users(*),
        replies:comments(
          *,
          user:users(*)
        )
      `)
      .eq("activity_id", activityId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching comments:", error)
      return
    }

    if (data) {
      setComments(data as any)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setLoading(true)
    const { error } = await supabase.from("comments").insert({
      activity_id: activityId,
      user_id: currentUserId,
      content: newComment.trim(),
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } else {
      setNewComment("")
      await fetchComments()
    }
    setLoading(false)
  }

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) return

    setLoading(true)
    const { error } = await supabase.from("comments").insert({
      activity_id: activityId,
      user_id: currentUserId,
      content: replyContent.trim(),
      parent_comment_id: parentId,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    } else {
      setReplyContent("")
      setReplyingTo(null)
      await fetchComments()
    }
    setLoading(false)
  }

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return

    setLoading(true)
    const { error } = await supabase
      .from("comments")
      .update({
        content: editContent.trim(),
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      })
    } else {
      setEditingComment(null)
      setEditContent("")
      await fetchComments()
    }
    setLoading(false)
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    setLoading(true)
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    } else {
      await fetchComments()
    }
    setLoading(false)
  }

  const renderComment = (comment: Comment & { user: User }, isReply = false) => (
    <div key={comment.id} className={`flex gap-3 ${isReply ? "ml-12" : ""}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {comment.user?.full_name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.user?.full_name}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), "MMM d, h:mm a")}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
            {comment.user_id === currentUserId && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setEditingComment(comment.id)
                    setEditContent(comment.content)
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {editingComment === comment.id ? (
            <div className="space-y-2 mt-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUpdateComment(comment.id)}
                  disabled={loading}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingComment(null)
                    setEditContent("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{comment.content}</p>
          )}
        </div>
        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 text-xs"
            onClick={() => {
              setReplyingTo(comment.id)
              setReplyContent("")
            }}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}
        {replyingTo === comment.id && (
          <div className="mt-2 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={loading}
              >
                <Send className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-semibold">Comments ({comments.length})</h3>
          </div>

          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={loading || !newComment.trim()}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>

          <div className="space-y-4 mt-6">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  {renderComment(comment)}
                  {comment.replies?.map((reply) => renderComment(reply, true))}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}