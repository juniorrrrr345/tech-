"use client";
import { useState, useEffect } from "react";
import QuantitySelector from "@/components/QuantitySelector";
import { PriceTier } from "@/types/product";
import { tierLabel, whatsAppUrl } from "@/lib/utils";

export default function PriceBlock({ p }:{
  p: { name: string; slug: string; priceTiers: PriceTier[] }
}) {
  const [sel, setSel] = useState<PriceTier | null>(null);

  useEffect(() => {
    if (p.priceTiers?.length) setSel(p.priceTiers[0]);
  }, [p.priceTiers]);

  return (
    <div className="space-y-3">
      <h2 className="mt-6 text-lg font-semibold">Sélectionner la Quantité</h2>
      <QuantitySelector tiers={p.priceTiers} onChange={(t)=>setSel(t)} />
      {sel && <div className="pt-1 text-xl font-bold text-sky-300">{tierLabel(sel)}</div>}

      <a
        href={sel ? whatsAppUrl(p, sel.grams, sel.priceEur) : "#"}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-4 text-lg font-semibold text-white"
      >
        Commander Maintenant
      </a>
    </div>
  );
}