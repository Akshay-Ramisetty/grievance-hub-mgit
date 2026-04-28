// Central API client — all calls go through here.
// Base URL reads from NEXT_PUBLIC_API_URL env var, falls back to localhost for development.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api"

// ── Token helpers (localStorage) ─────────────────────────────────────────────

export const token = {
  get: ()        => (typeof window !== "undefined" ? localStorage.getItem("access_token")  : null),
  getRefresh: () => (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null),
  set: (access: string, refresh: string) => {
    localStorage.setItem("access_token",  access)
    localStorage.setItem("refresh_token", refresh)
  },
  clear: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("current_user")
  },
}

export const currentUser = {
  get: () => {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("current_user")
    return raw ? JSON.parse(raw) : null
  },
  set: (user: object) => localStorage.setItem("current_user", JSON.stringify(user)),
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (auth) {
    const t = token.get()
    if (t) headers["Authorization"] = `Bearer ${t}`
  }

  const res = await fetch(`${BASE}/${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    // Surface the first readable error message
    const msg =
      body?.error ??
      body?.detail ??
      Object.values(body?.errors ?? {}).flat().join(" ") ??
      `Request failed (${res.status})`
    throw new Error(msg as string)
  }

  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface UserData {
  id: string
  name: string
  roll_number: string | null
  email: string
  department: string | null
  role: "student" | "admin"
  created_at: string
}

export async function apiRegister(data: {
  name: string
  roll_number: string
  email: string
  branch: string
  year: string
  department: string
  password: string
  confirm_password: string
}): Promise<{ user: UserData; access: string; refresh: string }> {
  const res = await request<{ user: UserData; access: string; refresh: string }>(
    "register", { method: "POST", body: JSON.stringify(data) }, false,
  )
  token.set(res.access, res.refresh)
  currentUser.set(res.user)
  return res
}

export async function apiLogin(data: {
  email_or_roll: string
  password: string
}): Promise<{ user: UserData; access: string; refresh: string }> {
  const res = await request<{ user: UserData; access: string; refresh: string }>(
    "login", { method: "POST", body: JSON.stringify(data) }, false,
  )
  token.set(res.access, res.refresh)
  currentUser.set(res.user)
  return res
}

export async function apiLogout() {
  try {
    await request("logout", { method: "POST", body: JSON.stringify({ refresh: token.getRefresh() }) })
  } finally {
    token.clear()
  }
}

// ── Complaints ────────────────────────────────────────────────────────────────

export interface ComplaintData {
  complaint_id: string
  title: string
  category: string
  description: string
  status: "pending" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_department: string | null
  remarks: string | null
  attachment: string | null
  is_anonymous: boolean
  block: string | null
  floor: string | null
  room_type: string | null
  room_number: string | null
  gender: string | null
  rating: number | null
  feedback: string | null
  resolved_at: string | null
  resolution_time: number | null
  student_name: string
  student_roll_no: string
  student_email: string
  student_department: string
  activities: ActivityData[]
  created_at: string
  updated_at: string
}

export interface ActivityData {
  id: number
  action: string
  description: string
  performed_by_name: string | null
  created_at: string
}

export interface StatsData {
  total: number
  pending: number
  in_progress: number
  resolved: number
  avg_resolution_hours: number | null
  avg_rating: number | null
  by_category: Array<{ category: string; count: number }>
  by_priority: Array<{ priority: string; count: number }>
  by_department: Array<{ assigned_department: string; count: number }>
  recent_trend: Array<{ date: string; count: number }>
}

export async function apiSubmitComplaint(data: FormData | {
  title: string; category: string; description: string; priority?: string; is_anonymous?: boolean
}): Promise<{ complaint_id: string; complaint: ComplaintData }> {
  const body = data instanceof FormData ? data : JSON.stringify(data)
  return request("submit-complaint", { method: "POST", body })
}

export async function apiGetComplaints(params?: {
  status?: string; category?: string; priority?: string; department?: string; search?: string
}): Promise<{ count: number; results: ComplaintData[] }> {
  const qs = new URLSearchParams()
  if (params?.status   && params.status   !== "all") qs.set("status",   params.status)
  if (params?.category && params.category !== "all") qs.set("category", params.category)
  if (params?.priority && params.priority !== "all") qs.set("priority", params.priority)
  if (params?.department && params.department !== "all") qs.set("department", params.department)
  if (params?.search)  qs.set("search", params.search)
  const query = qs.toString() ? `?${qs}` : ""
  return request(`complaints${query}`)
}

export async function apiGetComplaint(id: string): Promise<ComplaintData> {
  return request(`complaint/${id}`)
}

export async function apiRateComplaint(id: string, rating: number, feedback?: string): Promise<{ complaint: ComplaintData }> {
  return request(`rate-complaint/${id}`, { method: "POST", body: JSON.stringify({ rating, feedback }) })
}

export async function apiUpdateStatus(id: string, status: string): Promise<{ complaint: ComplaintData }> {
  return request(`update-status/${id}`, { method: "PUT", body: JSON.stringify({ status }) })
}

export async function apiUpdatePriority(id: string, priority: string): Promise<{ complaint: ComplaintData }> {
  return request(`update-priority/${id}`, { method: "PUT", body: JSON.stringify({ priority }) })
}

export async function apiAssignDepartment(id: string, assigned_department: string): Promise<{ complaint: ComplaintData }> {
  return request(`assign-department/${id}`, { method: "PUT", body: JSON.stringify({ assigned_department }) })
}

export async function apiAddRemark(id: string, remarks: string): Promise<{ complaint: ComplaintData }> {
  return request(`add-remark/${id}`, { method: "PUT", body: JSON.stringify({ remarks }) })
}

export async function apiAdminStats(): Promise<StatsData> {
  return request("admin/stats")
}

// ── Email Verification ────────────────────────────────────────────────────────

export async function apiSendOTP(email: string): Promise<{ message: string }> {
  return request("send-otp", { method: "POST", body: JSON.stringify({ email }) }, false)
}

export async function apiVerifyOTP(email: string, otp: string): Promise<{ message: string }> {
  return request("verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }, false)
}
