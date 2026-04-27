"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { Eye, EyeOff, ArrowLeft, UserPlus, Mail, CheckCircle2 } from "lucide-react"
import { apiRegister, apiSendOTP, apiVerifyOTP } from "@/lib/api"

const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Information Technology"]

export default function StudentRegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState<"email" | "otp" | "details">("email")
  const [formData, setFormData] = useState({ 
    fullName: "", 
    rollNumber: "", 
    email: "", 
    department: "", 
    password: "", 
    confirmPassword: "",
    otp: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const set = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }))

  const MGIT_EMAIL = /^[a-zA-Z0-9._%+-]+@mgit\.ac\.in$/
  const ROLL_NO    = /^[a-zA-Z0-9]{10}$/

  const handleSendOTP = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e: Record<string, string> = {}
    
    if (!formData.email.trim())
      e.email = "Email is required"
    else if (!MGIT_EMAIL.test(formData.email.trim()))
      e.email = "Must be a valid MGIT email (xxxxx@mgit.ac.in)"
    
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      await apiSendOTP(formData.email.trim())
      setOtpSent(true)
      setStep("otp")
      setErrors({})
    } catch (err: unknown) {
      setErrors({ email: err instanceof Error ? err.message : "Failed to send OTP" })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e: Record<string, string> = {}
    
    if (!formData.otp.trim())
      e.otp = "OTP is required"
    else if (formData.otp.trim().length !== 6)
      e.otp = "OTP must be 6 digits"
    
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      await apiVerifyOTP(formData.email.trim(), formData.otp.trim())
      setStep("details")
      setErrors({})
    } catch (err: unknown) {
      setErrors({ otp: err instanceof Error ? err.message : "Invalid OTP" })
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.fullName.trim()) e.fullName = "Full name is required"

    if (!formData.rollNumber.trim())
      e.rollNumber = "Roll number is required"
    else if (!ROLL_NO.test(formData.rollNumber.trim()))
      e.rollNumber = "Roll number must be exactly 10 characters (e.g. 21A91A0501)"

    if (!formData.department) e.department = "Department is required"
    if (!formData.password) e.password = "Password is required"
    else if (formData.password.length < 6) e.password = "Minimum 6 characters"
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match"
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    
    setLoading(true)
    try {
      await apiRegister({
        name: formData.fullName,
        roll_number: formData.rollNumber,
        email: formData.email,
        department: formData.department,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      })
      router.push("/student/dashboard")
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Registration failed. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const errCls = (k: string) => errors[k] ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""

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
            <UserPlus className="h-8 w-8 text-blue-700" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Student Registration</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Welcome to the MGIT Grievance Management System. This platform enables students to submit and track grievances efficiently.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <CheckCircle2 className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Secure & Confidential</p>
                <p className="text-sm text-gray-500">Your information is protected and handled with care</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <CheckCircle2 className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Track Your Grievances</p>
                <p className="text-sm text-gray-500">Monitor the status and progress in real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <CheckCircle2 className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Quick Resolution</p>
                <p className="text-sm text-gray-500">Grievances are assigned to relevant departments promptly</p>
              </div>
            </div>
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
            {/* Step indicator */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${step === "email" ? "bg-blue-700 text-white" : "bg-green-100 text-green-700"}`}>
                {step === "email" ? "1" : <CheckCircle2 className="h-4 w-4" />}
              </div>
              <div className={`h-0.5 w-12 ${step === "otp" || step === "details" ? "bg-blue-700" : "bg-gray-200"}`} />
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${step === "otp" ? "bg-blue-700 text-white" : step === "details" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                {step === "details" ? <CheckCircle2 className="h-4 w-4" /> : "2"}
              </div>
              <div className={`h-0.5 w-12 ${step === "details" ? "bg-blue-700" : "bg-gray-200"}`} />
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${step === "details" ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-500"}`}>
                3
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {step === "email" && "Verify Your Email"}
                {step === "otp" && "Enter OTP"}
                {step === "details" && "Complete Registration"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {step === "email" && "We'll send a verification code to your email"}
                {step === "otp" && "Check your email for the 6-digit code"}
                {step === "details" && "Fill in your details to create account"}
              </p>
            </div>

            {/* Step 1: Email */}
            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {errors.form && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errors.form}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">College Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input 
                      type="email" 
                      placeholder="xxxxx@mgit.ac.in" 
                      value={formData.email}
                      onChange={(e) => set("email", e.target.value)} 
                      className={`pl-10 ${errCls("email")}`}
                      disabled={loading}
                    />
                  </div>
                  {errors.email
                    ? <p className="text-xs text-red-500">{errors.email}</p>
                    : <p className="text-xs text-gray-400">Must be your official @mgit.ac.in address</p>}
                </div>

                <Button type="submit" disabled={loading} className="h-10 w-full bg-blue-700 text-sm font-semibold hover:bg-blue-800 text-white">
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {otpSent && !errors.otp && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                    OTP sent to {formData.email}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Enter 6-Digit OTP</Label>
                  <Input 
                    type="text" 
                    placeholder="000000" 
                    value={formData.otp}
                    onChange={(e) => set("otp", e.target.value.replace(/\D/g, "").slice(0, 6))} 
                    className={`text-center text-lg tracking-widest ${errCls("otp")}`}
                    maxLength={6}
                    disabled={loading}
                  />
                  {errors.otp && <p className="text-xs text-red-500">{errors.otp}</p>}
                </div>

                <Button type="submit" disabled={loading} className="h-10 w-full bg-blue-700 text-sm font-semibold hover:bg-blue-800 text-white">
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtpSent(false); set("otp", "") }}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-900"
                >
                  Change email address
                </button>
              </form>
            )}

            {/* Step 3: Details */}
            {step === "details" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errors.form}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input placeholder="Enter your full name" value={formData.fullName}
                    onChange={(e) => set("fullName", e.target.value)} className={errCls("fullName")} disabled={loading} />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Roll Number</Label>
                  <Input placeholder="e.g. 21A91A0501 (10 characters)" value={formData.rollNumber}
                    onChange={(e) => set("rollNumber", e.target.value)} className={errCls("rollNumber")} disabled={loading} />
                  {errors.rollNumber
                    ? <p className="text-xs text-red-500">{errors.rollNumber}</p>
                    : <p className="text-xs text-gray-400">Exactly 10 alphanumeric characters</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <Select value={formData.department} onValueChange={(v) => set("department", v)} disabled={loading}>
                    <SelectTrigger className={`h-10 border-gray-300 bg-white text-gray-900 shadow-sm ${errors.department ? "border-red-400" : ""}`}>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="Create a password"
                      value={formData.password} onChange={(e) => set("password", e.target.value)}
                      className={`pr-10 ${errCls("password")}`} disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} placeholder="Confirm your password"
                      value={formData.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)}
                      className={`pr-10 ${errCls("confirmPassword")}`} disabled={loading} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" disabled={loading} className="h-10 w-full bg-blue-700 text-sm font-semibold hover:bg-blue-800 text-white">
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/student/login" className="font-medium text-blue-600 hover:underline">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
