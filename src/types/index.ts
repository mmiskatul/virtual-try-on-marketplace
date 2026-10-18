export interface MarketplaceProduct {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  brandLogo: string;
  price: number;
  category: string;
  fabric: string;
  isTryOnEligible: boolean;
  image: string;
  tags: string[];
}

export interface BrandPartner {
  name: string;
  slug: string;
  tagline: string;
  logo: string;
  productCount: number;
}

export interface CartItem {
  product: MarketplaceProduct;
  size: string;
  quantity: number;
}

export interface CustomerUser {
  name: string;
  email: string;
}
