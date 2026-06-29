import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { FAQS } from "@/data/site";

export default function FAQ() {
  useSEO({
    title: "FAQ — Häufige Fragen | Noir Hamburg Premium Escort",
    description: "Antworten auf häufige Fragen zum Buchungsprozess, Diskretion, Verfügbarkeit und Zahlungsmodalitäten bei Noir Hamburg.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQS.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
    },
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="faq-page">
        <Breadcrumbs items={[{ label: "FAQ" }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">Wissenswertes</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Häufige <em className="italic accent-text">Fragen</em>
          </h1>
          <p className="mt-6 text-lg font-light text-[#9CA3AF] leading-relaxed">
            Antworten auf das, was unsere Klienten am häufigsten wissen möchten.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-16">
        <div className="max-w-4xl space-y-px bg-white/5">
          {FAQS.map((f, i) => (
            <details key={i} className="bg-[#0A0A0B] group" open={i === 0} data-testid={`faq-item-${i}`}>
              <summary className="cursor-pointer p-8 list-none flex items-center justify-between gap-6">
                <span className="font-heading text-2xl">{f.q}</span>
                <span className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-8 pb-8 text-base font-light text-[#9CA3AF] leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
