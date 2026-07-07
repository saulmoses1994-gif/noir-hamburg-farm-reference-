import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SERVICES } from "@/data/site";

/**
 * Admin — per-service image overrides.
 *
 * The 8 services (Luxury, VIP, Business, Dinner, Hotel, Event, Travel, GFE)
 * ship with default cover photos defined in `frontend/src/data/site.js`. This
 * page lets the admin override any of them by URL or upload. Overrides live
 * in `SiteSettings.service_images` (a map keyed by service slug) and are
 * picked up by both SSR and the SPA public pages.
 *
 * Empty field → falls back to the code default. Non-destructive.
 */
export default function AdminServices() {
  const [overrides, setOverrides] = useState({});   // { slug: url }
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    api.get("/settings")
      .then((r) => setOverrides(r.data.service_images || {}))
      .catch(() => toast.error("Fehler beim Laden"));
  }, []);

  const setImg = (slug, url) => setOverrides((p) => ({ ...p, [slug]: url }));

  const saveAll = async () => {
    setBusy(true);
    try {
      const { data: current } = await api.get("/settings");
      const { data } = await api.put("/settings", {
        ...current,
        service_images: overrides,
      });
      setOverrides(data.service_images || {});
      toast.success("Service-Bilder gespeichert");
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

  const resetFor = (slug) =>
    setOverrides((p) => {
      const n = { ...p };
      delete n[slug];
      return n;
    });

  return (
    <div className="p-8 md:p-12 max-w-5xl" data-testid="admin-services">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl">Escort Services — Bilder</h1>
          <p className="text-sm text-[#6B5F5F] mt-2 max-w-2xl">
            Jeder Service hat ein Standard-Coverbild aus dem Code. Hier können Sie es je Service überschreiben — per Upload oder URL.
            Empfohlen: 1200×900&nbsp;px oder größer, Landscape 4:3. Feld leer&nbsp;lassen&nbsp;→ Standardbild wird verwendet.
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={busy}
          className="btn-primary disabled:opacity-50"
          data-testid="admin-services-save"
        >
          {busy ? "Speichert…" : "Alle Änderungen speichern"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((s) => {
          const override = overrides[s.slug];
          const effective = override || s.image;
          const isOverridden = !!override;
          return (
            <div
              key={s.slug}
              className="border border-[#1A1414]/10 rounded-lg overflow-hidden bg-white"
              data-testid={`admin-service-card-${s.slug}`}
            >
              <div className="aspect-[4/3] bg-[#F2EAE4] relative">
                {effective && <img src={effective} alt={s.title} className="w-full h-full object-cover" />}
                {isOverridden && (
                  <span className="absolute top-3 left-3 bg-[#8B1538] text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold">
                    Angepasst
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-lg text-[#1A1414]">{s.title}</h3>
                  <span className="text-xs text-[#6B5F5F] font-mono whitespace-nowrap">/services/{s.slug}</span>
                </div>

                <input
                  type="url"
                  value={override || ""}
                  onChange={(e) => setImg(s.slug, e.target.value)}
                  placeholder="URL zum Bild (leer = Standard)"
                  className="w-full bg-transparent border border-[#1A1414]/15 focus:border-[#8B1538] outline-none p-2.5 text-sm font-light"
                  data-testid={`admin-service-url-${s.slug}`}
                />

                <div className="flex gap-2 items-center flex-wrap">
                  <label className="text-xs uppercase tracking-[0.15em] py-2 px-3 border border-[#1A1414]/15 hover:border-[#8B1538] hover:text-[#8B1538] cursor-pointer">
                    {uploading === s.slug ? "Lädt hoch…" : "Bild hochladen"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => uploadFor(s.slug, e.target.files?.[0])}
                      disabled={uploading === s.slug}
                      data-testid={`admin-service-upload-${s.slug}`}
                    />
                  </label>
                  {isOverridden && (
                    <button
                      type="button"
                      onClick={() => resetFor(s.slug)}
                      className="text-xs text-red-500 hover:underline"
                      data-testid={`admin-service-reset-${s.slug}`}
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
          data-testid="admin-services-save-bottom"
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
