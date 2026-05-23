export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-x-hidden">
      {children}
    </div>
  )
}
