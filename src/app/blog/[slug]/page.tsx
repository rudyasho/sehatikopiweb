
'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookAudio, Loader2, Twitter, Facebook, MessageCircle, Link2, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import { getBlogPosts, type BlogPost as BlogPostType } from '../page';
import { useEffect, useState, useMemo, useTransition, useRef } from 'react';
import { products } from '@/lib/products-data';
import { Card, CardContent, CardTitle, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateCoffeeStory } from '@/ai/flows/story-teller-flow';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

const staticContent: Record<string, {author: string, date: string, content: string}> = {
  'v60-guide': {
    author: 'Adi Prasetyo',
    date: 'July 28, 2024',
    content: `
      <p class="text-lg mb-4">The V60 is a fantastic brewing device that highlights the clarity and nuances of a coffee. Its conical shape and large single hole allow for great control over the brewing process. Let's dive into how to master it.</p>
      <h3 class="font-headline text-2xl text-primary mt-8 mb-4">What You'll Need</h3>
      <ul class="list-disc list-inside mb-4 space-y-2">
        <li>Hario V60 Dripper</li>
        <li>V60 Paper Filter</li>
        <li>Gooseneck Kettle</li>
        <li>20g of high-quality, medium-fine ground coffee</li>
        <li>320g of water at 92-96°C (198-205°F)</li>
        <li>Digital Scale and Timer</li>
        <li>Your favorite mug</li>
      </ul>
      <h3 class="font-headline text-2xl text-primary mt-8 mb-4">Step-by-Step Guide</h3>
      <ol class="list-decimal list-inside space-y-4">
        <li><strong>Rinse the Filter:</strong> Place the filter in the V60 and rinse it thoroughly with hot water. This removes any paper taste and preheats the brewer and your mug. Discard the rinse water.</li>
        <li><strong>Add Coffee:</strong> Add your 20g of ground coffee to the filter and give it a gentle shake to level the bed.</li>
        <li><strong>The Bloom (0:00 - 0:45):</strong> Start your timer and pour about 60g of water, ensuring all grounds are saturated. Let it 'bloom' for 45 seconds. This releases CO2 from the beans.</li>
        <li><strong>Main Pour (0:45 - 2:00):</strong> Begin pouring the rest of the water in slow, concentric circles. Avoid pouring on the very edge of the filter. Keep a steady pace until you reach 320g of water.</li>
        <li><strong>Drawdown (2:00 - 3:00):</strong> Allow all the water to drain through the coffee bed. The entire process should take around 3 minutes. If it's too fast, grind finer. If it's too slow, grind coarser.</li>
      </ol>
      <p class="text-lg mt-8">Enjoy your perfectly brewed cup of coffee! The V60 method rewards precision and experimentation, so don't be afraid to tweak your variables to suit your taste.</p>
    `,
  },
  'gayo-journey': {
    author: 'Siti Aminah',
    date: 'July 22, 2024',
    content: `
      <p class="text-lg mb-4">The Gayo Highlands in Aceh, Sumatra, are a place of breathtaking beauty and incredible coffee. The region's high altitude, volcanic soil, and unique microclimates create the perfect conditions for growing Arabica beans with a distinct, beloved character.</p>
      <p class="text-lg mb-4">Our journey took us to meet the families who have been cultivating coffee here for generations. They practice a unique processing method called 'Giling Basah' (wet-hulling), which contributes to the coffee's signature full body and earthy, spicy notes. It's a method born of the region's humid climate, and it's what makes Gayo coffee so special.</p>
      <blockquote class="border-l-4 border-primary pl-4 italic my-8">"We don't just grow coffee; we grow our family's legacy. Each bean holds a story of the land and our hands." - Pak Iwan, Gayo Farmer</blockquote>
      <p class="text-lg mb-4">Walking through the plantations, you see coffee growing harmoniously alongside shade trees and other crops. This commitment to biodiversity isn't just good for the environment; it enriches the soil and the final flavor of the coffee. At Sehati Kopi, we are proud to partner with these farmers, ensuring they receive a fair price for their incredible work and bringing their story to your cup.</p>
    `,
  },
  'processing-methods': {
    author: 'Budi Santoso',
    date: 'July 15, 2024',
    content: `
      <p class="text-lg mb-4">Have you ever wondered what 'washed', 'natural', or 'honey' means on a bag of coffee? These terms refer to the processing method used to remove the coffee bean from the cherry after it's picked. This step has a massive impact on the coffee's final flavor.</p>
      <h3 class="font-headline text-2xl text-primary mt-8 mb-4">Washed Process</h3>
      <p class="mb-4">In this method, all the fruit pulp is washed off the bean before it's dried. This results in a clean, crisp, and bright cup that showcases the coffee's inherent acidity and origin characteristics.</p>
      <h3 class="font-headline text-2xl text-primary mt-8 mb-4">Natural Process</h3>
      <p class="mb-4">Here, the entire coffee cherry is dried intact, with the bean inside. This is the oldest method of processing. The bean absorbs sugars from the drying fruit, leading to a heavy-bodied, sweet, and fruity cup, often with wine-like or fermented notes.</p>
      <h3 class="font-headline text-2xl text-primary mt-8 mb-4">Honey Process</h3>
      <p class="mb-4">A hybrid of the two, the honey process involves removing the skin of the cherry but leaving some of the sticky mucilage (the 'honey') on the bean during drying. This creates a cup that balances the clarity of a washed coffee with the sweetness and body of a natural.</p>
      <p class="text-lg mt-8">Each method offers a unique sensory experience. We encourage you to try coffees with different processing methods to discover your personal preference!</p>
    `,
  },
  'single-origin': {
    author: 'Budi Santoso',
    date: 'July 8, 2024',
    content: `
      <p class="text-lg mb-4">The term 'single-origin' simply means that the coffee comes from a single known geographical location. This could be a single farm, a specific cooperative of farmers, or a particular region in a country. But why does this matter?</p>
      <h3 class="font-headline text-2xl text-primary mt-8 mb-4">Traceability and Story</h3>
      <p class="mb-4">Single-origin coffee connects you directly to the source. You know where your coffee came from, who grew it, and the conditions it was grown in. This transparency ensures quality and ethical sourcing, allowing us to build meaningful relationships with our farming partners.</p>
      <h3 class="font-headline text-2xl text-primary mt-8 mb-4">Distinctive Flavor</h3>
      <p class="mb-4">Unlike blends, which are designed for consistency, single-origin coffees celebrate uniqueness. The specific soil, climate, altitude, and processing methods (the 'terroir') of a region impart a distinct flavor profile that can't be replicated. It's a taste of a specific place and time. You might taste the volcanic soil of Flores or the citrusy notes of Bali Kintamani.</p>
      <h3 class="font-headline text-2xl text-primary mt-8 mb-4">Seasonal Freshness</h3>
      <p class="mb-4">Coffee is a seasonal fruit. By focusing on single origins, we can offer you the freshest beans at their peak flavor, following the harvest seasons around Indonesia.</p>
      <p class="text-lg mt-8">Choosing single-origin is choosing to experience the full spectrum of what coffee can be—an agricultural product with a rich story and a unique sense of place.</p>
    `,
  },
};

