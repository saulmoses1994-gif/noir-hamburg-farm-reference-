// Site-wide static content — copied verbatim (subset) from the frozen
// reference /frontend/src/data/site.js so header/footer/nav renders identically.

export const BRAND = {
  name: 'Noir Hamburg',
  tagline: 'Premium Begleitagentur · Hamburg',
  taglineEn: 'Premium Companion Agency · Hamburg',
  phone: '+49 40 0000 0000',
  whatsapp: '+4940000000000',
  whatsappUrl: 'https://wa.me/4940000000000',
  email: 'kontakt@noir-hamburg.com',
}

export const NAV = [
  { to: '/', deLabel: 'Startseite', enLabel: 'Home' },
  { to: '/models', deLabel: 'Models', enLabel: 'Models' },
  { to: '/escort-hamburg', deLabel: 'Escort Hamburg', enLabel: 'Escort Hamburg' },
  { to: '/services', deLabel: 'Services', enLabel: 'Services' },
  { to: '/areas', deLabel: 'Hamburg Areas', enLabel: 'Areas' },
  { to: '/blog', deLabel: 'Blog', enLabel: 'Blog' },
  { to: '/faq', deLabel: 'FAQ', enLabel: 'FAQ' },
  { to: '/ueber-uns', enTo: '/about', deLabel: 'Über uns', enLabel: 'About' },
  { to: '/kontakt', enTo: '/contact', deLabel: 'Kontakt', enLabel: 'Contact' },
]

// Slugs are shared between DE and EN — routes differ only by locale prefix.
export const SERVICE_SLUGS = [
  'luxury-escort-hamburg',
  'vip-escort-hamburg',
  'business-escort-hamburg',
  'dinner-companion-hamburg',
  'hotel-escort-hamburg',
  'event-escort-hamburg',
  'travel-companion-hamburg',
  'girlfriend-experience-hamburg',
]
