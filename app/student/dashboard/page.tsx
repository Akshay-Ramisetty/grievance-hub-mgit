"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Bell,
  ChevronRight,
} from "lucide-react"
import { useComplaints } from "@/lib/complaint-context"
import { StatusBadge } from "@/components/status-badge"

export default function StudentDashboardPage() {
  const router = useRouter()
  const { complaints, currentStudent } = useComplaints()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Get student's complaints (for demo, show all complaints)
  const studentComplaints = currentStudent
    ? complaints.filter((c) => c.studentEmail === currentStudent.email)
    : complaints.slice(0, 3) // Show demo complaints if no student logged in

  const filteredComplaints = studentComplaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || complaint.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: studentComplaints.length,
    pending: studentComplaints.filter((c) => c.status === "pending").length,
    inProgress: studentComplaints.filter((c) => c.status === "in-progress").length,
    resolved: studentComplaints.filter((c) => c.status === "resolved").length,
  }

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">GrievanceHub-MGIT</span>
          </Link>
          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary" />
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back, {currentStudent?.fullName || "Student"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track your complaints from your dashboard
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            asChild
            size="lg"
            className="h-auto flex-col gap-2 py-6"
          >
            <Link href="/student/submit">
              <Plus className="h-6 w-6" />
              <span className="text-lg">Submit New Complaint</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-auto flex-col gap-2 py-6"
          >
            <Link href="/student/track">
              <Search className="h-6 w-6" />
              <span className="text-lg">Track Complaint</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-auto flex-col gap-2 py-6 sm:col-span-2 lg:col-span-1"
            onClick={() => setFilterStatus("all")}
          >
            <FileText className="h-6 w-6" />
            <span className="text-lg">View All Complaints</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Complaints</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-pending/10">
                <AlertCircle className="h-6 w-6 text-status-pending" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-in-progress/10">
                <Clock className="h-6 w-6 text-status-in-progress" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-resolved/10">
                <CheckCircle className="h-6 w-6 text-status-resolved" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Section */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-foreground">Your Complaints</CardTitle>
                <CardDescription className="text-muted-foreground">
                  View and track all your submitted complaints
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:w-64"
                  />
                </div>
              </div>
            </div>
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-4">
              {[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "in-progress", label: "In Progress" },
                { value: "resolved", label: "Resolved" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filterStatus === filter.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {filteredComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">No complaints found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "You haven't submitted any complaints yet"}
                </p>
                <Button asChild className="mt-4">
                  <Link href="/student/submit">Submit Your First Complaint</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <Link
                    key={complaint.id}
                    href={`/student/track?id=${complaint.id}`}
                    className="group flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {complaint.id}
                        </span>
                        <StatusBadge status={complaint.status} />
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary">
                        {complaint.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{complaint.category}</span>
                        <span>
                          {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
