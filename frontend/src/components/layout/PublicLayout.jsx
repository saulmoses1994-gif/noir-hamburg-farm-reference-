import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import { useI18n } from "@/lib/i18n";

/**
 * Show the "EN preview" banner only on EN routes whose body copy is still
 * admin-managed (model bios, blog posts). Site-wide static content (services,
 * areas, FAQ, home, about, contact) has full English copy as of Feb 2026.
 */
function EnPreviewBanner() {
  const { lang, t } = useI18n();
  const { pathname } = useLocation();
  if (lang !== "en") return null;
  const showBanner =
    /^\/en\/models\/[^/]+/.test(pathname) || /^\/en\/blog\/[^/]+/.test(pathname);
  if (!showBanner) return null;
  return (
    <aside
      data-testid="en-preview-banner"
      className="px-6 md:px-12 lg:px-16 py-3 bg-[#FAF5F2] border-b border-[#8B1538]/20 text-[#4A3F3F] text-xs md:text-sm"
    >
      <p className="max-w-4xl">
        <span className="font-semibold text-[#8B1538] mr-2">EN preview.</span>
        {t("misc.englishComingSoon")}
      </p>
    </aside>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-[#1A1414]" data-testid="public-layout">
      <Header />
      <EnPreviewBanner />
      <main id="main">{children}</main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
