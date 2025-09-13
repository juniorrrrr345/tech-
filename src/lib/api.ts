import { Product } from "@/types/product";

// Utiliser les APIs Cloudflare existantes
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cloudflare/products`, {
      next: { revalidate: 60 }
    });
    if (!response.ok) throw new Error("Produits introuvables");
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cloudflare/products/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!response.ok) throw new Error("Produit introuvable");
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    throw error;
  }
}