import { listPublicModels } from '@/lib/models'
import { getSettings } from '@/lib/settings'

// Resolves the homepage hero image with a 3-tier fallback:
//   1) settings.homepage_hero_image (admin override)
//   2) first featured model's cover_image
//   3) first model's cover_image (any)
// Returns null when none of the tiers has a value \u2014 caller should hide
// the slot entirely rather than render a placeholder.
export async function resolveHomeHero() {
  try {
    const [settings, models] = await Promise.all([
      getSettings().catch(() => ({})),
      listPublicModels().catch(() => []),
    ])
    if (settings?.homepage_hero_image) {
      return { image: settings.homepage_hero_image, alt: 'Noir Hamburg' }
    }
    const featured = models.find((m) => m.featured && m.cover_image)
    if (featured) return { image: featured.cover_image, alt: featured.name || 'Noir Hamburg' }
    const first = models.find((m) => m.cover_image)
    if (first) return { image: first.cover_image, alt: first.name || 'Noir Hamburg' }
    return null
  } catch { return null }
}
