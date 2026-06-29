import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminModels() {
  const [models, setModels] = useState([]);

  const load = useCallback(() => api.get("/models").then((r) => setModels(r.data)), []);

  useEffect(() => { load(); }, [load]);

  const del = async (slug) => {
    if (!confirm(`Model "${slug}" wirklich löschen?`)) return;
    try {
      await api.delete(`/models/${slug}`);
      toast.success("Gelöscht");
      load();
    } catch (e) {
      toast.error("Fehler beim Löschen.");
    }
  };

  return (
    <div className="p-12" data-testid="admin-models">
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="overline">CMS</span>
          <h1 className="font-heading text-4xl lg:text-5xl mt-3">Models</h1>
        </div>
        <Link to="/admin/models/new" className="btn-primary" data-testid="admin-new-model">
          <Plus size={14} /> Neues Model
        </Link>
      </div>

      <div className="border border-[#1A1414]/8 bg-[#FBF7F4]">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#1A1414]/15 text-xs font-mono uppercase tracking-[0.15em] text-[#9B8F8F]">
          <div className="col-span-1">Bild</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-1">Alter</div>
          <div className="col-span-3">Slug</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Aktion</div>
        </div>
        {models.map((m) => (
          <div key={m.id} className="grid grid-cols-12 gap-4 p-4 border-b border-[#1A1414]/8 items-center hover:bg-[#F2EAE4]" data-testid={`admin-model-row-${m.slug}`}>
            <div className="col-span-1">
              {m.cover_image && <img src={m.cover_image} alt={m.name} className="w-12 h-16 object-cover" />}
            </div>
            <div className="col-span-3 font-heading text-xl">{m.name}</div>
            <div className="col-span-1 text-sm font-light">{m.age}</div>
            <div className="col-span-3 text-sm font-mono text-[#6B5F5F]">{m.slug}</div>
            <div className="col-span-2">
              <span className={`text-xs uppercase tracking-[0.15em] py-1 px-2 ${m.featured ? "accent-text border border-[#8B1538]" : "text-[#6B5F5F] border border-[#1A1414]/15"}`}>
                {m.featured ? "Featured" : "Standard"}
              </span>
            </div>
            <div className="col-span-2 text-right flex gap-2 justify-end">
              <Link to={`/admin/models/edit/${m.slug}`} className="p-2 hover:accent-text" data-testid={`admin-edit-${m.slug}`}><Pencil size={16} /></Link>
              <button onClick={() => del(m.slug)} className="p-2 hover:text-red-400" data-testid={`admin-delete-${m.slug}`}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {models.length === 0 && (
          <div className="p-12 text-center text-[#6B5F5F]">Keine Models vorhanden.</div>
        )}
      </div>
    </div>
  );
}
