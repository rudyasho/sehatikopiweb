
"use client";

import Link from 'next/link';
import { Coffee, Instagram, Facebook, Twitter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FormEvent, useEffect, useState } from 'react';
import { getSettings, WebsiteSettings } from '@/lib/settings-data';

export function Footer() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsData = await getSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to load footer settings:", error);
      }
    }
    fetchSettings();
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
              {settings ? (
                <>
                  <a href={settings.socialInstagram} aria-label="Instagram" className="text-[#E4405F] transition-opacity hover:opacity-80">
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a href={settings.socialFacebook} aria-label="Facebook" className="text-[#1877F2] transition-opacity hover:opacity-80">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href={settings.socialTwitter} aria-label="Twitter" className="text-[#1DA1F2] transition-opacity hover:opacity-80">
                    <Twitter className="h-6 w-6" />
                  </a>
                </>
              ) : (
                <div className="h-6 w-24 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
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
             {settings ? (
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>{settings.contactAddress}</li>
                <li>{settings.contactEmail}</li>
                <li>{settings.contactPhone}</li>
              </ul>
            ) : (
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse"></div>
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse"></div>
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse"></div>
              </div>
            )}
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
