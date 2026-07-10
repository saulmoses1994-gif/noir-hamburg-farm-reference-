import Link from 'next/link'
import { BRAND } from '@/lib/site'
import { localePath } from '@/lib/i18n'

export default function Footer({ lang = 'de' }) {
  return (
    <footer className="bg-[#1A1414] text-white/80 mt-24">
      <div className="px-6 md:px-12 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="font-heading text-2xl">
            <span className="text-white font-semibold">Noir</span>{' '}
            <span className="text-[#E5A5B5] italic">Hamburg</span>
          </div>
          <p className="mt-4 text-sm font-light">
            {lang === 'en' ? BRAND.taglineEn : BRAND.tagline}
          </p>
        </div>
        <div>
          <div className="overline text-white/60 mb-3">{lang === 'en' ? 'Contact' : 'Kontakt'}</div>
          <ul className="space-y-2 text-sm">
            <li><a href={`tel:${BRAND.phone}`} className="hover:text-white">{BRAND.phone}</a></li>
            <li><a href={`mailto:${BRAND.email}`} className="hover:text-white">{BRAND.email}</a></li>
            <li><a href={BRAND.whatsappUrl} className="hover:text-white" target="_blank" rel="noreferrer nofollow">WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <div className="overline text-white/60 mb-3">{lang === 'en' ? 'Explore' : 'Entdecken'}</div>
          <ul className="space-y-2 text-sm">
            <li><Link href={localePath(lang, '/models')} className="hover:text-white">Models</Link></li>
            <li><Link href={localePath(lang, '/services')} className="hover:text-white">Services</Link></li>
            <li><Link href={localePath(lang, '/areas')} className="hover:text-white">{lang === 'en' ? 'Areas' : 'Hamburg Areas'}</Link></li>
            <li><Link href={localePath(lang, '/blog')} className="hover:text-white">Blog</Link></li>
          </ul>
        </div>
        <div>
          <div className="overline text-white/60 mb-3">{lang === 'en' ? 'Legal' : 'Rechtliches'}</div>
          <ul className="space-y-2 text-sm">
            <li><Link href={localePath(lang, '/impressum')} className="hover:text-white">{lang === 'en' ? 'Imprint' : 'Impressum'}</Link></li>
            <li><Link href={localePath(lang, '/p/diskretion')} className="hover:text-white">{lang === 'en' ? 'Discretion' : 'Diskretion'}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Noir Hamburg. All rights reserved.
      </div>
    </footer>
  )
}
