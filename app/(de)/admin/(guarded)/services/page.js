import Link from 'next/link'
import { listServiceContent } from '@/lib/service-content'

export const dynamic = 'force-dynamic'

export default async function AdminServicesList() {
  const services = await listServiceContent()
  return (
    <div className="p-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-2">Services</h1>
          <p className="text-sm text-[#6B5F5F] mt-2">SEO-Content pro Service (Title, Description, H1, FAQs …). Änderungen erscheinen sofort auf der öffentlichen Seite.</p>
        </div>
      </div>
      <div className="bg-white rounded-lg overflow-hidden border border-[#1A1414]/8">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] border-b border-[#1A1414]/8">
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Meta Title (DE)</th>
              <th className="px-6 py-4 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.slug} className="border-b border-[#1A1414]/5 hover:bg-[#FBF7F4]">
                <td className="px-6 py-4 font-mono text-xs">{s.slug}</td>
                <td className="px-6 py-4 font-heading text-base">{s.title}</td>
                <td className="px-6 py-4 text-sm text-[#6B5F5F] truncate max-w-md">{s.meta_title}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <a href={`/services/${s.slug}`} target="_blank" rel="noreferrer" className="text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] hover:accent-text mr-4">Ansehen</a>
                  <Link href={`/admin/services/${s.slug}`} className="text-xs font-mono uppercase tracking-[0.15em] accent-text">Bearbeiten →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
