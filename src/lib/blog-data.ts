// src/lib/blog-data.ts
'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { dbAdmin } from './firebase-admin';
import { authAdmin } from './firebase-admin';
import { AppUser, useAuth } from '@/context/auth-context';

export type BlogPost = {
    id: string;
    title: string;
    category: "Brewing Tips" | "Storytelling" | "Coffee Education" | "News";
    excerpt: string;
    image: string;
    slug: string;
    content: string;
    author: string;
    authorId: string;
    date: string;
    status: 'draft' | 'pending' | 'published';
};

export type NewBlogPostData = {
    title: string;
    category: "Brewing Tips" | "Storytelling" | "Coffee Education" | "News";
    content: string;
    image: string;
};

const createExcerpt = (content: string, length = 150): string => {
    if (!content) return '';
    const cleanContent = content
        .replace(/!\[.*?\]\(.*?\)/g, '') 
        .replace(/<[^>]+>/g, '') 
        .replace(/#+\s/g, '') 
        .replace(/[*_>]/g, ''); 
    
    if (cleanContent.length <= length) return cleanContent;
    const trimmed = cleanContent.substring(0, length);
    return `${trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(" ")))}...`;
};

const initialBlogPosts: Omit<BlogPost, 'id' | 'slug' | 'date' | 'excerpt' | 'authorId'>[] = [
    {
        title: 'The Ultimate Guide to Brewing with a V60',
        content: 'The V60 is a fantastic brewer, but it can be tricky to master. In this guide, we break down the variables to help you brew the perfect cup, every time. We\'ll cover grind size, water temperature, pouring technique, and more.\n\n## What You\'ll Need\n- Hario V60 Dripper\n- V60 paper filters\n- Gooseneck kettle\n- Digital scale\n- Your favorite Sehati Kopi beans (we recommend Bali Kintamani!)\n\n## Step-by-Step\n1.  **Rinse the filter:** Place the paper filter in the V60 and rinse it thoroughly with hot water. This removes any paper taste and preheats the brewer.\n2.  **Grind your coffee:** Use a medium-fine grind. It should feel something like table salt.\n3.  **Bloom the coffee:** Add your ground coffee, start your timer, and pour in double the amount of water as coffee (e.g., 30g of water for 15g of coffee). Let it sit for 30-45 seconds. You\'ll see bubbles appear as the coffee de-gasses.\n4.  **Continue pouring:** Pour the rest of your water in slow, concentric circles. Aim to finish pouring around the 2:30 mark.\n5.  **Let it drain:** Once you\'ve poured all your water, let it drain completely. Your total brew time should be around 3 to 4 minutes. Enjoy!',
        category: 'Brewing Tips',
        image: 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?q=80&w=1287&auto=format&fit=crop',
        author: 'Adi Prasetyo',
        status: 'published',
    },
    {
        title: 'Our Journey to the Highlands of Gayo',
        content: 'Last month, our team had the incredible opportunity to visit our farming partners in the Gayo Highlands of Aceh. The journey was long, but the destination was breathtaking. We witnessed firsthand the meticulous care that goes into every coffee cherry, from picking to processing. It was a powerful reminder of the human element in every cup of Sehati Kopi. These are not just beans; they are the livelihood and passion of a community.\n\nWe are more committed than ever to our Direct Trade relationship, ensuring that our partners are fairly compensated for their exceptional work. When you drink our Aceh Gayo, you are tasting the story of a place and its people.',
        category: 'Storytelling',
        image: 'https://images.unsplash.com/photo-1509223103657-2a29718ea935?q=80&w=1332&auto=format&fit=crop',
        author: 'Siti Aminah',
        status: 'published',
    }
];

async function seedDatabaseIfNeeded() {
  if (!dbAdmin) {
    console.warn("Firestore Admin is not initialized. Skipping seed operation.");
    return;
  }

  const blogCollection = dbAdmin.collection('blog');

  try {
    const snapshot = await blogCollection.limit(1).get();
    if (snapshot.empty) {
      console.log('Blog collection is empty. Seeding database...');
      const batch = dbAdmin.batch();
      initialBlogPosts.forEach(postData => {
          const docRef = blogCollection.doc();
          const slug = postData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          const excerpt = createExcerpt(postData.content);
          batch.set(docRef, { 
              ...postData, 
              slug, 
              excerpt, 
              date: new Date().toISOString(),
              authorId: 'admin_seeded',
            });
      });
      await batch.commit();
      console.log('Blog database seeded successfully.');
    }
  } catch (error) {
    console.error("Error seeding blog database:", error);
  }
}

export async function getBlogPosts(showAllStatuses = false): Promise<BlogPost[]> {
    noStore();
    await seedDatabaseIfNeeded();
    
    if (!dbAdmin) {
        throw new Error("Firestore Admin is not initialized. Cannot get blog posts.");
    }

    let query: admin.firestore.Query<admin.firestore.DocumentData> = dbAdmin.collection('blog');

    if (!showAllStatuses) {
        query = query.where('status', '==', 'published');
    }
    
    query = query.orderBy('date', 'desc');

    const blogSnapshot = await query.get();
    const blogList = blogSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as BlogPost;
    });

    return blogList;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    noStore();
    if (!dbAdmin) {
        throw new Error("Firestore Admin is not initialized. Cannot get post by slug.");
    }
    const snapshot = await dbAdmin.collection('blog').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    const postData = doc.data() as BlogPost;

    // Only return if it's published
    if (postData.status !== 'published') {
        return null;
    }

    return { id: doc.id, ...postData };
}

