"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Upload, CheckCircle, Copy, FileText, X, MapPin } from "lucide-react"
import { apiSubmitComplaint } from "@/lib/api"
import Image from "next/image"

type Category = "academics" | "infrastructure" | "washroom" | "classroom" | "lab" | "hostel" | "library" | "canteen" | "sports" | "administration" | "other"
type Priority = "low" | "medium" | "high" | "urgent"

const categories: { value: Category; label: string; desc: string }[] = [
  { value: "academics",       label: "Academics",       desc: "Exams, grades, curriculum"  },
  { value: "infrastructure",  label: "Infrastructure",  desc: "Building issues, maintenance" },
  { value: "washroom",        label: "Washroom",        desc: "Washroom cleanliness, issues" },
  { value: "classroom",       label: "Classroom",       desc: "Classroom facilities, equipment" },
  { value: "lab",             label: "Lab",             desc: "Lab equipment, facilities" },
  { value: "hostel",          label: "Hostel",          desc: "Accommodation, mess, rooms" },
  { value: "library",         label: "Library",         desc: "Books, resources, access"   },
  { value: "canteen",         label: "Canteen",         desc: "Food quality, service" },
  { value: "sports",          label: "Sports",          desc: "Sports facilities, equipment" },
  { value: "administration",  label: "Administration",  desc: "Fees, documents, staff"     },
  { value: "other",           label: "Other",           desc: "Anything else"              },
]

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "low",    label: "Low",    color: "border-gray-300 bg-gray-50 text-gray-700" },
  { value: "medium", label: "Medium", color: "border-yellow-300 bg-yellow-50 text-yellow-700" },
  { value: "high",   label: "High",   color: "border-orange-300 bg-orange-50 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "border-red-300 bg-red-50 text-red-700" },
]

const blocks = ['A', 'B', 'C', 'D', 'E', 'F']

const floorsByBlock: Record<string, string[]> = {
  'A': ['Ground Floor', '1st Floor'],  // 2 floors total
  'B': ['Ground Floor', '1st Floor', '2nd Floor'],  // 3 floors total
  'C': ['Ground Floor', '1st Floor', '2nd Floor'],  // 3 floors total
  'D': ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],  // 5 floors total (was 4)
  'E': ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor'],  // 7 floors total
  'F': ['Ground Floor']  // 1 floor total
}

const roomTypes = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'lab', label: 'Lab' },
  { value: 'washroom', label: 'Washroom' },
  { value: 'staff_room', label: 'Staff Room' }
]

const getRoomOptions = (roomType: string) => {
  if (roomType === 'classroom') {
    return [
      { value: '02', label: 'Room 02' },
      { value: '03', label: 'Room 03' },
      { value: '04', label: 'Room 04' },
      { value: '05', label: 'Room 05' }
    ]
  } else if (roomType === 'lab') {
    return [
      { value: '01', label: 'Lab 1 (Room 01)' },
      { value: '06', label: 'Lab 2 (Room 06)' }
    ]
  } else if (roomType === 'staff_room') {
    return [{ value: '04', label: 'Staff Room' }]
  }
  return []
}

