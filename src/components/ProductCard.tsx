import MediaDisplay from './MediaDisplay';

interface Product {
  id: number;
  name: string;
  farm: string;
  category: string;
  image_url: string;
  video_url?: string;
  description?: string;
  prices: {
    "5g": number;
    "10g": number;
    "25g": number;
    "50g": number;
    "100g": number;
    "200g": number;
  };
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  // Trouver le prix minimum pour l'affichage
  const prices = Object.values(product.prices || {}).filter(price => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const minWeight = Object.entries(product.prices || {}).find(([, price]) => price === minPrice)?.[0] || '10g';

  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-[#111F3A] rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group touch-manipulation w-full"
    >
      {/* Image produit arrondie */}
      <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-gray-400 text-4xl">📷</div>
          </div>
        )}
        
        {/* Badge catégorie */}
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
          {product.category}
        </div>
        
        {/* Indicateur vidéo */}
        {product.video_url && (
          <div className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-full shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Nom + emoji */}
      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
        {product.name}
      </h3>
      
      {/* Farm en petit */}
      <p className="text-gray-400 text-xs mb-2 line-clamp-1">
        {product.farm}
      </p>
      
      {/* Prix affiché en bas (style bleu) */}
      <p className="text-blue-400 font-bold text-sm">
        {minPrice}€ / {minWeight}
      </p>
    </div>
  );
}

export type { Product };