import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { useSettings } from "@/lib/settings";
import { DISKRETION_DEFAULT_HTML } from "@/data/diskretionDefault";

/**
 * /p/diskretion — Noir Hamburg's privacy promise. Content is CMS-managed via
 * `settings.diskretion_content` (Admin → Einstellungen). Falls back to the
 * bundled default so the page is always populated, even on a fresh DB.
 */
export default function Diskretion() {
  const settings = useSettings();
  const html = settings.diskretion_content || DISKRETION_DEFAULT_HTML;

  useSEO({
    title: "Diskretion & Privatsphäre – Noir Hamburg",
    description:
      "Absolute Diskretion, geschützte Privatsphäre und professionelle Kommunikation — das Versprechen von Noir Hamburg an jeden Kunden. Vertraulich, respektvoll, zuverlässig.",
  });

  return (
    <PublicLayout>
      <section
        className="px-6 md:px-12 lg:px-16 pt-12 pb-24"
        data-testid="diskretion-page"
      >
        <Breadcrumbs items={[{ label: "Diskretion" }]} />

        <div className="mt-8 max-w-3xl">
          <span className="overline">Vertrauen · Verschwiegenheit</span>
          <h1 className="font-heading text-5xl lg:text-6xl font-light tracking-tighter leading-none mt-4">
            Diskretion &amp; Privatsphäre
          </h1>
        </div>

        <div
          data-testid="diskretion-content"
          className="mt-12 max-w-2xl diskretion-body text-[16px] leading-[1.8] text-[#1A1414]/90"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    </PublicLayout>
  );
}
