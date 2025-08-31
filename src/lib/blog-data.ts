// src/lib/blog-data.ts
'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { dbAdmin } from './firebase-admin';

export type BlogPost = {
    id: string;
    title: string;
    category: "Brewing Tips" | "Storytelling" | "Coffee Education" | "News";
    excerpt: string;
    image: string;
    slug: string;
    content: string;
    author: string;
    date: string;
};

export type NewBlogPostData = {
    title: string;
    category: "Brewing Tips" | "Storytelling" | "Coffee Education" | "News";
    content: string;
    image: string;
    author: string;
}


const blogCollection = dbAdmin?.collection('blog');


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

export async function getBlogPosts(): Promise<BlogPost[]> {
    noStore();

    if (!blogCollection) {
      console.error("Firestore Admin is not initialized. Cannot get blog posts.");
      return [];
    }

    const blogSnapshot = await blogCollection.orderBy('date', 'desc').get();
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
    if (!blogCollection) {
        console.error("Firestore Admin is not initialized. Cannot get post by slug.");
        return null;
    }
    const snapshot = await blogCollection.where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BlogPost;
}

export async function addBlogPost(post: NewBlogPostData): Promise<BlogPost> {
    if (!blogCollection) throw new Error("Firestore Admin not initialized.");

    const slug = post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    const newPostData = {
        ...post,
        excerpt: createExcerpt(post.content),
        slug: slug,
        date: new Date().toISOString(),
    };

    const docRef = await blogCollection.add(newPostData);
    
    return {
        id: docRef.id,
        ...newPostData
    } as BlogPost;
}

export async function updateBlogPost(id: string, data: Partial<NewBlogPostData>): Promise<void> {
    if (!blogCollection) throw new Error("Firestore Admin not initialized.");
    
    const postRef = blogCollection.doc(id);
    const updateData: { [key: string]: any } = { ...data };
    
    if (data.title) {
        updateData.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    if (data.content) {
        if (!data.content.startsWith('data:image')) {
            updateData.excerpt = createExcerpt(data.content);
        }
    }

    await postRef.update(updateData);
}

export async function deleteBlogPost(id: string): Promise<void> {
    if (!blogCollection) throw new Error("Firestore Admin not initialized.");

    const postRef = blogCollection.doc(id);
    await postRef.delete();
}
