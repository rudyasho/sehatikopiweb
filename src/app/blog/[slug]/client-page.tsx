// src/app/blog/[slug]/client-page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Twitter, Facebook, MessageCircle, Link2, Edit } from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { type BlogPost } from '@/lib/blog-data';


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


export const PostFooter = ({ post }: { post: BlogPost }) => {
    const { user } = useAuth();
    return (
        <div className="mt-8 pt-8 border-t">
            <div className="flex justify-between items-center">
                <ShareButtons title={post.title} slug={post.slug} />
                {user && user.email === 'rd.lapawawoi@gmail.com' && (
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
