"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Service } from "@/lib/supabase/types"

interface ActivityFormProps {
  services: Service[]
  userId: string
  onSuccess: () => void
}

export function ActivityForm({ services, userId, onSuccess }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    serviceId: "",
    description: "",
    count: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif",
      ]

      if (!allowedTypes.includes(file.type)) {
        setError("Please select a PDF, Word document, or image file")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("File size must be less than 10MB")
        return
      }

      setSelectedFile(file)
      setError(null)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("activity-documents").upload(fileName, file)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return null
    }

    const { data } = supabase.storage.from("activity-documents").getPublicUrl(fileName)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate form
      if (!formData.serviceId || !formData.count) {
        throw new Error("Please fill in all required fields")
      }

      const count = Number.parseInt(formData.count)
      if (isNaN(count) || count <= 0) {
        throw new Error("Count must be a positive number")
      }

      const supabase = createClient()
      let fileUrl: string | null = null

      // Upload file if selected
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile)
        if (!fileUrl) {
          throw new Error("Failed to upload file")
        }
      }

      // Insert activity
      const { error: insertError } = await supabase.from("activities").insert({
        user_id: userId,
        service_id: parseInt(formData.serviceId),
        description: formData.description || '',
        count: count,
        file_url: fileUrl,
      })

      if (insertError) throw insertError

      // Reset form
      setFormData({
        serviceId: "",
        description: "",
        count: "",
      })
      setSelectedFile(null)

      onSuccess()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="service">Service *</Label>
          <Select value={formData.serviceId} onValueChange={(value) => handleInputChange("serviceId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="count">Count *</Label>
          <Input
            id="count"
            type="number"
            min="1"
            placeholder="Enter count"
            value={formData.count}
            onChange={(e) => handleInputChange("count", e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description of the activity"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label>Supporting Document</Label>
          {!selectedFile ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  <label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                    Click to upload
                  </label>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </div>
                <p className="text-xs text-muted-foreground">PDF, Word documents, or images (max 10MB)</p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Logging Activity..." : "Log Activity"}
      </Button>
    </form>
  )
}
