// Temporary preview page — shows 5 alternative price-badge designs on the
// same model card, side by side, so you can pick the one you like best
// before I ship it globally. Delete this file once the choice is made.
import { listPublicModels } from '@/lib/models'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'

export const dynamic = 'force-dynamic'

const DESIGNS = [
  {
    key: 'A',
    name: 'Dark pill (current)',
    note: 'Solid dark background, bottom-right overlay. Currently live.',
    render: ({ label, price, unit }) => (
      <span className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#1A1414]/85 backdrop-blur text-white text-[11px] font-mono tracking-widest rounded-full">
        {label} {price} <span className="text-white/70">· {unit}</span>
      </span>
    ),
  },
  {
    key: 'B',
    name: 'Cream card (soft & elegant)',
    note: 'Warm off-white pill, subtle border. Reads as bespoke stationery.',
    render: ({ label, price, unit }) => (
      <span className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#FBF7F4] border border-[#1A1414]/10 text-[#1A1414] text-[11px] font-mono tracking-widest rounded-full shadow-sm">
        {label} <strong className="font-semibold">{price}</strong>
        <span className="text-[#6B5F5F]"> · {unit}</span>
      </span>
    ),
  },
  {
    key: 'C',
    name: 'Below image (out of the photo)',
    note: 'No overlay on the photo at all. Price sits in its own row under the name. Cleanest.',
    render: null, // rendered inline below, not on image
    below: ({ label, price, unit }) => (
      <div className="mt-1 text-xs font-mono tracking-widest text-[#6B5F5F]">
        <span className="opacity-70">{label}</span>{' '}
        <span className="text-[#1A1414]">{price}</span>{' '}
        <span className="opacity-70">/ {unit}</span>
      </div>
    ),
  },
  {
    key: 'D',
    name: 'Gold accent tag',
    note: 'Champagne-gold border + serif label. Luxury jewellery vibe.',
    render: ({ label, price, unit }) => (
      <span className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur border border-[#B08D57] text-[#1A1414] text-[11px] tracking-widest rounded-full shadow-sm">
        <em className="not-italic font-heading text-[#B08D57] mr-0.5">{label}</em>
        <span className="font-mono font-semibold">{price}</span>
        <span className="font-mono text-[#6B5F5F]"> · {unit}</span>
      </span>
    ),
  },
  {
    key: 'E',
    name: 'Bordeaux minimalist (brand accent)',
    note: 'Uses your existing #8B1538 accent color. Feels on-brand instantly.',
    render: ({ label, price, unit }) => (
      <span className="absolute bottom-3 right-3 px-3 py-1.5 bg-white text-[#8B1538] text-[11px] font-mono uppercase tracking-widest rounded-full shadow-md">
        {label} <strong className="font-semibold">{price}</strong>
        <span className="text-[#8B1538]/60"> {unit}</span>
      </span>
    ),
  },
  {
    key: 'F',
    name: 'Top corner ribbon',
    note: 'Same tone as A, but at the top-right — leaves the face uncovered.',
    render: ({ label, price, unit }) => (
      <span className="absolute top-4 right-4 px-3 py-1.5 bg-[#1A1414]/85 backdrop-blur text-white text-[11px] font-mono tracking-widest rounded-full">
        {label} {price} <span className="text-white/70">· {unit}</span>
      </span>
    ),
  },
]

export default async function PriceBadgePreview() {
  const models = await listPublicModels()
  const m = models[0] || {}
  const hour = Array.isArray(m.prices) ? m.prices.find((p) => p.unit === 'hour') : null
  const price = hour
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: hour.currency || 'EUR', maximumFractionDigits: 0 }).format(hour.amount)
    : '500 €'
  const values = { label: 'ab', price, unit: '1 Std.' }

  return (
    <>
      <Header lang="de" currentPath="/preview-prices" />
      <main className="px-6 md:px-12 lg:px-16 py-12 max-w-7xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl mb-2">Price badge — design preview</h1>
        <p className="text-sm text-[#6B5F5F] mb-8">Same model card, six alternative designs. Reply with your favourite letter (A/B/C/D/E/F) and I&apos;ll ship it site-wide.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DESIGNS.map((d) => (
            <div key={d.key} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#8B1538] text-white text-xs font-mono font-semibold">{d.key}</span>
                <h2 className="font-heading text-lg flex-1 ml-3">{d.name}</h2>
              </div>
              <div className="aspect-[3/4] bg-[#F2EAE4] overflow-hidden editorial-image relative">
                {m.cover_image && <img src={m.cover_image} alt={m.name} className="w-full h-full object-cover" />}
                {d.render && d.render(values)}
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-heading text-2xl">{m.name || 'Aurelia'}</h3>
                  <div className="text-xs font-mono text-[#6B5F5F]">{m.age ? `${m.age} J.` : '25 J.'}</div>
                </div>
                {d.below && d.below(values)}
              </div>
              <p className="text-xs text-[#6B5F5F] italic border-l-2 border-[#8B1538] pl-3">{d.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 p-6 border-l-4 border-[#8B1538] bg-[#FBF7F4] rounded">
          <p className="text-sm text-[#1A1414]">
            <strong>Next step:</strong> reply with a letter (e.g. <strong>&ldquo;go with D&rdquo;</strong>) and I&apos;ll apply it to all 14 model cards across DE and EN. Delete this preview page after the choice is made — it&apos;s only linked here, not in the nav.
          </p>
        </div>
      </main>
      <Footer lang="de" />
    </>
  )
}
