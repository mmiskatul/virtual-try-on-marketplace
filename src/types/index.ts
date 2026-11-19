export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';
export type StorefrontVisibility = 'VISIBLE' | 'HIDDEN';
export type TryOnCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'all';

export interface ProductColorOption {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
  available: boolean;
  /** Price for this size. When missing, the product price applies. */
  price?: number;
  /** Photo of this colour. */
  imageUrl?: string;
}

export interface MarketplaceProduct {
  id: string;
  brandId: string;
  tenantId?: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  brandName: string;
  brandSlug: string;
  brandLogo: string;
  brandVerified?: boolean;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  category: string;
  subCategory?: string;
  audience?: 'Men' | 'Women' | 'Traditional' | 'Accessories' | 'Unisex';
  collections?: string[];
  fabric: string;
  materialDetails?: string;
  fitNotes?: string;
  specifications?: Record<string, string>;
  sizes: string[];
  colors: ProductColorOption[];
  variants: ProductVariant[];
  image: string;
  images: string[];
  sku?: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  totalSold: number;
  viewsCount?: number;
  favoritesCount?: number;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isTryOnEligible: boolean;
  tryOnCategory?: TryOnCategory;
  marketplaceStatus: PublicationStatus;
  marketplacePublished: boolean;
  storefrontVisibility: StorefrontVisibility;
  brandStorefrontPublished: boolean;
  publishedAt: string;
  tags: string[];
  shippingPolicy?: string;
  returnPolicy?: string;
}

export interface MarketplacePublication {
  productId: string;
  brandId: string;
  publicationStatus: PublicationStatus;
  publishedAt: string;
  featuredStatus: boolean;
  collectionIds: string[];
}

export interface BrandPartner {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo: string;
  coverImage: string;
  verificationStatus: 'VERIFIED' | 'PENDING';
  categoryFocus: string;
  originCity: string;
  rating: number;
  totalReviews: number;
  totalFollowers: number;
  productCount: number;
  isFeatured?: boolean;
  isRecentlyJoined?: boolean;
  accentColor?: string;
  announcement?: string;
  deliveryEstimate?: string;
  returnPolicy?: string;
  socialLinks?: {
    instagram?: string;
    website?: string;
  };
  collections?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  sizePurchased?: string;
  fitFeedback?: 'Runs Small' | 'True to Size' | 'Runs Large';
  helpfulCount: number;
  createdAt: string;
  customerImage?: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  group: 'Men' | 'Women' | 'Traditional' | 'Apparel' | 'Accessories';
  productCount?: number;
}

export interface MarketplaceCollection {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  season?: string;
}

export interface CustomerTestimonial {
  id: string;
  customerName: string;
  avatar: string;
  rating: number;
  comment: string;
  productName: string;
  productSlug: string;
  brandName: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  id?: string;
  product: MarketplaceProduct;
  size: string;
  color?: string;
  variantSku?: string;
  quantity: number;
}

export interface BrandCartGroup {
  brandId: string;
  brandName: string;
  brandSlug: string;
  brandLogo: string;
  deliveryEstimate: string;
  returnPolicy: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
}

export interface CustomerUser {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type PaymentMethodId = 'bkash' | 'nagad' | 'card' | 'cod';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  subtitle: string;
  badge?: string;
  enabled: boolean;
  regions: string[];
}

export interface CustomerOrder {
  id: string;
  backendOrderIds?: string[];
  createdAt: string;
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';
  paymentMethod: PaymentMethodId;
  paymentStatus: 'PAID' | 'PENDING' | 'COD_DUE';
  customerEmail: string;
  shippingAddress: {
    fullName: string;
    phone?: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  groups: {
    brandName: string;
    brandSlug: string;
    orderRef: string;
    deliveryMethod: string;
    deliveryEstimate: string;
    subtotal: number;
    shippingFee: number;
    items: CartItem[];
  }[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  promoCode?: string;
  trackingCode?: string;
}

export type TryOnStudioState =
  | 'empty'
  | 'image_uploaded'
  | 'product_selected'
  | 'ready_to_generate'
  | 'processing'
  | 'success'
  | 'failed'
  | 'retry';

export interface TryOnResultRecord {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  garmentImageUrl: string;
  personImageUrl: string;
  resultImageUrl: string;
  size?: string;
  color?: string;
  mode: 'live_ai' | 'demo_preview';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'order' | 'shipping' | 'discount' | 'restock' | 'brand' | 'collection' | 'tryon';
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export interface CustomerPreferences {
  orderUpdates: boolean;
  brandDrops: boolean;
  tryOnAlerts: boolean;
  promoOffers: boolean;
  photoConsentGranted: boolean;
  autoDeletePhotosDays: number;
}
