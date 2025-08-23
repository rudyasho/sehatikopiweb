
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Twitter, Facebook, MessageCircle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getBlogPosts, type BlogPost } from '@/lib/blog-data';
import { Skeleton } from '@/components/ui/skeleton';

const StaticShare = ({ slug, title }: { slug: string, title: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-foreground/80">Share:</span>
      <Button asChild variant="outline" size="icon" className="h-8 w-8" aria-label="Share on Twitter">
        <a href={`https://twitter.com/intent/tweet?url=${`https://sehatikopi.id/blog/${slug}`}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button asChild variant="outline" size="icon" className="h-8 w-8" aria-label="Share on Facebook">
         <a href={`https://www.facebook.com/sharer/sharer.php?u=${`https://sehatikopi.id/blog/${slug}`}`} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button asChild variant="outline" size="icon" className="h-8 w-8" aria-label="Share on WhatsApp">
         <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + `https://sehatikopi.id/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" />
        </a>
      </Button>
    </div>
)

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};


export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const posts = await getBlogPosts();
      setBlogPosts(posts);
      setIsLoading(false);
    }
    fetchPosts();
  }, []);
  
  if (isLoading) {
     return (
        <div className="bg-secondary/50">
            <div className="container mx-auto px-4 py-12">
                <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-12" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
     )
  }

  if (blogPosts.length === 0) {
     return (
        <div className="bg-secondary/50">
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="font-headline text-4xl">No Blog Posts Yet</h1>
                <p className="mt-4">Check back soon for stories and insights!</p>
            </div>
        </div>
     )
  }

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">From the Journal</h1>
          <p className="mt-2 text-lg text-foreground/80">Stories, guides, and insights from the world of coffee.</p>
        </div>

        <section className="mb-16">
            <Card className="grid md:grid-cols-2 overflow-hidden shadow-xl bg-background">
                <div className="relative min-h-[300px] md:h-full">
                     <Image src={featuredPost.image || 'https://placehold.co/600x400.png'} alt={featuredPost.title || 'Blog post image'} fill className="object-cover" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                    <CardHeader className="p-0">
                        <Badge variant="secondary" className="mb-4 w-fit">{featuredPost.category}</Badge>
                        <Link href={`/blog/${featuredPost.slug}`}>
                            <CardTitle className="font-headline text-3xl text-primary hover:underline">{featuredPost.title}</CardTitle>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <CardDescription className="text-base">{featuredPost.excerpt}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-0 mt-6 flex-col items-start gap-4">
                         <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <Button asChild variant="default" size="lg" className="flex-grow">
                                <Link href={`/blog/${featuredPost.slug}`}>Read More &rarr;</Link>
                            </Button>
                            <div className="self-center">
                                <StaticShare slug={featuredPost.slug} title={featuredPost.title} />
                            </div>
                         </div>
                        {featuredPost.date && <span className="text-sm text-muted-foreground">{format(new Date(featuredPost.date), "MMMM d, yyyy")}</span>}
                    </CardFooter>
                </div>
            </Card>
        </section>

        {otherPosts.length > 0 && (
            <section>
                <Separator />
                <h2 className="font-headline text-3xl font-bold text-primary text-center my-12">More Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                    <motion.div
                        key={post.id}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        whileHover={{ y: -5, scale: 1.03 }}
                    >
                        <Card className="flex flex-col overflow-hidden shadow-lg bg-background h-full">
                        <CardHeader className="p-0">
                            <Link href={`/blog/${post.slug}`}>
                            <div className="relative h-60 w-full">
                                <Image src={post.image || 'https://placehold.co/600x400.png'} alt={post.title || 'Blog post image'} fill className="object-cover" />
                            </div>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-6 flex-grow">
                            <div className="flex items-center gap-4 mb-2">
                                <Badge variant="secondary">{post.category}</Badge>
                                {post.date && <span className="text-xs text-muted-foreground">{format(new Date(post.date), "MMM d, yyyy")}</span>}
                            </div>
                            <Link href={`/blog/${post.slug}`}>
                            <CardTitle className="font-headline text-2xl text-primary hover:underline">{post.title}</CardTitle>
                            </Link>
                            <CardDescription className="mt-2 text-base">{post.excerpt}</CardDescription>
                        </CardContent>
                        <CardFooter className="p-6 bg-secondary/50 flex flex-col items-start gap-4 mt-auto">
                            <Button asChild variant="link" className="p-0 h-auto text-primary">
                                <Link href={`/blog/${post.slug}`}>Read More &rarr;</Link>
                            </Button>
                            <Separator className="my-2" />
                            <StaticShare slug={post.slug} title={post.title} />
                        </CardFooter>
                        </Card>
                    </motion.div>
                ))}
                </div>
            </section>
        )}
      </div>
    </div>
  );
};
