"use client";
import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import FiltersBar from "@/components/FiltersBar";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<{category?: string; farm?: string}>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/cloudflare/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = Array.from(new Set(products.map(p=>p.category).filter(Boolean))) as string[];
  const farms = Array.from(new Map(products.map(p=>[p.farm?.id, p.farm])).values()).filter(Boolean) as Product["farm"][];

  const filtered = products.filter(p=>{
    const okCat = !searchParams?.category || p.category === searchParams.category;
    const okFarm = !searchParams?.farm || p.farm?.id === searchParams.farm;
    return okCat && okFarm;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07132a] flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07132a]">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 text-white">
        <h1 className="mb-4 text-3xl font-bold">Catalogue</h1>
        <FiltersBar categories={categories} farms={farms as any} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0a1630]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-white">
          <a href="/">Accueil</a>
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}