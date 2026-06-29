import Header from "./Header";
import Footer from "./Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import { useI18n } from "@/lib/i18n";

function EnPreviewBanner() {
  const { lang, t } = useI18n();
  if (lang !== "en") return null;
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
