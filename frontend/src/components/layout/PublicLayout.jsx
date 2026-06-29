import Header from "./Header";
import Footer from "./Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";

/**
 * Public-facing layout: header, footer, sticky WhatsApp CTA, main slot.
 *
 * Note: the "EN preview" banner is now rendered INLINE within model & blog
 * detail pages — and only when the admin has not yet supplied an English
 * translation for that specific record. As a result, this layout no longer
 * carries a site-wide banner.
 */
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-[#1A1414]" data-testid="public-layout">
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
