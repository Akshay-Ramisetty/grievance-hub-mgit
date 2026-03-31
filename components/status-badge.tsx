import { cn } from "@/lib/utils"
import type { ComplaintStatus } from "@/lib/complaint-context"

interface StatusBadgeProps {
  status: ComplaintStatus
  className?: string
}

const statusConfig: Record<ComplaintStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-status-pending/15 text-status-pending border-status-pending/30",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-status-in-progress/15 text-status-in-progress border-status-in-progress/30",
  },
  resolved: {
    label: "Resolved",
    className: "bg-status-resolved/15 text-status-resolved border-status-resolved/30",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
