// src/lib/testimonials-data.ts
'use server';

import { dbAdmin } from './firebase-admin';
import { unstable_noStore as noStore } from 'next/cache';

export type Testimonial = {
    id: string;
    name: string;
    review: string;
    rating: number;
    avatar: string;
};

const initialTestimonials: Omit<Testimonial, 'id'>[] = [
  {
    name: 'Andi P.',
    avatar: 'https://images.unsplash.com/photo-1593628525442-f94a810619e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8cG90cmV0JTIwcHJpYSUyMHxlbnwwfHx8fDE3NTY2MjMwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    review: 'Kopi Arabika dari Sehati Kopi adalah yang terbaik yang pernah saya coba! Aroma dan rasanya benar-benar tiada duanya. Permata sejati.',
    rating: 5,
  },
  {
    name: 'Siti K.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    review: 'Sehati Kopi sudah menjadi ritual harian saya. Sangrai mereka konsisten dan pengirimannya selalu cepat. Sangat direkomendasikan!',
    rating: 5,
  },
  {
    name: 'Budi S.',
    avatar: 'https://images.unsplash.com/photo-1574091983337-b78650545f93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8cG90cmV0JTIwbGVsYWtpfGVufDB8fHx8MTc1NjYyMzE3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    review: 'Saya suka cerita di balik kopi dan semangat timnya. Anda bisa merasakan kualitasnya di setiap cangkir.',
    rating: 5,
  },
  {
    name: 'Rina M.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1361&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    review: 'Bali Kintamani mereka mengubah cara saya memandang kopi. Nota buahnya sangat cerah dan menyegarkan. Luar biasa!',
    rating: 5,
  },
  {
    name: 'Eko W.',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1470&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    review: 'Pengalaman pelanggan yang luar biasa. Timnya sangat berpengetahuan dan membantu saya memilih biji yang sempurna untuk selera saya.',
    rating: 4,
  }
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
  const testimonialsCollection = dbAdmin.collection('testimonials');

  try {
    const snapshot = await testimonialsCollection.limit(1).get();
    if (snapshot.empty) {
      console.log('Testimonials collection is empty. Seeding database...');
      const batch = dbAdmin.batch();
      initialTestimonials.forEach(testimonialData => {
          const docRef = testimonialsCollection.doc();
          batch.set(docRef, testimonialData);
      });
      await batch.commit();
      console.log('Testimonials database seeded successfully.');
    }
  } catch (error) {
    console.error("Error seeding testimonials database:", error);
  } finally {
    isSeeding = false;
    seedingCompleted = true;
  }
}

export async function getTestimonials(limit: number = 3): Promise<Testimonial[]> {
    noStore();
    await seedDatabaseIfNeeded();

    if (!dbAdmin) {
      throw new Error("Firestore Admin is not initialized. Cannot get testimonials.");
    }
    
    const testimonialsCollection = dbAdmin.collection('testimonials');
    const snapshot = await testimonialsCollection.limit(limit).get();
    const list = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Testimonial;
    });
    
    return list;
}
