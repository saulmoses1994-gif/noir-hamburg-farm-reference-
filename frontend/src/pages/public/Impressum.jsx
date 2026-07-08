import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { IMPRESSUM_DEFAULT_HTML } from "@/data/impressumDefault";

/**
 * Legally-required Impressum page per § 5 TMG (Germany).
 * Body content is CMS-managed via `settings.impressum_content` (Admin →
 * Einstellungen → Impressum). When the setting is empty we fall back to the
 * bundled default (address, contact, image credits, youth-protection officer).
 */
export default function Impressum() {
  const { lang } = useI18n();
  const settings = useSettings();
  const html = settings.impressum_content || IMPRESSUM_DEFAULT_HTML;

  useSEO({
    title: lang === "en" ? "Imprint | Noir Hamburg" : "Impressum | Noir Hamburg",
    description:
      lang === "en"
        ? "Legal imprint of Noir Hamburg per § 5 TMG — company address, contact, image credits and youth-protection officer."
        : "Impressum von Noir Hamburg gemäß § 5 TMG — Anbieteradresse, Kontakt, Bildrechte und Jugendschutzbeauftragter.",
    robots: "index,follow",
  });

  const crumbLabel = lang === "en" ? "Imprint" : "Impressum";

  return (
    <PublicLayout>
      <section
        className="px-6 md:px-12 lg:px-16 pt-12 pb-24"
        data-testid="impressum-page"
      >
        <Breadcrumbs items={[{ label: crumbLabel }]} />

        <div className="mt-8 max-w-3xl">
          <span className="overline">{lang === "en" ? "Legal" : "Rechtliches"}</span>
          <h1 className="font-heading text-5xl lg:text-6xl font-light tracking-tighter leading-none mt-4">
            {lang === "en" ? "Imprint" : "Impressum"}
          </h1>
        </div>

        <div
          data-testid="impressum-content"
          className="mt-12 max-w-2xl impressum-body text-[15px] leading-relaxed text-[#1A1414]/90"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    </PublicLayout>
  );
}
