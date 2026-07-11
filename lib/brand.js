import { getSettings } from '@/lib/settings'
import { BRAND } from '@/lib/site'

// Digit-only WhatsApp phone -> canonical wa.me URL. Accepts "+49 40 …" as
// well as "4940000000000".
function waUrlFromNumber(n) {
  const digits = String(n || '').replace(/[^\d]/g, '')
  if (!digits) return ''
  return `https://wa.me/${digits}`
}

// Returns a merged brand object resolved from the live site_settings
// singleton, with each field falling back to the hardcoded BRAND constant
// when the CMS field is empty. Locale-aware for tagline + hours.
//
// This is the single source of truth for Header/Footer/topbar/anywhere
// else we render contact info. Because Next.js caches the settings-read
// inside the request scope and the Settings PUT calls
// revalidatePath('/', 'layout'), edits show up on the next request across
// every layout surface.
export async function getBrand(lang = 'de') {
  const s = await getSettings().catch(() => ({}))
  const isEn = lang === 'en'
  const phone = s.phone || BRAND.phone
  const email = s.email || BRAND.email
  const waNumber = s.whatsapp_number || BRAND.whatsapp
  const waRecruitNumber = s.recruitment_whatsapp_number || ''
  return {
    name: s.business_name || BRAND.name,
    tagline: (isEn ? s.tagline_en : s.tagline_de) || (isEn ? BRAND.taglineEn : BRAND.tagline),
    phone,
    phoneHref: `tel:${String(phone).replace(/\s+/g, '')}`,
    email,
    emailHref: `mailto:${email}`,
    whatsappNumber: waNumber,
    whatsappUrl: waUrlFromNumber(waNumber) || BRAND.whatsappUrl,
    recruitmentWhatsappUrl: waRecruitNumber ? waUrlFromNumber(waRecruitNumber) : '',
    hours: (isEn ? s.hours_en : s.hours_de) ||
      (isEn
        ? 'Mon \u2013 Fri \u00b7 10 am \u2013 10 pm  \u00b7  Sat, Sun, Holidays \u00b7 1 pm \u2013 10 pm'
        : 'Mo \u2013 Fr \u00b7 10 \u2013 22 Uhr  \u00b7  Sa, So, Feiertag \u00b7 13 \u2013 22 Uhr'),
    instagramUrl: s.instagram_url || '',
    facebookUrl: s.facebook_url || '',
    twitterUrl: s.twitter_url || '',
  }
}
