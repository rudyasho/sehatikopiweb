// src/lib/events-data.ts
'use server';

import { getDb } from './firebase-admin';
import { unstable_noStore as noStore } from 'next/cache';

export type Event = {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    image: string;
};

export type EventFormData = Omit<Event, 'id'>;


const initialEvents: Omit<Event, 'id'>[] = [
  {
    title: 'Coffee Cupping 101',
    date: 'Saturday, August 17, 2024',
    time: '10:00 AM - 12:00 PM',
    location: 'Sehati Kopi Roastery, Jakarta',
    description: 'Join us for an immersive coffee cupping session. Learn to identify different flavor notes and aromas from our single-origin Indonesian coffees. Perfect for beginners and enthusiasts alike.',
    image: 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'Latte Art Workshop',
    date: 'Sunday, August 25, 2024',
    time: '2:00 PM - 4:00 PM',
    location: 'Sehati Kopi Flagship Store',
    description: 'Unleash your inner artist! Our expert baristas will guide you through the basics of milk steaming and pouring techniques to create beautiful latte art. All materials provided.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'Meet the Farmer: Gayo Highlands',
    date: 'Saturday, September 7, 2024',
    time: '3:00 PM - 5:00 PM',
    location: 'Online via Zoom',
    description: 'A special virtual event where you can meet the farmers behind our Aceh Gayo beans. Hear their stories, learn about their farming practices, and participate in a live Q&A session.',
    image: 'https://images.unsplash.com/photo-1509223103657-2a29718ea935?q=80&w=1332&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];


async function seedDatabaseIfNeeded() {
  const dbAdmin = getDb();
  if (!dbAdmin) return;
  const eventsCollection = dbAdmin.collection('events');

  try {
    const snapshot = await eventsCollection.limit(1).get();
    if (snapshot.empty) {
      console.log('Events collection is empty. Seeding database...');
      const batch = dbAdmin.batch();
      initialEvents.forEach(eventData => {
          const docRef = eventsCollection.doc();
          batch.set(docRef, eventData);
      });
      await batch.commit();
      console.log('Events database seeded successfully.');
    }
  } catch (error) {
    console.error("Error seeding events database:", error);
  }
}

export async function getEvents(): Promise<Event[]> {
    noStore();
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    await seedDatabaseIfNeeded();
    
    const eventsCollection = dbAdmin.collection('events');
    const eventsSnapshot = await eventsCollection.orderBy('date').get();
    const eventsList = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Event;
    });
    
    return eventsList;
}

export async function addEvent(eventData: EventFormData): Promise<Event> {
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    const eventsCollection = dbAdmin.collection('events');
    const docRef = await eventsCollection.add(eventData);
    return {
        id: docRef.id,
        ...eventData
    };
}

export async function updateEvent(id: string, data: Partial<EventFormData>): Promise<void> {
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    const eventsCollection = dbAdmin.collection('events');
    const eventRef = eventsCollection.doc(id);
    await eventRef.update(data);
}

export async function deleteEvent(id: string): Promise<void> {
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    const eventsCollection = dbAdmin.collection('events');
    const eventRef = eventsCollection.doc(id);
    await eventRef.delete();
}

    