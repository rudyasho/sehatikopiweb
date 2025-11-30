// src/app/blog/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';

import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { marked } from 'marked';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';

import { getBlogPosts, getPostBySlug } from '@/lib/blog-data';
import { getProducts } from '@/lib/products-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { PostFooter } from './client-page';

export const revalidate = 0;

type Props = {
  params: { slug: string };
};

/*
// Disabling for Vercel build fix. This was causing issues because it runs at build time
// when environment variables for Firebase Admin SDK are not available.
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  if (!posts) return [];
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
*/

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  const previousImages = (await parent).openGraph?.images || []

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `/blog/${post.slug}`,
        images: [post.image, ...previousImages],
    },
    twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: [post.image],
    }
  };
}


export default async function BlogPostPage({ params }: Props) {
    noStore();
    const post = await getPostBySlug(params.slug);

    if (!post || post.status !== 'published') {
        notFound();
    }
    
    const allProducts = await getProducts();
    const recommendedProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    const cleanHtml = marked.parse(post.content) as string;

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12">
                <article className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Button asChild variant="link" className="p-0 text-base">
                            <Link href="/blog" className="inline-flex items-center text-primary hover:underline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Link>
                        </Button>
                    </div>

                    <header className="mb-8 text-center">
                        <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">{post.title}</h1>
                        <p className="mt-4 text-muted-foreground">By {post.author} on {format(new Date(post.date), "MMMM d, yyyy")}</p>
                    </header>
                    
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-8 shadow-lg">
                        <Image src={post.image} alt={post.title} fill className="object-cover" priority/>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                        <div className="lg:col-span-3">
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
                             <PostFooter post={post} />
                        </div>

                        <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start space-y-8">
                             <Card className="bg-secondary/50">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl text-primary">Recommended Products</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                {recommendedProducts.map(product => (
                                    <div key={product.id} className="flex items-center gap-4">
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                            <Image src={product.image} alt={product.name} fill className="object-cover"/>
                                        </div>
                                        <div>
                                            <Link href={`/products/${product.slug}`} className="font-semibold text-sm hover:underline">{product.name}</Link>
                                            <p className="text-sm text-muted-foreground">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}</p>
                                        </div>
                                    </div>
                                ))}
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href="/products">Shop All</Link>
                                    </Button>
                                </CardFooter>
                             </Card>
                        </aside>
                    </div>

                </article>
            </div>
        </div>
    );
}
