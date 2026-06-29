export default function SectionTitle({ overline, title, description, align = "left" }) {
  const alignment = align === "center" ? "text-center mx-auto items-center" : "text-left";
  return (
    <div className={`flex flex-col gap-4 max-w-3xl ${alignment}`} data-testid="section-title">
      {overline && <span className="overline">{overline}</span>}
      <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-tight text-[#1A1414]">
        {title}
      </h2>
      {description && (
        <p className="text-base lg:text-lg font-light text-[#6B5F5F] leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
      <div className="gold-divider mt-2" />
    </div>
  );
}
