
// src/lib/blog-data.ts
import { app } from './firebase';
import { getFirestore, collection, getDocs, addDoc, query, where, getDoc, doc, writeBatch, limit, updateDoc, deleteDoc } from "firebase/firestore";

export type BlogPost = {
    id: string;
    title: string;
    category: "Brewing Tips" | "Storytelling" | "Coffee Education" | "News";
    excerpt: string;
    image: string; // Can be a URL or a data URI
    aiHint?: string;
    slug: string;
    content: string; // Stored as Markdown
    author: string;
    date: string; // ISO 8601 date string
};

export type NewBlogPostData = {
    title: string;
    category: "Brewing Tips" | "Storytelling" | "Coffee Education" | "News";
    content: string; // Markdown content
    image: string;
    aiHint: string;
}

const db = getFirestore(app);
const blogCollection = collection(db, 'blog');

// Server-side cache
let blogCache: BlogPost[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 1 * 1000;

const invalidateCache = () => {
  blogCache = null;
  lastFetchTime = null;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
    const now = Date.now();
    if (blogCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
      return blogCache;
    }

    const blogSnapshot = await getDocs(blogCollection);
    const blogList = blogSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as BlogPost;
    });

    // Sort by date descending
    blogList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    blogCache = blogList;
    lastFetchTime = now;

    return blogList;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await getBlogPosts();
    const post = posts.find(p => p.slug === slug);
    return post || null;
}

export async function addBlogPost(post: NewBlogPostData, authorName: string): Promise<BlogPost> {
    const slug = post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    const newPostData = {
        ...post,
        excerpt: `${(post.content.replace(/<[^>]+>/g, '').substring(0, 150))}...`,
        slug: slug,
        author: authorName,
        date: new Date().toISOString(),
    };

    const docRef = await addDoc(blogCollection, newPostData);
    
    invalidateCache();

    return {
        id: docRef.id,
        ...newPostData
    } as BlogPost;
}

export type BlogPostUpdateData = Partial<Pick<BlogPost, 'title' | 'category' | 'content' | 'image' | 'aiHint'>>;

export async function updateBlogPost(id: string, data: BlogPostUpdateData): Promise<void> {
    const postRef = doc(db, 'blog', id);
    const updateData: { [key: string]: any } = { ...data };
    
    if (data.title) {
        updateData.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    if (data.content) {
        // Generate excerpt from Markdown content
        updateData.excerpt = `${(data.content.replace(/#+\s/g, '').replace(/[*_>]/g, '').substring(0, 150))}...`;
    }

    await updateDoc(postRef, updateData);
    invalidateCache();
}

export async function deleteBlogPost(id: string): Promise<void> {
    const postRef = doc(db, 'blog', id);
    await deleteDoc(postRef);
    invalidateCache();
}
