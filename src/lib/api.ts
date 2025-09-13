import { Product } from "@/types/product";

const BASE = (process.env.NEXT_PUBLIC_PRODUCTS_URL ?? "").replace(/\/$/, "");

export async function getProducts(): Promise<Product[]> {
  const url = BASE ? `${BASE}` : "/api/products";
  const r = await fetch(url, { next: { revalidate: 60 } });
  if (!r.ok) throw new Error("Produits introuvables");
  return r.json();
}

export async function getProduct(slug: string): Promise<Product> {
  const url = BASE ? `${BASE}/${slug}` : `/api/products/${slug}`;
  const r = await fetch(url, { next: { revalidate: 60 } });
  if (!r.ok) throw new Error("Produit introuvable");
  return r.json();
}