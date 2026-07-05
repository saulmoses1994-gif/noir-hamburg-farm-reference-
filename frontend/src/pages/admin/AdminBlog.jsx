import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { BLOG_CATEGORIES, SERVICES, LOCATIONS } from "@/data/site";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";

export function AdminBlog() {
  const [posts, setPosts] = useState([]);

  const load = useCallback(() => api.get("/blog?include_drafts=true").then((r) => setPosts(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const del = async (slug) => {
    if (!confirm("Artikel löschen?")) return;
    await api.delete(`/blog/${slug}`);
    toast.success("Gelöscht");
    load();
  };

  return (
    <div className="p-12" data-testid="admin-blog">
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-3">Blog</h1>
        </div>
        <Link to="/admin/blog/new" className="btn-primary"><Plus size={14} /> Neuer Beitrag</Link>
      </div>

      <div className="border border-[#1A1414]/8 bg-[#FBF7F4]">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-6 p-4 border-b border-[#1A1414]/8 hover:bg-[#F2EAE4]" data-testid={`admin-blog-row-${p.slug}`}>
            {p.cover_image && <img src={p.cover_image} alt={p.title || "Blog cover"} className="w-20 h-14 object-cover" />}
            <div className="flex-1">
              <div className="font-heading text-xl">{p.title}</div>
              <div className="overline text-[10px] mt-1 flex items-center gap-3">
                <span>{p.category} · {p.published ? "Veröffentlicht" : "Entwurf"}</span>
                <span className={p.content_en ? "text-[#8B1538]" : "text-[#6B5F5F]/50"}>
                  {p.content_en ? "✓ EN" : "⚑ EN missing"}
                </span>
              </div>
            </div>
            <Link to={`/admin/blog/edit/${p.slug}`} className="p-2 hover:accent-text"><Pencil size={16} /></Link>
            <button onClick={() => del(p.slug)} className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
          </div>
        ))}
        {posts.length === 0 && <div className="p-12 text-center text-[#6B5F5F]">Keine Beiträge.</div>}
      </div>
    </div>
  );
}

const emptyPost = {
  title: "", excerpt: "", content: "", category: BLOG_CATEGORIES[0],
  title_en: "", excerpt_en: "", content_en: "",
  cover_image: "", meta_title: "", meta_description: "",
  meta_title_en: "", meta_description_en: "",
  related_services: [], related_locations: [], published: true,
};

export function AdminBlogEdit() {
  const { slug } = useParams();
  const isNew = !slug;
  const nav = useNavigate();
  const [form, setForm] = useState(emptyPost);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isNew) api.get(`/blog/${slug}`).then((r) => setForm({ ...emptyPost, ...r.data }));
  }, [slug, isNew]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => {
    setForm((f) => {
      const arr = new Set(f[k] || []);
      arr.has(v) ? arr.delete(v) : arr.add(v);
      return { ...f, [k]: Array.from(arr) };
    });
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("cover_image", process.env.REACT_APP_BACKEND_URL + data.url);
      toast.success("Cover hochgeladen");
    } catch { toast.error("Upload fehlgeschlagen"); }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isNew) await api.post("/blog", form);
      else await api.put(`/blog/${slug}`, form);
      toast.success("Gespeichert");
      nav("/admin/blog");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Fehler");
    } finally { setBusy(false); }
  };

  return (
    <div className="p-12 max-w-5xl" data-testid="admin-blog-edit">
      <button onClick={() => nav("/admin/blog")} className="flex items-center gap-2 text-sm text-[#6B5F5F] mb-8"><ArrowLeft size={14} /> Zurück</button>
      <span className="overline">Blog</span>
      <h1 className="font-heading text-4xl mt-3 mb-12">{isNew ? "Neuer Beitrag" : "Beitrag bearbeiten"}</h1>

      <form onSubmit={save} className="space-y-6">
        <div>
          <label className="overline text-[10px] block mb-2">Titel</label>
          <input type="text" required value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-3 font-light text-xl" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="overline text-[10px] block mb-2">Kategorie</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light">
              {BLOG_CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#FFFFFF]">{c}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Veröffentlicht
            </label>
          </div>
        </div>

        <div>
          <label className="overline text-[10px] block mb-2">Auszug (Excerpt)</label>
          <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light" />
        </div>

        <div>
          <label className="overline text-[10px] block mb-2">Inhalt (HTML)</label>
          <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={15} className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light font-mono text-sm" required />
        </div>

        {/* ----- English translation block ----- */}
        <details className="border border-[#8B1538]/20 bg-[#FAF5F2] p-5" open={!!form.content_en}>
          <summary className="cursor-pointer flex items-center justify-between gap-4">
            <span className="overline text-[#8B1538]">English Translation</span>
            <span className="text-[10px] uppercase tracking-widest text-[#8B1538]/80">
              {form.content_en ? "✓ EN published" : "⚑ EN translation needed"}
            </span>
          </summary>
          <div className="mt-5 space-y-4">
            <div>
              <label className="overline text-[10px] block mb-2">Title (English)</label>
              <input
                type="text" value={form.title_en ?? ""}
                onChange={(e) => set("title_en", e.target.value)}
                className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light"
                data-testid="blog-title-en"
              />
            </div>
            <div>
              <label className="overline text-[10px] block mb-2">Excerpt (English)</label>
              <textarea
                value={form.excerpt_en ?? ""}
                onChange={(e) => set("excerpt_en", e.target.value)}
                rows={2}
                className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light"
                data-testid="blog-excerpt-en"
              />
            </div>
            <div>
              <label className="overline text-[10px] block mb-2">Content (English, HTML)</label>
              <textarea
                value={form.content_en ?? ""}
                onChange={(e) => set("content_en", e.target.value)}
                rows={15}
                placeholder="Leave empty to fall back to German content with an EN-preview notice on /en/blog/<slug>"
                className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light font-mono text-sm"
                data-testid="blog-content-en"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="overline text-[10px] block mb-2">SEO Meta Title (EN)</label>
                <input
                  type="text" value={form.meta_title_en ?? ""}
                  onChange={(e) => set("meta_title_en", e.target.value)}
                  className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light"
                />
              </div>
              <div>
                <label className="overline text-[10px] block mb-2">SEO Meta Description (EN)</label>
                <input
                  type="text" value={form.meta_description_en ?? ""}
                  onChange={(e) => set("meta_description_en", e.target.value)}
                  className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light"
                />
              </div>
            </div>
          </div>
        </details>

        <div>
          <label className="overline text-[10px] block mb-2">Cover-Bild</label>
          <input type="file" accept="image/*" onChange={onUpload} className="text-sm text-[#6B5F5F]" />
          {form.cover_image && <img src={form.cover_image} alt="cover" className="mt-3 h-48 object-cover" />}
          <input type="text" value={form.cover_image} onChange={(e) => set("cover_image", e.target.value)} placeholder="oder URL" className="mt-2 w-full bg-transparent border border-[#1A1414]/15 p-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="overline text-[10px] block mb-2">SEO Meta Titel</label>
            <input type="text" value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light" />
          </div>
          <div>
            <label className="overline text-[10px] block mb-2">SEO Meta Description</label>
            <input type="text" value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} className="w-full bg-transparent border border-[#1A1414]/15 outline-none p-3 font-light" />
          </div>
        </div>

        <div>
          <label className="overline text-[10px] block mb-3">Verwandte Services</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button key={s.slug} type="button" onClick={() => toggleArr("related_services", s.slug)} className={`text-xs uppercase tracking-[0.15em] py-2 px-3 border ${form.related_services?.includes(s.slug) ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F]"}`}>{s.title}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="overline text-[10px] block mb-3">Verwandte Orte</label>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((l) => (
              <button key={l.slug} type="button" onClick={() => toggleArr("related_locations", l.slug)} className={`text-xs uppercase tracking-[0.15em] py-2 px-3 border ${form.related_locations?.includes(l.slug) ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F]"}`}>{l.name}</button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-[#1A1414]/8">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">{busy ? "Speichert…" : "Speichern"}</button>
        </div>
      </form>
    </div>
  );
}
