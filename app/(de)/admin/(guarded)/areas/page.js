import Link from 'next/link'
import { listAreaContent } from '@/lib/service-content'

export const dynamic = 'force-dynamic'

export default async function AdminAreasList() {
  const areas = await listAreaContent()
  const sorted = [...areas].sort((a, b) => (a.name || a.slug).localeCompare(b.name || b.slug))
  const filled = sorted.filter((a) => (a.meta_title || '').length > 0).length
  return (
    <div className="p-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-2">Hamburg Areas</h1>
          <p className="text-sm text-[#6B5F5F] mt-2">SEO-Content pro Stadtteil / Gebiet (Meta, Intro, Beschreibung, Landmarks, FAQs).</p>
        </div>
        <div className="text-xs font-mono text-[#6B5F5F]">{filled}/{sorted.length} mit Meta-Title befüllt</div>
      </div>
      <div className="bg-white rounded-lg overflow-hidden border border-[#1A1414]/8">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F] border-b border-[#1A1414]/8">
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Meta Title (DE)</th>
              <th className="px-6 py-4 w-20 text-center">SEO</th>
              <th className="px-6 py-4 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => {
              const seoOk = !!a.meta_title && !!a.meta_description
              return (
                <tr key={a.slug} className="border-b border-[#1A1414]/5 hover:bg-[#FBF7F4]">
                  <td className="px-6 py-4 font-mono text-xs">{a.slug}</td>
                  <td className="px-6 py-4 font-heading text-base">{a.name || a.title}</td>
                  <td className="px-6 py-4 text-sm text-[#6B5F5F] truncate max-w-md">{a.meta_title || <span className="italic text-[#9B8F8F]">— leer —</span>}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${seoOk ? 'bg-[#2D7A4E]' : 'bg-[#E5A5B5]'}`} title={seoOk ? 'Meta gesetzt' : 'Meta fehlt'} />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Link href={`/admin/areas/edit/${a.slug}`} className="text-xs font-mono uppercase tracking-[0.15em] accent-text">Bearbeiten →</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
