import AppHeader from "@/components/AppHeader";
import MediaCarousel from "@/components/MediaCarousel";
import PriceBlock from "@/components/PriceBlock";
import { getProduct } from "@/lib/api";

export const revalidate = 60;

export default async function ProductPage({ params }:{ params:{ slug:string } }) {
  const p = await getProduct(params.slug);

  return (
    <div className="min-h-screen bg-[#07132a] text-white">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <MediaCarousel media={p.media} />
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">
              {p.name} {p.micron && <span>• {p.micron}</span>}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <a className="rounded-full bg-white/10 px-3 py-1 text-sm" href={`/?farm=${p.farm?.id}`}>
                Farm: {p.farm?.name}
              </a>
              {p.micron && <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{p.micron}</span>}
            </div>

            {p.description && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm opacity-90">
                {p.description}
              </div>
            )}

            {p.priceTiers?.length>0 && <PriceBlock p={p} />}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0a1630]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-white">
          <a href="/">Accueil</a>
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}