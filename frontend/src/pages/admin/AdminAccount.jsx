import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/**
 * Account settings — self-service password change for the current admin.
 * Requires current password to defeat session-hijack scenarios.
 */
export default function AdminAccount() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (next.length < 10) return toast.error("Neues Passwort muss mindestens 10 Zeichen haben");
    if (next !== confirm) return toast.error("Passwortbestätigung stimmt nicht überein");
    if (next === current) return toast.error("Neues Passwort muss sich vom aktuellen unterscheiden");

    setBusy(true);
    try {
      await api.post("/auth/change-password", {
        current_password: current,
        new_password: next,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Passwort geändert");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Fehler beim Speichern");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-xl" data-testid="admin-account">
      <h1 className="font-heading text-3xl">Konto</h1>
      <p className="text-sm text-[#6B5F5F] mt-2">Angemeldet als <strong>{user?.email}</strong></p>

      <div className="mt-10">
        <h2 className="overline text-[10px] mb-4">Passwort ändern</h2>

        <label className="block">
          <span className="text-xs text-[#6B5F5F] block mb-1.5">Aktuelles Passwort</span>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full bg-transparent border border-[#1A1414]/15 outline-none focus:border-[#8B1538] p-2.5 text-sm"
            data-testid="account-current-password"
            autoComplete="current-password"
          />
        </label>

        <label className="block mt-4">
          <span className="text-xs text-[#6B5F5F] block mb-1.5">Neues Passwort (mind. 10 Zeichen)</span>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="w-full bg-transparent border border-[#1A1414]/15 outline-none focus:border-[#8B1538] p-2.5 text-sm"
            data-testid="account-new-password"
            autoComplete="new-password"
          />
        </label>

        <label className="block mt-4">
          <span className="text-xs text-[#6B5F5F] block mb-1.5">Neues Passwort bestätigen</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-transparent border border-[#1A1414]/15 outline-none focus:border-[#8B1538] p-2.5 text-sm"
            data-testid="account-confirm-password"
            autoComplete="new-password"
          />
        </label>

        <button
          onClick={submit}
          disabled={busy || !current || !next || !confirm}
          className="mt-6 btn-primary disabled:opacity-40"
          data-testid="account-save-btn"
        >
          {busy ? "Speichert…" : "Passwort ändern"}
        </button>
      </div>
    </div>
  );
}
