import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { FAQS } from "@/data/site";
import { useI18n } from "@/lib/i18n";

export default function FAQ() {
  const { lang, t } = useI18n();
  const q = (f) => (lang === "en" ? f.qEn : f.q);
  const a = (f) => (lang === "en" ? f.aEn : f.a);

  useSEO({
    title: lang === "en"
      ? "FAQ — Frequently Asked Questions | Noir Hamburg Premium Escort"
      : "FAQ — Häufige Fragen | Noir Hamburg Premium Escort",
    description: lang === "en"
      ? "Answers to common questions about bookings, discretion, availability and payment with Noir Hamburg."
      : "Antworten auf häufige Fragen zum Buchungsprozess, Diskretion, Verfügbarkeit und Zahlungsmodalitäten bei Noir Hamburg.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQS.map((f) => ({
        "@type": "Question",
        "name": q(f),
        "acceptedAnswer": { "@type": "Answer", "text": a(f) },
      })),
    },
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="faq-page">
        <Breadcrumbs items={[{ label: t("crumb.faq") }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">{lang === "en" ? "Good to know" : "Wissenswertes"}</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            {lang === "en"
              ? <>Frequently <em className="italic accent-text">Asked</em></>
              : <>Häufige <em className="italic accent-text">Fragen</em></>}
          </h1>
          <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
            {lang === "en"
              ? "Answers to what our clients ask most frequently."
              : "Antworten auf das, was unsere Klienten am häufigsten wissen möchten."}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-16">
        <div className="max-w-4xl space-y-px bg-[#1A1414]/5">
          {FAQS.map((f, i) => (
            <details key={i} className="bg-[#FFFFFF] group" open={i === 0} data-testid={`faq-item-${i}`}>
              <summary className="cursor-pointer p-8 list-none flex items-center justify-between gap-6">
                <span className="font-heading text-2xl">{q(f)}</span>
                <span className="accent-text text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-8 pb-8 text-base font-light text-[#6B5F5F] leading-relaxed">{a(f)}</div>
            </details>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
