// src/lib/blog-data.ts
import { dbAdmin } from './firebase-admin';

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

const blogCollection = dbAdmin?.collection('blog');

// Server-side cache
let blogCache: BlogPost[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 1 * 1000;

const invalidateCache = () => {
  blogCache = null;
  lastFetchTime = null;
};

// Helper function to safely create an excerpt
const createExcerpt = (content: string, length = 150): string => {
    if (!content) return '';
    // Strip markdown and HTML, then trim and slice.
    const cleanContent = content
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/#+\s/g, '') // Remove markdown headings
        .replace(/[*_>]/g, ''); // Remove other markdown characters
    
    if (cleanContent.length <= length) return cleanContent;
    // ensure we don't cut words in half
    const trimmed = cleanContent.substring(0, length);
    return `${trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(" ")))}...`;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
    const now = Date.now();
    if (blogCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
      return blogCache;
    }

    if (!dbAdmin || !blogCollection) {
      console.error("Firestore Admin is not initialized. Cannot get blog posts.");
      return [];
    }

    const blogSnapshot = await blogCollection.get();
    const blogList = blogSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as BlogPost;
    });

    // Sort by date descending
    blogList.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    });
    
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
    
    invalidateCache();

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
        updateData.excerpt = createExcerpt(data.content);
    }

    await postRef.update(updateData);
    invalidateCache();
}

export async function deleteBlogPost(id: string): Promise<void> {
    if (!dbAdmin || !blogCollection) throw new Error("Firestore Admin not initialized.");

    const postRef = blogCollection.doc(id);
    await postRef.delete();
    invalidateCache();
}
