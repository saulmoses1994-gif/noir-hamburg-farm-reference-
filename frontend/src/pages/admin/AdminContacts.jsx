import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("");

  const load = useCallback(() => api.get("/contact").then((r) => setContacts(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/contact/${id}?status=${status}`);
      toast.success("Status aktualisiert");
      load();
    } catch { toast.error("Fehler"); }
  };

  const filtered = contacts.filter((c) => !filter || c.status === filter);

  return (
    <div className="p-12" data-testid="admin-contacts">
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl mt-3">Anfragen</h1>
        </div>
        <div className="flex gap-2">
          {["", "new", "read", "closed"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`text-xs uppercase tracking-[0.15em] py-2 px-3 border ${filter === s ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F]"}`}>
              {s || "Alle"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((c) => (
          <div key={c.id} className="border border-[#1A1414]/8 bg-[#FBF7F4] p-6" data-testid={`contact-${c.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-heading text-2xl">{c.name}</div>
                <div className="overline text-[10px] mt-1 accent-text">
                  {new Date(c.created_at).toLocaleString("de-DE")} · {c.status}
                </div>
              </div>
              <div className="text-sm font-light text-right">
                <div><a href={`mailto:${c.email}`} className="hover:accent-text">{c.email}</a></div>
                {c.phone && <div className="text-[#6B5F5F]">{c.phone}</div>}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono uppercase tracking-[0.15em] text-[#6B5F5F]">
              {c.service && <div>Service: <span className="accent-text">{c.service}</span></div>}
              {c.location && <div>Ort: <span className="accent-text">{c.location}</span></div>}
              {c.date && <div>Wunschdatum: <span className="accent-text">{c.date}</span></div>}
              {c.model_slug && <div>Model: <span className="accent-text">{c.model_slug}</span></div>}
            </div>
            <p className="mt-4 text-sm font-light text-[#1A1414] leading-relaxed whitespace-pre-wrap">{c.message}</p>
            <div className="mt-4 flex gap-2">
              {["new", "read", "closed"].map((s) => (
                <button key={s} onClick={() => setStatus(c.id, s)} className={`text-xs uppercase tracking-[0.15em] py-1 px-3 border ${c.status === s ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F] hover:text-[#1A1414]"}`} data-testid={`status-${c.id}-${s}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-12 text-center text-[#6B5F5F]">Keine Anfragen.</div>}
      </div>
    </div>
  );
}
