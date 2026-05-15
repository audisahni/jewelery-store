// scripts/seed.ts
// Run with: npm run seed
// This script outputs SQL for seeding the Cloudflare D1 database.
// Apply it with: wrangler d1 execute jewelry-store-db --local --file=./scripts/seed.sql

const sampleProducts = [
  {
    id: "prod_001",
    name: "Lumière Diamond Ring",
    slug: "lumiere-diamond-ring",
    description: "A stunning solitaire ring featuring a brilliant-cut diamond set in 18k white gold. The Lumière Ring catches light from every angle, creating an ethereal glow that captivates all who behold it. Each stone is hand-selected for exceptional clarity and brilliance.",
    price: 425000, // $4,250.00
    compareAtPrice: 520000,
    category: "rings",
    material: "18k White Gold, Diamond",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
    ]),
    primaryImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    stock: 3,
    featured: 1,
    active: 1,
    metaTitle: "Lumière Diamond Ring | Fine Jewelry",
    metaDescription: "Brilliant-cut diamond solitaire in 18k white gold. Hand-selected for exceptional clarity.",
    weight: 4.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_002",
    name: "Céleste Pearl Necklace",
    slug: "celeste-pearl-necklace",
    description: "South Sea pearls of the highest luster, graduated from 9mm to 12mm and strung on silk with an 18k gold clasp. Each pearl is sourced from sustainable pearl farms and exhibits a deep, satiny glow unique to South Sea varieties.",
    price: 185000,
    compareAtPrice: null,
    category: "necklaces",
    material: "South Sea Pearls, 18k Gold",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
    ]),
    primaryImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
    stock: 5,
    featured: 1,
    active: 1,
    metaTitle: "Céleste Pearl Necklace | Fine Jewelry",
    metaDescription: "Graduated South Sea pearl necklace with 18k gold clasp.",
    weight: 28.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_003",
    name: "Aurora Drop Earrings",
    slug: "aurora-drop-earrings",
    description: "Rose gold drops set with pavé sapphires that cascade like morning light. These statement earrings move with effortless grace, catching the light to reveal depth and color that changes with every movement.",
    price: 98000,
    compareAtPrice: null,
    category: "earrings",
    material: "14k Rose Gold, Blue Sapphires",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
    ]),
    primaryImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
    stock: 8,
    featured: 1,
    active: 1,
    metaTitle: "Aurora Drop Earrings | Fine Jewelry",
    metaDescription: "14k rose gold drop earrings with pavé blue sapphires.",
    weight: 5.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_004",
    name: "Soleil Gold Bracelet",
    slug: "soleil-gold-bracelet",
    description: "A hand-hammered 22k gold bangle that bears the warmth of the sun. Artisanally crafted using ancient goldsmithing techniques, the Soleil bracelet is as timeless as the light that inspired it.",
    price: 145000,
    compareAtPrice: 168000,
    category: "bracelets",
    material: "22k Yellow Gold",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
    ]),
    primaryImage: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
    stock: 4,
    featured: 1,
    active: 1,
    metaTitle: "Soleil Gold Bracelet | Fine Jewelry",
    metaDescription: "Hand-hammered 22k yellow gold bangle bracelet.",
    weight: 18.3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_005",
    name: "Étoile Sapphire Ring",
    slug: "etoile-sapphire-ring",
    description: "A vivid Kashmir blue sapphire, 3.2 carats, set among a constellation of brilliant diamonds in platinum. The Étoile Ring is a collector's piece — once seen, never forgotten.",
    price: 895000,
    compareAtPrice: null,
    category: "rings",
    material: "Platinum, Kashmir Sapphire, Diamonds",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=800",
    ]),
    primaryImage: "https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=800",
    stock: 1,
    featured: 0,
    active: 1,
    metaTitle: "Étoile Sapphire Ring | Fine Jewelry",
    metaDescription: "Kashmir blue sapphire ring set in platinum with brilliant diamonds.",
    weight: 6.1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_006",
    name: "Aube Diamond Tennis Bracelet",
    slug: "aube-diamond-tennis-bracelet",
    description: "Forty-two round brilliant diamonds, each precisely matched for color and clarity, set in an elegant 18k white gold tennis bracelet. The Aube bracelet offers uninterrupted sparkle from every angle.",
    price: 620000,
    compareAtPrice: null,
    category: "bracelets",
    material: "18k White Gold, Diamonds",
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800",
    ]),
    primaryImage: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800",
    stock: 2,
    featured: 0,
    active: 1,
    metaTitle: "Aube Diamond Tennis Bracelet | Fine Jewelry",
    metaDescription: "42-diamond tennis bracelet in 18k white gold.",
    weight: 15.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const productsSql = sampleProducts.map(p => `
INSERT OR REPLACE INTO products (id, name, slug, description, price, compare_at_price, category, material, images, primary_image, stock, featured, active, meta_title, meta_description, weight, created_at, updated_at)
VALUES (
  '${p.id}',
  '${p.name.replace(/'/g, "''")}',
  '${p.slug}',
  '${p.description.replace(/'/g, "''")}',
  ${p.price},
  ${p.compareAtPrice ?? "NULL"},
  '${p.category}',
  '${p.material.replace(/'/g, "''")}',
  '${p.images.replace(/'/g, "''")}',
  '${p.primaryImage}',
  ${p.stock},
  ${p.featured},
  ${p.active},
  '${(p.metaTitle ?? "").replace(/'/g, "''")}',
  '${(p.metaDescription ?? "").replace(/'/g, "''")}',
  ${p.weight},
  '${p.createdAt}',
  '${p.updatedAt}'
);`).join("\n");

const settingsSql = `
INSERT OR REPLACE INTO settings (key, value) VALUES ('store_name', 'Jewelry Store');
INSERT OR REPLACE INTO settings (key, value) VALUES ('store_email', 'hello@jewelrystore.com');
INSERT OR REPLACE INTO settings (key, value) VALUES ('currency', 'USD');
INSERT OR REPLACE INTO settings (key, value) VALUES ('free_shipping_threshold', '15000');
INSERT OR REPLACE INTO settings (key, value) VALUES ('standard_shipping_cost', '1500');
`;

const fullSql = `-- Jewelry Store Seed Data
-- Generated: ${new Date().toISOString()}
-- Apply with: wrangler d1 execute jewelry-store-db --local --file=./scripts/seed.sql
-- For production: wrangler d1 execute jewelry-store-db --file=./scripts/seed.sql

${productsSql}

-- Settings
${settingsSql}
`;

console.log(fullSql);

import { writeFileSync } from "fs";
writeFileSync("./scripts/seed.sql", fullSql);
console.log("Seed SQL written to scripts/seed.sql");
console.log("Apply with: wrangler d1 execute jewelry-store-db --local --file=./scripts/seed.sql");
