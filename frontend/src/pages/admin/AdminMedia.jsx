import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Copy, Upload, Save, X, Edit3 } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Media library — grid of every uploaded image with copy-URL + soft-delete
 * + inline editing of SEO metadata (alt text, title, description, display
 * filename). WebP + AVIF variants are generated automatically at upload time
 * and shown as small badges on each tile.
 */
export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null); // id currently being edited

  const load = () => {
    api.get("/media").then((r) => setItems(r.data)).catch(() => toast.error("Fehler beim Laden"));
  };

  useEffect(load, []);

  const upload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      await api.post("/upload", fd);
      toast.success("Datei hochgeladen — WebP & AVIF automatisch generiert");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Diese Datei entfernen?")) return;
    setBusy(true);
    try {
      await api.delete(`/media/${id}`);
      setItems((xs) => xs.filter((x) => x.id !== id));
      toast.success("Entfernt");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Fehler");
    } finally {
      setBusy(false);
    }
  };

  const saveMeta = async (item) => {
    setBusy(true);
    try {
      const { data } = await api.put(`/media/${item.id}`, {
        alt_text: item.alt_text || "",
        alt_text_en: item.alt_text_en || "",
        title: item.title || "",
        description: item.description || "",
        display_filename: item.display_filename || "",
      });
      setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, ...data } : x)));
      setEditing(null);
      toast.success("Metadaten gespeichert");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Fehler");
    } finally {
      setBusy(false);
    }
  };

  const patchItem = (id, patch) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const copyUrl = (url) => {
    const full = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(full).then(
      () => toast.success("URL kopiert"),
      () => toast.error("Kopieren fehlgeschlagen"),
    );
  };

  const formatSize = (bytes) => {
    if (!bytes) return "–";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 md:p-10" data-testid="admin-media">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl">Medien-Bibliothek</h1>
          <p className="text-sm text-[#6B5F5F] mt-2 max-w-2xl">
            {items.length} Datei(en). Neue Uploads werden automatisch komprimiert und in <b>WebP</b> + <b>AVIF</b> konvertiert.
            Klicken Sie auf <em>Bearbeiten</em>, um ALT-Text, Titel und Beschreibung (SEO) zu setzen.
          </p>
        </div>
        <label className="btn-primary cursor-pointer flex items-center gap-2" data-testid="media-upload-btn">
          <Upload size={14} /> {uploading ? "Lädt hoch…" : "Datei hochladen"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} disabled={uploading} />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center text-[#6B5F5F]" data-testid="media-empty">
          <p className="font-heading text-2xl">Noch keine Dateien.</p>
          <p className="text-sm mt-2">Lade dein erstes Bild hoch, um zu beginnen.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border border-[#1A1414]/10 rounded-md overflow-hidden bg-[#FBF7F4]" data-testid={`media-item-${item.id}`}>
              <div className="aspect-video bg-[#F2EAE4] overflow-hidden relative">
                <img src={item.url} alt={item.alt_text || item.original_filename || "media"} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.webp_url && <span className="text-[9px] font-mono bg-[#1A1414] text-white px-1.5 py-0.5 rounded">WEBP</span>}
                  {item.avif_url && <span className="text-[9px] font-mono bg-[#8B1538] text-white px-1.5 py-0.5 rounded">AVIF</span>}
                </div>
              </div>
              <div className="p-3">
                {editing === item.id ? (
                  <div className="space-y-2" data-testid={`media-edit-${item.id}`}>
                    <MediaField label="Dateiname (Anzeige)" v={item.display_filename} onChange={(v) => patchItem(item.id, { display_filename: v })} testid={`media-${item.id}-name`} />
                    <MediaField label="ALT (DE)" v={item.alt_text} onChange={(v) => patchItem(item.id, { alt_text: v })} testid={`media-${item.id}-alt`} />
                    <MediaField label="ALT (EN)" v={item.alt_text_en} onChange={(v) => patchItem(item.id, { alt_text_en: v })} testid={`media-${item.id}-alt-en`} />
                    <MediaField label="Titel" v={item.title} onChange={(v) => patchItem(item.id, { title: v })} testid={`media-${item.id}-title`} />
                    <MediaField label="Beschreibung" v={item.description} onChange={(v) => patchItem(item.id, { description: v })} textarea testid={`media-${item.id}-desc`} />
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => saveMeta(item)} disabled={busy} className="btn-primary text-xs flex items-center gap-1 flex-1 justify-center disabled:opacity-50" data-testid={`media-${item.id}-save`}>
                        <Save size={12} /> Speichern
                      </button>
                      <button onClick={() => { setEditing(null); load(); }} className="text-xs border border-[#1A1414]/15 hover:border-[#8B1538] py-1 px-2 rounded" data-testid={`media-${item.id}-cancel`}>
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-light truncate" title={item.display_filename || item.original_filename}>
                      {item.display_filename || item.original_filename || "unbenannt"}
                    </p>
                    <p className="text-[10px] text-[#9B8F8F] font-mono uppercase mt-1">
                      {formatSize(item.size)} · {item.alt_text ? "ALT ✓" : "kein ALT"}
                    </p>
                    {item.alt_text && (
                      <p className="text-[11px] text-[#6B5F5F] mt-1 truncate italic" title={item.alt_text}>
                        „{item.alt_text}"
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setEditing(item.id)} className="flex-1 flex items-center justify-center gap-1 text-xs text-[#1A1414] border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538] py-1.5 rounded transition-colors" data-testid={`media-edit-btn-${item.id}`} title="SEO bearbeiten">
                        <Edit3 size={12} /> Bearbeiten
                      </button>
                      <button onClick={() => copyUrl(item.url)} className="flex-1 flex items-center justify-center gap-1 text-xs text-[#1A1414] border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538] py-1.5 rounded transition-colors" data-testid={`media-copy-${item.id}`} title="URL kopieren">
                        <Copy size={12} /> URL
                      </button>
                      <button onClick={() => del(item.id)} disabled={busy} className="flex items-center justify-center px-2 text-xs text-[#8B1538] hover:bg-[#F4E4E4] py-1.5 rounded transition-colors disabled:opacity-40" data-testid={`media-delete-${item.id}`} title="Entfernen">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaField({ label, v, onChange, textarea, testid }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.12em] text-[#6B5F5F]">{label}</span>
      {textarea ? (
        <textarea value={v || ""} onChange={(e) => onChange(e.target.value)} rows={2}
          className="mt-1 w-full border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-1.5 text-xs bg-white rounded"
          data-testid={testid} />
      ) : (
        <input type="text" value={v || ""} onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-1.5 text-xs bg-white rounded"
          data-testid={testid} />
      )}
    </label>
  );
}
