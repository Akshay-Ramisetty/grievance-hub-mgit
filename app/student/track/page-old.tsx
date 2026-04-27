"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, Clock, User, Building, Calendar, FileText, AlertCircle, CheckCircle, MessageSquare } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { PriorityBadge } from "@/components/priority-badge"
import { StarRating } from "@/components/star-rating"
import { apiGetComplaint, apiRateComplaint, currentUser, type ComplaintData } from "@/lib/api"
import Image from "next/image"

function TrackComplaintContent() {
  const searchParams = useSearchParams()
  const [searchId, setSearchId]       = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [complaint, setComplaint]     = useState<ComplaintData | null>(null)
  const [notFound, setNotFound]       = useState(false)
  const [showRating, setShowRating]   = useState(false)
  const [rating, setRating]           = useState(0)
  const [feedback, setFeedback]       = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)

  const doSearch = async (id: string) => {
    if (!id.trim()) return
    setLoading(true); setNotFound(false); setComplaint(null)
    try {
      const data = await apiGetComplaint(id.trim().toUpperCase())
      setComplaint(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false); setHasSearched(true)
    }
  }

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) { setSearchId(id); doSearch(id) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSearch = (ev: React.FormEvent) => { ev.preventDefault(); doSearch(searchId) }

  const handleRatingSubmit = async () => {
    if (!complaint || rating === 0) return
    setSubmittingRating(true)
    try {
      await apiRateComplaint(complaint.complaint_id, rating, feedback)
      // Reload complaint to show rating
      const updated = await apiGetComplaint(complaint.complaint_id)
      setComplaint(updated)
      setShowRating(false)
      setRating(0)
      setFeedback("")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit rating")
    } finally {
      setSubmittingRating(false)
    }
  }

  const user = currentUser.get()
  const canRate = complaint && 
                  complaint.status === "resolved" && 
                  !complaint.rating && 
                  user && 
                  complaint.student_email === user.email

  const timelineSteps = complaint ? [
    { done: true,
      label: "Complaint Submitted",
      sub: new Date(complaint.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      icon: FileText },
    { done: complaint.status === "in-progress" || complaint.status === "resolved",
      label: "Under Review",
      sub: complaint.assigned_department ? `Assigned to ${complaint.assigned_department}` : "Awaiting assignment",
      icon: Clock },
    { done: complaint.status === "resolved",
      label: "Resolved",
      sub: complaint.status === "resolved"
        ? new Date(complaint.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "Pending resolution",
      icon: CheckCircle },
  ] : []

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/student/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Track Complaint</h1>
        <p className="mt-1 text-sm text-gray-500">Enter your complaint ID to view its current status</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Enter Complaint ID (e.g. GH-ABC123-XY4Z)"
            value={searchId}
            onChange={(e) => { setSearchId(e.target.value); setHasSearched(false) }}
            className="h-11 pl-10" />
        </div>
        <Button type="submit" disabled={loading} className="h-11 px-6 bg-blue-700 hover:bg-blue-800 text-white">
          {loading ? "…" : "Search"}
        </Button>
      </form>

      {hasSearched && notFound && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50">
            <AlertCircle className="h-6 w-6 text-amber-500" />
          </div>
          <p className="font-semibold text-gray-900">Complaint Not Found</p>
          <p className="mt-1 text-sm text-gray-500">
            No complaint found with ID: <code className="font-mono text-gray-700">{searchId}</code>
          </p>
        </div>
      )}

      {complaint && (
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Complaint ID</p>
              <code className="font-mono text-xl font-bold text-gray-900">{complaint.complaint_id}</code>
            </div>
            <StatusBadge status={complaint.status} className="text-sm w-fit" />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">{complaint.title}</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: FileText,  label: "Category",            value: complaint.category,                    cap: true  },
                { icon: Building,  label: "Assigned Department",  value: complaint.assigned_department ?? "Not yet assigned", cap: false },
                { icon: Calendar,  label: "Submitted On",         value: new Date(complaint.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), cap: false },
                { icon: Clock,     label: "Last Updated",         value: new Date(complaint.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), cap: false },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className={`mt-0.5 text-sm font-medium text-gray-900 ${item.cap ? "capitalize" : ""}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">Description</p>
              <p className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>

            {complaint.remarks && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Admin Remarks</p>
                <p className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 leading-relaxed">{complaint.remarks}</p>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Submitted By</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {complaint.student_name} <span className="text-gray-400 font-normal">({complaint.student_roll_no})</span>
                </p>
                <p className="text-xs text-gray-400">{complaint.student_department}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 font-semibold text-gray-900">Status Timeline</h3>
            {timelineSteps.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    step.done ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white text-gray-400"
                  }`}>
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className={`w-px my-1 ${step.done ? "bg-blue-300" : "bg-gray-200"}`} style={{ minHeight: "2rem" }} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/student/dashboard">Dashboard</Link>
            </Button>
            <Button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white" asChild>
              <Link href="/student/submit">Submit Another</Link>
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}

export default function TrackComplaintPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div style={{ width: 34, height: 44, overflow: "hidden", flexShrink: 0 }}>
              <Image src="/mgit-logo.png" alt="MGIT" width={148} height={44}
                style={{ width: 148, height: 44, maxWidth: "none", mixBlendMode: "multiply" }} />
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">
              GrievanceHub<span className="text-blue-700">-MGIT</span>
            </span>
          </Link>
        </div>
      </header>
      <Suspense fallback={<div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>}>
        <TrackComplaintContent />
      </Suspense>
    </div>
  )
}
