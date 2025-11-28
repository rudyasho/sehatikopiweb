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
    status: 'pending' | 'published';
    date: string; // ISO 8601
    productId?: string;
    userId?: string;
};

export type NewTestimonialData = Omit<Testimonial, 'id'>;

const initialTestimonials: Omit<Testimonial, 'id'>[] = [
  {
    name: 'Andi P.',
    avatar: 'https://images.unsplash.com/photo-1593628525442-f94a810619e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8cG90cmV0JTIwcHJpYSUyMHxlbnwwfHx8fDE3NTY2MjMwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    review: 'Kopi Arabika dari Sehati Kopi adalah yang terbaik yang pernah saya coba! Aroma dan rasanya benar-benar tiada duanya. Permata sejati.',
    rating: 5,
    status: 'published',
    date: new Date().toISOString(),
  },
  {
    name: 'Siti K.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    review: 'Sehati Kopi sudah menjadi ritual harian saya. Sangrai mereka konsisten dan pengirimannya selalu cepat. Sangat direkomendasikan!',
    rating: 5,
    status: 'published',
    date: new Date().toISOString(),
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

export async function getTestimonials(limit: number = 3, showPending: boolean = false): Promise<Testimonial[]> {
    noStore();
    await seedDatabaseIfNeeded();

    if (!dbAdmin) {
      throw new Error("Firestore Admin is not initialized. Cannot get testimonials.");
    }
    
    let query: admin.firestore.Query<admin.firestore.DocumentData> = dbAdmin.collection('testimonials').orderBy('date', 'desc');
    
    if (!showPending) {
        query = query.where('status', '==', 'published');
    }
    
    // If limit is 0, we fetch all documents.
    if (limit > 0) {
        query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    const list = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Testimonial;
    });
    
    return list;
}

export async function addTestimonial(testimonialData: NewTestimonialData): Promise<void> {
    if (!dbAdmin) {
        throw new Error("Firestore Admin not initialized.");
    }
    await dbAdmin.collection('testimonials').add(testimonialData);
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>): Promise<void> {
     if (!dbAdmin) {
        throw new Error("Firestore Admin not initialized.");
    }
    await dbAdmin.collection('testimonials').doc(id).update(data);
}

export async function deleteTestimonial(id: string): Promise<void> {
    if (!dbAdmin) {
        throw new Error("Firestore Admin not initialized.");
    }
    await dbAdmin.collection('testimonials').doc(id).delete();
}
