import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MessageSquare,
  Search,
  CheckCircle,
  Shield,
  Clock,
  Users,
  ArrowRight,
  FileText,
  Bell,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">GrievanceHub-MGIT</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="/admin/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Admin Portal
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/student/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/student/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              Now accepting complaints
            </div>
            <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Transparent Communication Between Students and Administration
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              GrievanceHub-MGIT provides a seamless platform for students to submit, track, and resolve complaints efficiently. 
              Experience transparent communication with real-time status updates.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/student/register" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/student/login">Student Login</Link>
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors hover:bg-card">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Submit Complaints</h3>
                <p className="text-sm text-muted-foreground">
                  Easily submit your grievances with detailed descriptions and optional file attachments.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors hover:bg-card">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-in-progress/10">
                  <Search className="h-6 w-6 text-status-in-progress" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Track Status</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your complaint status in real-time with unique tracking IDs.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors hover:bg-card sm:col-span-2 lg:col-span-1">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-status-resolved/10">
                  <CheckCircle className="h-6 w-6 text-status-resolved" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Get Resolution</h3>
                <p className="text-sm text-muted-foreground">
                  Receive timely updates and resolutions from the administration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-border bg-secondary/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple steps to get your grievances addressed
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Register", description: "Create your student account with your college credentials", icon: Users },
              { step: "02", title: "Submit", description: "File your complaint with category and description", icon: FileText },
              { step: "03", title: "Track", description: "Monitor real-time status using your complaint ID", icon: Clock },
              { step: "04", title: "Resolve", description: "Receive updates and resolution from administration", icon: CheckCircle },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card text-2xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Platform Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need for efficient grievance management
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: "Secure & Private", description: "Your complaints are kept confidential with secure authentication." },
              { icon: Bell, title: "Real-time Notifications", description: "Get instant updates when your complaint status changes." },
              { icon: Search, title: "Easy Tracking", description: "Track any complaint instantly with the unique ID." },
              { icon: Users, title: "Department Assignment", description: "Complaints are routed to the appropriate department." },
              { icon: Clock, title: "Quick Resolution", description: "Efficient workflow ensures faster complaint resolution." },
              { icon: FileText, title: "File Attachments", description: "Upload supporting documents with your complaints." },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 rounded-lg border border-border bg-card/50 p-6 transition-colors hover:bg-card">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-primary/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to Submit Your Grievance?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of students who have successfully resolved their complaints through GrievanceHub-MGIT.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/student/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/student/track">Track Existing Complaint</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">GrievanceHub-MGIT</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MGIT College. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/admin/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Admin Portal
              </Link>
              <Link href="/student/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Student Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
