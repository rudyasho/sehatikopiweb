
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getBlogPosts, type BlogPost } from '@/lib/blog-data';
import type { Metadata } from 'next';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Stories, guides, and insights from the world of Indonesian coffee. Explore our journal for the latest articles on brewing, culture, and news.',
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  
  const [latestPost, ...otherPosts] = blogPosts.length > 0 ? [blogPosts[0], blogPosts.slice(1)] : [null, []];

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
                     <Image src={latestPost.image || 'https://placehold.co/600x400.png'} alt={latestPost.title || 'Featured blog post image'} layout="fill" objectFit="cover" data-ai-hint={latestPost.aiHint ?? 'coffee'} />
                </div>
                <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <Badge variant="secondary" className="w-fit">{latestPost.category}</Badge>
                      {latestPost.date && <span className="text-muted-foreground">{format(new Date(latestPost.date), "MMMM d, yyyy")}</span>}
                    </div>
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
      </div>
    </div>
  );
};
