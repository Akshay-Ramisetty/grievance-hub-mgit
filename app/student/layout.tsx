import { ComplaintProvider } from "@/lib/complaint-context"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ComplaintProvider>{children}</ComplaintProvider>
}
