
"use client";

import Link from 'next/link';
import { Coffee, Instagram, Facebook, Twitter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FormEvent, useEffect, useState } from 'react';
import { getSettings, WebsiteSettings } from '@/lib/settings-data';
import { Skeleton } from '@/components/ui/skeleton';

export function Footer() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettingsData() {
        setIsLoading(true);
        try {
            const settingsData = await getSettings();
            setSettings(settingsData);
        } catch (error) {
            console.error("Failed to load footer settings:", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchSettingsData();
  }, []);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailInput = event.currentTarget.elements.namedItem('email') as HTMLInputElement;
    const email = emailInput.value;
    
    if (email) {
      toast({
        title: "Subscribed!",
        description: `Thank you for subscribing, ${email}!`,
      });
      emailInput.value = '';
    }
  };

  return (
    <footer className="bg-secondary border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline text-lg">Sehati Kopi</span>
            </Link>
            <p className="text-sm text-foreground/80">
              Roasting the finest Indonesian coffee with heart and passion.
            </p>
            <div className="flex space-x-4">
              {isLoading ? (
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              ) : settings ? (
                <>
                  <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-foreground/70 transition-colors hover:text-primary">
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-foreground/70 transition-colors hover:text-primary">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-foreground/70 transition-colors hover:text-primary">
                    <Twitter className="h-6 w-6" />
                  </a>
                </>
              ) : null}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/products" className="hover:text-primary">Shop</Link></li>
              <li><Link href="/menu" className="hover:text-primary">Menu</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/events" className="hover:text-primary">Events</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
             {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : settings ? (
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>{settings.contactAddress}</li>
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-primary">{settings.contactEmail}</a>
                </li>
                <li>
                  <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className="hover:text-primary">{settings.contactPhone}</a>
                </li>
              </ul>
            ) : <p className="text-sm text-destructive">Info not available.</p>}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-foreground/80 mb-2">
              Get the latest news and special offers.
            </p>
            <form className="flex space-x-2" onSubmit={handleNewsletterSubmit}>
              <Input name="email" type="email" placeholder="Your email" className="bg-background" required />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Sehati Kopi Indonesia. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
