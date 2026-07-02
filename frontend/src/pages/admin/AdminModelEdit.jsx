import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { SERVICES, LOCATIONS } from "@/data/site";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const empty = {
  name: "", age: 25, bio: "", short_tagline: "",
  bio_en: "", short_tagline_en: "",
  height_cm: 170, languages: ["Deutsch", "Englisch"],
  services: [], locations: [],
  hair_color: "", eye_color: "", dress_size: "", measurements: "",
  cover_image: "", gallery: [],
  available: true, featured: false, nationality: "Deutsch",
  interests: [],
  prices: [],  // [{label, amount, currency, unit}]
  meta_title: "", meta_description: "",
  meta_title_en: "", meta_description_en: "",
};

export default function AdminModelEdit() {
  const { slug } = useParams();
  const isNew = !slug;
  const nav = useNavigate();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.get(`/models/${slug}`).then((r) => {
        setForm({ ...empty, ...r.data });
      });
    }
  }, [slug, isNew]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleArr = (k, val) => {
    setForm((f) => {
      const arr = new Set(f[k] || []);
      if (arr.has(val)) arr.delete(val);
      else arr.add(val);
      return { ...f, [k]: Array.from(arr) };
    });
  };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    return process.env.REACT_APP_BACKEND_URL + data.url;
  };

  const onCoverChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const url = await uploadFile(f);
      set("cover_image", url);
      toast.success("Cover hochgeladen");
    } catch { toast.error("Upload fehlgeschlagen"); }
  };

  const onGalleryAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      try {
        const url = await uploadFile(f);
        set("gallery", [...(form.gallery || []), url]);
      } catch { toast.error("Upload fehlgeschlagen"); }
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      age: parseInt(form.age) || 0,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      languages: typeof form.languages === "string" ? form.languages.split(",").map((s) => s.trim()).filter(Boolean) : form.languages,
      interests: typeof form.interests === "string" ? form.interests.split(",").map((s) => s.trim()).filter(Boolean) : form.interests,
    };
    try {
      if (isNew) {
        await api.post("/models", payload);
        toast.success("Model erstellt");
      } else {
        await api.put(`/models/${slug}`, payload);
        toast.success("Gespeichert");
      }
      nav("/admin/models");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-12 max-w-5xl" data-testid="admin-model-edit">
      <button onClick={() => nav("/admin/models")} className="flex items-center gap-2 text-sm text-[#6B5F5F] hover:text-[#1A1414] mb-8">
        <ArrowLeft size={14} /> Zurück
      </button>
      <span className="overline">Model</span>
      <h1 className="font-heading text-4xl mt-3 mb-12">{isNew ? "Neues Model" : `${form.name} bearbeiten`}</h1>

      <form onSubmit={save} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Name" value={form.name} onChange={(v) => set("name", v)} required />
          <Input label="Tagline" value={form.short_tagline} onChange={(v) => set("short_tagline", v)} />
          <Input label="Alter" type="number" value={form.age} onChange={(v) => set("age", v)} />
          <Input label="Nationalität" value={form.nationality} onChange={(v) => set("nationality", v)} />
          <Input label="Größe (cm)" type="number" value={form.height_cm} onChange={(v) => set("height_cm", v)} />
          <Input label="Konfektionsgröße" value={form.dress_size} onChange={(v) => set("dress_size", v)} />
          <Input label="Maße" value={form.measurements} onChange={(v) => set("measurements", v)} />
          <Input label="Haarfarbe" value={form.hair_color} onChange={(v) => set("hair_color", v)} />
          <Input label="Augenfarbe" value={form.eye_color} onChange={(v) => set("eye_color", v)} />
          <Input label="Sprachen (komma-getrennt)" value={Array.isArray(form.languages) ? form.languages.join(", ") : form.languages} onChange={(v) => set("languages", v)} />
          <Input label="Interessen (komma-getrennt)" value={Array.isArray(form.interests) ? form.interests.join(", ") : form.interests} onChange={(v) => set("interests", v)} />
        </div>

        <div>
          <label className="overline text-[10px] block mb-2">Biografie (Deutsch)</label>
          <textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={8}
            className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-4 font-light"
            required
            data-testid="model-bio-de"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="overline text-[10px]">Biografie (English)</label>
            {!form.bio_en && (
              <span className="text-[10px] uppercase tracking-widest text-[#8B1538]/80">
                ⚑ EN translation needed
              </span>
            )}
          </div>
          <textarea
            value={form.bio_en}
            onChange={(e) => set("bio_en", e.target.value)}
            rows={8}
            placeholder="Leave empty to fall back to German bio with an inline EN-preview notice"
            className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-4 font-light"
            data-testid="model-bio-en"
          />
          <p className="mt-2 text-xs text-[#6B5F5F]">
            Optional. When filled, the public <code>/en/models/&lt;slug&gt;</code> page renders this
            English bio and drops the &ldquo;EN preview&rdquo; banner for this record.
          </p>
        </div>

        <div>
          <label className="overline text-[10px] block mb-2">Tagline (English)</label>
          <input
            type="text"
            value={form.short_tagline_en ?? ""}
            onChange={(e) => set("short_tagline_en", e.target.value)}
            placeholder="e.g. Elegance with classical education"
            className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-3 font-light"
            data-testid="model-tagline-en"
          />
        </div>

        {/* ---- Tarife / Prices ---- */}
        <div className="border border-[#1A1414]/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="overline text-[10px]">Tarife / Pricing</label>
            <button
              type="button"
              onClick={() => set("prices", [...(form.prices || []), { label: "", amount: 0, currency: "EUR", unit: "hour" }])}
              className="text-xs uppercase tracking-widest text-[#8B1538] hover:underline"
              data-testid="add-price-row"
            >
              + Tarif hinzufügen
            </button>
          </div>
          <p className="text-xs text-[#6B5F5F] mb-4">
            Optional. Beispiel: <em>2 Stunden · 800 EUR</em>, <em>Dinner Date (4h) · 1500 EUR</em>, <em>Overnight · 2500 EUR</em>.
            Der niedrigste Eintrag wird als &ldquo;ab X EUR&rdquo; auf der Übersichtskarte angezeigt. Leere Liste = kein Preis sichtbar.
          </p>
          {(form.prices || []).length === 0 && (
            <p className="text-sm text-[#6B5F5F]/60 italic">Noch keine Tarife.</p>
          )}
          {(form.prices || []).map((p, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center" data-testid={`price-row-${i}`}>
              <input
                type="text"
                placeholder="Label (z.B. 2 Stunden)"
                value={p.label}
                onChange={(e) => {
                  const next = [...form.prices];
                  next[i] = { ...next[i], label: e.target.value };
                  set("prices", next);
                }}
                className="col-span-4 bg-transparent border border-[#1A1414]/15 outline-none p-2 text-sm"
                data-testid={`price-label-${i}`}
              />
              <input
                type="number"
                min="0"
                placeholder="Betrag"
                value={p.amount}
                onChange={(e) => {
                  const next = [...form.prices];
                  next[i] = { ...next[i], amount: parseInt(e.target.value, 10) || 0 };
                  set("prices", next);
                }}
                className="col-span-2 bg-transparent border border-[#1A1414]/15 outline-none p-2 text-sm text-right"
                data-testid={`price-amount-${i}`}
              />
              <select
                value={p.currency}
                onChange={(e) => {
                  const next = [...form.prices];
                  next[i] = { ...next[i], currency: e.target.value };
                  set("prices", next);
                }}
                className="col-span-2 bg-transparent border border-[#1A1414]/15 outline-none p-2 text-sm"
                data-testid={`price-currency-${i}`}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="CHF">CHF</option>
                <option value="GBP">GBP</option>
              </select>
              <select
                value={p.unit || "hour"}
                onChange={(e) => {
                  const next = [...form.prices];
                  next[i] = { ...next[i], unit: e.target.value };
                  set("prices", next);
                }}
                className="col-span-3 bg-transparent border border-[#1A1414]/15 outline-none p-2 text-sm"
                data-testid={`price-unit-${i}`}
                title="Einheit (wird hinter dem Betrag angezeigt)"
              >
                <option value="hour">pro Stunde</option>
                <option value="flat">Pauschal (ohne Zusatz)</option>
                <option value="night">pro Nacht</option>
                <option value="day">pro Tag</option>
                <option value="weekend">Wochenende</option>
              </select>
              <button
                type="button"
                onClick={() => set("prices", form.prices.filter((_, j) => j !== i))}
                className="col-span-1 text-[#8B1538] hover:text-[#a01a45] text-sm"
                title="Tarif entfernen"
                data-testid={`remove-price-${i}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="overline text-[10px] block mb-2">Cover-Bild</label>
          <input type="file" accept="image/*" onChange={onCoverChange} className="text-sm text-[#6B5F5F]" />
          {form.cover_image && <img src={form.cover_image} alt="cover" className="mt-3 h-48 object-cover" />}
          <input
            type="text" value={form.cover_image}
            onChange={(e) => set("cover_image", e.target.value)}
            placeholder="oder URL einfügen"
            className="mt-2 w-full bg-transparent border border-[#1A1414]/15 p-2 text-sm"
          />
        </div>

        <div>
          <label className="overline text-[10px] block mb-2">Galerie</label>
          <input type="file" accept="image/*" multiple onChange={onGalleryAdd} className="text-sm text-[#6B5F5F]" />
          <div className="grid grid-cols-4 gap-3 mt-3">
            {(form.gallery || []).map((img, i) => (
              <div key={img} className="relative group">
                <img src={img} alt="g" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set("gallery", form.gallery.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-black/70 px-2 py-1 text-xs opacity-0 group-hover:opacity-100"
                >×</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="overline text-[10px] block mb-3">Services</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button
                key={s.slug} type="button"
                onClick={() => toggleArr("services", s.slug)}
                className={`text-xs uppercase tracking-[0.15em] py-2 px-3 border ${form.services?.includes(s.slug) ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F]"}`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="overline text-[10px] block mb-3">Standorte</label>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((l) => (
              <button
                key={l.slug} type="button"
                onClick={() => toggleArr("locations", l.slug)}
                className={`text-xs uppercase tracking-[0.15em] py-2 px-3 border ${form.locations?.includes(l.slug) ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F]"}`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.available} onChange={(e) => set("available", e.target.checked)} /> Verfügbar
          </label>
        </div>

        {/* ---- SEO Meta Overrides ---- */}
        <details className="border border-[#1A1414]/10 rounded" data-testid="model-seo-panel">
          <summary className="cursor-pointer px-4 py-3 text-sm uppercase tracking-[0.15em] text-[#6B5F5F] hover:bg-[#FBF7F4]">
            SEO — Titel & Meta-Beschreibung (optional)
          </summary>
          <div className="p-4 space-y-4 border-t border-[#1A1414]/10">
            <p className="text-xs text-[#9B8F8F]">
              Leer lassen, um die automatisch generierten Werte aus Name + Kurzbio zu verwenden. Ideale Länge: Titel ≤ 60 Zeichen, Beschreibung 140–160 Zeichen.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="overline text-[10px] block mb-2">Meta Titel (DE)</label>
                <input
                  type="text"
                  value={form.meta_title || ""}
                  onChange={(e) => set("meta_title", e.target.value)}
                  className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm"
                  data-testid="model-meta-title-de"
                />
                <p className="text-[10px] text-[#9B8F8F] mt-1">{(form.meta_title || "").length}/60</p>
              </div>
              <div>
                <label className="overline text-[10px] block mb-2">Meta Titel (EN)</label>
                <input
                  type="text"
                  value={form.meta_title_en || ""}
                  onChange={(e) => set("meta_title_en", e.target.value)}
                  className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm"
                  data-testid="model-meta-title-en"
                />
                <p className="text-[10px] text-[#9B8F8F] mt-1">{(form.meta_title_en || "").length}/60</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="overline text-[10px] block mb-2">Meta Beschreibung (DE)</label>
                <textarea
                  value={form.meta_description || ""}
                  onChange={(e) => set("meta_description", e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm"
                  data-testid="model-meta-desc-de"
                />
                <p className="text-[10px] text-[#9B8F8F] mt-1">{(form.meta_description || "").length}/160</p>
              </div>
              <div>
                <label className="overline text-[10px] block mb-2">Meta Beschreibung (EN)</label>
                <textarea
                  value={form.meta_description_en || ""}
                  onChange={(e) => set("meta_description_en", e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm"
                  data-testid="model-meta-desc-en"
                />
                <p className="text-[10px] text-[#9B8F8F] mt-1">{(form.meta_description_en || "").length}/160</p>
              </div>
            </div>
          </div>
        </details>

        <div className="pt-6 border-t border-[#1A1414]/8">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50" data-testid="admin-model-save">
            {busy ? "Speichert…" : "Speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="overline text-[10px] block mb-2">{label}</label>
      <input
        type={type} required={required}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-3 font-light"
      />
    </div>
  );
}
