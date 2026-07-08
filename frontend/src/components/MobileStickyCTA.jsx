import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

/**
 * Sticky mobile WhatsApp CTA — hidden on /admin and on desktop.
 * Conversion driver: persistent visibility on the device where 70%+ of
 * escort-directory traffic comes from.
 */
export default function MobileStickyCTA() {
  const { lang } = useI18n();
  const settings = useSettings();
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return null;
  if (!settings.whatsappUrl) return null;
  return (
    <a
      href={settings.whatsappUrl}
      target="_blank"
      rel="noreferrer nofollow"
      data-testid="sticky-whatsapp"
      className="fixed bottom-5 right-5 z-40 md:hidden bg-[#25D366] text-white rounded-full shadow-2xl px-5 py-3 flex items-center gap-2 font-medium text-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#8B1538]"
      aria-label={lang === "en" ? "WhatsApp booking" : "WhatsApp Buchung"}
    >
      <MessageCircle size={18} />
      <span>WhatsApp</span>
    </a>
  );
}
