
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Coffee, Menu, X, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  DialogTitle,
  DialogDescription,
} from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useCart } from '@/context/cart-context';


const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop'},
  { href: '/menu', label: 'Menu' },
  { href: '/events', label: 'Events' },
  { href: '/blog', label: 'Blog' },
  { href: '/dashboard', label: 'Dashboard'},
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/recommendations', label: 'Rekomendasi'},
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">Sehati Kopi</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === href ? 'text-primary' : 'text-foreground/60'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center">
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {isClient && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <VisuallyHidden>
                  <DialogTitle>Mobile Menu</DialogTitle>
                  <DialogDescription>
                    Main navigation links for Sehati Kopi.
                  </DialogDescription>
                </VisuallyHidden>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b pb-4">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Coffee className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline text-lg">Sehati Kopi</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                     <X className="h-5 w-5" />
                     <span className="sr-only">Close Menu</span>
                  </Button>
                </div>
                <nav className="flex flex-col space-y-4 pt-6">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'text-lg transition-colors hover:text-primary',
                        pathname === href ? 'text-primary' : 'text-foreground/80'
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-4">
                  <Button asChild className="w-full relative">
                    <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Shopping Cart
                      {isClient && itemCount > 0 && (
                        <span className="absolute right-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
