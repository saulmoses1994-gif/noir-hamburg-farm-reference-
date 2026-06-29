import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Users, FileText, Inbox, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ models: 0, blog: 0, contacts: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/models"),
      api.get("/blog?include_drafts=true"),
      api.get("/contact").catch(() => ({ data: [] })),
    ]).then(([m, b, c]) => {
      setStats({ models: m.data.length, blog: b.data.length, contacts: c.data.length });
    });
  }, []);

  const cards = [
    { label: "Models", count: stats.models, to: "/admin/models", icon: Users },
    { label: "Blog Artikel", count: stats.blog, to: "/admin/blog", icon: FileText },
    { label: "Offene Anfragen", count: stats.contacts, to: "/admin/contacts", icon: Inbox },
  ];

  return (
    <div className="p-12" data-testid="admin-dashboard">
      <div>
        <span className="overline">Übersicht</span>
        <h1 className="font-heading text-4xl lg:text-5xl mt-3">Willkommen zurück.</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {cards.map(({ label, count, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="bg-[#121214] border border-white/5 p-8 hover:border-[#E5D3B3] transition-colors group block"
            data-testid={`dashboard-card-${label}`}
          >
            <Icon size={20} className="text-[#9CA3AF] group-hover:accent-text mb-6" />
            <div className="overline text-[10px]">{label}</div>
            <div className="font-heading text-5xl mt-2">{count}</div>
            <div className="mt-6 text-xs font-mono uppercase tracking-[0.2em] inline-flex items-center gap-2 accent-text">
              Verwalten <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
