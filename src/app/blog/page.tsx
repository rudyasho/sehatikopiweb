
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GenerateBlogPostOutput } from '@/ai/flows/blog-post-generator';
import { Separator } from '@/components/ui/separator';

const initialBlogPosts = [
  {
    title: 'The Ultimate Guide to V60 Brewing',
    category: 'Brewing Tips',
    excerpt: 'Master the art of the V60 pour-over with our step-by-step guide. From grind size to pouring technique, we cover everything you need to know for the perfect cup.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'v60 coffee',
    slug: 'v60-guide',
    content: ''
  },
  {
    title: 'A Journey to the Gayo Highlands',
    category: 'Storytelling',
    excerpt: 'Travel with us to the highlands of Aceh, the home of our Gayo coffee. Discover the stories of the farmers and the unique terroir that gives this coffee its distinct flavor.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'coffee plantation landscape',
    slug: 'gayo-journey',
    content: ''
  },
  {
    title: 'Understanding Coffee Processing Methods',
    category: 'Coffee Education',
    excerpt: 'Washed, natural, or honey-processed? Learn how different processing methods impact the final taste of your coffee and find your preferred style.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'coffee cherry',
    slug: 'processing-methods',
    content: ''
  },
  {
    title: 'Why Single-Origin Coffee Matters',
    category: 'Coffee Education',
    excerpt: 'Explore the benefits of single-origin coffee, from its traceable roots to its unique and complex flavor profiles that tell the story of its origin.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'coffee cup beans',
    slug: 'single-origin',
    content: ''
  },
];

export type BlogPost = {
    title: string;
    category: string;
    excerpt: string;
    image: string; // Can be a URL or a data URI
    aiHint?: string;
    slug: string;
    content?: string; // Full HTML content
};

// Singleton pattern to hold posts in memory
class PostStore {
  private static instance: PostStore;
  private posts: BlogPost[];

  private constructor() {
    this.posts = initialBlogPosts;
  }

  public static getInstance(): PostStore {
    if (!PostStore.instance) {
      PostStore.instance = new PostStore();
    }
    return PostStore.instance;
  }

  public getPosts(): BlogPost[] {
    return this.posts;
  }

  public addPost(post: GenerateBlogPostOutput): BlogPost {
    const newPost: BlogPost = {
      title: post.title,
      category: post.category,
      excerpt: `${(post.content.replace(/<[^>]+>/g, '').substring(0, 150))}...`,
      image: post.imageDataUri,
      slug: post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      content: post.content, // Store the full HTML content
    };
    this.posts.unshift(newPost); // Add to the beginning
    return newPost;
  }
}

// Function to add a post from another component
export const addBlogPost = (post: GenerateBlogPostOutput) => {
  return PostStore.getInstance().addPost(post);
}

// Function to get all posts (for blog detail page)
export const getBlogPosts = () => {
    return PostStore.getInstance().getPosts();
}


const BlogPage = () => {
  // We use state to trigger re-renders when the singleton's data changes.
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(PostStore.getInstance().getPosts());
  
  const [latestPost, ...otherPosts] = useMemo(() => blogPosts, [blogPosts]);

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">From the Journal</h1>
          <p className="mt-2 text-lg text-foreground/80">Stories, guides, and insights from the world of coffee.</p>
        </div>

        {/* Featured Post */}
        {latestPost && (
            <Card className="mb-12 shadow-xl grid md:grid-cols-2 overflow-hidden bg-background">
                <div className="relative min-h-[300px] md:h-full">
                     <Image src={latestPost.image} alt={latestPost.title} layout="fill" objectFit="cover" data-ai-hint={latestPost.aiHint ?? 'coffee'} />
                </div>
                <div className="p-8 flex flex-col justify-center">
                    <Badge variant="secondary" className="mb-4 w-fit">{latestPost.category}</Badge>
                    <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold mb-4">{latestPost.title}</h2>
                    <p className="text-lg text-foreground/80 mb-6">{latestPost.excerpt}</p>
                    <Button asChild size="lg" className="w-fit">
                        <Link href={`/blog/${latestPost.slug}`}>Read More &rarr;</Link>
                    </Button>
                </div>
            </Card>
        )}
        
        <Separator className="my-12"/>

        {/* Other Posts */}
        <h3 className="font-headline text-3xl text-primary mb-8 text-center">All Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post) => (
            <Card key={post.slug} className="flex flex-col overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-background">
              <CardHeader className="p-0">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-60 w-full">
                    <Image src={post.image} alt={post.title} layout="fill" objectFit="cover" data-ai-hint={post.aiHint ?? 'coffee'} />
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                <Link href={`/blog/${post.slug}`}>
                  <CardTitle className="font-headline text-2xl text-primary hover:underline">{post.title}</CardTitle>
                </Link>
                <CardDescription className="mt-2 text-base">{post.excerpt}</CardDescription>
              </CardContent>
              <CardFooter className="p-6 bg-secondary/50">
                 <Button asChild variant="link" className="p-0 h-auto text-primary">
                    <Link href={`/blog/${post.slug}`}>Read More &rarr;</Link>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
