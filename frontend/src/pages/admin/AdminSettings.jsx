import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

/**
 * Site-wide settings — phone, email, WhatsApp, opening hours (DE+EN),
 * social handles. Editable by any admin. Values are read on-demand by the
 * public site via GET /api/settings.
 */
export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setForm(r.data)).catch(() => toast.error("Fehler beim Laden"));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await api.put("/settings", form);
      setForm(data);
      toast.success("Einstellungen gespeichert");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Fehler beim Speichern");
    } finally {
      setBusy(false);
    }
  };

  if (!form) return <div className="p-8 text-[#6B5F5F]">Lädt…</div>;

  return (
    <div className="p-8 md:p-12 max-w-3xl" data-testid="admin-settings">
      <h1 className="font-heading text-3xl">Site Settings</h1>
      <p className="text-sm text-[#6B5F5F] mt-2">
        Diese Angaben werden auf der gesamten Website (Header, Footer, Kontaktseite, WhatsApp-Link, SSR) verwendet.
      </p>

      <div className="mt-8 space-y-6">
        <Field label="Business Name" value={form.business_name} onChange={(v) => set("business_name", v)} testId="settings-business-name" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tagline (DE)" value={form.tagline_de} onChange={(v) => set("tagline_de", v)} testId="settings-tagline-de" />
          <Field label="Tagline (EN)" value={form.tagline_en} onChange={(v) => set("tagline_en", v)} testId="settings-tagline-en" />
        </div>

        <div className="border-t border-[#1A1414]/8 pt-6">
          <span className="overline text-[10px] block mb-3">Kontakt</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+49 40 …" testId="settings-phone" />
            <Field label="E-Mail" value={form.email} onChange={(v) => set("email", v)} type="email" testId="settings-email" />
            <Field label="WhatsApp (nur Ziffern)" value={form.whatsapp_number} onChange={(v) => set("whatsapp_number", v)} placeholder="+4940…" testId="settings-whatsapp" />
          </div>
          <p className="text-xs text-[#9B8F8F] mt-2">
            WhatsApp-Nummer ohne Leerzeichen. Wir bauen daraus den <code>wa.me/…</code>-Link.
          </p>
        </div>

        <div className="border-t border-[#1A1414]/8 pt-6">
          <span className="overline text-[10px] block mb-3">Öffnungszeiten / Business Hours</span>
          <Field label="DE" value={form.hours_de} onChange={(v) => set("hours_de", v)} testId="settings-hours-de" />
          <div className="mt-4">
            <Field label="EN" value={form.hours_en} onChange={(v) => set("hours_en", v)} testId="settings-hours-en" />
          </div>
        </div>

        <div className="border-t border-[#1A1414]/8 pt-6">
          <span className="overline text-[10px] block mb-3">Homepage-Hero-Bild</span>
          <p className="text-xs text-[#6B5F5F] mb-3">
            Das große Bild rechts neben der Überschrift auf der Startseite. Leer lassen, um automatisch das Titelbild des ersten Featured-Models zu verwenden. Empfohlen: 1200×1500&nbsp;px, Portrait, mind. 200&nbsp;KB.
          </p>
          <Field
            label="Bild-URL"
            value={form.homepage_hero_image || ""}
            onChange={(v) => set("homepage_hero_image", v)}
            placeholder="https://…jpg  (leer lassen → erstes Featured-Model)"
            testId="settings-hero-image"
          />
          {form.homepage_hero_image && (
            <div className="mt-4">
              <img
                src={form.homepage_hero_image}
                alt="Hero preview"
                className="max-w-xs rounded border border-[#1A1414]/15"
                data-testid="settings-hero-preview"
              />
            </div>
          )}
        </div>

        <div className="border-t border-[#1A1414]/8 pt-6">
          <span className="overline text-[10px] block mb-3">Escort-Hamburg-Seite — Hero-Bild</span>
          <p className="text-xs text-[#6B5F5F] mb-3">
            Das große Hintergrundbild auf der Seite <code>/escort-hamburg</code> (Hamburg-Skyline, hinter der „Escort Hamburg&ldquo;-Überschrift). Leer lassen, um das eingebaute Pexels-Standardbild zu verwenden. Empfohlen: <strong>2400×1000&nbsp;px Landscape-JPEG</strong>, mind. 300&nbsp;KB für Retina-Displays.
          </p>
          <Field
            label="Bild-URL"
            value={form.escort_hamburg_image || ""}
            onChange={(v) => set("escort_hamburg_image", v)}
            placeholder="https://…jpg  (leer lassen → Pexels-Standard)"
            testId="settings-escort-hamburg-image"
          />
          {form.escort_hamburg_image && (
            <div className="mt-4">
              <img
                src={form.escort_hamburg_image}
                alt="Escort Hamburg hero preview"
                className="max-w-md rounded border border-[#1A1414]/15"
                style={{ aspectRatio: "2400/1000", objectFit: "cover" }}
                data-testid="settings-escort-hamburg-preview"
              />
            </div>
          )}
        </div>

        <div className="border-t border-[#1A1414]/8 pt-6">
          <span className="overline text-[10px] block mb-3">Über-uns-Seite — Editorial-Bild</span>
          <p className="text-xs text-[#6B5F5F] mb-3">
            Das große Portrait-Bild rechts neben dem Text auf der Seite <code>/ueber-uns</code>. Leer lassen, um das eingebaute Pexels-Standardbild zu verwenden. Empfohlen: <strong>1200×1800&nbsp;px Portrait-JPEG</strong>, mind. 200&nbsp;KB.
          </p>
          <Field
            label="Bild-URL"
            value={form.about_image || ""}
            onChange={(v) => set("about_image", v)}
            placeholder="https://…jpg  (leer lassen → Pexels-Standard)"
            testId="settings-about-image"
          />
          {form.about_image && (
            <div className="mt-4">
              <img
                src={form.about_image}
                alt="About page preview"
                className="max-w-[240px] rounded border border-[#1A1414]/15"
                style={{ aspectRatio: "2/3", objectFit: "cover" }}
                data-testid="settings-about-preview"
              />
            </div>
          )}
        </div>

        <div className="border-t border-[#1A1414]/8 pt-6">
          <span className="overline text-[10px] block mb-3">Social-Share-Bild (WhatsApp · Facebook · iMessage)</span>
          <p className="text-xs text-[#6B5F5F] mb-3">
            Das Bild, das beim Teilen des Links in WhatsApp, Facebook oder iMessage angezeigt wird. Ideal: <strong>1200×630&nbsp;px Landscape-JPEG</strong>. Leer&nbsp;lassen → verwendet das Homepage-Hero-Bild.
            <br />
            <strong className="text-[#8B1538]">Wichtig:</strong> WhatsApp cached die Vorschau bis zu 30 Tage. Nach Änderung <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noreferrer" className="underline">Facebook Sharing Debugger</a> öffnen, URL eingeben, „Scrape Again“ klicken — dann greift die neue Vorschau sofort.
          </p>
          <Field
            label="Bild-URL"
            value={form.social_share_image || ""}
            onChange={(v) => set("social_share_image", v)}
            placeholder="https://…jpg  (leer lassen → Hero-Bild)"
            testId="settings-social-image"
          />
          {form.social_share_image && (
            <div className="mt-4">
              <img
                src={form.social_share_image}
                alt="Social share preview"
                className="max-w-md rounded border border-[#1A1414]/15"
                style={{ aspectRatio: "1200/630", objectFit: "cover" }}
                data-testid="settings-social-preview"
              />
            </div>
          )}
        </div>

        <div className="border-t border-[#1A1414]/8 pt-6">
          <span className="overline text-[10px] block mb-3">Social (optional)</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Instagram URL" value={form.instagram_url} onChange={(v) => set("instagram_url", v)} placeholder="https://instagram.com/…" testId="settings-instagram" />
            <Field label="Facebook URL" value={form.facebook_url} onChange={(v) => set("facebook_url", v)} placeholder="https://facebook.com/…" testId="settings-facebook" />
            <Field label="X / Twitter URL" value={form.twitter_url} onChange={(v) => set("twitter_url", v)} placeholder="https://x.com/…" testId="settings-twitter" />
          </div>
        </div>

        <div className="pt-6 border-t border-[#1A1414]/8">
          <button
            onClick={save}
            disabled={busy}
            className="btn-primary disabled:opacity-40"
            data-testid="settings-save-btn"
          >
            {busy ? "Speichert…" : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", testId }) {
  return (
    <label className="block">
      <span className="overline text-[10px] block mb-1.5">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border border-[#1A1414]/15 outline-none focus:border-[#8B1538] p-2.5 text-sm"
        data-testid={testId}
      />
    </label>
  );
}
