"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MessageSquare,
  ArrowLeft,
  Search,
  Clock,
  User,
  Building,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react"
import { useComplaints } from "@/lib/complaint-context"
import { StatusBadge } from "@/components/status-badge"

export default function TrackComplaintPage() {
  const searchParams = useSearchParams()
  const { getComplaintById } = useComplaints()
  const [searchId, setSearchId] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const complaint = hasSearched ? getComplaintById(searchId.toUpperCase()) : null

  useEffect(() => {
    const idFromUrl = searchParams.get("id")
    if (idFromUrl) {
      setSearchId(idFromUrl)
      setHasSearched(true)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchId.trim()) {
      setHasSearched(true)
    }
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
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <Link
              href="/student/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <CardTitle className="text-2xl font-bold text-foreground">Track Complaint</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your complaint ID to view its current status and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="mb-8 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter Complaint ID (e.g., GH-M1A2B3-XY4Z)"
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value)
                    setHasSearched(false)
                  }}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {hasSearched && !complaint && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 py-12 text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-status-pending" />
                <h3 className="text-lg font-semibold text-foreground">Complaint Not Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No complaint found with ID: <code className="font-mono">{searchId}</code>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please check the ID and try again
                </p>
              </div>
            )}

            {complaint && (
              <div className="space-y-6">
                {/* Status Header */}
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/30 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Complaint ID</p>
                    <p className="font-mono text-lg font-bold text-foreground">{complaint.id}</p>
                  </div>
                  <StatusBadge status={complaint.status} className="w-fit text-sm" />
                </div>

                {/* Complaint Details */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Title</Label>
                    <p className="mt-1 text-lg font-semibold text-foreground">{complaint.title}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                      <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium capitalize text-foreground">
                          {complaint.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                      <Building className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned Department</p>
                        <p className="font-medium text-foreground">
                          {complaint.assignedDepartment || "Not yet assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                      <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted On</p>
                        <p className="font-medium text-foreground">
                          {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                      <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="font-medium text-foreground">
                          {new Date(complaint.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1 rounded-lg border border-border bg-secondary/30 p-4 text-foreground">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                    <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted By</p>
                      <p className="font-medium text-foreground">
                        {complaint.studentName} ({complaint.studentRollNo})
                      </p>
                      <p className="text-sm text-muted-foreground">{complaint.department}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="mb-4 font-semibold text-foreground">Status Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-resolved text-primary-foreground">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="h-full w-px bg-border" />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-foreground">Complaint Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {(complaint.status === "in-progress" || complaint.status === "resolved") && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-in-progress text-primary-foreground">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="h-full w-px bg-border" />
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-foreground">Under Review</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned to {complaint.assignedDepartment || "Administration"}
                          </p>
                        </div>
                      </div>
                    )}

                    {complaint.status === "resolved" && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-resolved text-primary-foreground">
                            <FileText className="h-4 w-4" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Resolved</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(complaint.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {complaint.status === "pending" && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground bg-secondary">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Awaiting Review</p>
                          <p className="text-sm text-muted-foreground">
                            Your complaint is in the queue
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/student/dashboard">Back to Dashboard</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/student/submit">Submit Another</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
