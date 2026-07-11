import Link from 'next/link'
import { listAllModels } from '@/lib/models'

export const dynamic = 'force-dynamic'

export default async function AdminModelsList() {
  const models = await listAllModels()
  return (
    <div className="p-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-2">Models</h1>
          <p className="text-sm text-[#6B5F5F] mt-2">{models.length} aktive Models. Gelöschte Einträge werden ausgeblendet (Wiederherstellung per Mongo-Query).</p>
        </div>
        <Link href="/admin/models/new" className="btn-primary !text-xs !py-2 !px-5">+ Neues Model</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {models.map((m) => (
          <Link key={m.slug} href={`/admin/models/edit/${m.slug}`} className="group bg-white rounded-lg overflow-hidden border border-[#1A1414]/8 hover:border-[#8B1538]/40 transition-colors block">
            <div className="aspect-[3/4] bg-[#F2EAE4] overflow-hidden">
              {m.cover_image ? (
                <img src={m.cover_image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9B8F8F] font-mono text-xs">kein Bild</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-heading text-lg">{m.name}</h2>
                <div className="font-mono text-[10px] text-[#6B5F5F]">{m.slug}</div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[10px] font-mono uppercase tracking-[0.15em]">
                {m.featured && <span className="px-2 py-0.5 bg-[#8B1538] text-white rounded-full">Featured</span>}
                <span className={`px-2 py-0.5 rounded-full ${m.available ? 'bg-[#DCEFE2] text-[#2D7A4E]' : 'bg-[#F4E4E4] text-[#8B1538]'}`}>
                  {m.available ? 'verfügbar' : 'nicht verf.'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
