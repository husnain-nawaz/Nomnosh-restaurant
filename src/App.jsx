import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroBanner from './components/HeroBanner.jsx';
import CategoryNav from './components/CategoryNav.jsx';
import CategorySection from './components/CategorySection.jsx';
import ItemCustomizeModal from './components/ItemCustomizeModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import AuthModal from './components/AuthModal.jsx';
import OrderTrackingModal from './components/OrderTrackingModal.jsx';
import LocationModal from './components/LocationModal.jsx';
import Dashboard from './components/Dashboard.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState(() => sessionStorage.getItem('nomnosh_view_mode') || 'storefront'); // 'storefront' | 'dashboard'
  const storefrontScrollY = useRef(Number(sessionStorage.getItem('nomnosh_storefront_scroll') || 0));
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(() => sessionStorage.getItem('nomnosh_active_category') || 'all');
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('nomnosh_search_query') || '');
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('nomnosh_delivery_location');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Cart State with localStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nomnosh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [activeOrderForTracking, setActiveOrderForTracking] = useState(null);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nomnosh_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (deliveryLocation) localStorage.setItem('nomnosh_delivery_location', JSON.stringify(deliveryLocation));
    } catch (e) {
      console.error(e);
    }
  }, [deliveryLocation]);

  // Require a delivery location before storefront ordering begins.
  useEffect(() => {
    const isAdmin = ['staff', 'admin', 'super_admin'].includes(currentUser?.role);
    if (deliveryLocation || isAdmin || viewMode === 'dashboard') return undefined;
    const timer = window.setTimeout(() => setIsLocationOpen(true), 3000);
    return () => window.clearTimeout(timer);
  }, [deliveryLocation, currentUser, viewMode]);

  // Check user session on load
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          if (data?.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => setCurrentUser(null));
  }, []);

  // Fetch Categories & Menu Items
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(cats => setCategories(cats))
      .catch(console.error);

    fetch('/api/products')
      .then(r => r.json())
      .then(items => setProducts(items))
      .catch(console.error);
  }, []);

  // Cart operations
  const handleAddToCart = (customizedItem) => {
    setCart(prev => {
      // If exact same item with same options exists, increment
      const matchIndex = prev.findIndex(i =>
        i.id === customizedItem.id &&
        i.selectedSize === customizedItem.selectedSize &&
        i.selectedCrust === customizedItem.selectedCrust &&
        i.selectedSpice === customizedItem.selectedSpice &&
        JSON.stringify(i.selectedAddons) === JSON.stringify(customizedItem.selectedAddons)
      );

      if (matchIndex > -1) {
        const next = [...prev];
        next[matchIndex].quantity += customizedItem.quantity;
        return next;
      }
      return [...prev, customizedItem];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (idx, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(idx);
    } else {
      setCart(prev => {
        const next = [...prev];
        next[idx].quantity = newQty;
        return next;
      });
    }
  };

  const handleRemoveItem = (idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setCurrentUser(null);
    if (viewMode === 'dashboard') setViewMode('storefront');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const handleViewModeChange = (nextMode) => {
    if (viewMode === 'storefront' && nextMode === 'dashboard') storefrontScrollY.current = window.scrollY;
    setViewMode(nextMode);
    sessionStorage.setItem('nomnosh_view_mode', nextMode);
  };

  useEffect(() => {
    sessionStorage.setItem('nomnosh_view_mode', viewMode);
    if (viewMode === 'storefront') window.requestAnimationFrame(() => window.scrollTo({ top: storefrontScrollY.current, behavior: 'instant' }));
  }, [viewMode]);

  useEffect(() => { sessionStorage.setItem('nomnosh_active_category', activeCategory); }, [activeCategory]);
  useEffect(() => { sessionStorage.setItem('nomnosh_search_query', searchQuery); }, [searchQuery]);

  useEffect(() => {
    const saveScroll = () => { if (viewMode === 'storefront') { storefrontScrollY.current = window.scrollY; sessionStorage.setItem('nomnosh_storefront_scroll', String(window.scrollY)); } };
    window.addEventListener('scroll', saveScroll, { passive: true });
    return () => window.removeEventListener('scroll', saveScroll);
  }, [viewMode]);

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description && p.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    if (activeCategory === 'all') return true;
    return p.category_slug === activeCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] selection:bg-amber-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLocation={() => setIsLocationOpen(true)}
        currentUser={currentUser}
        currentLocation={deliveryLocation}
        onLogout={handleLogout}
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        deliveryLocation={deliveryLocation}
      />

      {/* Main View Mode: Storefront vs Admin Dashboard */}
      {viewMode === 'dashboard' ? (
        <Dashboard
          onReturnToStore={() => handleViewModeChange('storefront')}
          currentUser={currentUser}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Promotional Banner */}
          <HeroBanner
            onSelectCategory={(slug) => {
              setActiveCategory(slug);
              const el = document.getElementById(slug);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenDealModal={() => {
              const combo = products.find(p => p.id === 101);
              if (combo) setSelectedItemForModal(combo);
            }}
          />

          {/* Sticky Category Navigation & Live Search */}
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={(slug) => {
              setActiveCategory(slug);
              if (slug !== 'all') {
                const el = document.getElementById(slug);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Catalog Sections */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {searchQuery ? (
              <div className="py-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-black text-stone-900 font-['Syne',sans-serif]">
                    Search Results for <span className="text-amber-600">"{searchQuery}"</span>
                  </h2>
                  <span className="text-xs text-stone-500">
                    {filteredProducts.length} items found
                  </span>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProducts.map(item => (
                      <CategorySection
                        key={item.id}
                        category={{ slug: item.category_slug, name: item.name }}
                        items={[item]}
                        onSelectItem={setSelectedItemForModal}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-stone-400">
                    <p className="text-base font-bold text-stone-700">No items match your search.</p>
                    <p className="text-xs mt-1">Try searching for "burger", "wings", "pizza" or "fajita".</p>
                  </div>
                )}
              </div>
            ) : activeCategory === 'all' ? (
              // Display each category section sequentially with themed headers
              categories.map(cat => {
                const catItems = products.filter(p => p.category_slug === cat.slug);
                return (
                  <CategorySection
                    key={cat.id}
                    category={cat}
                    items={catItems}
                    onSelectItem={setSelectedItemForModal}
                  />
                );
              })
            ) : (
              // Display only selected category
              (() => {
                const currentCat = categories.find(c => c.slug === activeCategory) || {
                  slug: activeCategory,
                  name: activeCategory
                };
                return (
                  <CategorySection
                    category={currentCat}
                    items={filteredProducts}
                    onSelectItem={setSelectedItemForModal}
                  />
                );
              })()
            )}
          </div>

          {/* Footer */}
          <Footer />
        </main>
      )}

      {/* Item Customization Modal */}
      {selectedItemForModal && (
        <ItemCustomizeModal
          item={selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        currentLocation={deliveryLocation}
        onOrderPlaced={() => {}}
      />

      {/* Auth Modal (JWT + Google) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Delivery Location Selector Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => {
          setIsLocationOpen(false);
        }}
        currentLocation={deliveryLocation}
        onSelectLocation={(location) => {
          setDeliveryLocation(location);
          setIsLocationOpen(false);
        }}
      />

    </div>
  );
}
