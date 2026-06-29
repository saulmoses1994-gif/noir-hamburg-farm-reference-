import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F0] grain" data-testid="public-layout">
      <Header />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
