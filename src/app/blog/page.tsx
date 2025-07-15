
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getBlogPosts, type BlogPost } from '@/lib/blog-data';
import { Skeleton } from '@/components/ui/skeleton';

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchPosts() {
        setIsLoading(true);
        try {
            const posts = await getBlogPosts();
            setBlogPosts(posts);
        } catch (error) {
            console.error("Failed to fetch blog posts:", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchPosts();
  }, []);
  
  const [latestPost, ...otherPosts] = useMemo(() => {
    if (blogPosts.length === 0) return [null, []];
    // Sort by date if available, otherwise just take the first one.
    const sorted = [...blogPosts].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
    });
    return [sorted[0], sorted.slice(1)];
  }, [blogPosts]);

  if (isLoading) {
    return (
        <div className="bg-secondary/50">
            <div className="container mx-auto px-4 py-12">
                 <div className="text-center mb-12">
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                </div>
                 <Skeleton className="h-[400px] w-full mb-12" />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full"/>)}
                 </div>
            </div>
        </div>
    )
  }

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
            <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-background">
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
