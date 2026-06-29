import { MessageCircle } from "lucide-react";
import { BRAND } from "@/data/site";

/**
 * Sticky mobile WhatsApp CTA — hidden on /admin and on desktop.
 * Conversion driver: persistent visibility on the device where 70%+ of
 * escort-directory traffic comes from.
 */
export default function MobileStickyCTA() {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return null;
  return (
    <a
      href={`https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g, "")}`}
      target="_blank"
      rel="noreferrer"
      data-testid="sticky-whatsapp"
      className="fixed bottom-5 right-5 z-40 md:hidden bg-[#25D366] text-white rounded-full shadow-2xl px-5 py-3 flex items-center gap-2 font-medium text-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#8B1538]"
      aria-label="WhatsApp Buchung"
    >
      <MessageCircle size={18} />
      <span>WhatsApp</span>
    </a>
  );
}
