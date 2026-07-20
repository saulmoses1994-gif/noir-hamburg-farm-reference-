import { notFound } from 'next/navigation'

// Root-level catch-all. Because we're using the multi-root layout pattern
// (each locale group provides its own <html>) there is no `app/layout.js`.
// Next.js therefore cannot render `app/not-found.js`. This catch-all under
// the (de) group matches any URL that no other route serves, then triggers
// notFound() so `(de)/not-found.js` renders our bilingual NotFoundBody.
// It's placed under (de) — the default locale — so unmatched URLs like
// /does-not-exist render the DE-first bilingual 404.
export default async function Catchall({ params }) {
  await params
  notFound()
}

// Static generation is a no-op for this route (it always throws), so we
// don't need generateStaticParams. Prevents Next.js from trying to prerender
// arbitrary permutations.
export const dynamic = 'force-static'
export const dynamicParams = true
