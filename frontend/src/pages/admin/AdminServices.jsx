import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Save, Plus, Trash2, RotateCw } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Admin — full SEO/editorial CMS for the 8 service pages.
 *
 * Each service is a collapsible card. Inside: every field that shows up on
 * /services/{slug} — meta title/description (DE+EN), H1, tagline, description,
 * long copy, keypoints, image + ALT text, editorial H2 sections (add/remove),
 * FAQs (add/remove), related-service links.
 *
 * Slug is intentionally NOT editable — the 8 slugs are structural (nav,
 * routes, sitemap, JSON-LD provider fields).
 */
export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null); // slug currently expanded
  const [busy, setBusy] = useState(null); // slug currently saving

  const load = () => {
    api.get("/service-content").then((r) => setItems(r.data.sort((a, b) => a.slug.localeCompare(b.slug)))).catch(() => toast.error("Fehler beim Laden"));
  };
  useEffect(load, []);

  const patch = (slug, patchObj) => setItems((xs) => xs.map((x) => (x.slug === slug ? { ...x, ...patchObj } : x)));

  const save = async (svc) => {
    setBusy(svc.slug);
    try {
      const { slug, ...payload } = svc;
      const { data } = await api.put(`/service-content/${slug}`, payload);
      patch(slug, data);
      toast.success(`${svc.title} gespeichert`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Fehler beim Speichern");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl" data-testid="admin-services">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl">Services — SEO Content</h1>
          <p className="text-sm text-[#6B5F5F] mt-2 max-w-3xl">
            Bearbeiten Sie Meta-Tags, H1, Editorials und FAQs für jede Service-Seite. Änderungen wirken sofort im Frontend nach dem Speichern.
            Die URL (Slug) ist strukturell fixiert und kann nicht geändert werden.
          </p>
        </div>
        <button onClick={load} className="text-xs uppercase tracking-[0.15em] py-2 px-4 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538] flex items-center gap-2" data-testid="admin-services-reload">
          <RotateCw size={12} /> Neu laden
        </button>
      </div>

      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.slug} className="border border-[#1A1414]/10 rounded-lg bg-white" data-testid={`admin-svc-card-${s.slug}`}>
            <button
              onClick={() => setOpen(open === s.slug ? null : s.slug)}
              className="w-full flex items-center justify-between p-4 md:p-5 gap-4 hover:bg-[#FBF7F4]"
              data-testid={`admin-svc-toggle-${s.slug}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {(s.image) && <img src={s.image} alt={s.image_alt || s.title} className="w-14 h-14 object-cover rounded" />}
                <div className="text-left min-w-0">
                  <div className="font-heading text-lg text-[#1A1414] truncate">{s.title}</div>
                  <div className="text-xs text-[#9B8F8F] font-mono truncate">/services/{s.slug}</div>
                </div>
              </div>
              <ChevronDown size={16} className={`transition-transform ${open === s.slug ? "rotate-180" : ""}`} />
            </button>
            {open === s.slug && (
              <div className="p-5 md:p-6 border-t border-[#1A1414]/10 space-y-5" data-testid={`admin-svc-edit-${s.slug}`}>
                <SvcTwoField label="Titel (DE / EN)" v={s.title} vEn={s.short_label || ""}
                  onDe={(v) => patch(s.slug, { title: v })} onEn={(v) => patch(s.slug, { short_label: v })}
                  labelEn="Short Label" testid={`svc-${s.slug}-title`} />

                <SvcField label="H1" v={s.h1} onChange={(v) => patch(s.slug, { h1: v })} testid={`svc-${s.slug}-h1`} />

                <SvcTwoField label="Tagline (DE / EN)" v={s.tagline} vEn={s.tagline_en}
                  onDe={(v) => patch(s.slug, { tagline: v })} onEn={(v) => patch(s.slug, { tagline_en: v })}
                  testid={`svc-${s.slug}-tagline`} />

                <SvcTwoField label="Meta Titel (DE / EN)" v={s.meta_title} vEn={s.meta_title_en}
                  onDe={(v) => patch(s.slug, { meta_title: v })} onEn={(v) => patch(s.slug, { meta_title_en: v })}
                  testid={`svc-${s.slug}-metatitle`} />

                <SvcTwoField label="Meta Beschreibung (DE / EN)" v={s.meta_description} vEn={s.meta_description_en}
                  onDe={(v) => patch(s.slug, { meta_description: v })} onEn={(v) => patch(s.slug, { meta_description_en: v })}
                  textarea testid={`svc-${s.slug}-metadesc`} />

                <SvcTwoField label="Kurzbeschreibung (DE / EN)" v={s.description} vEn={s.description_en}
                  onDe={(v) => patch(s.slug, { description: v })} onEn={(v) => patch(s.slug, { description_en: v })}
                  textarea testid={`svc-${s.slug}-desc`} />

                <SvcTwoField label="Long Copy — Fließtext (DE / EN)" v={s.long_copy} vEn={s.long_copy_en}
                  onDe={(v) => patch(s.slug, { long_copy: v })} onEn={(v) => patch(s.slug, { long_copy_en: v })}
                  textarea rows={6} testid={`svc-${s.slug}-longcopy`} />

                <div className="grid md:grid-cols-2 gap-4">
                  <ListEditor label="Charakteristika (DE)" items={s.keypoints || []}
                    onChange={(arr) => patch(s.slug, { keypoints: arr })} testid={`svc-${s.slug}-kp-de`} />
                  <ListEditor label="Charakteristika (EN)" items={s.keypoints_en || []}
                    onChange={(arr) => patch(s.slug, { keypoints_en: arr })} testid={`svc-${s.slug}-kp-en`} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <SvcField label="Bild-URL" v={s.image} onChange={(v) => patch(s.slug, { image: v })} testid={`svc-${s.slug}-img`} />
                  <SvcTwoField label="Bild ALT (DE / EN)" v={s.image_alt} vEn={s.image_alt_en}
                    onDe={(v) => patch(s.slug, { image_alt: v })} onEn={(v) => patch(s.slug, { image_alt_en: v })}
                    testid={`svc-${s.slug}-imgalt`} />
                </div>

                <SectionsEditor sections={s.sections || []} onChange={(arr) => patch(s.slug, { sections: arr })} testid={`svc-${s.slug}-sections`} />
                <FaqsEditor faqs={s.faqs || []} onChange={(arr) => patch(s.slug, { faqs: arr })} testid={`svc-${s.slug}-faqs`} />
                <RelatedEditor items={s.related_services || []} onChange={(arr) => patch(s.slug, { related_services: arr })} testid={`svc-${s.slug}-related`} />

                <div className="pt-4 border-t border-[#1A1414]/10 flex justify-end">
                  <button
                    onClick={() => save(s)}
                    disabled={busy === s.slug}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    data-testid={`svc-${s.slug}-save`}
                  >
                    <Save size={14} /> {busy === s.slug ? "Speichert…" : "Speichern"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Small inline editors used by both services + areas ---------- */

export function SvcField({ label, v, onChange, testid, textarea, rows = 2 }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.12em] text-[#6B5F5F]">{label}</span>
      {textarea ? (
        <textarea
          value={v || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="mt-1.5 w-full border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2.5 text-sm font-light bg-white rounded"
          data-testid={testid}
        />
      ) : (
        <input
          type="text"
          value={v || ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2.5 text-sm font-light bg-white rounded"
          data-testid={testid}
        />
      )}
    </label>
  );
}

export function SvcTwoField({ label, v, vEn, onDe, onEn, textarea, rows = 2, testid, labelEn }) {
  const Widget = textarea ? "textarea" : "input";
  const commonProps = { className: "mt-1.5 w-full border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2.5 text-sm font-light bg-white rounded" };
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <label className="block">
        <span className="text-xs uppercase tracking-[0.12em] text-[#6B5F5F]">{label.split(" / ")[0] || label}</span>
        <Widget {...commonProps} value={v || ""} onChange={(e) => onDe(e.target.value)} rows={rows} data-testid={`${testid}-de`} />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-[0.12em] text-[#6B5F5F]">{labelEn || label.split(" / ")[1] || "EN"}</span>
        <Widget {...commonProps} value={vEn || ""} onChange={(e) => onEn(e.target.value)} rows={rows} data-testid={`${testid}-en`} />
      </label>
    </div>
  );
}

export function ListEditor({ label, items, onChange, testid }) {
  const setAt = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.12em] text-[#6B5F5F]">{label}</span>
        <button type="button" onClick={add} className="text-xs text-[#8B1538] hover:underline flex items-center gap-1" data-testid={`${testid}-add`}>
          <Plus size={12} /> Zeile
        </button>
      </div>
      <div className="mt-2 space-y-1.5">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={v || ""} onChange={(e) => setAt(i, e.target.value)}
              className="flex-1 border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm bg-white rounded"
              data-testid={`${testid}-row-${i}`} />
            <button type="button" onClick={() => remove(i)} className="text-[#8B1538] p-1 hover:bg-[#F4E4E4] rounded" data-testid={`${testid}-remove-${i}`}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionsEditor({ sections, onChange, testid }) {
  const setAt = (i, obj) => onChange(sections.map((s, idx) => (idx === i ? { ...s, ...obj } : s)));
  const setBodyAt = (i, key, arr) => setAt(i, { [key]: arr });
  const add = () => onChange([...sections, { h2: "", h2_en: "", body: [""], body_en: [""] }]);
  const remove = (i) => onChange(sections.filter((_, idx) => idx !== i));

  return (
    <div className="border border-[#1A1414]/10 rounded-lg p-4 bg-[#FBF7F4]/40">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-[0.15em] text-[#1A1414] font-semibold">H2 Sektionen ({sections.length})</span>
        <button type="button" onClick={add} className="text-xs text-[#8B1538] hover:underline flex items-center gap-1" data-testid={`${testid}-add`}>
          <Plus size={12} /> Neue Sektion
        </button>
      </div>
      <div className="space-y-3">
        {sections.map((sec, i) => (
          <div key={i} className="p-3 border border-[#1A1414]/10 rounded bg-white space-y-2" data-testid={`${testid}-item-${i}`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase text-[#9B8F8F]">Sektion #{i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="text-[#8B1538] text-xs" data-testid={`${testid}-remove-${i}`}>
                <Trash2 size={12} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <input value={sec.h2 || ""} onChange={(e) => setAt(i, { h2: e.target.value })}
                placeholder="H2 (DE)" className="border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm rounded" />
              <input value={sec.h2_en || ""} onChange={(e) => setAt(i, { h2_en: e.target.value })}
                placeholder="H2 (EN)" className="border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm rounded" />
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <ListEditor label="Absätze DE" items={sec.body || []} onChange={(arr) => setBodyAt(i, "body", arr)} testid={`${testid}-body-${i}-de`} />
              <ListEditor label="Absätze EN" items={sec.body_en || []} onChange={(arr) => setBodyAt(i, "body_en", arr)} testid={`${testid}-body-${i}-en`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FaqsEditor({ faqs, onChange, testid }) {
  const setAt = (i, obj) => onChange(faqs.map((f, idx) => (idx === i ? { ...f, ...obj } : f)));
  const add = () => onChange([...faqs, { q: "", q_en: "", a: "", a_en: "" }]);
  const remove = (i) => onChange(faqs.filter((_, idx) => idx !== i));
  return (
    <div className="border border-[#1A1414]/10 rounded-lg p-4 bg-[#FBF7F4]/40">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-[0.15em] text-[#1A1414] font-semibold">FAQ ({faqs.length})</span>
        <button type="button" onClick={add} className="text-xs text-[#8B1538] hover:underline flex items-center gap-1" data-testid={`${testid}-add`}>
          <Plus size={12} /> Neue Frage
        </button>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="p-3 border border-[#1A1414]/10 rounded bg-white space-y-2" data-testid={`${testid}-item-${i}`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase text-[#9B8F8F]">Frage #{i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="text-[#8B1538] text-xs" data-testid={`${testid}-remove-${i}`}>
                <Trash2 size={12} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <input value={f.q || ""} onChange={(e) => setAt(i, { q: e.target.value })}
                placeholder="Frage (DE)" className="border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm rounded" />
              <input value={f.q_en || ""} onChange={(e) => setAt(i, { q_en: e.target.value })}
                placeholder="Question (EN)" className="border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm rounded" />
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <textarea value={f.a || ""} onChange={(e) => setAt(i, { a: e.target.value })}
                placeholder="Antwort (DE)" rows={2} className="border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm rounded" />
              <textarea value={f.a_en || ""} onChange={(e) => setAt(i, { a_en: e.target.value })}
                placeholder="Answer (EN)" rows={2} className="border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2 text-sm rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RelatedEditor({ items, onChange, testid }) {
  return (
    <ListEditor label="Verwandte Services (Slugs)" items={items} onChange={onChange} testid={testid} />
  );
}
