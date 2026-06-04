import 'dotenv/config';

import bcrypt from 'bcrypt';

import { prisma } from '../src/prisma/client.js';
import { MARKETPLACES } from '../src/config/constants.js';

const passwordHash = await bcrypt.hash('password123', 10);

await prisma.user.upsert({
  where: { email: 'rahaditya@example.com' },
  update: {
    name: 'Rahaditya',
    password: passwordHash,
  },
  create: {
    name: 'Rahaditya',
    email: 'rahaditya@example.com',
    password: passwordHash,
  },
});

const seedProducts = [
  {
    marketplace: 'shopee',
    product_name: 'iPhone 15 Pro',
    marketplace_sku: 'SHP-IPH15PRO',
    internal_sku: 'IPH15PRO-BLK',
    description: 'Apple flagship smartphone with A17 Pro chip, titanium body, and advanced camera system',
    category: 'Smartphone',
    brand: 'Apple',
    price: 18000000,
    stock: 15,
    weight: 0.2,
    thumbnail_url: '/uploads/products/shopee-iphone-15-pro-main.jpg',
    status: 'ACTIVE',
    images: [
      '/uploads/products/shopee-iphone-15-pro-main.jpg',
      '/uploads/products/shopee-iphone-15-pro-back.jpg',
      '/uploads/products/shopee-iphone-15-pro-side.jpg',
    ],
  },
  {
    marketplace: 'shopee',
    product_name: 'Sony WH-1000XM5',
    marketplace_sku: 'SHP-SONY-WH5',
    internal_sku: 'WH1000XM5-BLK',
    description: 'Premium wireless noise cancelling headphones with 30-hour battery life',
    category: 'Audio',
    brand: 'Sony',
    price: 4500000,
    stock: 28,
    weight: 0.25,
    thumbnail_url: '/uploads/products/shopee-sony-wh5-main.jpg',
    status: 'ACTIVE',
    images: [
      '/uploads/products/shopee-sony-wh5-main.jpg',
      '/uploads/products/shopee-sony-wh5-case.jpg',
    ],
  },
  {
    marketplace: 'shopee',
    product_name: 'Nintendo Switch OLED',
    marketplace_sku: 'SHP-SWITCH-OLED',
    internal_sku: 'SWOLED-WHITE',
    description: 'Hybrid console with vivid OLED display and docked/portable gameplay',
    category: 'Gaming',
    brand: 'Nintendo',
    price: 5400000,
    stock: 20,
    weight: 0.32,
    thumbnail_url: '/uploads/products/shopee-switch-oled-main.jpg',
    status: 'DRAFT',
    images: [
      '/uploads/products/shopee-switch-oled-main.jpg',
      '/uploads/products/shopee-switch-oled-dock.jpg',
    ],
  },
  {
    marketplace: 'tokopedia',
    product_name: 'ASUS ROG Zephyrus G14',
    marketplace_sku: 'TOK-ROG-G14',
    internal_sku: 'ROG-G14-2025',
    description: 'Compact gaming laptop with Ryzen 9 processor, RTX graphics, and 165Hz display',
    category: 'Laptop',
    brand: 'ASUS',
    price: 24500000,
    stock: 8,
    weight: 1.7,
    thumbnail_url: '/uploads/products/tokopedia-rog-g14-main.jpg',
    status: 'ACTIVE',
    images: [
      '/uploads/products/tokopedia-rog-g14-main.jpg',
      '/uploads/products/tokopedia-rog-g14-open.jpg',
      '/uploads/products/tokopedia-rog-g14-keyboard.jpg',
    ],
  },
  {
    marketplace: 'tokopedia',
    product_name: 'Logitech MX Master 3S',
    marketplace_sku: 'TOK-MX-M3S',
    internal_sku: 'MXM3S-GRAY',
    description: 'Ergonomic wireless mouse with ultra-fast scrolling and silent clicks',
    category: 'Accessories',
    brand: 'Logitech',
    price: 1250000,
    stock: 42,
    weight: 0.14,
    thumbnail_url: '/uploads/products/tokopedia-mx-master-3s-main.jpg',
    status: 'DRAFT',
    images: [
      '/uploads/products/tokopedia-mx-master-3s-main.jpg',
      '/uploads/products/tokopedia-mx-master-3s-side.jpg',
    ],
  },
  {
    marketplace: 'tokopedia',
    product_name: 'SteelSeries Apex Pro TKL',
    marketplace_sku: 'TOK-APEX-PRO-TKL',
    internal_sku: 'APEXPRO-TKL-BLK',
    description: 'Adjustable actuation gaming keyboard with OLED smart display',
    category: 'Gaming',
    brand: 'SteelSeries',
    price: 3200000,
    stock: 19,
    weight: 0.95,
    thumbnail_url: '/uploads/products/tokopedia-apex-pro-tkl-main.jpg',
    status: 'ACTIVE',
    images: [
      '/uploads/products/tokopedia-apex-pro-tkl-main.jpg',
      '/uploads/products/tokopedia-apex-pro-tkl-side.jpg',
    ],
  },
  {
    marketplace: 'lazada',
    product_name: 'PlayStation 5 Slim',
    marketplace_sku: 'LZD-PS5-SLIM',
    internal_sku: 'PS5SLIM-DISC',
    description: 'Next-gen console with ultra-fast SSD, 4K gaming, and DualSense controller',
    category: 'Gaming',
    brand: 'Sony',
    price: 8990000,
    stock: 12,
    weight: 3.2,
    thumbnail_url: '/uploads/products/lazada-ps5-slim-main.jpg',
    status: 'ACTIVE',
    images: [
      '/uploads/products/lazada-ps5-slim-main.jpg',
      '/uploads/products/lazada-ps5-slim-controller.jpg',
    ],
  },
  {
    marketplace: 'lazada',
    product_name: 'JBL Flip 6',
    marketplace_sku: 'LZD-JBL-FLIP6',
    internal_sku: 'FLIP6-BLU',
    description: 'Portable waterproof Bluetooth speaker with rich bass and 12-hour battery',
    category: 'Audio',
    brand: 'JBL',
    price: 1790000,
    stock: 35,
    weight: 0.55,
    thumbnail_url: '/uploads/products/lazada-jbl-flip6-main.jpg',
    status: 'ARCHIVED',
    images: [
      '/uploads/products/lazada-jbl-flip6-main.jpg',
      '/uploads/products/lazada-jbl-flip6-back.jpg',
    ],
  },
  {
    marketplace: 'lazada',
    product_name: 'Anker PowerCore 20000',
    marketplace_sku: 'LZD-ANKER-20K',
    internal_sku: 'ANKER20K-BLK',
    description: 'High-capacity power bank with dual USB outputs and fast charging support',
    category: 'Accessories',
    brand: 'Anker',
    price: 599000,
    stock: 47,
    weight: 0.43,
    thumbnail_url: '/uploads/products/lazada-anker-20k-main.jpg',
    status: 'ACTIVE',
    images: [
      '/uploads/products/lazada-anker-20k-main.jpg',
      '/uploads/products/lazada-anker-20k-side.jpg',
    ],
  },
];

for (const product of seedProducts) {
  const { images, ...productData } = product;

  await prisma.product.upsert({
    where: {
      marketplace_marketplace_sku: {
        marketplace: product.marketplace,
        marketplace_sku: product.marketplace_sku,
      },
    },
    update: {
      ...productData,
      images: {
        deleteMany: {},
        create: images.map((image_url) => ({ image_url })),
      },
    },
    create: {
      ...productData,
      images: {
        create: images.map((image_url) => ({ image_url })),
      },
    },
  });
}

console.log(`Seeded product data for ${MARKETPLACES.join(', ')}`);

await prisma.$disconnect();
