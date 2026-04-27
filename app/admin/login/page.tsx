"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Eye, EyeOff, Shield, ArrowLeft, Lock } from "lucide-react"
import { apiLogin } from "@/lib/api"

// ---------------------------------------------------------------------------
// Authorised admin accounts (frontend guard — replace with real JWT backend)
// ---------------------------------------------------------------------------
const ADMIN_ACCOUNTS = [
  { email: "admin@mgit.ac.in", password: "akshaynaidu88", name: "MGIT Admin" },
]

const MGIT_EMAIL = /^[a-zA-Z0-9._%+-]+@mgit\.ac\.in$/

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [authError, setAuthError] = useState("")

  const validate = () => {
    const e: Record<string, string> = {}
    const email = formData.email.trim()

    if (!email) {
      e.email = "Email is required"
    } else if (!MGIT_EMAIL.test(email)) {
      e.email = "Must be a valid MGIT faculty email (xxxxx@mgit.ac.in)"
    }

    if (!formData.password) e.password = "Password is required"

    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setAuthError("")
    if (!validate()) return

    // Step 1 — frontend guard: only the one authorised account
    const allowed = ADMIN_ACCOUNTS.find(
      (a) => a.email === formData.email.trim() && a.password === formData.password
    )
    if (!allowed) {
      setAuthError("Invalid credentials. Access is restricted to authorised faculty only.")
      return
    }

    // Step 2 — get a real JWT from the backend
    try {
      const res = await apiLogin({ email_or_roll: formData.email.trim(), password: formData.password })
      if (res.user.role !== "admin") {
        setAuthError("This account does not have admin privileges.")
        return
      }
      router.push("/admin/dashboard")
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Login failed. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between border-r border-gray-200 bg-white p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div style={{ width: 34, height: 44, overflow: "hidden", flexShrink: 0 }}>
            <Image src="/mgit-logo.png" alt="MGIT" width={148} height={44}
              style={{ width: 148, height: 44, maxWidth: "none", mixBlendMode: "multiply" }} />
          </div>
          <span className="font-bold text-gray-900">GrievanceHub<span className="text-blue-700">-MGIT</span></span>
        </Link>

        <div>
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
            <Shield className="h-8 w-8 text-blue-700" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Restricted access for authorized MGIT faculty and administrators. Manage student grievances efficiently and ensure timely resolution.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "View and manage all grievances",
              "Assign to relevant departments",
              "Track resolution progress",
              "Maintain communication records",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Access notice */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-xs font-semibold text-amber-700">Restricted Access</p>
              <p className="mt-0.5 text-xs text-amber-600">
                Admin accounts are created only by the system administrator. Contact IT support if you need access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                <Shield className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin / Faculty Login</h1>
                <p className="text-xs text-gray-500">Authorised personnel only</p>
              </div>
            </div>

            {/* Global auth error */}
            {authError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Faculty Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="xxxxx@mgit.ac.in"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setAuthError("") }}
                  className={errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}
                />
                {errors.email
                  ? <p className="text-xs text-red-500">{errors.email}</p>
                  : <p className="text-xs text-gray-400">Must be your official @mgit.ac.in address</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setAuthError("") }}
                    className={`pr-10 ${errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <Button type="submit" className="h-10 w-full bg-blue-700 text-sm font-semibold hover:bg-blue-800 text-white">
                Sign In to Admin Panel
              </Button>
            </form>

            {/* No register link — intentional */}
            <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-center">
              <p className="text-xs text-gray-500">
                Don&apos;t have an account?{" "}
                <span className="font-medium text-gray-700">Contact your system administrator</span>
                {" "}to get access provisioned.
              </p>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Student?{" "}
              <Link href="/student/login" className="text-blue-600 hover:underline">Go to Student Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
