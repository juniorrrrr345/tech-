'use client';
import { useEffect, useState } from 'react';
import { Product } from './ProductCard';
import { useCartStore } from '@/lib/cartStore';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaDisplay from './MediaDisplay';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { addItem } = useCartStore();

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [product]);

  const handleAddToCart = (weight: string, price: number, originalPrice: number, discount: number) => {
    if (!product) return;
    
    addItem({
      productId: product.id.toString(),
      productName: product.name,
      farm: product.farm,
      image: product.image_url,
      weight,
      price,
      originalPrice,
      discount
    });
    
    toast.success(`${product.name} (${weight}) ajouté au panier !`);
  };

  if (!product) return null;

  // Créer une liste des prix avec promotions
  const priceList = Object.entries(product.prices || {})
    .filter(([, price]) => {
      return price !== undefined && 
             price !== null && 
             price !== 0 && 
             price !== '' && 
             !isNaN(Number(price)) && 
             Number(price) > 0;
    })
    .map(([weight, price]) => {
      const promo = product.promotions?.[weight as keyof typeof product.promotions] || 0;
      const originalPrice = Number(price);
      const finalPrice = promo > 0 ? originalPrice * (1 - promo / 100) : originalPrice;
      
      return {
        weight,
        originalPrice,
        finalPrice,
        discount: promo
      };
    })
    .sort((a, b) => {
      const weightA = parseInt(a.weight);
      const weightB = parseInt(b.weight);
      return weightA - weightB;
    });

  return (
    <div className="fixed inset-0 z-[100000] bg-[#0B1630]">
      {/* Header avec bouton fermer */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-[#0B1630] to-transparent">
        <button 
          onClick={onClose}
          className="ml-auto block text-white hover:text-gray-300 bg-black/50 backdrop-blur-sm rounded-full p-2.5"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Contenu scrollable */}
      <div className="w-full h-full overflow-y-auto pb-20 pt-16">
        <div className="p-4">
          {/* Grande image circulaire ou carrée arrondie */}
          <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden mb-6">
            {product.video_url ? (
              <video 
                src={product.video_url}
                className="w-full h-full object-contain"
                controls
                muted
                playsInline
              >
                <source src={product.video_url} type="video/mp4" />
                Vidéo non supportée
              </video>
            ) : product.image_url ? (
              <img 
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div>Aucune image</div>
                </div>
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">{product.name}</h1>
            <p className="text-gray-400 text-sm mb-1">{product.farm}</p>
            <p className="text-blue-400 text-sm">Catégorie: {product.category}</p>
          </div>

          {/* Bloc description */}
          <div className="bg-[#111F3A] p-4 rounded-lg mb-6">
            <h3 className="text-white font-semibold mb-3">Informations produit</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong className="text-white">Farm:</strong> {product.farm}</p>
              <p><strong className="text-white">Strain:</strong> {product.name}</p>
              <p><strong className="text-white">Catégorie:</strong> {product.category}</p>
              {product.description && (
                <p><strong className="text-white">Description:</strong> {product.description}</p>
              )}
            </div>
          </div>

          {/* Sélecteur quantités */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-4">Sélectionner la Quantité</h3>
            <div className="grid grid-cols-2 gap-3">
              {priceList.map(({ weight, originalPrice, finalPrice, discount }, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddToCart(weight, finalPrice, originalPrice, discount)}
                  className="px-4 py-3 bg-gray-700 rounded-lg text-white hover:bg-blue-600 transition-colors text-center"
                >
                  <div className="font-semibold">{weight}</div>
                  <div className="text-sm text-blue-400">
                    {discount > 0 ? (
                      <>
                        <span className="line-through text-gray-400">{originalPrice}€</span>
                        <span className="ml-1">{finalPrice.toFixed(2)}€</span>
                        <span className="text-green-400 ml-1">-{discount}%</span>
                      </>
                    ) : (
                      `${finalPrice.toFixed(2)}€`
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bouton Commander */}
          <button 
            onClick={() => {
              if (priceList.length > 0) {
                const { weight, finalPrice, originalPrice, discount } = priceList[0];
                handleAddToCart(weight, finalPrice, originalPrice, discount);
              }
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Commander Maintenant
          </button>
        </div>
      </div>
    </div>
  );
}