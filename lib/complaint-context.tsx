"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type ComplaintStatus = "pending" | "in-progress" | "resolved"
export type ComplaintCategory = "academics" | "facilities" | "administration" | "other"

export interface Complaint {
  id: string
  title: string
  category: ComplaintCategory
  description: string
  status: ComplaintStatus
  studentName: string
  studentRollNo: string
  studentEmail: string
  department: string
  assignedDepartment?: string
  createdAt: Date
  updatedAt: Date
  fileUrl?: string
}

export interface Student {
  id: string
  fullName: string
  rollNumber: string
  email: string
  department: string
}

interface ComplaintContextType {
  complaints: Complaint[]
  currentStudent: Student | null
  addComplaint: (complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "status">) => string
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void
  assignDepartment: (id: string, department: string) => void
  getComplaintById: (id: string) => Complaint | undefined
  getStudentComplaints: (email: string) => Complaint[]
  setCurrentStudent: (student: Student | null) => void
  registerStudent: (student: Omit<Student, "id">) => Student
}

const ComplaintContext = createContext<ComplaintContextType | null>(null)

function generateComplaintId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GH-${timestamp}-${random}`
}

function generateStudentId(): string {
  return `STU-${Date.now().toString(36).toUpperCase()}`
}

// Sample data for demo purposes
const initialComplaints: Complaint[] = [
  {
    id: "GH-M1A2B3-XY4Z",
    title: "Library AC not working",
    category: "facilities",
    description: "The air conditioning in the main library has been non-functional for the past week, making it difficult to study.",
    status: "in-progress",
    studentName: "Rahul Sharma",
    studentRollNo: "20CS101",
    studentEmail: "rahul@mgit.edu",
    department: "Computer Science",
    assignedDepartment: "Maintenance",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-18"),
  },
  {
    id: "GH-N2B3C4-AB5C",
    title: "Exam schedule conflict",
    category: "academics",
    description: "Two exams are scheduled at the same time slot on March 25th.",
    status: "pending",
    studentName: "Priya Patel",
    studentRollNo: "20EC045",
    studentEmail: "priya@mgit.edu",
    department: "Electronics",
    createdAt: new Date("2024-03-20"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "GH-O3C4D5-CD6E",
    title: "Hostel water supply issue",
    category: "facilities",
    description: "Irregular water supply in Block B hostel rooms since last Monday.",
    status: "resolved",
    studentName: "Amit Kumar",
    studentRollNo: "20ME032",
    studentEmail: "amit@mgit.edu",
    department: "Mechanical",
    assignedDepartment: "Hostel Administration",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-14"),
  },
]

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)

  const addComplaint = useCallback(
    (complaintData: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "status">): string => {
      const id = generateComplaintId()
      const now = new Date()
      const newComplaint: Complaint = {
        ...complaintData,
        id,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      }
      setComplaints((prev) => [newComplaint, ...prev])
      return id
    },
    []
  )

  const updateComplaintStatus = useCallback((id: string, status: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date() } : c))
    )
  }, [])

  const assignDepartment = useCallback((id: string, department: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, assignedDepartment: department, updatedAt: new Date() } : c
      )
    )
  }, [])

  const getComplaintById = useCallback(
    (id: string) => complaints.find((c) => c.id === id),
    [complaints]
  )

  const getStudentComplaints = useCallback(
    (email: string) => complaints.filter((c) => c.studentEmail === email),
    [complaints]
  )

  const registerStudent = useCallback((studentData: Omit<Student, "id">): Student => {
    const student: Student = {
      ...studentData,
      id: generateStudentId(),
    }
    setCurrentStudent(student)
    return student
  }, [])

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        currentStudent,
        addComplaint,
        updateComplaintStatus,
        assignDepartment,
        getComplaintById,
        getStudentComplaints,
        setCurrentStudent,
        registerStudent,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  )
}

export function useComplaints() {
  const context = useContext(ComplaintContext)
  if (!context) {
    throw new Error("useComplaints must be used within a ComplaintProvider")
  }
  return context
}
