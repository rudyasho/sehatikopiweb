
// src/lib/blog-data.ts
import { app } from './firebase';
import { getFirestore, collection, getDocs, addDoc, query, writeBatch, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { marked } from 'marked';

export type BlogPost = {
    id: string;
    title: string;
    category: "Brewing Tips" | "Storytelling" | "Coffee Education" | "News";
    excerpt: string;
    image: string; // Can be a URL or a data URI
    aiHint?: string;
    slug: string;
    content: string; // Stored as Markdown, rendered as HTML
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

const initialBlogPosts: Omit<BlogPost, 'id' | 'slug'>[] = [
  {
    title: 'The Ultimate Guide to V60 Brewing',
    category: 'Brewing Tips',
    excerpt: 'Master the art of the V60 pour-over with our step-by-step guide. From grind size to pouring technique, we cover everything you need to know for the perfect cup.',
    image: 'https://images.unsplash.com/photo-1593963654879-24b533a31936?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'v60 coffee',
    author: 'Adi Prasetyo',
    date: '2024-07-28T10:00:00Z',
    content: `The V60 is a fantastic brewing device that highlights the clarity and nuances of a coffee. Its conical shape and large single hole allow for great control over the brewing process. Let's dive into how to master it.

## What You'll Need
*   Hario V60 Dripper
*   V60 Paper Filter
*   Gooseneck Kettle
*   20g of high-quality, medium-fine ground coffee
*   320g of water at 92-96°C (198-205°F)
*   Digital Scale and Timer
*   Your favorite mug

## Step-by-Step Guide
1.  **Rinse the Filter:** Place the filter in the V60 and rinse it thoroughly with hot water. This removes any paper taste and preheats the brewer and your mug. Discard the rinse water.
2.  **Add Coffee:** Add your 20g of ground coffee to the filter and give it a gentle shake to level the bed.
3.  **The Bloom (0:00 - 0:45):** Start your timer and pour about 60g of water, ensuring all grounds are saturated. Let it 'bloom' for 45 seconds. This releases CO2 from the beans.
4.  **Main Pour (0:45 - 2:00):** Begin pouring the rest of the water in slow, concentric circles. Avoid pouring on the very edge of the filter. Keep a steady pace until you reach 320g of water.
5.  **Drawdown (2:00 - 3:00):** Allow all the water to drain through the coffee bed. The entire process should take around 3 minutes. If it's too fast, grind finer. If it's too slow, grind coarser.

Enjoy your perfectly brewed cup of coffee! The V60 method rewards precision and experimentation, so don't be afraid to tweak your variables to suit your taste.`,
  },
  {
    title: 'A Journey to the Gayo Highlands',
    category: 'Storytelling',
    excerpt: 'Travel with us to the highlands of Aceh, the home of our Gayo coffee. Discover the stories of the farmers and the unique terroir that gives this coffee its distinct flavor.',
    image: 'https://images.unsplash.com/photo-1599819149454-98445100e495?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'coffee plantation landscape',
    author: 'Siti Aminah',
    date: '2024-07-22T10:00:00Z',
    content: `The Gayo Highlands in Aceh, Sumatra, are a place of breathtaking beauty and incredible coffee. The region's high altitude, volcanic soil, and unique microclimates create the perfect conditions for growing Arabica beans with a distinct, beloved character.

Our journey took us to meet the families who have been cultivating coffee here for generations. They practice a unique processing method called 'Giling Basah' (wet-hulling), which contributes to the coffee's signature full body and earthy, spicy notes. It's a method born of the region's humid climate, and it's what makes Gayo coffee so special.

> "We don't just grow coffee; we grow our family's legacy. Each bean holds a story of the land and our hands." - Pak Iwan, Gayo Farmer

Walking through the plantations, you see coffee growing harmoniously alongside shade trees and other crops. This commitment to biodiversity isn't just good for the environment; it enriches the soil and the final flavor of the coffee. At Sehati Kopi, we are proud to partner with these farmers, ensuring they receive a fair price for their incredible work and bringing their story to your cup.`,
  },
  {
    title: 'Understanding Coffee Processing Methods',
    category: 'Coffee Education',
    excerpt: 'Washed, natural, or honey-processed? Learn how different processing methods impact the final taste of your coffee and find your preferred style.',
    image: 'https://images.unsplash.com/photo-1621282276039-3a13a0342637?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'coffee cherry',
    author: 'Budi Santoso',
    date: '2024-07-15T10:00:00Z',
    content: `Have you ever wondered what 'washed', 'natural', or 'honey' means on a bag of coffee? These terms refer to the processing method used to remove the coffee bean from the cherry after it's picked. This step has a massive impact on the coffee's final flavor.

## Washed Process
In this method, all the fruit pulp is washed off the bean before it's dried. This results in a clean, crisp, and bright cup that showcases the coffee's inherent acidity and origin characteristics.

## Natural Process
Here, the entire coffee cherry is dried intact, with the bean inside. This is the oldest method of processing. The bean absorbs sugars from the drying fruit, leading to a heavy-bodied, sweet, and fruity cup, often with wine-like or fermented notes.

## Honey Process
A hybrid of the two, the honey process involves removing the skin of the cherry but leaving some of the sticky mucilage (the 'honey') on the bean during drying. This creates a cup that balances the clarity of a washed coffee with the sweetness and body of a natural.

Each method offers a unique sensory experience. We encourage you to try coffees with different processing methods to discover your personal preference!`,
  },
  {
    title: 'Why Single-Origin Coffee Matters',
    category: 'Coffee Education',
    excerpt: 'Explore the benefits of single-origin coffee, from its traceable roots to its unique and complex flavor profiles that tell the story of its origin.',
    image: 'https://plus.unsplash.com/premium_photo-1673984542253-96e3d7756e15?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    aiHint: 'coffee cup beans',
    author: 'Budi Santoso',
    date: '2024-07-08T10:00:00Z',
    content: `The term 'single-origin' simply means that the coffee comes from a single known geographical location. This could be a single farm, a specific cooperative of farmers, or a particular region in a country. But why does this matter?

## Traceability and Story
Single-origin coffee connects you directly to the source. You know where your coffee came from, who grew it, and the conditions it was grown in. This transparency ensures quality and ethical sourcing, allowing us to build meaningful relationships with our farming partners.

## Distinctive Flavor
Unlike blends, which are designed for consistency, single-origin coffees celebrate uniqueness. The specific soil, climate, altitude, and processing methods (the 'terroir') of a region impart a distinct flavor profile that can't be replicated. It's a taste of a specific place and time. You might taste the volcanic soil of Flores or the citrusy notes of Bali Kintamani.

## Seasonal Freshness
Coffee is a seasonal fruit. By focusing on single origins, we can offer you the freshest beans at their peak flavor, following the harvest seasons around Indonesia.

Choosing single-origin is choosing to experience the full spectrum of what coffee can be—an agricultural product with a rich story and a unique sense of place.`,
  },
].map(post => ({
    ...post,
    slug: post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
}));


const db = getFirestore(app);
const blogCollection = collection(db, 'blog');
let isSeeding = false;
let seedingCompleted = false;

async function seedDatabaseIfNeeded() {
  if (seedingCompleted || isSeeding) {
    return;
  }
  
  isSeeding = true;

  try {
    const snapshot = await getDocs(query(blogCollection, limit(1)));
    if (snapshot.empty) {
      console.log('Blog collection is empty. Seeding database...');
      const batch = writeBatch(db);
      initialBlogPosts.forEach(postData => {
          const docRef = doc(blogCollection);
          batch.set(docRef, postData);
      });
      await batch.commit();
      console.log('Blog database seeded successfully.');
    }
    seedingCompleted = true;
  } catch (error) {
    console.error("Error seeding blog database:", error);
  } finally {
    isSeeding = false;
  }
}

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

    await seedDatabaseIfNeeded();

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
    // To display the content correctly, we convert Markdown to HTML here.
    const post = posts.find(p => p.slug === slug);
    if (post) {
      try {
        post.content = await marked.parse(post.content);
      } catch (e) {
        console.error("Error parsing markdown for slug:", slug, e);
        post.content = "Error displaying content."
      }
    }
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

    