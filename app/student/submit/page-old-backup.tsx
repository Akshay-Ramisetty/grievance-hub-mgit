"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Upload, CheckCircle, Copy, FileText, X } from "lucide-react"
import { apiSubmitComplaint } from "@/lib/api"
import Image from "next/image"

type Category = "academics" | "facilities" | "hostel" | "library" | "infrastructure" | "administration" | "other"
type Priority = "low" | "medium" | "high" | "urgent"

const categories: { value: Category; label: string; desc: string }[] = [
  { value: "academics",       label: "Academics",       desc: "Exams, grades, curriculum"  },
  { value: "facilities",      label: "Facilities",      desc: "Classrooms, labs, equipment" },
  { value: "hostel",          label: "Hostel",          desc: "Accommodation, mess, rooms" },
  { value: "library",         label: "Library",         desc: "Books, resources, access"   },
  { value: "infrastructure",  label: "Infrastructure",  desc: "Buildings, maintenance"     },
  { value: "administration",  label: "Administration",  desc: "Fees, documents, staff"     },
  { value: "other",           label: "Other",           desc: "Anything else"              },
]

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "low",    label: "Low",    color: "border-gray-300 bg-gray-50 text-gray-700" },
  { value: "medium", label: "Medium", color: "border-yellow-300 bg-yellow-50 text-yellow-700" },
  { value: "high",   label: "High",   color: "border-orange-300 bg-orange-50 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "border-red-300 bg-red-50 text-red-700" },
]

export default function SubmitComplaintPage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
  const [complaintId, setComplaintId] = useState("")
  const [copied, setCopied]           = useState(false)
  const [fileName, setFileName]       = useState("")
  const [fileObj, setFileObj]         = useState<File | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [formData, setFormData]       = useState({ 
    title: "", 
    category: "" as Category | "", 
    description: "",
    priority: "medium" as Priority,
    is_anonymous: false
  })
  const [errors, setErrors]           = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.title.trim())       e.title       = "Title is required"
    if (!formData.category)           e.category    = "Category is required"
    if (!formData.description.trim()) e.description = "Description is required"
    else if (formData.description.trim().length < 20) e.description = "At least 20 characters"
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      let body: FormData | { title: string; category: string; description: string; priority: string; is_anonymous: boolean }
      if (fileObj) {
        const fd = new FormData()
        fd.append("title",        formData.title)
        fd.append("category",     formData.category)
        fd.append("description",  formData.description)
        fd.append("priority",     formData.priority)
        fd.append("is_anonymous", formData.is_anonymous.toString())
        fd.append("attachment",   fileObj)
        body = fd
      } else {
        body = { 
          title: formData.title, 
          category: formData.category, 
          description: formData.description,
          priority: formData.priority,
          is_anonymous: formData.is_anonymous
        }
      }
      const res = await apiSubmitComplaint(body)
      setComplaintId(res.complaint_id)
      setShowSuccess(true)
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Submission failed. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(complaintId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href="/student/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit New Complaint</h1>
          <p className="mt-1 text-sm text-gray-500">Fill in the details below. You&apos;ll receive a unique tracking ID on submission.</p>
        </div>

        {errors.form && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Basic Info</h2>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">Complaint Title</Label>
              <Input id="title" placeholder="Brief title describing your complaint"
                value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? "border-red-400" : ""} />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button key={cat.value} type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      formData.category === cat.value
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-blue-300"
                    }`}>
                    <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-500">{cat.desc}</p>
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Priority Level</Label>
              <div className="grid grid-cols-4 gap-2">
                {priorities.map((pri) => (
                  <button key={pri.value} type="button"
                    onClick={() => setFormData({ ...formData, priority: pri.value })}
                    className={`rounded-lg border p-2 text-center text-xs font-medium transition-all ${
                      formData.priority === pri.value
                        ? pri.color + " shadow-sm"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}>
                    {pri.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">Select the urgency level of your complaint</p>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Details</h2>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea id="description" placeholder="Provide a detailed description of your complaint..."
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`min-h-36 resize-none ${errors.description ? "border-red-400" : ""}`} />
              <div className="flex items-center justify-between">
                {errors.description
                  ? <p className="text-xs text-red-500">{errors.description}</p>
                  : <p className="text-xs text-gray-400">Minimum 20 characters</p>}
                <p className="text-xs text-gray-400">{formData.description.length}/500</p>
              </div>
            </div>

            {/* File upload */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Attachment <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 transition-colors hover:border-blue-400 hover:bg-blue-50/30">
                <input type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) { setFileName(f.name); setFileObj(f) }
                  }} />
                {fileName ? (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="max-w-[200px] truncate">{fileName}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setFileName(""); setFileObj(null) }}
                      className="text-gray-400 hover:text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-7 w-7 text-gray-400" />
                    <p className="text-sm text-gray-500"><span className="text-blue-600 font-medium">Click to upload</span> or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG up to 10 MB</p>
                  </>
                )}
              </label>
            </div>

            {/* Anonymous option */}
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="anonymous" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Submit Anonymously
                </Label>
                <p className="mt-0.5 text-xs text-gray-500">
                  Your identity will not be revealed to anyone. Use this for sensitive issues.
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" disabled={submitting}
            className="w-full h-12 bg-blue-700 text-base font-semibold hover:bg-blue-800 text-white shadow-sm disabled:opacity-60">
            {submitting ? "Submitting…" : "Submit Complaint"}
          </Button>
        </form>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="border-gray-200 bg-white sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 border border-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">Complaint Submitted!</DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Use the tracking ID below to monitor your complaint status.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-xs text-gray-400">Your Complaint ID</p>
              <div className="flex items-center justify-between gap-2">
                <code className="font-mono text-lg font-bold text-blue-700">{complaintId}</code>
                <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400">Save this ID to track your complaint</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/student/track?id=${complaintId}`}>Track Complaint</Link>
              </Button>
              <Button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white" asChild>
                <Link href="/student/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
