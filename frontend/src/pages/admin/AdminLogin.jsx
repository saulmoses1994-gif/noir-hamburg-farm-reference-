import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, login, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@noir-hamburg.de");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#9CA3AF]">Lädt…</div>;
  if (user && user.role === "admin") return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      if (u.role !== "admin") {
        toast.error("Kein Admin-Konto.");
        return;
      }
      nav("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-6" data-testid="admin-login-page">
      <form onSubmit={submit} className="w-full max-w-md" data-testid="admin-login-form">
        <div className="text-center mb-12">
          <span className="overline accent-text">Admin</span>
          <h1 className="font-heading text-4xl tracking-tight mt-3"><span className="text-[#F5F5F0]">Noir</span> <span className="accent-text">Hamburg</span></h1>
          <p className="text-sm font-light text-[#9CA3AF] mt-2">CMS Login</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="overline text-[10px] block mb-2">E-Mail</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/10 focus:border-[#E5D3B3] outline-none p-3 font-light text-[#F5F5F0]"
              data-testid="admin-email"
            />
          </div>
          <div>
            <label className="overline text-[10px] block mb-2">Passwort</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/10 focus:border-[#E5D3B3] outline-none p-3 font-light text-[#F5F5F0]"
              data-testid="admin-password"
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50" data-testid="admin-login-submit">
            {busy ? "Wird angemeldet…" : "Anmelden"}
          </button>
        </div>
      </form>
    </div>
  );
}
