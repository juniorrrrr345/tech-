'use client';
import { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
// Redéploiement forcé - Nouveau chargement TECH+
import CategoryFilter from '../components/CategoryFilter';
import ProductCard, { Product } from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import BottomNav from '../components/BottomNav';
import contentCache from '../lib/contentCache';
import { useAdminSync } from '../hooks/useAdminSync';
export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories');
  const [selectedFarm, setSelectedFarm] = useState('Toutes les farms');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('menu');
  const router = useRouter();
  
  // Précharger les autres pages pour navigation instantanée
  useEffect(() => {
    router.prefetch('/info');
    router.prefetch('/contact');
    router.prefetch('/social');
  }, [router]);
  
  // États pour les données - Initialiser avec des valeurs par défaut
  const [loading, setLoading] = useState(true); // Toujours true au départ
  const [loadingStage, setLoadingStage] = useState(1); // 1 = logo seul, 2 = interface complète
  const [settings, setSettings] = useState<any>(null);

  // Gestion des étapes de chargement
  useEffect(() => {
    // Étape 1 : Logo seul pendant 1.5 secondes
    const stage1Timer = setTimeout(() => {
      setLoadingStage(2); // Passer à l'étape 2
    }, 1500);

    return () => clearTimeout(stage1Timer);
  }, []);

  // Charger les settings immédiatement pour l'image de chargement
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Essayer d'abord le localStorage
        const cached = localStorage.getItem('shopSettings');
        if (cached) {
          setSettings(JSON.parse(cached));
        }
        
        // Puis charger depuis l'API
        const settingsRes = await fetch('/api/cloudflare/settings', { cache: 'no-store' });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
          localStorage.setItem('shopSettings', JSON.stringify(settingsData));
        }
      } catch (error) {
        console.error('Erreur chargement settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Gérer la logique de première visite côté client uniquement
  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      // Si déjà visité, cacher le chargement immédiatement
      setLoading(false);
    } else {
      // Si première visite, marquer comme visité
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []); // Ne s'exécute qu'une fois au montage
  
  // Charger le thème depuis l'API au démarrage
  useEffect(() => {
    const loadThemeForNewVisitors = async () => {
      try {
        // Charger les paramètres depuis l'API pour les nouveaux visiteurs
        const settingsRes = await fetch('/api/cloudflare/settings', { cache: 'no-store' });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData); // Sauvegarder dans l'état
          
          // Sauvegarder dans localStorage pour les prochaines visites
          localStorage.setItem('shopSettings', JSON.stringify(settingsData));
          
          // Appliquer le thème immédiatement
          if (settingsData.backgroundImage) {
            const style = document.createElement('style');
            style.id = 'dynamic-theme-new-visitor';
            style.textContent = `
              html, body, .main-container {
                background-image: url(${settingsData.backgroundImage}) !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                background-attachment: fixed !important;
              }
              .global-overlay {
                background-color: rgba(0, 0, 0, ${(settingsData.backgroundOpacity || 20) / 100}) !important;
                backdrop-filter: blur(${settingsData.backgroundBlur || 5}px) !important;
              }
            `;
            document.head.appendChild(style);
          }
        }
      } catch (error) {
        console.error('Erreur chargement thème:', error);
      }
    };
    
    // Charger le thème immédiatement pour les nouveaux visiteurs
    if (!localStorage.getItem('shopSettings')) {
      loadThemeForNewVisitors();
    }
  }, []);

  // Charger immédiatement depuis l'API - PAS depuis localStorage
  const getInitialProducts = () => {
    // Toujours retourner un tableau vide pour forcer le chargement depuis l'API
    return [];
  };
  
  const getInitialCategories = () => {
    // Toujours retourner les catégories par défaut pour forcer le chargement depuis l'API
    return ['Toutes les catégories'];
  };
  
  const getInitialFarms = () => {
    // Toujours retourner les farms par défaut pour forcer le chargement depuis l'API
    return ['Toutes les farms'];
  };
  
  const [products, setProducts] = useState<Product[]>(getInitialProducts());
  const [categories, setCategories] = useState<string[]>(getInitialCategories());
  const [farms, setFarms] = useState<string[]>(getInitialFarms());

  // Fonction de rechargement des données
  const loadAllData = async () => {
    try {
      console.log('🔄 Rechargement données...');
      
      const [productsRes, categoriesRes, farmsRes] = await Promise.all([
        fetch('/api/cloudflare/products', { cache: 'no-store' }),
        fetch('/api/cloudflare/categories', { cache: 'no-store' }),
        fetch('/api/cloudflare/farms', { cache: 'no-store' })
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        console.log('📦 Produits:', productsData.length);
        setProducts(productsData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('🏷️ Catégories:', categoriesData.length);
        setCategories(['Toutes les catégories', ...categoriesData.map((c: any) => c.name)]);
      }

      if (farmsRes.ok) {
        const farmsData = await farmsRes.json();
        console.log('🏭 Farms:', farmsData.length);
        setFarms(['Toutes les farms', ...farmsData.map((f: any) => f.name)]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement TECH+:', error);
      setProducts([]);
      setCategories(['Toutes les catégories']);
      setFarms(['Toutes les farms']);
    }
  };

  // Synchronisation avec l'admin
  useAdminSync(loadAllData);



  // CHARGEMENT INSTANTANÉ DEPUIS L'API (DONNÉES FRAÎCHES)
  useEffect(() => {
    // Charger IMMÉDIATEMENT depuis l'API pour données fraîches
    loadAllData();
    
    // Cacher le chargement après délai
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    // Rafraîchir les données toutes les minutes pour synchronisation temps réel
    const interval = setInterval(() => {
      loadAllData();
    }, 60000); // 1 minute au lieu de 2 secondes
    
    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(interval);
    };
  }, []);

  // Écouter les mises à jour du cache
  useEffect(() => {
    const handleCacheUpdate = (event: CustomEvent) => {
      const { products: newProducts, categories: newCategories, farms: newFarms } = event.detail;
      
      if (newProducts) {
        setProducts(newProducts);
      }
      
      if (newCategories) {
        setCategories(['Toutes les catégories', ...newCategories.map((c: any) => c.name)]);
      }
      
      if (newFarms) {
        setFarms(['Toutes les farms', ...newFarms.map((f: any) => f.name)]);
      }
    };
    
    window.addEventListener('cacheUpdated', handleCacheUpdate as EventListener);
    
    return () => {
      window.removeEventListener('cacheUpdated', handleCacheUpdate as EventListener);
    };
  }, []);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'Toutes les catégories' || product.category === selectedCategory;
    const farmMatch = selectedFarm === 'Toutes les farms' || product.farm === selectedFarm;
    return categoryMatch && farmMatch;
  });

  const handleTabChange = (tabId: string) => {
    if (tabId === 'social') {
      router.push('/social');
    } else if (tabId === 'infos') {
      router.push('/info');
    } else if (tabId === 'contact') {
      router.push('/contact');
    } else {
      setActiveTab(tabId);
      if (tabId === 'menu') {
        setSelectedProduct(null);
      }
    }
  };

  // Écran de chargement tech moderne en deux étapes
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Arrière-plan avec dégradé diagonal bleu/vert */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-green-600"></div>
        
        {/* Formes diffuses tech modernes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-16 h-16 bg-emerald-400/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Contenu central */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            
            {/* Logo carré - Étape 1 : Logo seul, Étape 2 : Avec effet orbital */}
            <div className="relative mb-12">
              {/* Effet orbital - lignes fines lumineuses (Étape 2 seulement) */}
              {loadingStage === 2 && (
                <div className="absolute inset-0 w-48 h-48 mx-auto">
                  {/* Cercle orbital extérieur */}
                  <div className="absolute inset-0 border border-blue-300/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute inset-2 border border-green-300/20 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-4 border border-cyan-300/15 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
                  
                  {/* Points lumineux sur l'orbite */}
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1/2 shadow-[0_0_10px_rgba(34,197,94,0.8)]" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-y-1/2 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-emerald-400 rounded-full transform -translate-y-1/2 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ animationDelay: '3s' }}></div>
                </div>
              )}
              
              {/* Logo carré central */}
              <div className={`relative w-32 h-32 mx-auto bg-blue-900/80 backdrop-blur-sm rounded-2xl border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all duration-1000 ${
                loadingStage === 1 ? 'animate-scaleIn' : 'animate-fadeIn'
              }`}>
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">
                    <span className="text-green-400">T</span>ech+
                  </div>
                  <div className="text-xs text-blue-300 font-medium">Paris</div>
                </div>
              </div>
            </div>
            
            {/* Texte d'accueil (Étape 2 seulement) */}
            {loadingStage === 2 && (
              <div className="mb-8 animate-fadeIn">
                <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  Bienvenue
                </h1>
                <p className="text-lg text-gray-300 font-medium mb-4">
                  Préparation de l'interface
                </p>
                
                {/* Trois points de chargement */}
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }





  // Structure avec fond toujours visible
  return (
    <div className="main-container">
      {/* Overlay global toujours présent */}
      <div className="global-overlay"></div>
      
      {/* Contenu principal avec navigation */}
      <div className="content-layer">
        <Header />
        
        {/* Ajouter un padding-top pour compenser le header fixe */}
        <div className="pt-24 sm:pt-28 md:pt-32">
            {selectedProduct ? (
              <ProductDetail 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
              />
            ) : (
              <div className="pt-2">
                <CategoryFilter
                  categories={categories}
                  farms={farms}
                  selectedCategory={selectedCategory}
                  selectedFarm={selectedFarm}
                  onCategoryChange={setSelectedCategory}
                  onFarmChange={setSelectedFarm}
                />
                
                <main className="pt-3 pb-24 sm:pb-28 px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl mx-auto">

                {/* Affichage des produits */}
                {filteredProducts.length === 0 && products.length > 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-white/60 text-base sm:text-lg">
                      Aucun produit ne correspond à vos critères de recherche
                    </p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                ) : null}
                </main>
              </div>
            )}
        </div>
      </div>
      
      {/* BottomNav toujours visible - en dehors du content-layer */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}