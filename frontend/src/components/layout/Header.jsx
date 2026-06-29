import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { BRAND, NAV } from "@/data/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-[#0A0A0B]/85 border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="px-6 md:px-12 lg:px-16 py-5 flex items-center justify-between">
        <Link to="/" className="font-heading text-xl tracking-[0.3em] uppercase" data-testid="brand-logo">
          <span className="text-[#F5F5F0]">Noir</span>{" "}
          <span className="accent-text font-light">Hamburg</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.to.replace(/\//g, "") || "home"}`}
              end={n.to === "/"}
              className={({ isActive }) =>
                `text-xs uppercase tracking-[0.2em] font-light link-underline transition-colors ${
                  isActive ? "accent-text" : "text-[#F5F5F0]/80 hover:text-[#F5F5F0]"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Link to="/kontakt" className="btn-primary" data-testid="header-book-btn">
            Buchen
          </Link>
        </div>
        <button
          className="lg:hidden text-[#F5F5F0]"
          onClick={() => setOpen(true)}
          aria-label="Menü öffnen"
          data-testid="mobile-menu-btn"
        >
          <Menu size={26} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-[#0A0A0B] z-50 px-6 py-6 lg:hidden" data-testid="mobile-menu">
          <div className="flex justify-between items-center mb-12">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-heading text-xl tracking-[0.3em] uppercase"
            >
              <span className="text-[#F5F5F0]">Noir</span>{" "}
              <span className="accent-text font-light">Hamburg</span>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Menü schließen" data-testid="mobile-close-btn">
              <X size={26} />
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `font-heading text-3xl tracking-tight ${
                    isActive ? "accent-text" : "text-[#F5F5F0]"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link
              to="/kontakt"
              onClick={() => setOpen(false)}
              className="btn-primary mt-6 w-fit"
              data-testid="mobile-book-btn"
            >
              Buchen
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
