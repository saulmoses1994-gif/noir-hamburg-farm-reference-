import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export default function ModelCard({ model }) {
  const { lang, to } = useI18n();
  const isEn = lang === "en";

  const availLabel = isEn
    ? (model.available ? "Available today" : "Not available today")
    : (model.available ? "Heute verfügbar" : "Heute nicht verfügbar");
  const badgeClass = model.available ? "badge-available" : "badge-unavailable";

  const cityLabel = model.locations?.[0] || "Hamburg";
  const cityName = cityLabel.charAt(0).toUpperCase() + cityLabel.slice(1).replace(/-/g, " ");

  // Prefer EN tagline when present, fall back to DE.
  const tagline = isEn && model.short_tagline_en ? model.short_tagline_en : model.short_tagline;
  const ageSuffix = isEn ? "y" : "J.";
  const sizeLabel = isEn ? "size" : "Größe";

  return (
    <Link
      to={to(`/models/${model.slug}`)}
      data-testid={`model-card-${model.slug}`}
      className="model-card group block bg-white border border-[#1A1414]/8 rounded-lg overflow-hidden hover:shadow-xl hover:border-[#8B1538]/40 transition-all fade-in"
    >
      <div className="editorial-image aspect-[3/4] relative">
        {model.cover_image ? (
          <img src={model.cover_image} alt={`${model.name} – Escort Hamburg`} loading="lazy" />
        ) : (
          <div className="w-full h-full bg-[#F2EAE4] flex items-center justify-center font-heading text-6xl text-[#8B1538]/40">
            {model.name?.[0] || "N"}
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className={badgeClass}>{availLabel}</span>
        </div>
        {model.featured && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-[#8B1538] text-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full">Featured</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-2xl text-[#1A1414] group-hover:accent-text transition-colors">{model.name}</h3>
        </div>
        <div className="text-xs accent-text uppercase tracking-wider mt-1 font-semibold">Escort {cityName}</div>
        <div className="mt-3 text-sm text-[#6B5F5F] flex items-center gap-2 flex-wrap">
          <span>{model.age}{ageSuffix}</span>
          {model.height_cm && (<><span className="text-[#1A1414]/20">·</span><span>{model.height_cm}cm</span></>)}
          {model.dress_size && (<><span className="text-[#1A1414]/20">·</span><span>{sizeLabel} {model.dress_size}</span></>)}
        </div>
        {tagline && (
          <p className="mt-3 text-sm text-[#6B5F5F] line-clamp-2 italic">{tagline}</p>
        )}
        {model.prices?.length > 0 && (
          <div className="mt-3 text-xs font-mono uppercase tracking-[0.15em] accent-text" data-testid={`model-card-price-${model.slug}`}>
            {isEn ? "from" : "ab"} {Math.min(...model.prices.map((p) => p.amount)).toLocaleString(isEn ? "en-GB" : "de-DE")} {model.prices[0].currency || "EUR"}
          </div>
        )}
      </div>
    </Link>
  );
}
