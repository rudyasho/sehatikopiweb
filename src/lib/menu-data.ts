// src/lib/menu-data.ts
'use server';

import { getDb } from './firebase-admin';
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
    { name: 'Espresso', description: 'A concentrated coffee beverage brewed by forcing a small amount of nearly boiling water through finely-ground coffee beans.', price: 'Rp 20.000', image: 'https://images.unsplash.com/photo-1579983928235-55f171457a41?q=80&w=1287&auto=format&fit=crop', category: 'hot' },
    { name: 'Americano', description: 'A style of coffee prepared by brewing espresso with added hot water, giving it a similar strength to, but different flavor from, traditionally brewed coffee.', price: 'Rp 25.000', image: 'https://images.unsplash.com/photo-1542611201-a58334418642?q=80&w=1287&auto=format&fit=crop', category: 'hot' },
    { name: 'Latte', description: 'A coffee drink made with espresso and steamed milk.', price: 'Rp 30.000', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1337&auto=format&fit=crop', category: 'hot' },
    { name: 'Cappuccino', description: 'An espresso-based coffee drink that originated in Italy, and is traditionally prepared with steamed milk foam.', price: 'Rp 30.000', image: 'https://images.unsplash.com/photo-1572442388796-11668a67d5b2?q=80&w=1287&auto=format&fit=crop', category: 'hot' },
    // Cold
    { name: 'Iced Americano', description: 'Espresso shots topped with cold water produce a light layer of crema, then served over ice.', price: 'Rp 27.000', image: 'https://images.unsplash.com/photo-1621879699368-819e60a3fd43?q=80&w=1287&auto=format&fit=crop', category: 'cold' },
    { name: 'Iced Latte', description: 'A chilled version of the classic latte, made with espresso and cold milk over ice.', price: 'Rp 32.000', image: 'https://images.unsplash.com/photo-1594498654809-159c1b2c8643?q=80&w=1287&auto=format&fit=crop', category: 'cold' },
    { name: 'Cold Brew', description: 'Coffee brewed with cold water over a long period, resulting in a smooth, less acidic flavor.', price: 'Rp 35.000', image: 'https://images.unsplash.com/photo-1578779439626-88b7f94b490f?q=80&w=1287&auto=format&fit=crop', category: 'cold' },
    // Manual
    { name: 'V60', description: 'A pour-over brewing method that produces a clean, clear, and nuanced cup of coffee.', price: 'Rp 40.000', image: 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?q=80&w=1287&auto=format&fit=crop', category: 'manual' },
    { name: 'French Press', description: 'An immersion brewing method that creates a full-bodied, rich, and aromatic cup of coffee.', price: 'Rp 38.000', image: 'https://images.unsplash.com/photo-1621215109044-a90a18731b3e?q=80&w=1287&auto=format&fit=crop', category: 'manual' },
    { name: 'Aeropress', description: 'A versatile brewing device that can produce a range of coffee styles, from espresso-like to filter coffee.', price: 'Rp 42.000', image: 'https://images.unsplash.com/photo-1557996160-704933215100?q=80&w=1287&auto=format&fit=crop', category: 'manual' },
    // Signature
    { name: 'Kopi Susu Sehati', description: 'Our signature iced coffee with creamy milk and a touch of Gula Aren.', price: 'Rp 28.000', image: 'https://images.unsplash.com/photo-1586948256598-c949c8742c38?q=80&w=1287&auto=format&fit=crop', category: 'signature' },
    { name: 'Pandan Latte', description: 'A unique blend of espresso, steamed milk, and fragrant pandan syrup.', price: 'Rp 35.000', image: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=1287&auto=format&fit=crop', category: 'signature' },
];

let isSeeding = false;
let seedingCompleted = false;

async function seedDatabaseIfNeeded() {
  if (seedingCompleted || isSeeding) {
    return;
  }

  const dbAdmin = getDb();
  isSeeding = true;
  const menuCollection = dbAdmin.collection('menu');

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
  } catch (error) {
    console.error("Error seeding menu database:", error);
  } finally {
    isSeeding = false;
    seedingCompleted = true;
  }
}

export async function getMenuItems(): Promise<MenuItems | null> {
    noStore();
    try {
        const dbAdmin = getDb();
        await seedDatabaseIfNeeded();

        const menuCollection = dbAdmin.collection('menu');
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
    } catch (error) {
        console.error("Failed to get menu items:", error);
        return null;
    }
}
