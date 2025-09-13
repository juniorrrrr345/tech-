"use client";
import { PriceTier } from "@/types/product";
import { useEffect, useState } from "react";
import { fmtMoney } from "@/lib/utils";

export default function QuantitySelector({ tiers, onChange }:{
  tiers: PriceTier[];
  onChange?: (tier: PriceTier)=>void;
}) {
  const [sel, setSel] = useState(0);
  useEffect(()=>{ if (tiers?.length) onChange?.(tiers[0]); },[tiers]);

  const pick = (i:number)=>{ setSel(i); onChange?.(tiers[i]); };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiers.map((t,i)=>(
        <button key={t.grams}
          onClick={()=>pick(i)}
          className={`rounded-2xl border px-4 py-3 text-left ${i===sel?"border-white bg-white/10":"border-white/10 bg-white/5"} text-white`}
        >
          <div className="text-lg font-semibold">{fmtMoney(t.priceEur)}</div>
          <div className="text-sm opacity-70">{t.grams}g</div>
        </button>
      ))}
    </div>
  );
}