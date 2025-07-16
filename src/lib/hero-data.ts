// src/lib/hero-data.ts
'use server';

import { dbAdmin } from './firebase-admin';

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
  imageUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
};

const contentCollection = dbAdmin?.collection('siteContent');
const HERO_DOC_ID = 'homepage-hero';

// Server-side cache
let heroCache: HeroData | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function initializeHeroDataIfNeeded() {
  if (!dbAdmin || !contentCollection) return;

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

const invalidateCache = () => {
  heroCache = null;
  lastFetchTime = null;
};

export async function getHeroData(): Promise<HeroData> {
    const now = Date.now();
    if (heroCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
      return heroCache;
    }
    
    if (!dbAdmin || !contentCollection) {
      console.error("Firestore Admin is not initialized. Returning default hero data.");
      return { id: HERO_DOC_ID, ...defaultHeroData };
    }
    
    await initializeHeroDataIfNeeded();
    
    const docRef = contentCollection.doc(HERO_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
        return { id: HERO_DOC_ID, ...defaultHeroData };
    }
    
    const data = doc.data() as HeroFormData;
    heroCache = { id: doc.id, ...data };
    lastFetchTime = now;
    
    return heroCache;
}

export async function updateHeroData(data: HeroFormData): Promise<void> {
    if (!dbAdmin || !contentCollection) throw new Error("Firestore Admin not initialized.");

    const docRef = contentCollection.doc(HERO_DOC_ID);
    await docRef.update(data);
    invalidateCache();
}
