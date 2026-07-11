'use client'
import { useState } from 'react'
import Link from 'next/link'
import { t, localePath } from '@/lib/i18n'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Client-side contact form used on /kontakt (and /en/contact). Posts to
// POST /api/contact. Includes a hidden honeypot ("website") for bot triage.
export default function ContactForm({ lang, services = [] }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', message: '',
    date: '', consent: false,
    website: '', // honeypot — must stay empty
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [networkError, setNetworkError] = useState('')

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }))
    if (networkError) setNetworkError('')
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = t(lang, 'contact.err.required')
    if (!form.email.trim()) e.email = t(lang, 'contact.err.required')
    else if (!EMAIL_RE.test(form.email.trim())) e.email = t(lang, 'contact.err.email')
    if (!form.message.trim()) e.message = t(lang, 'contact.err.required')
    else if (form.message.trim().length < 20) e.message = t(lang, 'contact.err.min20')
    if (!form.consent) e.consent = t(lang, 'contact.err.consent')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (evt) => {
    evt.preventDefault()
    if (!validate()) return
    setSending(true)
    setNetworkError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data?.errors && typeof data.errors === 'object') {
          // Map server-side error codes to the same i18n keys used client-side.
          const mapped = {}
          for (const [k, code] of Object.entries(data.errors)) {
            if (code === 'invalid') mapped[k] = t(lang, 'contact.err.email')
            else if (code === 'too_short') mapped[k] = t(lang, 'contact.err.min20')
            else mapped[k] = t(lang, 'contact.err.required')
          }
          setErrors(mapped)
        } else {
          setNetworkError(t(lang, 'contact.err.network'))
        }
        return
      }
      setSent(true)
      setForm({ name: '', email: '', phone: '', service: '', message: '', date: '', consent: false, website: '' })
    } catch {
      setNetworkError(t(lang, 'contact.err.network'))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="lg:col-span-7" data-testid="contact-success">
        <span className="overline accent-text">{t(lang, 'contact.success.overline')}</span>
        <h2 className="font-heading text-4xl lg:text-6xl font-light tracking-tighter leading-none mt-6">
          {t(lang, 'contact.success.h1a')}{' '}
          <em className="italic accent-text">{t(lang, 'contact.success.h1b')}</em>.
        </h2>
        <p className="mt-8 max-w-xl text-lg font-light text-[#6B5F5F]">
          {t(lang, 'contact.success.body')}
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setErrors({}) }}
          className="btn-ghost mt-10"
          data-testid="contact-reset"
        >
          {t(lang, 'contact.success.reset')}
        </button>
      </div>
    )
  }

  const inputCls = (k) =>
    `w-full bg-transparent border ${errors[k] ? 'border-[#8B1538]' : 'border-[#1A1414]/15'} focus:border-[#8B1538] outline-none p-3 font-light text-[#1A1414]`

  // Screen-reader helpers: give every validated input a stable id, wire
  // aria-invalid + aria-describedby to the error <p> so assistive tech
  // announces the exact reason a field is rejected.
  const errId = (k) => `cf-${k}-err`
  const inputA11y = (k) => ({
    id: `cf-${k}`,
    'aria-invalid': errors[k] ? 'true' : undefined,
    'aria-describedby': errors[k] ? errId(k) : undefined,
  })

  return (
    <form onSubmit={onSubmit} className="lg:col-span-7 space-y-6" data-testid="contact-form" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="overline text-[10px] block mb-2">{t(lang, 'contact.form.name')} *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className={inputCls('name')}
            data-testid="contact-name"
            required
            {...inputA11y('name')}
          />
          {errors.name && <p id={errId('name')} className="text-[11px] text-[#8B1538] mt-1" data-testid="err-name">{errors.name}</p>}
        </div>
        <div>
          <label className="overline text-[10px] block mb-2">{t(lang, 'contact.form.email')} *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            className={inputCls('email')}
            data-testid="contact-email"
            required
            {...inputA11y('email')}
          />
          {errors.email && <p id={errId('email')} className="text-[11px] text-[#8B1538] mt-1" data-testid="err-email">{errors.email}</p>}
        </div>
        <div>
          <label className="overline text-[10px] block mb-2">{t(lang, 'contact.form.phone')}</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            className={inputCls('phone')}
            data-testid="contact-phone"
          />
        </div>
        <div>
          <label className="overline text-[10px] block mb-2">{t(lang, 'contact.form.date')}</label>
          <input
            type="text"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
            placeholder={t(lang, 'contact.form.datePlaceholder')}
            className={inputCls('date')}
            data-testid="contact-date"
          />
        </div>
        <div className="md:col-span-2">
          <label className="overline text-[10px] block mb-2">{t(lang, 'contact.form.service')}</label>
          <select
            value={form.service}
            onChange={(e) => setField('service', e.target.value)}
            className={inputCls('service')}
            data-testid="contact-service"
          >
            <option value="">{t(lang, 'contact.form.serviceDefault')}</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>{s.label}</option>
            ))}
            <option value="other">{t(lang, 'contact.form.serviceOther')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="overline text-[10px] block mb-2">{t(lang, 'contact.form.message')} *</label>
        <textarea
          value={form.message}
          onChange={(e) => setField('message', e.target.value)}
          rows={6}
          className={inputCls('message') + ' resize-y'}
          placeholder={t(lang, 'contact.form.messagePlaceholder')}
          data-testid="contact-message"
          required
          {...inputA11y('message')}
        />
        {errors.message && <p id={errId('message')} className="text-[11px] text-[#8B1538] mt-1" data-testid="err-message">{errors.message}</p>}
      </div>

      <label className="flex items-start gap-3 cursor-pointer" data-testid="contact-consent-wrap">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setField('consent', e.target.checked)}
          className="mt-1 accent-[#8B1538]"
          data-testid="contact-consent"
          id="cf-consent"
          aria-invalid={errors.consent ? 'true' : undefined}
          aria-describedby={errors.consent ? errId('consent') : undefined}
        />
        <span className="text-sm font-light text-[#3F3838] leading-relaxed">
          {t(lang, 'contact.form.consent')}{' '}
          <Link href={localePath(lang, '/p/diskretion')} className="underline decoration-[#8B1538]/50 hover:decoration-[#8B1538]">
            {t(lang, 'contact.form.consentLink')}
          </Link>{' '}
          {t(lang, 'contact.form.consentTail')}
        </span>
      </label>
      {errors.consent && <p id={errId('consent')} className="text-[11px] text-[#8B1538]" data-testid="err-consent">{errors.consent}</p>}

      {networkError && (
        <p className="text-sm text-[#8B1538]" data-testid="err-network" role="alert" aria-live="assertive">{networkError}</p>
      )}

      <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50" data-testid="contact-submit">
        {sending ? t(lang, 'contact.form.sending') : t(lang, 'contact.form.submit')} →
      </button>

      {/* Honeypot: hidden field bots love to fill in. Real users never see it. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>
        <label htmlFor="cf-website">{t(lang, 'contact.form.honeypot')}</label>
        <input
          id="cf-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setField('website', e.target.value)}
        />
      </div>
    </form>
  )
}
