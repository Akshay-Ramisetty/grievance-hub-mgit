import { ComplaintProvider } from "@/lib/complaint-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ComplaintProvider>{children}</ComplaintProvider>
}
