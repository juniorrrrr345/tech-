import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { tierLabel } from "@/lib/utils";

export default function ProductCard({ p }: { p: Product }) {
  const main = p.media.find(m=>m.type==="image") ?? p.media[0];
  return (
    <Link href={`/produit/${p.slug}`} className="group block overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/5">
      <div className="relative h-48 w-full">
        {main?.type==="image" ? (
          <Image src={(main as any).url} alt={p.name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="h-full w-full bg-black/40" />
        )}
        {p.micron && <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{p.micron}</span>}
      </div>
      <div className="space-y-1 p-4 text-white">
        <div className="text-lg font-semibold">{p.name}</div>
        <div className="text-sm opacity-70">{p.farm?.name}</div>
        {p.priceTiers?.[0] && <div className="pt-1 text-xl font-bold text-sky-300">{tierLabel(p.priceTiers[0])}</div>}
      </div>
    </Link>
  );
}