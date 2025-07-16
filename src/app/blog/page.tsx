
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBlogPosts, type BlogPost } from '@/lib/blog-data';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Stories, guides, and insights from the world of Indonesian coffee. Explore our journal for the latest articles on brewing, culture, and news.',
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  
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

        {/* Featured Post Section */}
        <section className="mb-16">
            <Card className="grid md:grid-cols-2 overflow-hidden shadow-xl bg-background">
                <div className="relative min-h-[300px] md:h-full">
                     <Image src={featuredPost.image || 'https://placehold.co/600x400.png'} alt={featuredPost.title || 'Blog post image'} layout="fill" objectFit="cover" data-ai-hint={featuredPost.aiHint ?? 'coffee'} />
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
                         <Button asChild variant="default" size="lg">
                            <Link href={`/blog/${featuredPost.slug}`}>Read More &rarr;</Link>
                        </Button>
                        {featuredPost.date && <span className="text-sm text-muted-foreground">{format(new Date(featuredPost.date), "MMMM d, yyyy")}</span>}
                    </CardFooter>
                </div>
            </Card>
        </section>

        {otherPosts.length > 0 && (
            <section>
                <Separator />
                <h2 className="font-headline text-3xl font-bold text-primary text-center my-12">Artikel Lainnya</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                    <Card key={`${post.id}-${post.slug}`} className="flex flex-col overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-background">
                    <CardHeader className="p-0">
                        <Link href={`/blog/${post.slug}`}>
                        <div className="relative h-60 w-full">
                            <Image src={post.image || 'https://placehold.co/600x400.png'} alt={post.title || 'Blog post image'} layout="fill" objectFit="cover" data-ai-hint={post.aiHint ?? 'coffee'} />
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
                    <CardFooter className="p-6 bg-secondary/50">
                        <Button asChild variant="link" className="p-0 h-auto text-primary">
                            <Link href={`/blog/${post.slug}`}>Read More &rarr;</Link>
                        </Button>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            </section>
        )}
      </div>
    </div>
  );
};
