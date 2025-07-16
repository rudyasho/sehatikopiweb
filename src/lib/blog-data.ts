// src/lib/blog-data.ts
'use server';

import { dbAdmin } from './firebase-admin';
import { unstable_noStore as noStore } from 'next/cache';


export type BlogPost = {
    id: string;
    title: string;
    category: "Brewing Tips" | "Storytelling" | "Coffee Education" | "News";
    excerpt: string;
    image: string;
    aiHint?: string;
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
    aiHint: string;
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

    if (!dbAdmin || !blogCollection) {
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
    const posts = await getBlogPosts();
    const post = posts.find(p => p.slug === slug);
    return post || null;
}

export async function addBlogPost(post: NewBlogPostData, authorName: string): Promise<BlogPost> {
    if (!dbAdmin || !blogCollection) throw new Error("Firestore Admin not initialized.");

    const slug = post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    const newPostData = {
        ...post,
        excerpt: createExcerpt(post.content),
        slug: slug,
        author: authorName,
        date: new Date().toISOString(),
    };

    const docRef = await blogCollection.add(newPostData);
    
    return {
        id: docRef.id,
        ...newPostData
    } as BlogPost;
}

export type BlogPostUpdateData = Partial<Pick<BlogPost, 'title' | 'category' | 'content' | 'image' | 'aiHint'>>;

export async function updateBlogPost(id: string, data: BlogPostUpdateData): Promise<void> {
    if (!dbAdmin || !blogCollection) throw new Error("Firestore Admin not initialized.");
    
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
    if (!dbAdmin || !blogCollection) throw new Error("Firestore Admin not initialized.");

    const postRef = blogCollection.doc(id);
    await postRef.delete();
}