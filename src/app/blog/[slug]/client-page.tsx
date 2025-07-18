
// src/app/blog/[slug]/client-page.tsx
'use client';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Twitter, Facebook, MessageCircle, Link2, BookAudio, Loader2, Pause, Play, Edit } from 'lucide-react';
import { useEffect, useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import { type BlogPost } from '@/lib/blog-data';
import { generateCoffeeStoryText, generateCoffeeStoryAudio } from '@/ai/flows/story-teller-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ShareButtons = ({ title, slug }: { title: string, slug: string }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, [slug]);

  if (!url) return null;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "You can now share it with your friends." });
  };

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`;

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-sm font-semibold text-foreground/80">Share:</span>
      
      <Button asChild variant="outline" size="icon" aria-label="Share on Twitter">
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>

      <Button asChild variant="outline" size="icon" aria-label="Share on Facebook">
         <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>

      <Button asChild variant="outline" size="icon" aria-label="Share on WhatsApp">
         <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" />
        </a>
      </Button>

       <Button variant="outline" size="icon" onClick={handleCopyLink} aria-label="Copy link">
          <Link2 className="h-4 w-4" />
       </Button>
    </div>
  );
};

const AudioPlayer = ({ audioDataUri, isAudioLoading }: { audioDataUri: string | null; isAudioLoading: boolean; }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioDataUri && audioRef.current) {
        audioRef.current.src = audioDataUri;
    }
  }, [audioDataUri]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio && !isAudioLoading) {
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
      <audio ref={audioRef} preload="auto" />
      <Button onClick={togglePlayPause} size="icon" variant="outline" className="flex-shrink-0 rounded-full h-12 w-12" disabled={isAudioLoading || !audioDataUri}>
        {isAudioLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
        ) : isPlaying ? (
            <Pause className="h-6 w-6" />
        ) : (
            <Play className="h-6 w-6 translate-x-0.5" />
        )}
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

export const BlogPostClientWrapper = ({ post, children }: { post: BlogPost; children: React.ReactNode }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isTextLoading, startTextTransition] = useTransition();
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [storyText, setStoryText] = useState<string | null>(null);
    const [audioStory, setAudioStory] = useState<string | null>(null);
    const [storyStarted, setStoryStarted] = useState(false);

    const handleGenerateStory = () => {
        if (!post) return;
        setStoryStarted(true);
        setStoryText(null);
        setAudioStory(null);
        
        // Generate text first
        startTextTransition(async () => {
            try {
                const result = await generateCoffeeStoryText({
                    name: post.title,
                    origin: "Indonesia",
                    description: post.content.substring(0, 500), // Pass a snippet for better performance
                });
                setStoryText(result.storyText);
                
                // Now generate audio in the background
                setIsAudioLoading(true);
                const audioResult = await generateCoffeeStoryAudio(result.storyText);
                setAudioStory(audioResult.audioDataUri);

            } catch (error) {
                console.error("Error generating story:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not generate the story. Please try again.',
                });
            } finally {
                setIsAudioLoading(false);
            }
        });
    };

    return (
        <div>
            {/* The main post content, rendered on the server */}
            {children}

            {/* AI Story Teller section, which is interactive */}
            {user && (
                <div className="max-w-4xl mx-auto mt-12">
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
                                Generate the Story
                                </Button>
                            </div>
                            </>
                        )}

                        {isTextLoading && !storyText &&(
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>The storyteller is gathering their thoughts...</span>
                            </div>
                        )}
                            
                        {storyText && (
                            <Card className="mt-4 bg-secondary/30 animate-in fade-in-50 duration-500">
                                <CardContent className="p-4 space-y-4">
                                    <p className="text-foreground/90 italic whitespace-pre-wrap">{storyText}</p>
                                    <AudioPlayer audioDataUri={audioStory} isAudioLoading={isAudioLoading} />
                                </CardContent>
                            </Card>
                        )}
                    </Alert>
                </div>
            )}
        </div>
    );
};

export const PostFooter = ({ post }: { post: BlogPost }) => {
    const { user } = useAuth();
    return (
        <div className="mt-8 pt-8 border-t">
            <div className="flex justify-between items-center">
                <ShareButtons title={post.title} slug={post.slug} />
                {user && (
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard?view=manageBlog&edit=${post.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Post
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
