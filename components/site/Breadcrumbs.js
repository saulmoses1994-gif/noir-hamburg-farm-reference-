import Link from 'next/link'

export default function Breadcrumbs({ items, dark = false }) {
  const cls = dark ? 'text-white/70' : 'text-[#6B5F5F]'
  const cur = dark ? 'text-white' : 'text-[#1A1414]'
  return (
    <nav aria-label="Breadcrumb" className={`text-xs font-mono uppercase tracking-[0.2em] ${cls}`}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span className="opacity-50">/</span>}
              {it.href && !isLast ? (
                <Link href={it.href} className="hover:accent-text">{it.label}</Link>
              ) : (
                <span className={cur}>{it.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
