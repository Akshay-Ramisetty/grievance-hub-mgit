"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, FileText, Clock, CheckCircle, AlertCircle, Bell, Menu, X, Eye, TrendingUp, RefreshCw } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { StatusBadge } from "@/components/status-badge"
import { PriorityBadge } from "@/components/priority-badge"
import {
  apiGetComplaints, apiUpdateStatus, apiUpdatePriority, apiAssignDepartment, apiAddRemark, apiAdminStats,
  type ComplaintData, type StatsData,
} from "@/lib/api"
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const departments = [
  "Academic Affairs", "Student Services", "Facilities Management",
  "IT Department", "Hostel Administration", "Library", "Maintenance", "Administration",
]

export default function AdminDashboardPage() {
  const [complaints, setComplaints]   = useState<ComplaintData[]>([])
  const [stats, setStats]             = useState<StatsData>({ 
    total: 0, pending: 0, in_progress: 0, resolved: 0,
    avg_resolution_hours: null, avg_rating: null,
    by_category: [], by_priority: [], by_department: [], recent_trend: []
  })
  const [loading, setLoading]         = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus]     = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selected, setSelected]       = useState<ComplaintData | null>(null)
  const [showDetail, setShowDetail]   = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [remark, setRemark]           = useState("")
  const [saving, setSaving]           = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [cRes, sRes] = await Promise.all([
        apiGetComplaints({ status: filterStatus, category: filterCategory, priority: filterPriority, search: searchQuery }),
        apiAdminStats(),
      ])
      setComplaints(cRes.results)
      setStats(sRes)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterCategory, filterPriority, searchQuery])

  useEffect(() => { load() }, [load])

  const resolutionRate = stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const openDetail = (c: ComplaintData) => {
    setSelected(c); setRemark(c.remarks ?? ""); setShowDetail(true)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      if (remark && remark !== selected.remarks) {
        const r = await apiAddRemark(selected.complaint_id, remark)
        setSelected(r.complaint)
      }
      await load()
      setShowDetail(false)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    await apiUpdateStatus(id, status)
    setComplaints((prev) => prev.map((c) => c.complaint_id === id ? { ...c, status: status as ComplaintData["status"] } : c))
    if (selected?.complaint_id === id) setSelected((s) => s ? { ...s, status: status as ComplaintData["status"] } : s)
  }

  const handleDeptChange = async (id: string, dept: string) => {
    await apiAssignDepartment(id, dept)
    setComplaints((prev) => prev.map((c) => c.complaint_id === id ? { ...c, assigned_department: dept } : c))
    if (selected?.complaint_id === id) setSelected((s) => s ? { ...s, assigned_department: dept } : s)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-200`}>
        <AdminSidebar />
      </div>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden">
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Manage all student grievances</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <Bell className="h-4 w-4" />
                {stats.pending > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {stats.pending}
                  </span>
                )}
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 border border-blue-200">A</div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Stats */}
          <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total",       value: stats.total,       icon: FileText,    color: "text-gray-600",  bg: "bg-gray-100",  sub: "All complaints"  },
              { label: "Pending",     value: stats.pending,     icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50",  sub: "Awaiting review" },
              { label: "In Progress", value: stats.in_progress, icon: Clock,       color: "text-blue-600",  bg: "bg-blue-50",   sub: "Being handled"   },
              { label: "Resolved",    value: stats.resolved,    icon: CheckCircle, color: "text-green-600", bg: "bg-green-50",  sub: "Completed"       },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-400">{s.label}</p>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Resolution rate */}
          <div className="mb-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">Resolution Rate</p>
                </div>
                <span className="text-2xl font-bold text-gray-900">{resolutionRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${resolutionRate}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-400">{stats.resolved} of {stats.total} resolved</p>
            </div>

            {stats.avg_resolution_hours !== null && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">Avg Resolution Time</p>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.avg_resolution_hours}h</p>
                <p className="mt-1 text-xs text-gray-400">Average time to resolve</p>
              </div>
            )}

            {stats.avg_rating !== null && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">Avg Rating</p>
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.avg_rating}/5</p>
                <p className="mt-1 text-xs text-gray-400">Student satisfaction</p>
              </div>
            )}
          </div>

          {/* Analytics Charts */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="mb-4 gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {showAnalytics ? "Hide" : "Show"} Analytics
            </Button>

            {showAnalytics && (
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Category Chart */}
                {stats.by_category.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-semibold text-gray-900">Complaints by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.by_category}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Priority Chart */}
                {stats.by_priority.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-semibold text-gray-900">Complaints by Priority</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={stats.by_priority}
                          dataKey="count"
                          nameKey="priority"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `${entry.priority}: ${entry.count}`}
                        >
                          {stats.by_priority.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Trend Chart */}
                {stats.recent_trend.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <h3 className="mb-4 font-semibold text-gray-900">30-Day Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={stats.recent_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Complaints" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900">All Complaints</h2>
                  <p className="text-xs text-gray-400">{complaints.length} result{complaints.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search by ID, title, or student..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9 text-sm" />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9 w-full sm:w-36 text-sm border-gray-300 bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-9 w-full sm:w-36 text-sm border-gray-300 bg-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academics">Academics</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="h-9 w-full sm:w-36 text-sm border-gray-300 bg-white">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    {["Complaint ID", "Student", "Title", "Category", "Priority", "Status", "Department", ""].map((h) => (
                      <TableHead key={h} className="text-xs font-semibold text-gray-400">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-sm text-gray-400">Loading…</TableCell>
                    </TableRow>
                  ) : complaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-sm text-gray-400">No complaints found</TableCell>
                    </TableRow>
                  ) : (
                    complaints.map((c) => (
                      <TableRow key={c.complaint_id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                        <TableCell className="font-mono text-xs text-gray-400">{c.complaint_id}</TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-gray-900">{c.is_anonymous ? "Anonymous" : c.student_name}</p>
                          <p className="text-xs text-gray-400">{c.is_anonymous ? "Hidden" : c.student_roll_no}</p>
                        </TableCell>
                        <TableCell className="max-w-[180px]">
                          <p className="truncate text-sm text-gray-900">{c.title}</p>
                        </TableCell>
                        <TableCell>
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">{c.category}</span>
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={c.priority} showIcon={false} />
                        </TableCell>
                        <TableCell>
                          <Select value={c.status} onValueChange={(v) => handleStatusChange(c.complaint_id, v)}>
                            <SelectTrigger className="h-7 w-32 border-none bg-transparent p-0 shadow-none text-xs">
                              <StatusBadge status={c.status} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={c.assigned_department ?? ""} onValueChange={(v) => handleDeptChange(c.complaint_id, v)}>
                            <SelectTrigger className="h-7 w-36 border-gray-200 bg-white text-xs">
                              <SelectValue placeholder="Assign…" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((d) => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(c)}
                            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-700">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-200 bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Complaint Details</DialogTitle>
            <DialogDescription className="text-gray-500">View and manage this complaint</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 py-2">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div>
                  <p className="text-xs text-gray-400">Complaint ID</p>
                  <code className="font-mono text-base font-bold text-gray-900">{selected.complaint_id}</code>
                </div>
                <StatusBadge status={selected.status} className="text-sm" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Student Name", value: selected.student_name       },
                  { label: "Roll Number",  value: selected.student_roll_no    },
                  { label: "Email",        value: selected.student_email      },
                  { label: "Department",   value: selected.student_department },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Title</p>
                  <p className="text-sm font-semibold text-gray-900">{selected.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Category</p>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">{selected.category}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 leading-relaxed">{selected.description}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500">Update Status</Label>
                  <Select value={selected.status} onValueChange={(v) => handleStatusChange(selected.complaint_id, v)}>
                    <SelectTrigger className="h-9 border-gray-300 bg-white text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500">Update Priority</Label>
                  <Select value={selected.priority} onValueChange={async (v) => {
                    await apiUpdatePriority(selected.complaint_id, v)
                    setSelected({ ...selected, priority: v as ComplaintData["priority"] })
                    await load()
                  }}>
                    <SelectTrigger className="h-9 border-gray-300 bg-white text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500">Assign Department</Label>
                  <Select value={selected.assigned_department ?? ""} onValueChange={(v) => handleDeptChange(selected.complaint_id, v)}>
                    <SelectTrigger className="h-9 border-gray-300 bg-white text-sm"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-500">Remark / Comment</Label>
                <Textarea placeholder="Add a remark or comment for the student…"
                  value={remark} onChange={(e) => setRemark(e.target.value)}
                  className="min-h-24 resize-none border-gray-300 bg-white text-sm" />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
            <Button disabled={saving} onClick={handleSave} className="bg-blue-700 hover:bg-blue-800 text-white">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
