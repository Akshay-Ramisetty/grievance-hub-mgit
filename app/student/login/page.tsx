"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Eye, EyeOff, ArrowLeft, GraduationCap } from "lucide-react"
import { apiLogin, currentUser } from "@/lib/api"

export default function StudentLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ emailOrRoll: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const MGIT_EMAIL = /^[a-zA-Z0-9._%+-]+@mgit\.ac\.in$/
  const ROLL_NO    = /^[a-zA-Z0-9]{10}$/

  const validate = () => {
    const e: Record<string, string> = {}
    const val = formData.emailOrRoll.trim()

    if (!val) {
      e.emailOrRoll = "Email or Roll Number is required"
    } else if (val.includes("@")) {
      // Entered as email — must be @mgit.ac.in
      if (!MGIT_EMAIL.test(val))
        e.emailOrRoll = "Must be a valid MGIT email (xxxxx@mgit.ac.in)"
    } else {
      // Entered as roll number — must be exactly 10 alphanumeric characters
      if (!ROLL_NO.test(val))
        e.emailOrRoll = "Roll number must be exactly 10 characters (e.g. 21A91A0501)"
    }

    if (!formData.password) e.password = "Password is required"
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    try {
      const res = await apiLogin({ email_or_roll: formData.emailOrRoll.trim(), password: formData.password })
      // Guard: only students can use this portal
      if (res.user.role !== "student") {
        setErrors({ form: "This portal is for students only. Use the Admin Portal." })
        return
      }
      router.push("/student/dashboard")
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Login failed. Please check your credentials." })
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
            <GraduationCap className="h-8 w-8 text-blue-700" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Student Portal</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Access your dashboard to submit grievances, track their status, and communicate with the administration.
          </p>
          <div className="mt-8 space-y-3">
            {["Submit and manage grievances", "Real-time status tracking", "Secure and confidential"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Mahatma Gandhi Institute of Technology</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Student Login</h1>
              <p className="mt-1 text-sm text-gray-500">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.form && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errors.form}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="emailOrRoll" className="text-sm font-medium text-gray-700">Email or Roll Number</Label>
                <Input
                  id="emailOrRoll"
                  placeholder="xxxxx@mgit.ac.in or 21A91A0501"
                  value={formData.emailOrRoll}
                  onChange={(e) => setFormData({ ...formData, emailOrRoll: e.target.value })}
                  className={errors.emailOrRoll ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""}
                />
                {errors.emailOrRoll && <p className="text-xs text-red-500">{errors.emailOrRoll}</p>}
                {!errors.emailOrRoll && (
                  <p className="text-xs text-gray-400">Use your @mgit.ac.in email or 10-digit roll number</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/student/register" className="font-medium text-blue-600 hover:underline">Register here</Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            Admin?{" "}
            <Link href="/admin/login" className="text-blue-600 hover:underline">Go to Admin Portal</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
