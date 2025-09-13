'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <div className="detail">
        <div className="loading">Chargement...</div>
        <style jsx>{`
          .detail {
            padding: 20px;
            background: #0a1a2f;
            min-height: 100vh;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading {
            font-size: 18px;
            color: #4da6ff;
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="detail">
        <div className="error">Produit non trouvé</div>
        <style jsx>{`
          .detail {
            padding: 20px;
            background: #0a1a2f;
            min-height: 100vh;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error {
            font-size: 18px;
            color: #ff6b6b;
          }
        `}</style>
      </div>
    );
  }

  // Créer une liste des prix disponibles
  const priceList = Object.entries(product.prices || {})
    .filter(([, price]) => price > 0)
    .map(([weight, price]) => ({ weight, price: Number(price) }))
    .sort((a, b) => parseInt(a.weight) - parseInt(b.weight));

  return (
    <div className="detail">
      {/* Header */}
      <div className="header">
        <button onClick={() => router.back()} className="back">← Retour</button>
        <h1 className="logo">TECH+ Paris</h1>
      </div>

      {/* Image principale + thumbnails */}
      <div className="image-slider">
        <div className="main-image-container">
          {product.video_url ? (
            <video 
              src={product.video_url}
              className="main-img"
              controls
              muted
              playsInline
            >
              <source src={product.video_url} type="video/mp4" />
              Vidéo non supportée
            </video>
          ) : (
            <img 
              src={selectedImage || product.image_url} 
              alt={product.name} 
              className="main-img" 
            />
          )}
        </div>
        
        {/* Thumbnails si plusieurs images */}
        {product.image_url && (
          <div className="thumbs">
            <img
              src={product.image_url}
              alt="main"
              className={`thumb ${selectedImage === product.image_url ? "active" : ""}`}
              onClick={() => setSelectedImage(product.image_url)}
            />
            {product.video_url && (
              <div
                className={`thumb video-thumb ${selectedImage === product.video_url ? "active" : ""}`}
                onClick={() => setSelectedImage(product.video_url)}
              >
                <div className="play-icon">▶</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Infos produit */}
      <div className="info">
        <h2 className="name">{product.name}</h2>
        <p className="farm">Farm: {product.farm}</p>
        <p className="category">Catégorie: {product.category}</p>
        {product.description && (
          <p className="description">{product.description}</p>
        )}
      </div>

      {/* Prix disponibles */}
      <div className="prices">
        <h3 className="prices-title">Prix disponibles :</h3>
        <div className="price-grid">
          {priceList.map(({ weight, price }) => (
            <div key={weight} className="price-item">
              <span className="weight">{weight}</span>
              <span className="price">{price}€</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .detail {
          padding: 20px;
          background: #0a1a2f;
          min-height: 100vh;
          color: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 22px;
          font-weight: bold;
          color: #4da6ff;
        }
        .back {
          background: #152842;
          border: 1px solid #2a3f5f;
          color: white;
          cursor: pointer;
          font-size: 16px;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .back:hover {
          background: #2a3f5f;
          border-color: #4da6ff;
        }
        .image-slider {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }
        .main-image-container {
          width: 100%;
          max-width: 400px;
          margin-bottom: 15px;
        }
        .main-img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 12px;
        }
        .thumbs {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .thumb {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
          opacity: 0.6;
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
        .name {
          font-size: 24px;
          margin-bottom: 10px;
          color: #4da6ff;
        }
        .farm {
          color: #bbb;
          margin-bottom: 5px;
        }
        .category {
          color: #bbb;
          margin-bottom: 10px;
        }
        .description {
          color: #ddd;
          line-height: 1.5;
          margin-top: 10px;
        }
        .prices {
          margin-top: 20px;
          background: #152842;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #2a3f5f;
        }
        .prices-title {
          font-size: 18px;
          margin-bottom: 15px;
          color: #4da6ff;
        }
        .price-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }
        .price-item {
          background: #0a1a2f;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #2a3f5f;
        }
        .weight {
          display: block;
          font-size: 14px;
          color: #bbb;
          margin-bottom: 5px;
        }
        .price {
          font-weight: bold;
          color: #4da6ff;
          font-size: 16px;
        }
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          .main-img {
            height: 250px;
          }
          .price-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}