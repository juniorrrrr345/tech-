'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";

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

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      // Récupérer le produit depuis l'API du panel admin
      fetch(`/api/cloudflare/products/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setSelectedImage(data.image_url);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Erreur chargement produit:', error);
          setLoading(false);
        });
    }
  }, [params.id]);

  if (loading) {
    return (
      <Layout showBackButton={true}>
        <div className="loading">Chargement...</div>
        <style jsx>{`
          .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 50vh;
            font-size: 18px;
            color: #4da6ff;
          }
        `}</style>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout showBackButton={true}>
        <div className="error">Produit non trouvé</div>
        <style jsx>{`
          .error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 50vh;
            font-size: 18px;
            color: #ff6b6b;
          }
        `}</style>
      </Layout>
    );
  }

  // Créer une liste des prix disponibles
  const priceList = Object.entries(product.prices || {})
    .filter(([, price]) => price > 0)
    .map(([weight, price]) => ({ weight, price: Number(price) }))
    .sort((a, b) => parseInt(a.weight) - parseInt(b.weight));

  return (
    <Layout showBackButton={true}>
      <div className="detail">
        {/* Images */}
        <div className="image-slider">
          <img 
            src={selectedImage || product.image_url} 
            alt={product.name} 
            className="main-img" 
          />
          <div className="thumbs">
            {product.image_url && (
              <img
                src={product.image_url}
                alt="main"
                className={`thumb ${selectedImage === product.image_url ? "active" : ""}`}
                onClick={() => setSelectedImage(product.image_url)}
              />
            )}
            {product.video_url && (
              <div
                className={`thumb video-thumb ${selectedImage === product.video_url ? "active" : ""}`}
                onClick={() => setSelectedImage(product.video_url)}
              >
                <div className="play-icon">▶</div>
              </div>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="info">
          <h2>{product.name} <span>🌿</span></h2>
          <p>Farm: {product.farm}</p>
          <p>Catégorie: {product.category}</p>
          {product.description && (
            <p className="description">{product.description}</p>
          )}
          <p className="price">{priceList[0]?.price || 0}€ / {priceList[0]?.weight || '10g'}</p>
        </div>
      </div>

      <style jsx>{`
        .detail {
          padding: 20px;
        }
        .image-slider {
          text-align: center;
          margin-bottom: 20px;
        }
        .main-img {
          width: 100%;
          max-width: 400px;
          height: 300px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 15px;
        }
        .thumbs {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .thumb {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
          opacity: 0.6;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        .thumb.active {
          border-color: #4da6ff;
          opacity: 1;
        }
        .video-thumb {
          background: #152842;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #2a3f5f;
          border-radius: 6px;
        }
        .video-thumb.active {
          border-color: #4da6ff;
        }
        .play-icon {
          color: #4da6ff;
          font-size: 20px;
        }
        .info {
          margin-top: 20px;
          background: #152842;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #2a3f5f;
        }
        .info h2 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #4da6ff;
        }
        .info p {
          color: #bbb;
          margin-bottom: 5px;
        }
        .description {
          color: #ddd !important;
          line-height: 1.5;
          margin-top: 10px !important;
        }
        .price {
          font-size: 20px !important;
          font-weight: bold !important;
          color: #4da6ff !important;
          margin-top: 10px !important;
        }
        @media (max-width: 768px) {
          .main-img {
            height: 250px;
          }
        }
      `}</style>
    </Layout>
  );
}