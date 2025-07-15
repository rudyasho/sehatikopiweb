
// src/app/blog/[slug]/page.tsx
'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookAudio, Loader2, Twitter, Facebook, MessageCircle, Link2, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import { getBlogPosts, getPostBySlug, type BlogPost } from '@/lib/blog-data';
import { useEffect, useState, useMemo, useTransition, useRef } from 'react';
import { getProducts } from '@/lib/products-data';
import { Card, CardContent, CardTitle, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateCoffeeStory } from '@/ai/flows/story-teller-flow';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

const ShareButtons = ({ title, slug }: { title: string, slug: string }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, [slug]);

  if (!url) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`Check out this article from Sehati Kopi: ${title}`);

  const shareLinks = [
    { name: 'Twitter', icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'WhatsApp', icon: MessageCircle, href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}` }
  ];
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "You can now share it with your friends." });
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-sm font-semibold text-foreground/80">Share:</span>
      {shareLinks.map(link => (
        <Button key={link.name} variant="outline" size="icon" asChild>
          <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${link.name}`}>
            <link.icon className="h-4 w-4" />
          </a>
        </Button>
      ))}
       <Button variant="outline" size="icon" onClick={handleCopyLink} aria-label="Copy link">
          <Link2 className="h-4 w-4" />
       </Button>
    </div>
  );
};


const RecommendedBlogs = ({ currentSlug }: { currentSlug: string }) => {
    const [recommendedPosts, setRecommendedPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        const fetchRecommended = async () => {
            const allPosts = await getBlogPosts();
            const recommended = allPosts
                .filter(p => p.slug !== currentSlug) // Exclude the current post
                .sort(() => 0.5 - Math.random()) // Shuffle the array
                .slice(0, 3); // Take the first 3
            setRecommendedPosts(recommended);
        }
        fetchRecommended();
    }, [currentSlug]);

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
              <Card key={post.slug} className="flex flex-col overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-secondary/50">
                <CardHeader className="p-0">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-52 w-full">
                      <Image src={post.image} alt={post.title} layout="fill" objectFit="cover" data-ai-hint={post.aiHint ?? 'coffee'} />
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

const RecommendedProducts = () => {
    const [topProducts, setTopProducts] = useState<any[]>([]);

    useEffect(() => {
        async function fetchTopProducts() {
            const products = await getProducts();
            const sortedProducts = products
                .sort((a, b) => b.reviews - a.reviews)
                .slice(0, 3);
            setTopProducts(sortedProducts);
        }
        fetchTopProducts();
    }, []);

  if (!topProducts.length) return null;

  return (
    <div className="mt-12">
      <Separator />
      <div className="py-12">
        <h2 className="font-headline text-3xl text-primary text-center mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topProducts.map(product => (
            <Card key={product.slug} className="overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-secondary/50">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative h-52 w-full">
                  <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={product.aiHint}/>
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

const AudioPlayer = ({ audioDataUri }: { audioDataUri: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border">
      <audio ref={audioRef} src={audioDataUri} preload="auto" />
      <Button onClick={togglePlayPause} size="icon" variant="outline" className="flex-shrink-0 rounded-full h-12 w-12">
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
      </Button>
      <div className="flex items-center gap-1 w-full h-8 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary/30 rounded-full"
            style={{
              height: `${Math.sin(i * 0.4 + (isPlaying ? Date.now() / 200 : 0)) * 50 + 50}%`,
              animation: isPlaying ? 'wave 1.5s ease-in-out infinite alternate' : 'none',
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes wave {
            0% { transform: scaleY(0.2); }
            50% { transform: scaleY(1); }
            100% { transform: scaleY(0.2); }
          }
        `}</style>
      </div>
    </div>
  );
};


export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isStoryLoading, startStoryTransition] = useTransition();
  const [storyText, setStoryText] = useState<string | null>(null);
  const [audioStory, setAudioStory] = useState<string | null>(null);
  const [storyStarted, setStoryStarted] = useState(false);

  useEffect(() => {
    if (params.slug) {
        const fetchPost = async () => {
            const postData = await getPostBySlug(params.slug);
            setPost(postData);
        }
        fetchPost();
    }
  }, [params.slug]);

  const handleGenerateStory = () => {
    if (!post) return;
    setStoryStarted(true);
    startStoryTransition(async () => {
      setStoryText(null);
      setAudioStory(null);
      try {
        const result = await generateCoffeeStory({
          name: post.title,
          origin: "Indonesia",
          description: post.content, // Pass the full content for better story context
        });
        setStoryText(result.storyText);
        setAudioStory(result.audioDataUri);
      } catch (error) {
        console.error("Error generating audio story:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate the audio story. Please try again.',
        });
      }
    });
  };

  if (!post) {
    return (
        <div className="bg-background">
          <div className="container mx-auto px-4 py-8 md:py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary"/>
            <p className="mt-4">Loading post...</p>
          </div>
        </div>
    );
  }

  const storyGenerated = storyText && audioStory;

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-4xl mx-auto bg-card p-6 md:p-12 rounded-lg shadow-xl">
          <div className="mb-6 md:mb-8">
            <Link href="/blog" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </div>
          <header className="mb-6 md:mb-8 border-b pb-6 md:pb-8">
            <Badge variant="secondary" className="mb-4">{post.category}</Badge>
            <h1 className="font-headline text-3xl md:text-5xl font-bold text-primary">{post.title}</h1>
            <div className="mt-4 text-sm text-foreground/60">
              <span>By {post.author}</span> | <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <ShareButtons title={post.title} slug={post.slug} />
          </header>

          <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
            <Image src={post.image} alt={post.title} layout="fill" objectFit="cover" data-ai-hint={post.aiHint ?? 'coffee blog'} />
          </div>

          <div
            className="prose dark:prose-invert lg:prose-xl max-w-none text-foreground/90 prose-headings:text-primary prose-h2:font-headline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {user && (
            <div className="mt-12">
              <Separator />
              <Alert className="mt-12">
                  <BookAudio className="h-4 w-4" />
                  <AlertTitle className="font-headline">AI Story Teller</AlertTitle>
                  {!storyStarted && (
                    <>
                    <AlertDescription>
                      Listen to an AI-narrated version of this story.
                    </AlertDescription>
                    <div className="mt-4">
                        <Button variant="outline" onClick={handleGenerateStory}>
                          Listen to the Story
                        </Button>
                    </div>
                    </>
                  )}

                  {isStoryLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>The storyteller is clearing their throat... Please wait.</span>
                      </div>
                  )}
                    
                  {storyGenerated && (
                      <Card className="mt-4 bg-secondary/30 animate-in fade-in-50 duration-500">
                          <CardContent className="p-4 space-y-4">
                            <p className="text-foreground/90 italic whitespace-pre-wrap">{storyText}</p>
                            <AudioPlayer audioDataUri={audioStory} />
                          </CardContent>
                      </Card>
                  )}
                </Alert>
            </div>
          )}

          <RecommendedBlogs currentSlug={post.slug} />
          <RecommendedProducts />
        </article>
      </div>
    </div>
  );
}

    