import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Stories, brewing guides, and insights from the world of Indonesian coffee. Dive into our journal to deepen your coffee knowledge.',
};

const blogPosts = [
  {
    title: 'The Ultimate Guide to V60 Brewing',
    category: 'Brewing Tips',
    excerpt: 'Master the art of the V60 pour-over with our step-by-step guide. From grind size to pouring technique, we cover everything you need to know for the perfect cup.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'v60 coffee',
    slug: 'v60-guide',
  },
  {
    title: 'A Journey to the Gayo Highlands',
    category: 'Storytelling',
    excerpt: 'Travel with us to the highlands of Aceh, the home of our Gayo coffee. Discover the stories of the farmers and the unique terroir that gives this coffee its distinct flavor.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'coffee plantation landscape',
    slug: 'gayo-journey',
  },
  {
    title: 'Understanding Coffee Processing Methods',
    category: 'Coffee Education',
    excerpt: 'Washed, natural, or honey-processed? Learn how different processing methods impact the final taste of your coffee and find your preferred style.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'coffee cherry',
    slug: 'processing-methods',
  },
  {
    title: 'Why Single-Origin Coffee Matters',
    category: 'Coffee Education',
    excerpt: 'Explore the benefits of single-origin coffee, from its traceable roots to its unique and complex flavor profiles that tell the story of its origin.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'coffee cup beans',
    slug: 'single-origin',
  },
];

const BlogPage = () => {
  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">From the Journal</h1>
          <p className="mt-2 text-lg text-foreground/80">Stories, guides, and insights from the world of coffee.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="flex flex-col overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-background">
              <CardHeader className="p-0">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-60 w-full">
                    <Image src={post.image} alt={post.title} layout="fill" objectFit="cover" data-ai-hint={post.aiHint} />
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
