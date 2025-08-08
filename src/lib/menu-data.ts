// src/lib/menu-data.ts
'use server';

import { dbAdmin } from './firebase-admin';
import { unstable_noStore as noStore } from 'next/cache';

export type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    category: MenuCategory;
};

export type MenuCategory = 'hot' | 'cold' | 'manual' | 'signature';

export type MenuItems = {
    hot: MenuItem[];
    cold: MenuItem[];
    manual: MenuItem[];
    signature: MenuItem[];
};


const initialMenuItems: Omit<MenuItem, 'id'>[] = [
    // Hot
    { name: 'Espresso', description: 'A concentrated coffee beverage brewed by forcing a small amount of nearly boiling water through finely-ground coffee beans.', price: 'Rp 20.000', image: 'https://placehold.co/600x400.png', category: 'hot' },
    { name: 'Americano', description: 'A style of coffee prepared by brewing espresso with added hot water, giving it a similar strength to, but different flavor from, traditionally brewed coffee.', price: 'Rp 25.000', image: 'https://placehold.co/600x400.png', category: 'hot' },
    { name: 'Latte', description: 'A coffee drink made with espresso and steamed milk.', price: 'Rp 30.000', image: 'https://placehold.co/600x400.png', category: 'hot' },
    { name: 'Cappuccino', description: 'An espresso-based coffee drink that originated in Italy, and is traditionally prepared with steamed milk foam.', price: 'Rp 30.000', image: 'https://placehold.co/600x400.png', category: 'hot' },
    // Cold
    { name: 'Iced Americano', description: 'Espresso shots topped with cold water produce a light layer of crema, then served over ice.', price: 'Rp 27.000', image: 'https://placehold.co/600x400.png', category: 'cold' },
    { name: 'Iced Latte', description: 'A chilled version of the classic latte, made with espresso and cold milk over ice.', price: 'Rp 32.000', image: 'https://placehold.co/600x400.png', category: 'cold' },
    { name: 'Cold Brew', description: 'Coffee brewed with cold water over a long period, resulting in a smooth, less acidic flavor.', price: 'Rp 35.000', image: 'https://placehold.co/600x400.png', category: 'cold' },
    // Manual
    { name: 'V60', description: 'A pour-over brewing method that produces a clean, clear, and nuanced cup of coffee.', price: 'Rp 40.000', image: 'https://placehold.co/600x400.png', category: 'manual' },
    { name: 'French Press', description: 'An immersion brewing method that creates a full-bodied, rich, and aromatic cup of coffee.', price: 'Rp 38.000', image: 'https://placehold.co/600x400.png', category: 'manual' },
    { name: 'Aeropress', description: 'A versatile brewing device that can produce a range of coffee styles, from espresso-like to filter coffee.', price: 'Rp 42.000', image: 'https://placehold.co/600x400.png', category: 'manual' },
    // Signature
    { name: 'Kopi Susu Sehati', description: 'Our signature iced coffee with creamy milk and a touch of Gula Aren.', price: 'Rp 28.000', image: 'https://placehold.co/600x400.png', category: 'signature' },
    { name: 'Pandan Latte', description: 'A unique blend of espresso, steamed milk, and fragrant pandan syrup.', price: 'Rp 35.000', image: 'https://placehold.co/600x400.png', category: 'signature' },
];

const menuCollection = dbAdmin?.collection('menu');
let isSeeding = false;
let seedingCompleted = false;

async function seedDatabaseIfNeeded() {
  if (!dbAdmin || !menuCollection || seedingCompleted || isSeeding) {
    return;
  }
  
  isSeeding = true;

  try {
    const snapshot = await menuCollection.limit(1).get();
    if (snapshot.empty) {
      console.log('Menu collection is empty. Seeding database...');
      const batch = dbAdmin.batch();
      initialMenuItems.forEach(itemData => {
          const docRef = menuCollection.doc();
          batch.set(docRef, itemData);
      });
      await batch.commit();
      console.log('Menu database seeded successfully.');
    }
    seedingCompleted = true;
  } catch (error) {
    console.error("Error seeding menu database:", error);
  } finally {
    isSeeding = false;
  }
}

export async function getMenuItems(): Promise<MenuItems> {
    noStore();

    if (!dbAdmin || !menuCollection) {
      console.error("Firestore Admin is not initialized. Cannot get menu items.");
      return { hot: [], cold: [], manual: [], signature: [] };
    }

    await seedDatabaseIfNeeded();

    const menuSnapshot = await menuCollection.get();
    const menuList = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as MenuItem));
    
    // Group items by category
    const groupedItems = menuList.reduce((acc, item) => {
        const category = item.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as MenuItems);
    
    return {
        hot: groupedItems.hot || [],
        cold: groupedItems.cold || [],
        manual: groupedItems.manual || [],
        signature: groupedItems.signature || [],
    };
}
