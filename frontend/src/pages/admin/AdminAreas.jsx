import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Save, RotateCw } from "lucide-react";
import { api } from "@/lib/api";
import { SvcField, SvcTwoField, ListEditor, FaqsEditor } from "./AdminServices";

/**
 * Admin — full SEO/editorial CMS for the 18 Hamburg area pages.
 * Uses the same shared editors as AdminServices (imported).
 */
export default function AdminAreas() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => {
    api.get("/area-content").then((r) => setItems(r.data.sort((a, b) => a.name.localeCompare(b.name)))).catch(() => toast.error("Fehler beim Laden"));
  };
  useEffect(load, []);

  const patch = (slug, patchObj) => setItems((xs) => xs.map((x) => (x.slug === slug ? { ...x, ...patchObj } : x)));

  const save = async (area) => {
    setBusy(area.slug);
    try {
      const { slug, ...payload } = area;
      const { data } = await api.put(`/area-content/${slug}`, payload);
      patch(slug, data);
      toast.success(`${area.name} gespeichert`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Fehler beim Speichern");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl" data-testid="admin-areas">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl">Stadtteile — SEO Content</h1>
          <p className="text-sm text-[#6B5F5F] mt-2 max-w-3xl">
            Bearbeiten Sie Meta-Tags, Intro-Texte, Beschreibungen und FAQs für jede Hamburg-Area. FAQ-Textbausteine mit <code>{`{name}`}</code>
            werden zur Laufzeit durch den Namen des Stadtteils ersetzt.
          </p>
        </div>
        <button onClick={load} className="text-xs uppercase tracking-[0.15em] py-2 px-4 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538] flex items-center gap-2" data-testid="admin-areas-reload">
          <RotateCw size={12} /> Neu laden
        </button>
      </div>

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.slug} className="border border-[#1A1414]/10 rounded-lg bg-white" data-testid={`admin-area-card-${a.slug}`}>
            <button
              onClick={() => setOpen(open === a.slug ? null : a.slug)}
              className="w-full flex items-center justify-between p-4 md:p-5 gap-4 hover:bg-[#FBF7F4]"
              data-testid={`admin-area-toggle-${a.slug}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {a.image && <img src={a.image} alt={a.image_alt || a.name} className="w-14 h-14 object-cover rounded" />}
                <div className="text-left min-w-0">
                  <div className="font-heading text-lg text-[#1A1414] truncate">{a.name}</div>
                  <div className="text-xs text-[#9B8F8F] font-mono truncate">/escort/{a.slug}</div>
                </div>
              </div>
              <ChevronDown size={16} className={`transition-transform ${open === a.slug ? "rotate-180" : ""}`} />
            </button>
            {open === a.slug && (
              <div className="p-5 md:p-6 border-t border-[#1A1414]/10 space-y-5" data-testid={`admin-area-edit-${a.slug}`}>
                <SvcField label="Name" v={a.name} onChange={(v) => patch(a.slug, { name: v })} testid={`area-${a.slug}-name`} />
                <SvcField label="Seitentitel (H1)" v={a.title} onChange={(v) => patch(a.slug, { title: v })} testid={`area-${a.slug}-title`} />

                <SvcTwoField label="Intro (DE / EN)" v={a.intro} vEn={a.intro_en}
                  onDe={(v) => patch(a.slug, { intro: v })} onEn={(v) => patch(a.slug, { intro_en: v })}
                  textarea testid={`area-${a.slug}-intro`} />

                <SvcTwoField label="Meta Titel (DE / EN)" v={a.meta_title} vEn={a.meta_title_en}
                  onDe={(v) => patch(a.slug, { meta_title: v })} onEn={(v) => patch(a.slug, { meta_title_en: v })}
                  testid={`area-${a.slug}-metatitle`} />

                <SvcTwoField label="Meta Beschreibung (DE / EN)" v={a.meta_description} vEn={a.meta_description_en}
                  onDe={(v) => patch(a.slug, { meta_description: v })} onEn={(v) => patch(a.slug, { meta_description_en: v })}
                  textarea testid={`area-${a.slug}-metadesc`} />

                <SvcTwoField label="Beschreibung (DE / EN)" v={a.description} vEn={a.description_en}
                  onDe={(v) => patch(a.slug, { description: v })} onEn={(v) => patch(a.slug, { description_en: v })}
                  textarea rows={4} testid={`area-${a.slug}-desc`} />

                <div className="grid md:grid-cols-2 gap-4">
                  <ListEditor label="Zusätzliche Absätze (DE)" items={a.body_extra || []}
                    onChange={(arr) => patch(a.slug, { body_extra: arr })} testid={`area-${a.slug}-extra-de`} />
                  <ListEditor label="Zusätzliche Absätze (EN)" items={a.body_extra_en || []}
                    onChange={(arr) => patch(a.slug, { body_extra_en: arr })} testid={`area-${a.slug}-extra-en`} />
                </div>

                <ListEditor label="Landmarks" items={a.landmarks || []}
                  onChange={(arr) => patch(a.slug, { landmarks: arr })} testid={`area-${a.slug}-landmarks`} />

                <div className="grid md:grid-cols-2 gap-4">
                  <SvcField label="Bild-URL" v={a.image} onChange={(v) => patch(a.slug, { image: v })} testid={`area-${a.slug}-img`} />
                  <SvcTwoField label="Bild ALT (DE / EN)" v={a.image_alt} vEn={a.image_alt_en}
                    onDe={(v) => patch(a.slug, { image_alt: v })} onEn={(v) => patch(a.slug, { image_alt_en: v })}
                    testid={`area-${a.slug}-imgalt`} />
                </div>

                <FaqsEditor faqs={a.faqs || []} onChange={(arr) => patch(a.slug, { faqs: arr })} testid={`area-${a.slug}-faqs`} />

                <div className="pt-4 border-t border-[#1A1414]/10 flex justify-end">
                  <button
                    onClick={() => save(a)}
                    disabled={busy === a.slug}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    data-testid={`area-${a.slug}-save`}
                  >
                    <Save size={14} /> {busy === a.slug ? "Speichert…" : "Speichern"}
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
