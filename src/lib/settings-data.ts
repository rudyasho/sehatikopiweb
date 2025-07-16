// src/lib/settings-data.ts
'use server';

import { dbAdmin } from './firebase-admin';

export type WebsiteSettings = {
    id: string;
    contactPhone: string;
    contactEmail: string;
    contactAddress: string;
    socialInstagram: string;
    socialFacebook: string;
    socialTwitter: string;
};

export type SettingsFormData = Omit<WebsiteSettings, 'id'>;

const defaultSettings: SettingsFormData = {
  contactPhone: '+62 123 4567 890',
  contactEmail: 'info@sehatikopi.id',
  contactAddress: 'Jl. Kopi Nikmat No. 1, Jakarta, Indonesia',
  socialInstagram: 'https://instagram.com/sehatikopi',
  socialFacebook: 'https://facebook.com/sehatikopi',
  socialTwitter: 'https://twitter.com/sehatikopi',
};

const settingsCollection = dbAdmin?.collection('settings');
const SETTINGS_DOC_ID = 'main-settings'; // Use a single document for all settings

// Server-side cache
let settingsCache: WebsiteSettings | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function initializeSettingsIfNeeded() {
  if (!dbAdmin || !settingsCollection) return;

  try {
    const docRef = settingsCollection.doc(SETTINGS_DOC_ID);
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log('Settings document not found. Creating with default values...');
      await docRef.set(defaultSettings);
      console.log('Default settings created.');
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
  }
}

const invalidateCache = () => {
  settingsCache = null;
  lastFetchTime = null;
};

export async function getSettings(): Promise<WebsiteSettings> {
    const now = Date.now();
    if (settingsCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
      return settingsCache;
    }
    
    if (!dbAdmin || !settingsCollection) {
      console.error("Firestore Admin is not initialized. Returning default settings.");
      return { id: SETTINGS_DOC_ID, ...defaultSettings };
    }
    
    await initializeSettingsIfNeeded();
    
    const docRef = settingsCollection.doc(SETTINGS_DOC_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
        // This should not happen after initialization, but as a fallback
        return { id: SETTINGS_DOC_ID, ...defaultSettings };
    }
    
    const data = doc.data() as SettingsFormData;
    settingsCache = { id: doc.id, ...data };
    lastFetchTime = now;
    
    return settingsCache;
}

export async function updateSettings(data: SettingsFormData): Promise<void> {
    if (!dbAdmin || !settingsCollection) throw new Error("Firestore Admin not initialized.");

    const docRef = settingsCollection.doc(SETTINGS_DOC_ID);
    await docRef.update(data);
    invalidateCache(); // Invalidate cache after update
}
