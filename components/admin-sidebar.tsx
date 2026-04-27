"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MessageSquare, LayoutDashboard, FileText, CheckCircle,
  Users, Settings, LogOut, Shield,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard?view=complaints", label: "All Complaints", icon: FileText },
  { href: "/admin/dashboard?view=resolved", label: "Resolved", icon: CheckCircle },
  { href: "/admin/dashboard?view=departments", label: "Departments", icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/30">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground leading-none">GrievanceHub</p>
          <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Admin badge */}
      <div className="mx-3 mt-4 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
          <Shield className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-sidebar-foreground">MGIT Admin</p>
          <p className="text-[10px] text-sidebar-foreground/50">admin@mgit.edu</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">Navigation</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href.split("?")[0]
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}>
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} />
              {item.label}
              {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-0.5">
        <Link href="/admin/dashboard?view=settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  )
}
