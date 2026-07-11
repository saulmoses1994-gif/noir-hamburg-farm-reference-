// Admin chrome (no auth guard here — that's in (guarded)/layout.js).
// The `/admin/login` page needs to render without the auth guard, so the
// guard lives in a nested route-group layout.
export const dynamic = 'force-dynamic'

export default function AdminChromeLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F5F2] font-body text-[#1A1414]">
      {children}
    </div>
  )
}
