
'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Twitter, Facebook, MessageCircle, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const BlogPostShare = ({ title, slug }: { title: string, slug: string }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Construct the full URL on the client side
    if (typeof window !== 'undefined') {
        const fullUrl = window.location.origin + `/blog/${slug}`;
        setUrl(fullUrl);
    }
  }, [slug]);

  if (!url) return null; // Don't render anything until the URL is ready

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "You can now share it with your friends." });
  };

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-foreground/80">Share:</span>
      
      <Button asChild variant="outline" size="icon" aria-label="Share on Twitter" className="h-8 w-8">
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>

      <Button asChild variant="outline" size="icon" aria-label="Share on Facebook" className="h-8 w-8">
         <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>

      <Button asChild variant="outline" size="icon" aria-label="Share on WhatsApp" className="h-8 w-8">
         <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" />
        </a>
      </Button>

       <Button variant="outline" size="icon" onClick={handleCopyLink} aria-label="Copy link" className="h-8 w-8">
          <Link2 className="h-4 w-4" />
       </Button>
    </div>
  );
};
