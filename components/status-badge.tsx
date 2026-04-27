import { cn } from "@/lib/utils"
import type { ComplaintStatus } from "@/lib/complaint-context"

interface StatusBadgeProps {
  status: ComplaintStatus
  className?: string
}

const statusConfig: Record<ComplaintStatus, { label: string; dot: string; className: string }> = {
  pending: {
    label: "Pending",
    dot: "bg-status-pending",
    className: "bg-status-pending/10 text-status-pending border-status-pending/25",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-status-in-progress",
    className: "bg-status-in-progress/10 text-status-in-progress border-status-in-progress/25",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-status-resolved",
    className: "bg-status-resolved/10 text-status-resolved border-status-resolved/25",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      config.className,
      className,
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  )
}
