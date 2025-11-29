// src/lib/settings-data.ts
'use server';

import { dbAdmin } from './firebase-admin';
import { unstable_noStore as noStore } from 'next/cache';

export type WebsiteSettings = {
    id: string;
    siteName: string;
    contactPhone: string;
    contactEmail: string;
    contactAddress: string;
    socialInstagram: string;
    socialFacebook: string;
    socialTwitter: string;
};

export type SettingsFormData = Omit<WebsiteSettings, 'id'>;

const defaultSettings: SettingsFormData = {
  siteName: 'Sehati Kopi',
  contactPhone: '+62 123 4567 890',
  contactEmail: 'info@sehatikopi.id',
  contactAddress: 'Jl. Kopi Nikmat No. 1, Jakarta, Indonesia',
  socialInstagram: 'https://instagram.com/sehatikopi',
  socialFacebook: 'https://facebook.com/sehatikopi',
  socialTwitter: 'https://twitter.com/sehatikopi',
};

async function initializeSettingsIfNeeded() {
  if (!dbAdmin) {
    console.warn("Firestore Admin is not initialized. Skipping settings initialization.");
    return;
  }
  
  const settingsCollection = dbAdmin.collection('settings');
  const SETTINGS_DOC_ID = 'main-settings'; 

  try {
    const docRef = settingsCollection.doc(SETTINGS_DOC_ID);
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log('Settings document not found. Creating with default values...');
      await docRef.set(defaultSettings);
      console.log('Default settings created.');
    } else {
        // Add missing fields if they don't exist
        const data = doc.data();
        if (!data?.siteName) {
            await docRef.update({ siteName: defaultSettings.siteName });
        }
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
  }
}

export async function getSettings(): Promise<WebsiteSettings> {
    noStore();
    
    if (!dbAdmin) {
      console.error("Firestore Admin is not initialized. Returning default settings.");
      return { id: 'main-settings', ...defaultSettings };
    }
    await initializeSettingsIfNeeded();
    
    const docRef = dbAdmin.collection('settings').doc('main-settings');
    const doc = await docRef.get();

    if (!doc.exists) {
        return { id: 'main-settings', ...defaultSettings };
    }
    
    const data = doc.data() as SettingsFormData;
    return { id: doc.id, ...data };
}

export async function updateSettings(data: SettingsFormData): Promise<void> {
    if (!dbAdmin) {
        throw new Error("Firestore Admin not initialized.");
    }

    const docRef = dbAdmin.collection('settings').doc('main-settings');
    await docRef.update(data);
}