export default function SubmitComplaintPage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
  const [complaintId, setComplaintId] = useState("")
  const [copied, setCopied] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileObj, setFileObj] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ 
    title: "", 
    category: "" as Category | "", 
    description: "",
    priority: "medium" as Priority,
    is_anonymous: false,
    // Location fields
    block: "",
    floor: "",
    room_type: "",
    room_number: "",
    room_selection: "", // NEW: for selecting specific room
    gender: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const needsLocation = ['infrastructure', 'washroom', 'classroom', 'lab'].includes(formData.category)
  const needsGender = formData.category === 'washroom'
  const availableFloors = formData.block ? floorsByBlock[formData.block] || [] : []
  const availableRooms = formData.room_type ? getRoomOptions(formData.room_type) : []

  const generateRoomNumber = () => {
    if (!formData.block || !formData.floor || !formData.room_selection) return ""
    
    const floorNum = formData.floor === 'Ground Floor' ? '0' : formData.floor.charAt(0)
    return `${formData.block}${floorNum}${formData.room_selection}`
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.title.trim()) e.title = "Title is required"
    if (!formData.category) e.category = "Category is required"
    if (!formData.description.trim()) e.description = "Description is required"
    else if (formData.description.trim().length < 20) e.description = "At least 20 characters"
    
    // Validate location fields for categories that need them
    if (needsLocation) {
      if (!formData.block) e.block = "Block is required"
      if (!formData.floor) e.floor = "Floor is required"
      if (formData.category !== 'washroom') {
        if (!formData.room_type) e.room_type = "Room type is required"
        if (!formData.room_selection) e.room_selection = "Please select a specific room"
      }
    }
    
    if (needsGender && !formData.gender) e.gender = "Please specify washroom type"
    
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      let body: FormData | any
      
      // Generate room number if applicable
      const roomNumber = (formData.room_type && formData.room_type !== 'washroom') 
        ? generateRoomNumber() 
        : ""
      
      if (fileObj) {
        const fd = new FormData()
        fd.append("title", formData.title)
        fd.append("category", formData.category)
        fd.append("description", formData.description)
        fd.append("priority", formData.priority)
        fd.append("is_anonymous", formData.is_anonymous.toString())
        fd.append("attachment", fileObj)
        
        // Add location fields if needed
        if (needsLocation) {
          fd.append("block", formData.block)
          fd.append("floor", formData.floor)
          if (formData.room_type) fd.append("room_type", formData.room_type)
          if (roomNumber) fd.append("room_number", roomNumber)
          if (formData.gender) fd.append("gender", formData.gender)
        }
        
        body = fd
      } else {
        body = { 
          title: formData.title, 
          category: formData.category, 
          description: formData.description,
          priority: formData.priority,
          is_anonymous: formData.is_anonymous,
          ...(needsLocation && {
            block: formData.block,
            floor: formData.floor,
            room_type: formData.room_type,
            room_number: roomNumber,
            gender: formData.gender
          })
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ file: "File size must be less than 10MB" })
        return
      }
      setFileObj(file)
      setFileName(file.name)
      setErrors({ ...errors, file: "" })
    }
  }

  const removeFile = () => {
    setFileObj(null)
    setFileName("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/student/dashboard" className="flex items-center gap-2.5 text-gray-900 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div style={{ width: 34, height: 44, overflow: "hidden" }}>
              <Image src="/mgit-logo.png" alt="MGIT" width={148} height={44}
                style={{ width: 148, height: 44, maxWidth: "none", mixBlendMode: "multiply" }} />
            </div>
            <span className="font-bold text-gray-900">GrievanceHub<span className="text-blue-700">-MGIT</span></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit a Complaint</h1>
          <p className="mt-2 text-gray-600">
            Describe your issue in detail. We'll route it to the appropriate department.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.form}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Complaint Title *</Label>
            <Input
              placeholder="Brief summary of your issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? "border-red-400" : ""}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Category *</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value, block: "", floor: "", room_type: "", gender: "" })}
                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                    formData.category === cat.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">{cat.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>

          {/* Location Fields - Show only for relevant categories */}
          {needsLocation && (
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <MapPin className="h-4 w-4" />
                <span>Location Details</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Block */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Block *</Label>
                  <Select value={formData.block} onValueChange={(v) => setFormData({ ...formData, block: v, floor: "" })}>
                    <SelectTrigger className={errors.block ? "border-red-400" : ""}>
                      <SelectValue placeholder="Select block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((b) => <SelectItem key={b} value={b}>Block {b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.block && <p className="text-xs text-red-500">{errors.block}</p>}
                </div>

                {/* Floor */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Floor *</Label>
                  <Select 
                    value={formData.floor} 
                    onValueChange={(v) => setFormData({ ...formData, floor: v })}
                    disabled={!formData.block}
                  >
                    <SelectTrigger className={errors.floor ? "border-red-400" : ""}>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFloors.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.floor && <p className="text-xs text-red-500">{errors.floor}</p>}
                </div>
              </div>

              {/* Room Type - Not for washrooms */}
              {formData.category !== 'washroom' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Room Type *</Label>
                    <Select value={formData.room_type} onValueChange={(v) => setFormData({ ...formData, room_type: v, room_selection: "" })}>
                      <SelectTrigger className={errors.room_type ? "border-red-400" : ""}>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.filter(rt => rt.value !== 'washroom').map((rt) => (
                          <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.room_type && <p className="text-xs text-red-500">{errors.room_type}</p>}
                  </div>

                  {/* Room Selection - Show after room type is selected */}
                  {formData.room_type && availableRooms.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Select Specific Room *</Label>
                      <Select 
                        value={formData.room_selection} 
                        onValueChange={(v) => setFormData({ ...formData, room_selection: v })}
                        disabled={!formData.room_type}
                      >
                        <SelectTrigger className={errors.room_selection ? "border-red-400" : ""}>
                          <SelectValue placeholder="Choose room" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRooms.map((room) => (
                            <SelectItem key={room.value} value={room.value}>{room.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.room_selection && <p className="text-xs text-red-500">{errors.room_selection}</p>}
                      {formData.room_selection && formData.block && formData.floor && (
                        <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
                          <p className="text-sm font-medium text-blue-700">
                            Room Number: {generateRoomNumber()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Gender - Only for washrooms */}
              {needsGender && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Washroom Type *</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "Boys" })}
                      className={`flex-1 rounded-lg border-2 p-3 text-center font-medium transition-all ${
                        formData.gender === "Boys"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Boys
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "Girls" })}
                      className={`flex-1 rounded-lg border-2 p-3 text-center font-medium transition-all ${
                        formData.gender === "Girls"
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Girls
                    </button>
                  </div>
                  {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Description *</Label>
            <Textarea
              placeholder="Provide detailed information about your complaint..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className={errors.description ? "border-red-400" : ""}
            />
            <div className="flex items-center justify-between text-xs">
              {errors.description ? (
                <p className="text-red-500">{errors.description}</p>
              ) : (
                <p className="text-gray-400">Minimum 20 characters</p>
              )}
              <p className="text-gray-400">{formData.description.length} characters</p>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Priority</Label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p.value })}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                    formData.priority === p.value ? p.color : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Attachment (Optional)</Label>
            {!fileName ? (
              <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 transition-colors hover:border-gray-400 hover:bg-gray-100">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="mt-1 text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
              </label>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-700">{fileName}</span>
                </div>
                <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}
          </div>

          {/* Anonymous */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.is_anonymous}
              onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Submit anonymously (your identity will be hidden)
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="h-11 w-full bg-blue-700 text-base font-semibold hover:bg-blue-800"
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
          </Button>
        </form>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">Complaint Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Your complaint has been registered successfully. Save this ID to track your complaint.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-medium text-gray-500">Complaint ID</p>
              <div className="flex items-center justify-between">
                <code className="text-lg font-bold text-gray-900">{complaintId}</code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/student/dashboard")}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button
                type="button"
                onClick={() => router.push(`/student/track?id=${complaintId}`)}
                className="flex-1 bg-blue-700 hover:bg-blue-800"
              >
                Track Complaint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
