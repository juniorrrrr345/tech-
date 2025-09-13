export type MediaItem =
  | { type: "image"; url: string }
  | { type: "video"; url: string; poster?: string };

export type PriceTier = { grams: number; priceEur: number };

export interface Product {
  id: string;
  slug: string;
  name: string;
  farm: { id: string; name: string };
  category?: string;
  micron?: string;              // ex: "120u"
  media: MediaItem[];           // images/vidéos
  description?: string;         // "Farm : ... • Strain : ... • Microns : 120u"
  priceTiers: PriceTier[];      // [{ grams: 10, priceEur: 80 }, ...]
  inStock?: boolean;
}