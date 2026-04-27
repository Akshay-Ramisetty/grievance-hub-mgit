import Link from "next/link"
import Image from "next/image"
import {
  Search,
  CheckCircle,
  Shield,
  Clock,
  Users,
  ArrowRight,
  FileText,
  Bell,
} from "lucide-react"
import { FadeInSection } from "@/components/fade-in-section"

export default function LandingPage() {
  return (
    <div className="landing min-h-screen" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--lp-border)",
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 1.5rem",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Show only the circular emblem — container clips at ~38px, well before the text starts */}
            <div style={{ width: 34, height: 44, overflow: "hidden", flexShrink: 0 }}>
              <Image
                src="/mgit-logo.png"
                alt="MGIT Logo"
                width={148}
                height={44}
                className="lp-logo-img"
                style={{ width: 148, height: 44, maxWidth: "none" }}
              />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--lp-text)", letterSpacing: "-0.01em" }}>
              GrievanceHub<span style={{ color: "var(--lp-primary)" }}>-MGIT</span>
            </span>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }} className="lp-nav-hide">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "/admin/login", label: "Admin Portal" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="lp-nav-link" style={{
                padding: "6px 14px", borderRadius: 8,
                fontSize: 14, color: "var(--lp-text-muted)",
                textDecoration: "none", fontWeight: 500,
                transition: "background 0.15s, color 0.15s",
              }}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/student/login" className="lp-btn-outline" style={{
              padding: "7px 16px", borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              color: "var(--lp-text-muted)",
              border: "1px solid var(--lp-border)",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}>
              Login
            </Link>
            <Link href="/student/register" className="lp-btn-primary" style={{
              padding: "7px 18px", borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              color: "#fff",
              backgroundColor: "var(--lp-primary)",
              textDecoration: "none",
              boxShadow: "0 1px 2px 0 rgb(29 78 216 / 0.25)",
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        padding: "80px 1.5rem 72px",
        textAlign: "center",
        backgroundColor: "var(--lp-bg-alt)",
        borderBottom: "1px solid var(--lp-border)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }} className="animate-fade-in">
          {/* College logo in hero */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }} className="animate-scale-in">
            <Image
              src="/mgit-logo.png"
              alt="Mahatma Gandhi Institute of Technology"
              width={260}
              height={85}
              className="lp-logo-img"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 999,
            border: "1px solid #bfdbfe",
            backgroundColor: "#eff6ff",
            fontSize: 13, fontWeight: 500, color: "var(--lp-primary)",
            marginBottom: 28,
          }} className="animate-fade-in stagger-1">
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--lp-primary)", display: "inline-block" }} className="animate-pulse-slow" />
            Official Student Grievance System
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            color: "var(--lp-text)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            margin: "0 0 20px",
          }} className="animate-fade-in stagger-2">
            MGIT Grievance Portal
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: 17,
            color: "var(--lp-text-muted)",
            lineHeight: 1.65,
            margin: "0 auto 36px",
            maxWidth: 520,
          }} className="animate-fade-in stagger-3">
            A centralized platform for students to submit and track grievances efficiently and transparently.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }} className="animate-fade-in stagger-4">
            <Link href="/student/register" className="lp-btn-green btn-ripple" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 24px", borderRadius: 9,
              fontSize: 15, fontWeight: 600,
              color: "#fff",
              backgroundColor: "var(--lp-green)",
              textDecoration: "none",
              boxShadow: "0 1px 3px 0 rgb(22 163 74 / 0.3)",
            }}>
              Submit a Complaint <ArrowRight size={16} />
            </Link>
            <Link href="/student/track" className="lp-btn-blue btn-ripple" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 24px", borderRadius: 9,
              fontSize: 15, fontWeight: 600,
              color: "var(--lp-primary)",
              backgroundColor: "var(--lp-blue-bg)",
              border: "1px solid var(--lp-blue-ring)",
              textDecoration: "none",
            }}>
              <Search size={16} /> Track Existing
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{
        padding: "72px 1.5rem",
        backgroundColor: "var(--lp-bg)",
        borderBottom: "1px solid var(--lp-border)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeInSection>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--lp-primary)", marginBottom: 10 }}>
                Process
              </p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "var(--lp-text)", margin: "0 0 10px", letterSpacing: "-0.015em" }}>
                How It Works
              </h2>
              <p style={{ fontSize: 15, color: "var(--lp-text-muted)" }}>
                Four straightforward steps to get your grievance addressed
              </p>
            </div>
          </FadeInSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { step: "01", title: "Register", desc: "Create your student account using your college credentials.", icon: Users },
              { step: "02", title: "Submit", desc: "File your complaint with a category and clear description.", icon: FileText },
              { step: "03", title: "Track", desc: "Monitor real-time status using your unique complaint ID.", icon: Clock },
              { step: "04", title: "Resolve", desc: "Receive updates and a formal resolution from administration.", icon: CheckCircle },
            ].map((item, i) => (
              <FadeInSection key={item.step} delay={i * 100}>
                <div className="card-hover" style={{
                  backgroundColor: "var(--lp-bg-alt)",
                  border: "1px solid var(--lp-border)",
                  borderRadius: 12,
                  padding: "28px 24px",
                  position: "relative",
                  height: "100%",
                }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 8,
                    backgroundColor: i === 3 ? "var(--lp-green-bg)" : "var(--lp-blue-bg)",
                    border: `1px solid ${i === 3 ? "var(--lp-green-ring)" : "var(--lp-blue-ring)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16,
                  }}>
                  <item.icon size={18} color={i === 3 ? "var(--lp-green)" : "var(--lp-primary)"} />
                </div>
                <span style={{
                  position: "absolute", top: 20, right: 20,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                  color: "var(--lp-text-muted)", opacity: 0.5,
                }}>
                  {item.step}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--lp-text)", margin: "0 0 6px" }}>{item.title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--lp-text-muted)", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "72px 1.5rem", backgroundColor: "var(--lp-bg-alt)", borderBottom: "1px solid var(--lp-border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeInSection>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--lp-primary)", marginBottom: 10 }}>
                Features
              </p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "var(--lp-text)", margin: "0 0 10px", letterSpacing: "-0.015em" }}>
                Everything You Need
              </h2>
              <p style={{ fontSize: 15, color: "var(--lp-text-muted)" }}>
                Built for efficient, transparent grievance management
              </p>
            </div>
          </FadeInSection>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {[
              { icon: Shield, title: "Secure & Private", desc: "Authenticated sessions ensure your complaints remain confidential and protected." },
              { icon: Bell, title: "Status Tracking", desc: "Get real-time updates as your complaint progresses through each stage." },
              { icon: Search, title: "Easy Lookup", desc: "Retrieve any complaint instantly using its unique tracking ID." },
              { icon: Users, title: "Department Routing", desc: "Complaints are directed to the appropriate department automatically." },
              { icon: Clock, title: "Timely Resolution", desc: "A structured admin workflow ensures complaints are handled promptly." },
              { icon: FileText, title: "File Attachments", desc: "Attach supporting documents or images to provide additional context." },
            ].map((f, i) => (
              <FadeInSection key={f.title} delay={i * 80}>
                <div className="card-hover" style={{
                  display: "flex", gap: 16,
                  padding: "22px 20px",
                  borderRadius: 12,
                  border: "1px solid var(--lp-border)",
                  backgroundColor: "var(--lp-bg)",
                  height: "100%",
                }}>
                  <div style={{
                    width: 40, height: 40, flexShrink: 0,
                    borderRadius: 9,
                    backgroundColor: "var(--lp-blue-bg)",
                    border: "1px solid var(--lp-blue-ring)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <f.icon size={18} color="var(--lp-primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--lp-text)", margin: "0 0 5px" }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: "var(--lp-text-muted)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "72px 1.5rem", backgroundColor: "var(--lp-bg)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <FadeInSection>
            <div className="card-hover" style={{
              padding: "48px 40px",
              borderRadius: 16,
              border: "1px solid var(--lp-border)",
              backgroundColor: "var(--lp-bg-alt)",
              boxShadow: "var(--lp-shadow-md)",
            }}>
              <h2 style={{
                fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                fontWeight: 700, color: "var(--lp-text)",
                margin: "0 0 12px", letterSpacing: "-0.015em",
              }}>
                Ready to Submit Your Grievance?
              </h2>
              <p style={{ fontSize: 15, color: "var(--lp-text-muted)", margin: "0 0 28px", lineHeight: 1.6 }}>
                Register with your college credentials and submit your complaint in minutes.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/student/register" className="lp-btn-green btn-ripple" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 24px", borderRadius: 9,
                  fontSize: 15, fontWeight: 600,
                  color: "#fff",
                  backgroundColor: "var(--lp-green)",
                  textDecoration: "none",
                  boxShadow: "0 1px 3px 0 rgb(22 163 74 / 0.3)",
                }}>
                  Create Account
                </Link>
                <Link href="/student/login" className="lp-btn-outline btn-ripple" style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "11px 24px", borderRadius: 9,
                  fontSize: 15, fontWeight: 600,
                  color: "var(--lp-text-muted)",
                  border: "1px solid var(--lp-border)",
                  backgroundColor: "transparent",
                  textDecoration: "none",
                }}>
                  Student Login
                </Link>
            </div>
          </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid var(--lp-border)",
        backgroundColor: "var(--lp-bg-alt)",
        padding: "28px 1.5rem",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image
              src="/mgit-logo.png"
              alt="MGIT Logo"
              width={36}
              height={36}
              className="lp-logo-img"
              style={{ objectFit: "contain" }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--lp-text)" }}>GrievanceHub-MGIT</span>
          </div>

          <p style={{ fontSize: 13, color: "var(--lp-text-muted)", margin: 0 }}>
            © {new Date().getFullYear()} Mahatma Gandhi Institute of Technology. All rights reserved.
          </p>

          <div style={{ display: "flex", gap: 20 }}>
            {[
              { href: "/admin/login", label: "Admin Portal" },
              { href: "/student/login", label: "Student Login" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="lp-footer-link" style={{
                fontSize: 13, color: "var(--lp-text-muted)",
                textDecoration: "none", fontWeight: 500,
                transition: "color 0.15s",
              }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
