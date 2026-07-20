import { notFound } from 'next/navigation'

// Catch-all for unmatched /en/* URLs. Complements the DE catch-all at
// app/(de)/[...notfound]/page.js. Triggers `(en)/not-found.js` which
// renders the shared bilingual NotFoundBody with EN content first.
export default async function CatchallEn({ params }) {
  await params
  notFound()
}

export const dynamic = 'force-static'
export const dynamicParams = true
