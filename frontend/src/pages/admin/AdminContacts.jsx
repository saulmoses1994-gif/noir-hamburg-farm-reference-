import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("");

  const load = () => api.get("/contact").then((r) => setContacts(r.data));
  useEffect(() => { load(); }, []);

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
            <button key={s} onClick={() => setFilter(s)} className={`text-xs uppercase tracking-[0.15em] py-2 px-3 border ${filter === s ? "border-[#E5D3B3] text-[#E5D3B3]" : "border-white/10 text-[#9CA3AF]"}`}>
              {s || "Alle"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((c) => (
          <div key={c.id} className="border border-white/5 bg-[#121214] p-6" data-testid={`contact-${c.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-heading text-2xl">{c.name}</div>
                <div className="overline text-[10px] mt-1 accent-text">
                  {new Date(c.created_at).toLocaleString("de-DE")} · {c.status}
                </div>
              </div>
              <div className="text-sm font-light text-right">
                <div><a href={`mailto:${c.email}`} className="hover:accent-text">{c.email}</a></div>
                {c.phone && <div className="text-[#9CA3AF]">{c.phone}</div>}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono uppercase tracking-[0.15em] text-[#9CA3AF]">
              {c.service && <div>Service: <span className="accent-text">{c.service}</span></div>}
              {c.location && <div>Ort: <span className="accent-text">{c.location}</span></div>}
              {c.date && <div>Wunschdatum: <span className="accent-text">{c.date}</span></div>}
              {c.model_slug && <div>Model: <span className="accent-text">{c.model_slug}</span></div>}
            </div>
            <p className="mt-4 text-sm font-light text-[#F5F5F0] leading-relaxed whitespace-pre-wrap">{c.message}</p>
            <div className="mt-4 flex gap-2">
              {["new", "read", "closed"].map((s) => (
                <button key={s} onClick={() => setStatus(c.id, s)} className={`text-xs uppercase tracking-[0.15em] py-1 px-3 border ${c.status === s ? "border-[#E5D3B3] text-[#E5D3B3]" : "border-white/10 text-[#9CA3AF] hover:text-[#F5F5F0]"}`} data-testid={`status-${c.id}-${s}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-12 text-center text-[#9CA3AF]">Keine Anfragen.</div>}
      </div>
    </div>
  );
}
