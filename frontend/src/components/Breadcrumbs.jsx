import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs({ items = [], dark = false }) {
  const baseColor = dark ? "text-white/70" : "text-[#9B8F8F]";
  const hoverColor = dark ? "hover:text-white" : "hover:text-[#1A1414]";
  const activeColor = dark ? "text-[#E5A5B5]" : "accent-text";

  return (
    <nav className={`text-xs uppercase tracking-wider flex items-center flex-wrap gap-2 ${baseColor}`} data-testid="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/" className={`flex items-center gap-1 ${hoverColor}`}>
        <Home size={12} /> Home
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const key = `${item.to || ""}|${item.label}`;
        return (
          <span key={key} className="flex items-center gap-2">
            <ChevronRight size={12} className={baseColor} />
            {item.to && !isLast ? (
              <Link to={item.to} className={hoverColor}>{item.label}</Link>
            ) : (
              <span className={activeColor}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
