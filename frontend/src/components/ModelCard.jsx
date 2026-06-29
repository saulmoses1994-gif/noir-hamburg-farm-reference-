import { Link } from "react-router-dom";

export default function ModelCard({ model, index = 0 }) {
  // Use varied heights for editorial feel
  const isWide = index % 5 === 2;
  const heightClass = index % 3 === 0 ? "h-[640px]" : index % 3 === 1 ? "h-[560px]" : "h-[700px]";

  return (
    <Link
      to={`/models/${model.slug}`}
      data-testid={`model-card-${model.slug}`}
      className={`group block ${isWide ? "md:col-span-8" : "md:col-span-4"} fade-in`}
    >
      <div className={`editorial-image ${heightClass}`}>
        <img
          src={model.cover_image}
          alt={`${model.name} – Escort Hamburg`}
          loading="lazy"
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <h3 className="font-heading text-2xl tracking-tight">
          {model.name}
        </h3>
        <span className="overline text-[10px]">{model.age} · {model.height_cm}cm</span>
      </div>
      {model.short_tagline && (
        <p className="mt-2 text-sm text-[#9CA3AF] font-light leading-snug">{model.short_tagline}</p>
      )}
    </Link>
  );
}
