import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { LOCATIONS } from "@/data/site";

/**
 * Admin — per-area image overrides.
 *
 * The 18 Hamburg areas ship with default hero images defined in
 * `frontend/src/data/site.js`. This page lets the admin override any of
 * them by pasting a URL or uploading a fresh photo. The overrides live in
 * `SiteSettings.area_images` (a map keyed by area slug) so the values are
 * persisted globally and picked up by both SSR and the SPA public pages.
 *
 * "Empty" fields simply fall back to the code default — non-destructive.
 */
export default function AdminAreas() {
  const [overrides, setOverrides] = useState({});   // { slug: url }
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null); // slug currently uploading

  // Load current overrides once on mount.
  useEffect(() => {
    api.get("/settings")
      .then((r) => setOverrides(r.data.area_images || {}))
      .catch(() => toast.error("Fehler beim Laden"));
  }, []);

  const setImg = (slug, url) => setOverrides((prev) => ({ ...prev, [slug]: url }));

  const saveAll = async () => {
    setBusy(true);
    try {
      // Fetch current settings so we don't clobber unrelated fields.
      const { data: current } = await api.get("/settings");
      const { data } = await api.put("/settings", {
        ...current,
        area_images: overrides,
      });
      setOverrides(data.area_images || {});
      toast.success("Area-Bilder gespeichert");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Fehler beim Speichern");
    } finally {
      setBusy(false);
    }
  };

  const uploadFor = async (slug, file) => {
    if (!file) return;
    setUploading(slug);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImg(slug, data.url);
      toast.success("Hochgeladen — jetzt „Speichern“ klicken");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload fehlgeschlagen");
    } finally {
      setUploading(null);
    }
  };

  const resetFor = (slug) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  };

  return (
    <div className="p-8 md:p-12 max-w-5xl" data-testid="admin-areas">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl">Hamburg-Areas — Bilder</h1>
          <p className="text-sm text-[#6B5F5F] mt-2 max-w-2xl">
            Jeder Stadtteil hat ein Standard-Coverbild aus dem Code. Hier können Sie es je Area überschreiben — per Upload oder URL.
            Empfohlen: 1200×900&nbsp;px oder größer, Landscape 4:3. Feld leer&nbsp;lassen&nbsp;→ Standardbild wird verwendet.
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={busy}
          className="btn-primary disabled:opacity-50"
          data-testid="admin-areas-save"
        >
          {busy ? "Speichert…" : "Alle Änderungen speichern"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {LOCATIONS.map((l) => {
          const override = overrides[l.slug];
          const effective = override || l.image;
          const isOverridden = !!override;
          return (
            <div
              key={l.slug}
              className="border border-[#1A1414]/10 rounded-lg overflow-hidden bg-white"
              data-testid={`admin-area-card-${l.slug}`}
            >
              <div className="aspect-[4/3] bg-[#F2EAE4] relative">
                {effective && (
                  <img
                    src={effective}
                    alt={l.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {isOverridden && (
                  <span className="absolute top-3 left-3 bg-[#8B1538] text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold">
                    Angepasst
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-heading text-lg text-[#1A1414]">{l.name}</h3>
                  <span className="text-xs text-[#6B5F5F] font-mono">/escort/{l.slug}</span>
                </div>

                <input
                  type="url"
                  value={override || ""}
                  onChange={(e) => setImg(l.slug, e.target.value)}
                  placeholder="URL zum Bild (leer = Standard)"
                  className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2.5 text-sm font-light"
                  data-testid={`admin-area-url-${l.slug}`}
                />

                <div className="flex gap-2 items-center flex-wrap">
                  <label className="text-xs uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538] cursor-pointer">
                    {uploading === l.slug ? "Lädt hoch…" : "Bild hochladen"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => uploadFor(l.slug, e.target.files?.[0])}
                      disabled={uploading === l.slug}
                      data-testid={`admin-area-upload-${l.slug}`}
                    />
                  </label>
                  {isOverridden && (
                    <button
                      type="button"
                      onClick={() => resetFor(l.slug)}
                      className="text-xs text-red-500 hover:underline"
                      data-testid={`admin-area-reset-${l.slug}`}
                    >
                      Zurücksetzen
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-[#1A1414]/10 sticky bottom-0 bg-white/95 backdrop-blur-sm py-4">
        <button
          onClick={saveAll}
          disabled={busy}
          className="btn-primary disabled:opacity-50"
          data-testid="admin-areas-save-bottom"
        >
          {busy ? "Speichert…" : "Alle Änderungen speichern"}
        </button>
        <span className="ml-4 text-xs text-[#6B5F5F]">
          Änderungen werden erst nach Klick übernommen. Standardbilder aus dem Code bleiben unberührt.
        </span>
      </div>
    </div>
  );
}
