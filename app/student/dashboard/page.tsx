"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus, Search, FileText, Clock, CheckCircle,
  AlertCircle, LogOut, Bell, ChevronRight, LayoutDashboard,
} from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { PriorityBadge } from "@/components/priority-badge"
import { apiGetComplaints, apiLogout, currentUser, type ComplaintData, type UserData } from "@/lib/api"
import Image from "next/image"

export default function StudentDashboardPage() {
  const router = useRouter()
  const [user, setUser]           = useState<UserData | null>(null)
  const [complaints, setComplaints] = useState<ComplaintData[]>([])
  const [loading, setLoading]     = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const u = currentUser.get() as UserData | null
      if (!u) { router.push("/student/login"); return }
      setUser(u)
      const res = await apiGetComplaints()
      setComplaints(res.results)
    } catch {
      router.push("/student/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complaint_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === "all" || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total:      complaints.length,
    pending:    complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved:   complaints.filter((c) => c.status === "resolved").length,
  }

  const handleLogout = async () => {
    await apiLogout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div style={{ width: 34, height: 44, overflow: "hidden", flexShrink: 0 }}>
              <Image src="/mgit-logo.png" alt="MGIT" width={148} height={44}
                style={{ width: 148, height: 44, maxWidth: "none", mixBlendMode: "multiply" }} />
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">
              GrievanceHub<span className="text-blue-700">-MGIT</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <Bell className="h-4 w-4" />
              {stats.pending > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 border border-blue-200">
              {(user?.name || "S")[0].toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-gray-500 hover:text-gray-900">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome back, <span className="text-blue-700">{user?.name || "Student"}</span>
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {user?.roll_number && <span className="mr-2 font-mono">{user.roll_number}</span>}
              {user?.department}
            </p>
          </div>
          <Button asChild className="gap-2 bg-blue-700 hover:bg-blue-800 text-white shadow-sm">
            <Link href="/student/submit"><Plus className="h-4 w-4" /> New Complaint</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total",       value: stats.total,      icon: FileText,    color: "text-gray-600",   bg: "bg-gray-100"   },
            { label: "Pending",     value: stats.pending,    icon: AlertCircle, color: "text-amber-600",  bg: "bg-amber-50"   },
            { label: "In Progress", value: stats.inProgress, icon: Clock,       color: "text-blue-600",   bg: "bg-blue-50"    },
            { label: "Resolved",    value: stats.resolved,   icon: CheckCircle, color: "text-green-600",  bg: "bg-green-50"   },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4 shadow-sm">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <Link href="/student/submit"
            className="group flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Plus className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Submit New Complaint</p>
              <p className="text-xs text-gray-500">File a new grievance</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/student/track"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Track by ID</p>
              <p className="text-xs text-gray-500">Look up any complaint</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Complaints list */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Your Complaints</h2>
              <p className="text-xs text-gray-400">{filtered.length} complaint{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 sm:w-56" />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto px-5 py-3 border-b border-gray-100">
            {[
              { value: "all",         label: "All"         },
              { value: "pending",     label: "Pending"     },
              { value: "in-progress", label: "In Progress" },
              { value: "resolved",    label: "Resolved"    },
            ].map((f) => (
              <button key={f.value} onClick={() => setFilterStatus(f.value)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                  filterStatus === f.value
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:text-gray-900"
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900">No complaints found</p>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? "Try a different search" : "Submit your first complaint to get started"}
                </p>
                {!searchQuery && (
                  <Button asChild className="mt-4 bg-blue-700 hover:bg-blue-800 text-white" size="sm">
                    <Link href="/student/submit">Submit Complaint</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((c) => (
                  <Link key={c.complaint_id} href={`/student/track?id=${c.complaint_id}`}
                    className="group flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <code className="text-xs text-gray-400 font-mono">{c.complaint_id}</code>
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} showIcon={false} />
                        {c.is_anonymous && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">{c.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                        <span className="capitalize">{c.category}</span>
                        <span>·</span>
                        <span>{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        {c.resolved_at && c.resolution_time && (
                          <>
                            <span>·</span>
                            <span>Resolved in {c.resolution_time}h</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
