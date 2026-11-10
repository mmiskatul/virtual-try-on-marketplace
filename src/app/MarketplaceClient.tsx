'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Navbar } from '../components/layout/Navbar';
import { BrandPartners } from '../components/modules/BrandPartners';
import { ProductGrid } from '../components/modules/ProductGrid';
import { TryOnStudioModal } from '../components/try-on/TryOnStudioModal';
import { CartDrawer } from '../components/cart/CartDrawer';
import { MarketplaceProduct } from '../types';
import { marketplaceApi } from '../lib/api';
import { useCartStore } from '../stores/useCartStore';
import { useCatalogStore } from '../stores/useCatalogStore';
import { useTryOnStore } from '../stores/useTryOnStore';
import { useOptimisticCatalog } from '../hooks/useOptimisticCatalog';

export function MarketplaceClient() {
  const { data: session } = useSession();
  const { isWishlisted, toggleWishlist, isSyncing } = useOptimisticCatalog();

  // Zustand Client State
  const cart = useCartStore((s) => s.items);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const checkoutStep = useCartStore((s) => s.checkoutStep);
  const confirmedOrderId = useCartStore((s) => s.confirmedOrderId);
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const setCheckoutStep = useCartStore((s) => s.setCheckoutStep);
  const confirmOrder = useCartStore((s) => s.confirmOrder);

  const products = useCatalogStore((s) => s.products);
  const brands = useCatalogStore((s) => s.brands);
  const search = useCatalogStore((s) => s.searchQuery);
  const selectedCategory = useCatalogStore((s) => s.selectedCategory);
  const selectedBrand = useCatalogStore((s) => s.selectedBrand);
  const tryOnOnly = useCatalogStore((s) => s.tryOnOnly);
  const sortBy = useCatalogStore((s) => s.sortBy);

  const setSearchQuery = useCatalogStore((s) => s.setSearchQuery);
  const setSelectedCategory = useCatalogStore((s) => s.setSelectedCategory);
  const setSelectedBrand = useCatalogStore((s) => s.setSelectedBrand);
  const setTryOnOnly = useCatalogStore((s) => s.setTryOnOnly);
  const setSortBy = useCatalogStore((s) => s.setSortBy);

  const activeTryOn = useTryOnStore((s) => s.activeProduct);
  const tryOnPhase = useTryOnStore((s) => s.phase);
  const tryOnResultImg = useTryOnStore((s) => s.resultImageUrl);
  const userUploadedPhoto = useTryOnStore((s) => s.userUploadedPhoto);
  const startTryOn = useTryOnStore((s) => s.startTryOn);
  const setTryOnPhase = useTryOnStore((s) => s.setTryOnPhase);
  const setUserUploadedPhoto = useTryOnStore((s) => s.setUserUploadedPhoto);
  const setResultImageUrl = useTryOnStore((s) => s.setResultImageUrl);
  const closeTryOn = useTryOnStore((s) => s.closeTryOn);

  // TanStack Query for Server State (with fallback to seeded baseline)
  const { data: serverProducts } = useQuery({
    queryKey: ['marketplace-products', selectedCategory, selectedBrand, search],
    queryFn: () => marketplaceApi.getProducts({ category: selectedCategory, brand: selectedBrand, q: search }),
    enabled: false // Activated when live API microservice is connected
  });

  const displayProducts = serverProducts && serverProducts.length > 0 ? serverProducts : products;

  // Filtered Products calculation
  const filteredProducts = displayProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brandName.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brandName === selectedBrand;
    const matchesTryOn = !tryOnOnly || p.isTryOnEligible;
    return matchesSearch && matchesCategory && matchesBrand && matchesTryOn;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const handleStartTryOn = (product: MarketplaceProduct) => {
    startTryOn(product);
  };

  const handleExecuteTryOn = async () => {
    setTryOnPhase('processing');
    try {
      const userPhoto = userUploadedPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
      const garmentPhoto = activeTryOn?.image;

      const res = await fetch('/api/edge/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageUrl: userPhoto,
          garmentImageUrl: garmentPhoto,
          clothType: activeTryOn?.category?.toLowerCase() || 'tops',
          brandSlug: activeTryOn?.brandSlug || 'generic',
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.outputImageUrl) {
          setResultImageUrl(data.outputImageUrl);
        }
      }
    } catch {
      // Graceful fallback to default high-res fitting simulation
    } finally {
      setTimeout(() => {
        setTryOnPhase('result');
      }, 1000);
    }
  };

  const handleCompleteCheckout = () => {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    confirmOrder(orderId);
  };

  const customer = session?.user
    ? { name: session.user.name || 'Customer', email: session.user.email || '' }
    : { name: 'Sarah Miller', email: 'sarah.miller@example.com' };

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        search={search}
        onSearchChange={setSearchQuery}
        customer={customer}
        cartCount={cart.length}
        onOpenCart={() => {
          setCheckoutStep('cart');
          openCart();
        }}
      />

      <BrandPartners
        brands={brands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
      />

      <ProductGrid
        products={filteredProducts}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        tryOnOnly={tryOnOnly}
        onToggleTryOnOnly={setTryOnOnly}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        onStartTryOn={handleStartTryOn}
        onAddToCart={(product) => addToCart(product)}
        isWishlisted={isWishlisted}
        onToggleWishlist={toggleWishlist}
      />

      <TryOnStudioModal
        product={activeTryOn}
        phase={tryOnPhase}
        resultImg={tryOnResultImg}
        userPhoto={userUploadedPhoto}
        onClose={closeTryOn}
        onStartSynthesis={handleExecuteTryOn}
        onSelectPreset={(url) => setUserUploadedPhoto(url)}
        onUploadPhoto={(data) => setUserUploadedPhoto(data)}
        onResetPhase={() => setTryOnPhase('upload')}
        onAddToCart={(product) => addToCart(product)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        cart={cart}
        onRemoveItem={removeFromCart}
        checkoutStep={checkoutStep}
        onSetCheckoutStep={setCheckoutStep}
        customer={customer}
        confirmedOrderId={confirmedOrderId}
        onCompleteCheckout={handleCompleteCheckout}
      />
    </div>
  );
}
