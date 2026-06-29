import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { MessageCircle, Phone, Mail } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { api } from "@/lib/api";
import { BRAND, SERVICES, LOCATIONS } from "@/data/site";
import { toast } from "sonner";

export default function Contact() {
  const search = new URLSearchParams(useLocation().search);
  const preSelectedModel = search.get("model") || "";

  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "",
    service: "", location: "", date: "", model_slug: preSelectedModel,
    company: "", // honeypot — must stay empty
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useSEO({
    title: "Kontakt — Diskrete Buchung | Noir Hamburg",
    description: "Nehmen Sie diskret Kontakt zu Noir Hamburg auf. Wir antworten persönlich und vertraulich – per E-Mail, Telefon oder WhatsApp.",
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Bitte Name, E-Mail und Nachricht ausfüllen.");
      return;
    }
    setSending(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      toast.success("Anfrage erhalten. Wir melden uns persönlich und diskret.");
    } catch (err) {
      toast.error("Übermittlung fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <PublicLayout>
        <section className="px-6 md:px-12 lg:px-16 py-32 text-center" data-testid="contact-success">
          <span className="overline accent-text">Anfrage erhalten</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-6 max-w-3xl mx-auto">
            Vielen <em className="italic accent-text">Dank</em>.
          </h1>
          <p className="mt-8 max-w-xl mx-auto text-lg font-light text-[#6B5F5F]">
            Wir haben Ihre Anfrage erhalten und melden uns persönlich, diskret und in Kürze.
          </p>
          <div className="mt-12">
            <Link to="/" className="btn-ghost">Zur Startseite</Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="contact-page">
        <Breadcrumbs items={[{ label: "Kontakt" }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">Buchung & Anfrage</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Diskret <em className="italic accent-text">kontaktieren</em>
          </h1>
          <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
            Wir antworten persönlich, vertraulich und meist innerhalb weniger Stunden.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <form onSubmit={submit} className="lg:col-span-7 space-y-6" data-testid="contact-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Name" value={form.name} onChange={(v) => setField("name", v)} required testId="contact-name" />
              <Field label="E-Mail" type="email" value={form.email} onChange={(v) => setField("email", v)} required testId="contact-email" />
              <Field label="Telefon (optional)" value={form.phone} onChange={(v) => setField("phone", v)} testId="contact-phone" />
              <Field label="Wunschdatum (optional)" type="date" value={form.date} onChange={(v) => setField("date", v)} testId="contact-date" />
              <SelectField
                label="Service"
                value={form.service}
                onChange={(v) => setField("service", v)}
                options={[{ value: "", label: "Bitte wählen" }, ...SERVICES.map((s) => ({ value: s.slug, label: s.title }))]}
                testId="contact-service"
              />
              <SelectField
                label="Standort"
                value={form.location}
                onChange={(v) => setField("location", v)}
                options={[{ value: "", label: "Bitte wählen" }, ...LOCATIONS.map((l) => ({ value: l.slug, label: l.name }))]}
                testId="contact-location"
              />
            </div>

            <div>
              <label className="overline text-[10px] block mb-2">Ihre Nachricht *</label>
              <textarea
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                rows={6}
                required
                className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-4 font-light text-[#1A1414]"
                placeholder="Anlass, Wünsche, Hinweise…"
                data-testid="contact-message"
              />
            </div>

            <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50" data-testid="contact-submit">
              {sending ? "Wird gesendet…" : "Anfrage senden"}
            </button>

            {/* Honeypot — visually hidden from users, irresistible to bots. Real
                visitors never fill this; bots auto-fill all visible fields. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
              <label htmlFor="company-website">Firma (nicht ausfüllen)</label>
              <input
                id="company-website"
                type="text"
                tabIndex="-1"
                autoComplete="off"
                value={form.company}
                onChange={(e) => setField("company", e.target.value)}
              />
            </div>
          </form>

          {/* Direct Contact */}
          <aside className="lg:col-span-4 lg:col-start-9 space-y-8">
            <div>
              <span className="overline mb-4 block">Direkt</span>
              <div className="space-y-5 mt-4">
                <a href={`https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 group" data-testid="direct-whatsapp">
                  <span className="w-10 h-10 border border-[#1A1414]/15 group-hover:border-[#8B1538] flex items-center justify-center"><MessageCircle size={16} className="group-hover:text-[#8B1538]" /></span>
                  <div>
                    <div className="overline text-[10px]">WhatsApp</div>
                    <div className="text-lg font-light group-hover:accent-text">{BRAND.phone}</div>
                  </div>
                </a>
                <a href={`tel:${BRAND.phone}`} className="flex items-center gap-4 group" data-testid="direct-phone">
                  <span className="w-10 h-10 border border-[#1A1414]/15 group-hover:border-[#8B1538] flex items-center justify-center"><Phone size={16} className="group-hover:text-[#8B1538]" /></span>
                  <div>
                    <div className="overline text-[10px]">Telefon</div>
                    <div className="text-lg font-light group-hover:accent-text">{BRAND.phone}</div>
                  </div>
                </a>
                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-4 group" data-testid="direct-email">
                  <span className="w-10 h-10 border border-[#1A1414]/15 group-hover:border-[#8B1538] flex items-center justify-center"><Mail size={16} className="group-hover:text-[#8B1538]" /></span>
                  <div>
                    <div className="overline text-[10px]">E-Mail</div>
                    <div className="text-lg font-light group-hover:accent-text">{BRAND.email}</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="thin-divider" />
            <div className="text-sm font-light text-[#6B5F5F] leading-relaxed">
              <span className="overline accent-text mb-3 block">Diskretion</span>
              Alle Anfragen werden vertraulich behandelt. Persönliche Daten werden ausschließlich zur Vermittlung verwendet und nach Abschluss eines Termins fachgerecht gelöscht.
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}

function Field({ label, value, onChange, type = "text", required, testId }) {
  return (
    <div>
      <label className="overline text-[10px] block mb-2">{label}{required ? " *" : ""}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-3 font-light text-[#1A1414]"
        data-testid={testId}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, testId }) {
  return (
    <div>
      <label className="overline text-[10px] block mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-3 font-light text-[#1A1414]"
        data-testid={testId}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#FFFFFF]">{o.label}</option>
        ))}
      </select>
    </div>
  );
}
