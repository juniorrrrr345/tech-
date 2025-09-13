'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

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

export default function Catalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [farms, setFarms] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories");
  const [selectedFarm, setSelectedFarm] = useState("Toutes les farms");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les produits depuis l'API du panel admin
    fetch("/api/cloudflare/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur chargement produits:', error);
        setLoading(false);
      });

    // Récupérer les catégories
    fetch("/api/cloudflare/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(['Toutes les catégories', ...data.map((cat: any) => cat.name)]);
      });

    // Récupérer les farms
    fetch("/api/cloudflare/farms")
      .then((res) => res.json())
      .then((data) => {
        setFarms(['Toutes les farms', ...data.map((farm: any) => farm.name)]);
      });
  }, []);

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'Toutes les catégories' || product.category === selectedCategory;
    const farmMatch = selectedFarm === 'Toutes les farms' || product.farm === selectedFarm;
    return categoryMatch && farmMatch;
  });

  // Trouver le prix minimum pour l'affichage
  const getMinPrice = (product: Product) => {
    const prices = Object.values(product.prices || {}).filter(price => price > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const minWeight = Object.entries(product.prices || {}).find(([, price]) => price === minPrice)?.[0] || '10g';
    return { price: minPrice, weight: minWeight };
  };

  if (loading) {
    return (
      <Layout>
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

  return (
    <Layout>
      <div className="catalogue">
        {/* Bandeau titre */}
        <div className="catalogue-header">
          <h2>Catalogue</h2>
          <div className="filters">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select 
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
            >
              {farms.map((farm) => (
                <option key={farm} value={farm}>{farm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grille produits */}
        <div className="grid">
          {filteredProducts.map((product) => {
            const { price, weight } = getMinPrice(product);
            return (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div className="card">
                  <img src={product.image_url || '/placeholder.jpg'} alt={product.name} className="card-img" />
                  <div className="card-info">
                    <h3>{product.name}</h3>
                    <p className="farm">{product.farm}</p>
                    <p className="price">{price}€ / {weight}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>Aucun produit trouvé</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .catalogue {
          padding: 20px;
        }
        .catalogue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0;
          flex-wrap: wrap;
          gap: 15px;
        }
        .catalogue-header h2 {
          font-size: 28px;
          font-weight: bold;
          color: #4da6ff;
          margin: 0;
        }
        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .filters select {
          background: #152842;
          color: white;
          border: 1px solid #2a3f5f;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
        }
        .filters select:focus {
          outline: none;
          border-color: #4da6ff;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        .card {
          background: #152842;
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #2a3f5f;
        }
        .card:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(77, 166, 255, 0.2);
        }
        .card-img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .card-info h3 {
          font-size: 16px;
          margin-bottom: 5px;
          font-weight: 600;
          line-height: 1.3;
        }
        .farm {
          font-size: 12px;
          color: #bbb;
          margin-bottom: 5px;
        }
        .price {
          font-weight: bold;
          color: #4da6ff;
          font-size: 14px;
        }
        .no-products {
          text-align: center;
          padding: 40px;
          color: #bbb;
          font-size: 18px;
        }
        @media (max-width: 768px) {
          .catalogue-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
          }
        }
      `}</style>
    </Layout>
  );
}