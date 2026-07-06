// Shopify Storefront API — raw response shapes + our normalized storefront types.
//
// We normalize Shopify's GraphQL objects into shapes that closely mirror the
// old D1 `Product` type so existing store components need minimal changes.
// Notably, money is normalized to INTEGER MINOR UNITS (paise) so the existing
// `formatPrice(cents)` helper and cart math keep working untouched.

export interface ShopifyMoney {
  amount: string; // decimal string, e.g. "24999.00"
  currencyCode: string; // e.g. "INR"
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopifyVariant {
  id: string; // gid://shopify/ProductVariant/...
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProduct {
  id: string; // gid://shopify/Product/...
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney };
  variants: { nodes: ShopifyVariant[] };
  seo: { title: string | null; description: string | null };
  metafield?: { value: string } | null; // e.g. custom.material
}

export interface ShopifyCartLine {
  id: string; // line id
  quantity: number;
  cost: { totalAmount: ShopifyMoney; subtotalAmount: ShopifyMoney };
  merchandise: {
    id: string; // variant gid
    title: string;
    product: {
      handle: string;
      title: string;
      featuredImage: ShopifyImage | null;
    };
    price: ShopifyMoney;
    selectedOptions: { name: string; value: string }[];
  };
}

export interface ShopifyCart {
  id: string; // gid://shopify/Cart/...
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount: ShopifyMoney | null;
  };
  lines: { nodes: ShopifyCartLine[] };
}

// ---------------------------------------------------------------------------
// Normalized storefront types consumed by our React components
// ---------------------------------------------------------------------------

export interface StoreVariant {
  id: string; // variant gid — this is what the cart needs
  title: string;
  available: boolean;
  quantityAvailable: number | null;
  price: number; // paise
  compareAtPrice: number | null; // paise
  options: { name: string; value: string }[];
}

export interface StoreProduct {
  id: string; // product gid
  slug: string; // handle
  name: string;
  description: string;
  descriptionHtml: string;
  category: string; // productType
  material: string; // metafield or vendor
  price: number; // paise — min variant price
  compareAtPrice: number | null; // paise
  currencyCode: string;
  images: string[];
  primaryImage: string | null;
  available: boolean;
  featured: boolean;
  variants: StoreVariant[];
  defaultVariantId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface StoreCartLine {
  id: string;
  variantId: string;
  quantity: number;
  name: string;
  slug: string;
  variantTitle: string;
  image: string | null;
  price: number; // paise, per unit
  lineTotal: number; // paise
}

export interface StoreCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: number; // paise
  total: number; // paise
  totalTax: number | null; // paise
  currencyCode: string;
  lines: StoreCartLine[];
}
