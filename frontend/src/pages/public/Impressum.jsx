import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { useI18n } from "@/lib/i18n";

/**
 * Legally-required Impressum page per § 5 TMG (Germany).
 * Content is static (address, contact, youth-protection officer). Kept as a
 * proper React page so SSR/SSG serves it instantly and crawlers see the
 * required disclosure text.
 */
export default function Impressum() {
  const { lang } = useI18n();
  useSEO({
    title: lang === "en" ? "Imprint | Noir Hamburg" : "Impressum | Noir Hamburg",
    description:
      lang === "en"
        ? "Legal imprint of Noir Hamburg per § 5 TMG — company address, contact, image credits and youth-protection officer."
        : "Impressum von Noir Hamburg gemäß § 5 TMG — Anbieteradresse, Kontakt, Bildrechte und Jugendschutzbeauftragter.",
    // Legal pages should not be indexed as marketing landing pages.
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

        <div className="mt-12 max-w-2xl space-y-10 text-[15px] leading-relaxed text-[#1A1414]/90">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#8B1538] font-semibold mb-3">
              Angaben gemäß § 5 TMG
            </h2>
            <address className="not-italic space-y-0.5">
              <div className="font-medium text-[#1A1414]">Noir Hamburg</div>
              <div>Pinneberger Chaussee 50</div>
              <div>22523 Hamburg</div>
            </address>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#8B1538] font-semibold mb-3">
              Kontakt
            </h2>
            <div className="space-y-0.5">
              <div>
                E-Mail:{" "}
                <a
                  href="mailto:support@noir-hamburg.com"
                  className="underline underline-offset-4 decoration-[#8B1538]/40 hover:decoration-[#8B1538] transition-colors"
                  data-testid="impressum-support-email"
                >
                  support@noir-hamburg.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#8B1538] font-semibold mb-3">
              Bildrechte
            </h2>
            <p>© Noir Hamburg und unter Lizenz von Pixabay / Unsplash / Shutterstock.com</p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#8B1538] font-semibold mb-3">
              Jugendschutzbeauftragter
            </h2>
            <address className="not-italic space-y-0.5">
              <div className="font-medium text-[#1A1414]">Jochen Jüngst, LL.M.</div>
              <div>
                Tel.:{" "}
                <a
                  href="tel:+494087408606"
                  className="hover:text-[#8B1538] transition-colors"
                  data-testid="impressum-jsb-tel"
                >
                  +49 40 874 086 06
                </a>
              </div>
              <div>Fax: 040 – 874 087 00</div>
              <div>
                E-Mail:{" "}
                <a
                  href="mailto:info@juengst-legal.de"
                  className="underline underline-offset-4 decoration-[#8B1538]/40 hover:decoration-[#8B1538] transition-colors"
                  data-testid="impressum-jsb-email"
                >
                  info@juengst-legal.de
                </a>
              </div>
              <div>
                Web:{" "}
                <a
                  href="https://www.juengst-legal.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 decoration-[#8B1538]/40 hover:decoration-[#8B1538] transition-colors"
                  data-testid="impressum-jsb-web"
                >
                  www.juengst-legal.de
                </a>
              </div>
            </address>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
