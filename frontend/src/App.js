import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { AuthProvider } from "@/lib/auth";
import { detectLang, t as rawT } from "@/data/i18n";

// Code splitting: each route is its own JS chunk. Public visitors no longer
// download admin code; admin users only pay for the admin shell.
const Home = lazy(() => import("@/pages/public/Home"));
const Models = lazy(() => import("@/pages/public/Models"));
const ModelDetail = lazy(() => import("@/pages/public/ModelDetail"));
const EscortHamburg = lazy(() => import("@/pages/public/EscortHamburg"));
const ServicesList = lazy(() => import("@/pages/public/Services").then((m) => ({ default: m.ServicesList })));
const ServiceDetail = lazy(() => import("@/pages/public/Services").then((m) => ({ default: m.ServiceDetail })));
const AreasList = lazy(() => import("@/pages/public/Areas").then((m) => ({ default: m.AreasList })));
const AreaDetail = lazy(() => import("@/pages/public/Areas").then((m) => ({ default: m.AreaDetail })));
const BlogList = lazy(() => import("@/pages/public/Blog").then((m) => ({ default: m.BlogList })));
const BlogDetail = lazy(() => import("@/pages/public/Blog").then((m) => ({ default: m.BlogDetail })));
const FAQ = lazy(() => import("@/pages/public/FAQ"));
const About = lazy(() => import("@/pages/public/About"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const PageDetail = lazy(() => import("@/pages/public/PageDetail"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminModels = lazy(() => import("@/pages/admin/AdminModels"));
const AdminModelEdit = lazy(() => import("@/pages/admin/AdminModelEdit"));
const AdminBlog = lazy(() => import("@/pages/admin/AdminBlog").then((m) => ({ default: m.AdminBlog })));
const AdminBlogEdit = lazy(() => import("@/pages/admin/AdminBlog").then((m) => ({ default: m.AdminBlogEdit })));
const AdminContacts = lazy(() => import("@/pages/admin/AdminContacts"));
const AdminPages = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.AdminPages })));
const AdminPageEdit = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.AdminPageEdit })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  // Keep <html lang="..."> in sync with the current URL prefix so a11y tools
  // and search engines see the right language on client-side navigations.
  useEffect(() => {
    const lang = detectLang(pathname);
    document.documentElement.setAttribute("lang", lang);
  }, [pathname]);
  return null;
}

function PageFallback() {
  const lang = detectLang(typeof window === "undefined" ? "/" : window.location.pathname);
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-[#6B5F5F] text-sm">
      {rawT("misc.loading", lang)}
    </div>
  );
}

function SkipLink() {
  const { pathname } = useLocation();
  const lang = detectLang(pathname);
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-[#8B1538] focus:text-white focus:px-4 focus:py-2 focus:rounded"
    >
      {rawT("cta.skipToMain", lang)}
    </a>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          {/* Accessibility: skip to main content (visible on keyboard focus only) */}
          <SkipLink />
          <Toaster theme="light" position="top-right" richColors />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public — DE (default) */}
              <Route path="/" element={<Home />} />
              <Route path="/models" element={<Models />} />
              <Route path="/models/:slug" element={<ModelDetail />} />
              <Route path="/escort-hamburg" element={<EscortHamburg />} />
              <Route path="/services" element={<ServicesList />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/areas" element={<AreasList />} />
              <Route path="/escort/:slug" element={<AreaDetail />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/ueber-uns" element={<About />} />
              <Route path="/kontakt" element={<Contact />} />
              {/* CMS-managed landing pages */}
              <Route path="/p/:slug" element={<PageDetail />} />

              {/* Public — EN mirror (UI chrome translated; long-form copy
                  remains in DE for now with an "EN preview" banner) */}
              <Route path="/en" element={<Home />} />
              <Route path="/en/models" element={<Models />} />
              <Route path="/en/models/:slug" element={<ModelDetail />} />
              <Route path="/en/escort-hamburg" element={<EscortHamburg />} />
              <Route path="/en/services" element={<ServicesList />} />
              <Route path="/en/services/:slug" element={<ServiceDetail />} />
              <Route path="/en/areas" element={<AreasList />} />
              <Route path="/en/escort/:slug" element={<AreaDetail />} />
              <Route path="/en/blog" element={<BlogList />} />
              <Route path="/en/blog/:slug" element={<BlogDetail />} />
              <Route path="/en/faq" element={<FAQ />} />
              <Route path="/en/about" element={<About />} />
              <Route path="/en/contact" element={<Contact />} />
              <Route path="/en/p/:slug" element={<PageDetail />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="models" element={<AdminModels />} />
                <Route path="models/new" element={<AdminModelEdit />} />
                <Route path="models/edit/:slug" element={<AdminModelEdit />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="blog/new" element={<AdminBlogEdit />} />
                <Route path="blog/edit/:slug" element={<AdminBlogEdit />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="pages/new" element={<AdminPageEdit />} />
                <Route path="pages/edit/:slug" element={<AdminPageEdit />} />
                <Route path="contacts" element={<AdminContacts />} />
              </Route>

              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
