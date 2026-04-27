import { cn } from "@/lib/utils"
import { AlertCircle, AlertTriangle, Info, Minus } from "lucide-react"

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "urgent"
  className?: string
  showIcon?: boolean
}

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
  const config = {
    urgent: {
      label: "Urgent",
      className: "bg-red-100 text-red-700 border-red-200",
      icon: AlertCircle,
    },
    high: {
      label: "High",
      className: "bg-orange-100 text-orange-700 border-orange-200",
      icon: AlertTriangle,
    },
    medium: {
      label: "Medium",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: Info,
    },
    low: {
      label: "Low",
      className: "bg-gray-100 text-gray-600 border-gray-200",
      icon: Minus,
    },
  }

  const { label, className: colorClass, icon: Icon } = config[priority]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  )
}
