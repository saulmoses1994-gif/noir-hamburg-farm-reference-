import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { BRAND } from "@/data/site";
import { api } from "./api";

/**
 * Site settings live in MongoDB and are editable via /admin/settings.
 * They shape header/footer contact info, WhatsApp CTAs and opening hours.
 * Defaults from data/site.js are used as a fallback so nothing blanks out
 * during the first paint or if the API is momentarily unreachable.
 */
const brandToSettings = (b) => ({
  business_name: b.name,
  tagline_de: b.tagline,
  tagline_en: b.taglineEn,
  phone: b.phone,
  email: b.email,
  whatsapp_number: b.whatsapp,
  hours_de: "",
  hours_en: "",
  instagram_url: "",
  facebook_url: "",
  twitter_url: "",
  homepage_hero_image: "",
  area_images: {},
  service_images: {},
  social_share_image: "",
});

const Ctx = createContext(brandToSettings(BRAND));

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => brandToSettings(BRAND));

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

/** Read-only accessor for public-site components. */
export function useSettings() {
  const s = useContext(Ctx);
  return useMemo(() => {
    const wa = (s.whatsapp_number || "").replace(/\D/g, "");
    return {
      ...s,
      whatsappUrl: wa ? `https://wa.me/${wa}` : "",
    };
  }, [s]);
}
