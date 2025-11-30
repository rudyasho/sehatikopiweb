// src/lib/hero-data.ts
'use server';

import { getDb } from './firebase-admin';
import { unstable_noStore as noStore } from 'next/cache';

export type HeroData = {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
};

export type HeroFormData = Omit<HeroData, 'id'>;

const defaultHeroData: HeroFormData = {
  title: 'A Journey of Indonesian Flavor',
  subtitle: 'Discover the rich heritage and exquisite taste of single-origin Indonesian coffee, roasted with passion and precision.',
  imageUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1170&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
};

async function initializeHeroDataIfNeeded() {
  const dbAdmin = getDb();
  if (!dbAdmin) return;
  const contentCollection = dbAdmin.collection('siteContent');
  const HERO_DOC_ID = 'homepage-hero';

  try {
    const docRef = contentCollection.doc(HERO_DOC_ID);
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log('Hero data document not found. Creating with default values...');
      await docRef.set(defaultHeroData);
      console.log('Default hero data created.');
    }
  } catch (error) {
    console.error("Error initializing hero data:", error);
  }
}

export async function getHeroData(): Promise<HeroData> {
    noStore();
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    await initializeHeroDataIfNeeded();
    
    const docRef = dbAdmin.collection('siteContent').doc('homepage-hero');
    const doc = await docRef.get();

    if (!doc.exists) {
        return { id: 'homepage-hero', ...defaultHeroData };
    }
    
    const data = doc.data() as HeroFormData;
    return { id: doc.id, ...data };
}

export async function updateHeroData(data: HeroFormData): Promise<void> {
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    const docRef = dbAdmin.collection('siteContent').doc('homepage-hero');
    await docRef.update(data);
}