type PostWithContent = BlogPostType & { content: string, author: string, date: string };

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
  const recommendedPosts = useMemo(() => {
    const allPosts = getBlogPosts();
    return allPosts
      .filter(p => p.slug !== currentSlug) // Exclude the current post
      .sort(() => 0.5 - Math.random()) // Shuffle the array
      .slice(0, 3); // Take the first 3
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
  const topProducts = products
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 3);

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
  const [post, setPost] = useState<PostWithContent | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isStoryLoading, startStoryTransition] = useTransition();
  const [storyText, setStoryText] = useState<string | null>(null);
  const [audioStory, setAudioStory] = useState<string | null>(null);
  const [storyStarted, setStoryStarted] = useState(false);

  useEffect(() => {
    const allPosts = getBlogPosts();
    const postData = allPosts.find((p) => p.slug === params.slug);

    if (postData) {
      const isAiGenerated = !staticContent[postData.slug];
      
      const postDetails = isAiGenerated
        ? {
            author: 'Sehati Kopi AI',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            content: postData.content || `<p>${postData.excerpt}</p>`,
          }
        : staticContent[postData.slug];
      
      const fullPost: PostWithContent = {
        ...postData,
        ...postDetails,
      };
      setPost(fullPost);
    } else {
        setPost(null); 
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
          description: post.excerpt,
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
              <span>By {post.author}</span> | <span>{post.date}</span>
            </div>
            <ShareButtons title={post.title} slug={post.slug} />
          </header>

          <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
            <Image src={post.image} alt={post.title} layout="fill" objectFit="cover" data-ai-hint={post.aiHint ?? 'coffee blog'} />
          </div>

          <div
            className="prose lg:prose-xl max-w-none text-foreground/90 prose-headings:text-primary prose-h3:font-headline"
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
