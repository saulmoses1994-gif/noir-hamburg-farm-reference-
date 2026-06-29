import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { AuthProvider } from "@/lib/auth";

// Public pages
import Home from "@/pages/public/Home";
import Models from "@/pages/public/Models";
import ModelDetail from "@/pages/public/ModelDetail";
import EscortHamburg from "@/pages/public/EscortHamburg";
import { ServicesList, ServiceDetail } from "@/pages/public/Services";
import { AreasList, AreaDetail } from "@/pages/public/Areas";
import { BlogList, BlogDetail } from "@/pages/public/Blog";
import FAQ from "@/pages/public/FAQ";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";

// Admin pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminModels from "@/pages/admin/AdminModels";
import AdminModelEdit from "@/pages/admin/AdminModelEdit";
import { AdminBlog, AdminBlogEdit } from "@/pages/admin/AdminBlog";
import AdminContacts from "@/pages/admin/AdminContacts";

// Misc
import NotFound from "@/pages/public/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Toaster theme="dark" position="top-right" richColors />
          <Routes>
            {/* Public */}
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
              <Route path="contacts" element={<AdminContacts />} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
