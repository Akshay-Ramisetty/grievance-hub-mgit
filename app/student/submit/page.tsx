"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MessageSquare, ArrowLeft, Upload, CheckCircle, Copy, FileText } from "lucide-react"
import { useComplaints, type ComplaintCategory } from "@/lib/complaint-context"

const categories: { value: ComplaintCategory; label: string }[] = [
  { value: "academics", label: "Academics" },
  { value: "facilities", label: "Facilities" },
  { value: "administration", label: "Administration" },
  { value: "other", label: "Other" },
]

export default function SubmitComplaintPage() {
  const router = useRouter()
  const { addComplaint, currentStudent } = useComplaints()
  const [showSuccess, setShowSuccess] = useState(false)
  const [complaintId, setComplaintId] = useState("")
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "" as ComplaintCategory | "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Complaint title is required"
    }
    if (!formData.category) {
      newErrors.category = "Category is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const id = addComplaint({
        title: formData.title,
        category: formData.category as ComplaintCategory,
        description: formData.description,
        studentName: currentStudent?.fullName || "Demo Student",
        studentRollNo: currentStudent?.rollNumber || "20CS101",
        studentEmail: currentStudent?.email || "demo@mgit.edu",
        department: currentStudent?.department || "Computer Science",
      })
      setComplaintId(id)
      setShowSuccess(true)
    }
  }

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(complaintId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">GrievanceHub-MGIT</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <Link
              href="/student/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <CardTitle className="text-2xl font-bold text-foreground">
              Submit New Complaint
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Fill in the details below to submit your grievance. You will receive a unique
              tracking ID upon submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Complaint Title
                </Label>
                <Input
                  id="title"
                  placeholder="Brief title describing your complaint"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as ComplaintCategory })
                  }
                >
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select complaint category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of your complaint..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`min-h-32 resize-none ${errors.description ? "border-destructive" : ""}`}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.description.length} / 500 characters
                </p>
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Attachment (Optional)</Label>
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 px-6 py-8 transition-colors hover:border-primary/50 hover:bg-secondary/50">
                  <div className="text-center">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-primary">Click to upload</span> or drag and
                      drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Submit Complaint
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-resolved/10">
              <CheckCircle className="h-8 w-8 text-status-resolved" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-foreground">
              Complaint Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Your complaint has been submitted. Use the tracking ID below to monitor its status.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="mb-2 text-sm text-muted-foreground">Your Complaint ID</p>
              <div className="flex items-center justify-between gap-2">
                <code className="flex-1 font-mono text-lg font-bold text-primary">
                  {complaintId}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyId}>
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-status-resolved" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Save this ID to track your complaint status
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                asChild
                variant="outline"
                className="flex-1"
              >
                <Link href={`/student/track?id=${complaintId}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Track Complaint
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1"
              >
                <Link href="/student/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
