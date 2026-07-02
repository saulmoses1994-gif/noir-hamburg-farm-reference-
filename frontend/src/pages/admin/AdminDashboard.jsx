import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Users, FileText, Inbox, ArrowRight, Map, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ models: 0, blog: 0, contacts: 0 });
  const [sitemap, setSitemap] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/models"),
      api.get("/blog?include_drafts=true"),
      api.get("/contact").catch(() => ({ data: [] })),
      api.get("/sitemap/status").catch(() => ({ data: null })),
    ]).then(([m, b, c, s]) => {
      setStats({ models: m.data.length, blog: b.data.length, contacts: c.data.length });
      setSitemap(s.data);
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
            className="bg-[#FBF7F4] border border-[#1A1414]/8 p-8 hover:border-[#8B1538] transition-colors group block"
            data-testid={`dashboard-card-${label}`}
          >
            <Icon size={20} className="text-[#6B5F5F] group-hover:accent-text mb-6" />
            <div className="overline text-[10px]">{label}</div>
            <div className="font-heading text-5xl mt-2">{count}</div>
            <div className="mt-6 text-xs font-mono uppercase tracking-[0.2em] inline-flex items-center gap-2 accent-text">
              Verwalten <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>

      {/* Sitemap widget — read-only visibility into what search engines see. */}
      {sitemap && (
        <div className="mt-12 bg-white border border-[#1A1414]/8 p-8" data-testid="dashboard-sitemap-widget">
          <div className="flex items-center gap-3 mb-6">
            <Map size={18} className="text-[#8B1538]" />
            <h2 className="overline text-[11px]">Sitemap / SEO Index</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SitemapStat label="Statisch" value={sitemap.static} />
            <SitemapStat label="Services" value={sitemap.services} />
            <SitemapStat label="Stadtteile" value={sitemap.locations} />
            <SitemapStat label="Models" value={sitemap.models} />
            <SitemapStat label="Blog" value={sitemap.blog_posts} />
            <SitemapStat label="Pages" value={sitemap.pages} />
          </div>
          <div className="mt-6 pt-6 border-t border-[#1A1414]/8 flex flex-wrap items-center gap-6 text-sm">
            <span className="text-[#6B5F5F]">
              <strong className="accent-text font-heading text-lg">{sitemap.total}</strong> URLs im Sitemap
            </span>
            <a
              href={sitemap.sitemap_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-[#1A1414] hover:accent-text"
              data-testid="dashboard-view-sitemap"
            >
              sitemap.xml <ExternalLink size={11} />
            </a>
            <a
              href={sitemap.robots_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-[#1A1414] hover:accent-text"
              data-testid="dashboard-view-robots"
            >
              robots.txt <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function SitemapStat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#9B8F8F]">{label}</div>
      <div className="font-heading text-2xl mt-1">{value}</div>
    </div>
  );
}
