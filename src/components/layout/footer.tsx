"use client";

import Link from 'next/link';
import { Coffee, Instagram, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FormEvent } from 'react';

export function Footer() {
  const { toast } = useToast();

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = (event.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    
    if (email) {
      toast({
        title: "Subscribed!",
        description: `Thank you for subscribing, ${email}!`,
      });
      (event.target as HTMLFormElement).reset();
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
              <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary" /></Link>
              <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-primary" /></Link>
              <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary" /></Link>
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
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>Jl. Kopi Nikmat No. 1, Jakarta</li>
              <li>info@sehatikopi.id</li>
              <li>+62 123 4567 890</li>
            </ul>
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
          <p>&copy; {new Date().getFullYear()} Sehati Kopi Digital. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