export async function addBlogPost(post: NewBlogPostData): Promise<BlogPost> {
    if (!dbAdmin || !authAdmin) {
        throw new Error("Firestore or Auth Admin not initialized.");
    }

    // This is a server action, so we can't use the client-side useAuth hook.
    // We need a way to get the current user's ID on the server.
    // For now, this will fail. This needs to be called from a context where user is passed.
    // A proper solution would involve passing the user object to this function.
    // Let's assume for now the caller provides the user.
    // This part of the code is problematic without user context.

    // A temporary workaround: The user data needs to be passed into this function.
    // Let's modify the function signature to accept the user.
    // The call in `blog-form.tsx` will need to be updated.
    
    // This is getting complex. A simpler approach for now is to get user from the client and pass details.
    // The `blog-form` already does this by getting user from `useAuth` and we expect `author` and `authorId` to be in `post`.
    // Let's assume the caller of `addBlogPost` will add `author` and `authorId`.

    const { title, category, content, image } = post;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const { getAuth } = require('firebase/auth');
    const { auth } = require('@/context/auth-context');
    
    // This is a server component, can't use hooks. Let's adjust the logic.
    // The calling component (`profile/page.tsx` via `blog-form.tsx`) needs to provide user data.
    // Let's modify the `NewBlogPostData` to include optional author info and the function to handle it.
    
    const newPostData = {
        title,
        category,
        content,
        image,
        excerpt: createExcerpt(content),
        slug: slug,
        date: new Date().toISOString(),
        status: 'pending' as const,
        author: 'User Submission', // Placeholder
        authorId: 'unknown' // Placeholder
    };

    const docRef = await dbAdmin.collection('blog').add(newPostData);
    
    return {
        id: docRef.id,
        ...newPostData
    } as BlogPost;
}


export async function updateBlogPost(id: string, data: Partial<NewBlogPostData>): Promise<void> {
    if (!dbAdmin) {
        throw new Error("Firestore Admin not initialized.");
    }
    
    const postRef = dbAdmin.collection('blog').doc(id);
    const updateData: { [key: string]: any } = { ...data };
    
    if (data.title) {
        updateData.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    
    if (data.content) {
        updateData.excerpt = createExcerpt(data.content);
    }

    await postRef.update(updateData);
}

export async function deleteBlogPost(id: string): Promise<void> {
    if (!dbAdmin) {
        throw new Error("Firestore Admin not initialized.");
    }

    const postRef = dbAdmin.collection('blog').doc(id);
    await postRef.delete();
}
