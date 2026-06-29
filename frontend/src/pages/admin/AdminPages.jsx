import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { SERVICES, LOCATIONS } from "@/data/site";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowLeft, ExternalLink } from "lucide-react";

export function AdminPages() {
  const [pages, setPages] = useState([]);
  const load = useCallback(() => api.get("/pages?include_drafts=true").then((r) => setPages(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const del = async (slug) => {
    if (!confirm("Seite löschen?")) return;
    await api.delete(`/pages/${slug}`);
    toast.success("Gelöscht");
    load();
  };

  return (
    <div className="p-12" data-testid="admin-pages">
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-3">Landing Pages</h1>
          <p className="text-sm text-[#6B5F5F] mt-2 max-w-xl">
            Eigene Landingpages für SEO-Kampagnen, neue Stadtteile oder saisonale Aktionen — vollständig redaktionell pflegbar, automatisch in Sitemap.
          </p>
        </div>
        <Link to="/admin/pages/new" className="btn-primary"><Plus size={14} /> Neue Seite</Link>
      </div>

      <div className="border border-[#1A1414]/8 bg-[#FBF7F4]">
        {pages.map((p) => (
          <div key={p.id} className="flex items-center gap-6 p-4 border-b border-[#1A1414]/8 hover:bg-white" data-testid={`admin-page-row-${p.slug}`}>
            <div className="flex-1">
              <div className="font-heading text-xl">{p.title}</div>
              <div className="text-xs text-[#6B5F5F] mt-1 font-mono">/p/{p.slug} · {p.published ? "Veröffentlicht" : "Entwurf"}</div>
            </div>
            <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 hover:accent-text" title="Vorschau"><ExternalLink size={16} /></a>
            <Link to={`/admin/pages/edit/${p.slug}`} className="p-2 hover:accent-text"><Pencil size={16} /></Link>
            <button onClick={() => del(p.slug)} className="p-2 hover:text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
        {pages.length === 0 && (
          <div className="p-12 text-center text-[#6B5F5F]">
            Noch keine Landingpages. Erstellen Sie z.B. &bdquo;Escort Lübeck Wochenende&ldquo; oder &bdquo;Last Minute Hamburg&ldquo;.
          </div>
        )}
      </div>
    </div>
  );
}

const emptyPage = {
  title: "", h1: "", intro: "", content: "",
  hero_image: "", meta_title: "", meta_description: "",
  related_services: [], related_locations: [], published: true,
};

export function AdminPageEdit() {
  const { slug } = useParams();
  const isNew = !slug;
  const nav = useNavigate();
  const [form, setForm] = useState(emptyPage);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isNew) api.get(`/pages/${slug}`).then((r) => setForm({ ...emptyPage, ...r.data })).catch(() => {});
  }, [slug, isNew]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setForm((f) => {
    const arr = new Set(f[k] || []);
    arr.has(v) ? arr.delete(v) : arr.add(v);
    return { ...f, [k]: Array.from(arr) };
  });

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("hero_image", process.env.REACT_APP_BACKEND_URL + data.url);
      toast.success("Hero hochgeladen");
    } catch { toast.error("Upload fehlgeschlagen"); }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isNew) await api.post("/pages", form);
      else await api.put(`/pages/${slug}`, form);
      toast.success("Gespeichert");
      nav("/admin/pages");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Fehler");
    } finally { setBusy(false); }
  };

  return (
    <div className="p-12 max-w-5xl" data-testid="admin-page-edit">
      <button onClick={() => nav("/admin/pages")} className="flex items-center gap-2 text-sm text-[#6B5F5F] mb-8"><ArrowLeft size={14} /> Zurück</button>
      <span className="overline">Landing Page</span>
      <h1 className="font-heading text-4xl mt-3 mb-12">{isNew ? "Neue Landingpage" : "Seite bearbeiten"}</h1>

      <form onSubmit={save} className="space-y-6">
        <Field label="Titel" value={form.title} onChange={(v) => set("title", v)} required />
        <Field label="H1 (sichtbare Hauptüberschrift)" value={form.h1} onChange={(v) => set("h1", v)} />
        <Field label="Intro (kurze Einleitung im Hero)" value={form.intro} onChange={(v) => set("intro", v)} />

        <div>
          <label className="overline text-[10px] block mb-2">Inhalt (HTML)</label>
          <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={15} required
                    className="w-full bg-white border border-[#1A1414]/15 outline-none focus:border-[#8B1538] p-3 font-mono text-sm" />
        </div>

        <div>
          <label className="overline text-[10px] block mb-2">Hero-Bild</label>
          <input type="file" accept="image/*" onChange={onUpload} className="text-sm text-[#6B5F5F]" />
          {form.hero_image && <img src={form.hero_image} alt="hero" className="mt-3 h-48 object-cover" />}
          <input type="text" value={form.hero_image} onChange={(e) => set("hero_image", e.target.value)} placeholder="oder URL" className="mt-2 w-full bg-white border border-[#1A1414]/15 p-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Field label="SEO Meta Titel" value={form.meta_title} onChange={(v) => set("meta_title", v)} />
          <Field label="SEO Meta Beschreibung" value={form.meta_description} onChange={(v) => set("meta_description", v)} />
        </div>

        <div>
          <label className="overline text-[10px] block mb-3">Verwandte Services</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button key={s.slug} type="button" onClick={() => toggleArr("related_services", s.slug)}
                      className={`text-xs uppercase tracking-wider py-2 px-3 border ${form.related_services?.includes(s.slug) ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F]"}`}>
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="overline text-[10px] block mb-3">Verwandte Orte</label>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((l) => (
              <button key={l.slug} type="button" onClick={() => toggleArr("related_locations", l.slug)}
                      className={`text-xs uppercase tracking-wider py-2 px-3 border ${form.related_locations?.includes(l.slug) ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F]"}`}>
                {l.name}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Veröffentlicht
        </label>

        <div className="pt-6 border-t border-[#1A1414]/8">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
            {busy ? "Speichert…" : "Speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <div>
      <label className="overline text-[10px] block mb-2">{label}</label>
      <input type="text" required={required} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
             className="w-full bg-white border border-[#1A1414]/15 outline-none focus:border-[#8B1538] p-3" />
    </div>
  );
}
