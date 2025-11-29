// src/app/blog/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

import { getBlogPosts, getPostBySlug } from '@/lib/blog-data';
import { getProducts } from '@/lib/products-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PostFooter } from './client-page';


marked.setOptions({
  highlight: function (code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true,
});


type Props = {
  params: { slug: string };
};

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
  
  const previousImages = (await parent).openGraph?.images || [];
  const description = post.excerpt || `Baca artikel tentang ${post.title} di blog Sehati Kopi.`;

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: [post.image, ...previousImages],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      url: `https://sehatikopi.id/blog/${post.slug}`,
    },
    twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: description,
        images: [post.image],
    }
  };
}

const RecommendedBlogs = async ({ currentSlug }: { currentSlug: string }) => {
    const allPosts = await getBlogPosts();
    const recommendedPosts = allPosts
        .filter(p => p.slug !== currentSlug)
        .sort(() => 0.5 - Math.random()) 
        .slice(0, 3); 

  if (recommendedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
       <Separator />
       <div className="py-12">
        <h2 className="font-headline text-3xl text-primary text-center mb-8">Continue Reading</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedPosts.map(post => (
              <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-secondary/50">
                <CardHeader className="p-0">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-52 w-full">
                      <Image src={post.image} alt={post.title} fill className="object-cover" />
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                  <Link href={`/blog/${post.slug}`}>
                    <CardTitle className="font-headline text-xl text-primary hover:underline">{post.title}</CardTitle>
                  </Link>
                  <CardDescription className="mt-1 text-sm">{post.excerpt.substring(0,80)}...</CardDescription>
                </CardContent>
                 <CardFooter className="p-4 pt-0">
                   <Button asChild variant="link" className="p-0 h-auto text-primary">
                      <Link href={`/blog/${post.slug}`}>Read More <ArrowLeft className="transform rotate-180 ml-2 h-4 w-4"/></Link>
                    </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
       </div>
    </div>
  )
}

const RecommendedProducts = async () => {
    const products = await getProducts();
    const topProducts = products
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, 3);

  if (!topProducts.length) return null;

  return (
    <div className="mt-12">
      <Separator />
      <div className="py-12">
        <h2 className="font-headline text-3xl text-primary text-center mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topProducts.map(product => (
            <Card key={product.id} className="overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-secondary/50">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative h-52 w-full">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <CardTitle className="font-headline text-xl text-primary hover:underline">{product.name}</CardTitle>
                </Link>
                <p className="text-foreground/80 text-sm mt-1">{product.origin}</p>
                <Button asChild className="w-full mt-4">
                  <Link href={`/products/${product.slug}`}>View Product</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};


export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }
  
  const renderedContent = marked.parse(post.content);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 md:mb-8">
                <Button asChild variant="link" className="p-0">
                <Link href="/blog" className="inline-flex items-center text-primary hover:underline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                </Link>
                </Button>
            </div>
            <Card className="shadow-xl overflow-hidden">
                <div className="relative aspect-video w-full">
                    <Image src={post.image} alt={post.title} fill className="object-cover" priority />
                </div>
                <article className="p-6 md:p-12">
                    <header className="mb-6 md:mb-8 border-b pb-6 md:pb-8">
                        <Badge variant="secondary" className="mb-4">{post.category}</Badge>
                        <h1 className="font-headline text-3xl md:text-5xl font-bold text-primary">{post.title}</h1>
                        <div className="mt-4 text-sm text-foreground/60">
                        <span>By {post.author}</span>
                        {post.date && <span> • {format(new Date(post.date), "MMMM d, yyyy")}</span>}
                        </div>
                    </header>
                    <div
                        className="prose dark:prose-invert lg:prose-xl max-w-none text-foreground/90 prose-headings:text-primary prose-h2:font-headline"
                        dangerouslySetInnerHTML={{ __html: renderedContent as string }}
                    />
                    <PostFooter post={post} />
                </article>
            </Card>
            <RecommendedBlogs currentSlug={post.slug} />
            <RecommendedProducts />
        </div>
      </div>
    </div>
  );
}
