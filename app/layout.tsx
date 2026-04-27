import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "GrievanceHub-MGIT | College Complaint Management System",
  description:
    "Transparent Communication Between Students and Administration — Submit, track, and resolve complaints efficiently.",
  icons: {
    icon: [
      {
        url: "/mgit-emblem.png",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      {
        url: "/mgit-emblem.png",
        type: "image/png",
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/mgit-emblem.png" type="image/png" />
      </head>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  )
}
