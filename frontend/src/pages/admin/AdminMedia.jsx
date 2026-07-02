import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Copy, Upload } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Media library — grid of every uploaded image with copy-URL + soft-delete.
 * Uploads happen via existing inline uploaders on Model/Blog/Page forms;
 * this page is for browsing / cleaning up.
 */
export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    api.get("/media").then((r) => setItems(r.data)).catch(() => toast.error("Fehler beim Laden"));
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      await api.post("/upload", fd);
      toast.success("Datei hochgeladen");
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

  const copyUrl = (url) => {
    // Full absolute URL so admins can paste into any image field.
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
    <div className="p-8 md:p-12" data-testid="admin-media">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl">Medien</h1>
          <p className="text-sm text-[#6B5F5F] mt-2">{items.length} Datei(en) in der Bibliothek</p>
        </div>
        <label
          className="btn-primary cursor-pointer flex items-center gap-2"
          data-testid="media-upload-btn"
        >
          <Upload size={14} /> {uploading ? "Lädt hoch…" : "Datei hochladen"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
            disabled={uploading}
          />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center text-[#6B5F5F]" data-testid="media-empty">
          <p className="font-heading text-2xl">Noch keine Dateien.</p>
          <p className="text-sm mt-2">Lade dein erstes Bild hoch, um zu beginnen.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-[#1A1414]/10 rounded-md overflow-hidden bg-[#FBF7F4]"
              data-testid={`media-item-${item.id}`}
            >
              <div className="aspect-square bg-[#F2EAE4] overflow-hidden">
                <img
                  src={item.url}
                  alt={item.original_filename || "media"}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-light truncate" title={item.original_filename}>
                  {item.original_filename || "unbenannt"}
                </p>
                <p className="text-[10px] text-[#9B8F8F] font-mono uppercase mt-1">{formatSize(item.size)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs text-[#1A1414] border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538] py-1.5 rounded transition-colors"
                    data-testid={`media-copy-${item.id}`}
                    title="URL kopieren"
                  >
                    <Copy size={12} /> URL
                  </button>
                  <button
                    onClick={() => del(item.id)}
                    disabled={busy}
                    className="flex items-center justify-center px-2 text-xs text-[#8B1538] hover:bg-[#F4E4E4] py-1.5 rounded transition-colors disabled:opacity-40"
                    data-testid={`media-delete-${item.id}`}
                    title="Entfernen"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
