import Header from "./Header";
import Footer from "./Footer";
import MobileStickyCTA from "@/components/MobileStickyCTA";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-[#1A1414]" data-testid="public-layout">
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
