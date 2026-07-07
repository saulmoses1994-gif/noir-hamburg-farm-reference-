import { Link, NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Users, FileText, Inbox, LogOut, Home, Image, Settings, User, MapPin, Sparkles } from "lucide-react";

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const nav = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF] text-[#6B5F5F]">Lädt…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  const handleLogout = async () => {
    await logout();
    nav("/admin/login");
  };

  const links = [
    { to: "/admin", label: "Dashboard", icon: Home, end: true },
    { to: "/admin/models", label: "Models", icon: Users },
    { to: "/admin/blog", label: "Blog", icon: FileText },
    { to: "/admin/pages", label: "Pages", icon: FileText },
    { to: "/admin/areas", label: "Stadtteile", icon: MapPin },
    { to: "/admin/services", label: "Services", icon: Sparkles },
    { to: "/admin/contacts", label: "Anfragen", icon: Inbox },
    { to: "/admin/media", label: "Medien", icon: Image },
    { to: "/admin/settings", label: "Einstellungen", icon: Settings },
    { to: "/admin/account", label: "Konto", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1414] flex" data-testid="admin-layout">
      <aside className="w-64 bg-[#FBF7F4] border-r border-[#1A1414]/8 flex flex-col">
        <div className="p-6 border-b border-[#1A1414]/8">
          <Link to="/" className="font-heading text-lg tracking-[0.25em] uppercase">
            <span>Noir</span> <span className="accent-text">Hamburg</span>
          </Link>
          <div className="text-xs font-mono text-[#9B8F8F] mt-1">CMS · Admin</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-light transition-colors ${
                  isActive ? "bg-[#F2EAE4] accent-text" : "text-[#6B5F5F] hover:bg-[#F2EAE4] hover:text-[#1A1414]"
                }`
              }
              data-testid={`admin-nav-${label.toLowerCase()}`}
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1A1414]/8">
          <div className="text-xs text-[#9B8F8F] mb-2 font-mono">{user.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[#6B5F5F] hover:text-[#1A1414]"
            data-testid="admin-logout-btn"
          >
            <LogOut size={14} /> Abmelden
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
