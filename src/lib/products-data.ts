// src/lib/products-data.ts
'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { dbAdmin } from './firebase-admin';

export interface Product {
  id: string;
  slug: string;
  name: string;
  origin: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  roast: string;
}

export type ProductFormData = Omit<Product, 'id' | 'slug' | 'rating' | 'reviews'>;


const initialProducts: Omit<Product, 'id' | 'slug'>[] = [
  {
    name: 'Aceh Gayo',
    origin: 'Gayo Highlands, Aceh',
    description: 'A rich, full-bodied coffee with earthy notes of dark chocolate, cedar, and a hint of spice. Known for its smooth finish and low acidity, making it a classic Indonesian favorite.',
    price: 120000,
    image: 'https://images.unsplash.com/photo-1607681034540-2c46cc71896d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.8,
    reviews: 125,
    tags: ['Earthy', 'Spicy', 'Full Body'],
    roast: 'Medium-Dark',
  },
  {
    name: 'Bali Kintamani',
    origin: 'Kintamani Highlands, Bali',
    description: 'A smooth, sweet coffee with a clean finish and bright, citrusy undertones. Grown on volcanic soil alongside citrus fruits, which imparts a unique fruity aroma and flavor.',
    price: 135000,
    image: 'https://images.unsplash.com/photo-1629248989876-07129a68946d?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.9,
    reviews: 98,
    tags: ['Fruity', 'Citrus', 'Clean'],
    roast: 'Medium',
  },
  {
    name: 'Flores Bajawa',
    origin: 'Bajawa, Flores',
    description: 'A complex coffee with beautiful floral aromas, sweet chocolate notes, and a syrupy, lingering body. The unique terroir of Flores gives this coffee a truly memorable character.',
    price: 150000,
    image: 'https://plus.unsplash.com/premium_photo-1681324222331-935fd4bc5180?q=80&w=1170&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.7,
    reviews: 82,
    tags: ['Floral', 'Chocolate', 'Syrupy'],
    roast: 'Medium',
  },
  {
    name: 'Sumatra Mandheling',
    origin: 'Mandailing, Sumatra',
    description: 'Famously smooth and heavy-bodied, this coffee presents deep, resonant notes of tobacco, dark cocoa, and a whisper of tropical fruit. A truly classic and satisfying cup.',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1515694590185-73647ba02c10?q=80&w=1170&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.8,
    reviews: 110,
    tags: ['Full Body', 'Earthy', 'Complex'],
    roast: 'Dark',
  },
  {
    name: 'Toraja Kalosi',
    origin: 'Tana Toraja, Sulawesi',
    description: 'Well-balanced with a velvety body and notes of ripe fruit and dark chocolate. It has a vibrant yet low-toned acidity, making it a delightfully complex and clean coffee.',
    price: 140000,
    image: 'https://placehold.co/800x800.png',
    rating: 4.9,
    reviews: 102,
    tags: ['Balanced', 'Chocolate', 'Fruity'],
    roast: 'Medium-Dark',
  },
  {
    name: 'Java Preanger',
    origin: 'West Java',
    description: 'One of the world\'s oldest coffee cultivation areas. This coffee offers a medium body, a mild acidity, and a smooth, clean taste with a sweet, slightly herbaceous finish.',
    price: 130000,
    image: 'https://placehold.co/800x800.png',
    rating: 4.6,
    reviews: 75,
    tags: ['Smooth', 'Sweet', 'Herbal'],
    roast: 'Medium',
  },
  {
    name: 'Papua Wamena',
    origin: 'Wamena, Papua',
    description: 'Grown in the remote highlands of Papua, this coffee has a clean, crisp flavor with a heavy body, low acidity, and notes of caramel, nuts, and a hint of stone fruit.',
    price: 160000,
    image: 'https://placehold.co/800x800.png',
    rating: 4.8,
    reviews: 65,
    tags: ['Caramel', 'Nutty', 'Clean'],
    roast: 'Medium'
  },
];

let isSeeding = false;
let seedingCompleted = false;

async function seedDatabaseIfNeeded() {
  if (seedingCompleted || isSeeding) {
    return;
  }
  
  if (!dbAdmin) {
    console.warn("Firestore Admin is not initialized. Skipping seed operation.");
    seedingCompleted = true; 
    return;
  }
  
  isSeeding = true;
  const productsCollection = dbAdmin.collection('products');

  try {
    const snapshot = await productsCollection.limit(1).get();
    if (snapshot.empty) {
      console.log('Products collection is empty. Seeding database...');
      const batch = dbAdmin.batch();
      initialProducts.forEach(productData => {
          const docRef = productsCollection.doc();
          const slug = productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          batch.set(docRef, {...productData, slug });
      });
      await batch.commit();
      console.log('Products database seeded successfully.');
    }
  } catch (error) {
    console.error("Error seeding products database:", error);
  } finally {
    isSeeding = false;
    seedingCompleted = true;
  }
}

export async function getProducts(): Promise<Product[]> {
  noStore();
  await seedDatabaseIfNeeded();

  if (!dbAdmin) {
    throw new Error("Firestore Admin is not initialized. Cannot get products.");
  }

  const productsCollection = dbAdmin.collection('products');
  const productsSnapshot = await productsCollection.get();
  const productsList = productsSnapshot.docs.map(doc => {
    return {
      id: doc.id,
      ...doc.data()
    } as Product;
  });
  
  return productsList;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    noStore();
    if (!dbAdmin) {
        throw new Error("Firestore Admin is not initialized. Cannot get product by slug.");
    }
    const productsCollection = dbAdmin.collection('products');
    const snapshot = await productsCollection.where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Product;
}

export async function addProduct(productData: Omit<ProductFormData, 'tags'> & { tags: string }): Promise<Product> {
  if (!dbAdmin) {
      throw new Error("Firestore Admin not initialized.");
  }

  const productsCollection = dbAdmin.collection('products');
  const slug = productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
  const newProductData = {
    ...productData,
    slug,
    rating: Math.round((Math.random() * (5 - 4) + 4) * 10) / 10,
    reviews: Math.floor(Math.random() * (100 - 10 + 1) + 10),
    tags: productData.tags.split(',').map(tag => tag.trim()),
  };

  const docRef = await productsCollection.add(newProductData);
  
  const createdProduct: Product = {
    id: docRef.id,
    ...newProductData
  };

  return createdProduct;
}

export async function updateProduct(id: string, productData: Omit<ProductFormData, 'tags'> & { tags: string }): Promise<void> {
    if (!dbAdmin) {
        throw new Error("Firestore Admin not initialized.");
    }
    
    const productsCollection = dbAdmin.collection('products');
    const productRef = productsCollection.doc(id);
    const updatedData = {
        ...productData,
        tags: productData.tags.split(',').map(tag => tag.trim()),
        slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    };
    await productRef.update(updatedData);
}

export async function deleteProduct(id: string): Promise<void> {
    if (!dbAdmin) {
        throw new Error("Firestore Admin not initialized.");
    }
    
    const productsCollection = dbAdmin.collection('products');
    const productRef = productsCollection.doc(id);
    await productRef.delete();
}
