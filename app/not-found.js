import NotFoundBody from '@/components/public/NotFoundBody'

// Root fallback for URLs that don't map to any route group. Bilingual by
// design — see NotFoundBody for the rationale.
export default function NotFound() {
  return <NotFoundBody />
}
