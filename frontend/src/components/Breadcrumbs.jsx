import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="text-xs font-mono uppercase tracking-[0.2em] text-[#52525B] flex items-center flex-wrap gap-2" data-testid="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/" className="flex items-center gap-1 hover:text-[#F5F5F0]">
        <Home size={12} /> Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight size={12} className="text-[#52525B]" />
          {item.to && i !== items.length - 1 ? (
            <Link to={item.to} className="hover:text-[#F5F5F0]">{item.label}</Link>
          ) : (
            <span className="accent-text">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
