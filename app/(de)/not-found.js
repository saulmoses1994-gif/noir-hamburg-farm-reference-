import NotFoundBody from '@/components/public/NotFoundBody'

// Rendered when a page inside the (de) group calls notFound(). Uses the
// bilingual body — no locale detection needed.
export default function NotFound() {
  return <NotFoundBody />
}
