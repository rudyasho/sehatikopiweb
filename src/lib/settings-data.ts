// src/lib/settings-data.ts
'use server';

import { dbAdmin } from './firebase-admin';
import { unstable_noStore as noStore } from 'next/cache';

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
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
  }
}

export async function getSettings(): Promise<WebsiteSettings> {
    noStore();
    
    await initializeSettingsIfNeeded();
    
    if (!dbAdmin) {
      throw new Error("Firestore Admin is not initialized. Returning default settings.");
    }
    
    const docRef = dbAdmin.collection('settings').doc('main-settings');
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error("Settings document not found.");
    }
    
    const data = doc.data() as SettingsFormData;
    return { id: doc.id, ...data };
}

export async function updateSettings(data: SettingsFormData): Promise<void> {
    if (!dbAdmin) throw new Error("Firestore Admin not initialized.");

    const docRef = dbAdmin.collection('settings').doc('main-settings');
    await docRef.update(data);
}
