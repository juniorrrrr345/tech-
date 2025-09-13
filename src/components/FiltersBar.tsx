"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function FiltersBar({ categories, farms }:{
  categories: string[]; farms: {id:string; name:string}[];
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const onChange = (key: "category"|"farm", v: string) => {
    const p = new URLSearchParams(sp.toString());
    v ? p.set(key, v) : p.delete(key);
    router.push(`/?${p.toString()}`);
  };

  return (
    <div className="mb-4 flex gap-3">
      <select
        defaultValue={sp.get("category") ?? ""}
        onChange={(e)=>onChange("category", e.target.value)}
        className="rounded-xl bg-white/5 px-4 py-2 text-white outline-none"
      >
        <option value="">Toutes les catégories</option>
        {categories.map(c=> <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        defaultValue={sp.get("farm") ?? ""}
        onChange={(e)=>onChange("farm", e.target.value)}
        className="rounded-xl bg-white/5 px-4 py-2 text-white outline-none"
      >
        <option value="">Toutes les farms</option>
        {farms.map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </div>
  );
}