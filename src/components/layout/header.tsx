
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Coffee, 
  Menu, 
  X, 
  ShoppingCart, 
  LayoutDashboard,
  Home,
  ShoppingBag,
  BookOpen,
  Calendar,
  Newspaper,
  Info,
  Mail,
  User,
  LogOut,
  Search,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useAuth, ADMIN_EMAILS } from '@/context/auth-context';
import { ThemeToggle } from './theme-toggle';
import { Separator } from '../ui/separator';


export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const { user, loading, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Shop', icon: ShoppingBag },
    { href: '/menu', label: 'Menu', icon: BookOpen },
    { href: '/blog', label: 'Blog', icon: Newspaper },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const isUserAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  const AuthNav = () => {
    if (loading) return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
    
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary transition-colors">
                 <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                 <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            {isUserAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button asChild>
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Link>
      </Button>
    );
  }

  const MobileAuth = () => {
    if (loading) {
      return <div className="h-14 w-full rounded-md bg-muted animate-pulse" />;
    }
    if (user) {
      return (
        <Button 
          variant="secondary"
          className="w-full justify-start text-lg p-6"
          onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
          }}
        >
          <LogOut className="mr-4 h-5 w-5" />
          Logout
        </Button>
      );
    }
    return (
      <Button asChild
        className="w-full justify-start text-lg p-6"
        variant="default"
      >
        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
            <LogIn className="mr-4 h-5 w-5" />
            Login / Sign Up
        </Link>
      </Button>
    )
  }

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };


  return (
    <motion.header
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
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
          <div className="flex items-center gap-2">
             <Button asChild variant="ghost" size="icon">
                <Link href="/search">
                    <Search />
                    <span className="sr-only">Search</span>
                </Link>
            </Button>
             <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart">
                <ShoppingCart />
                {isClient && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>
            <ThemeToggle />
            <div className="hidden md:block">
              {isClient && <AuthNav />}
            </div>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-4">
               <VisuallyHidden>
                  <DialogTitle>Mobile Menu</DialogTitle>
                  <DialogDescription>
                    Main navigation links for Sehati Kopi.
                  </DialogDescription>
                </VisuallyHidden>
              <div className="flex items-center justify-between border-b pb-4">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Coffee className="h-6 w-6 text-primary" />
                  <span className="font-bold font-headline text-lg">Sehati Kopi</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                   <X />
                   <span className="sr-only">Close Menu</span>
                </Button>
              </div>
              <nav className="flex flex-col space-y-2 pt-4 flex-grow">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 rounded-md p-3 text-lg font-medium transition-colors hover:bg-secondary',
                      pathname === href ? 'bg-secondary text-primary' : 'text-foreground/80'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t pt-4 space-y-2">
                {isClient && user && (
                  <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 rounded-md p-3 text-lg font-medium transition-colors hover:bg-secondary',
                      pathname === '/profile' ? 'bg-secondary text-primary' : 'text-foreground/80'
                    )}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  {isUserAdmin &&
                   <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 rounded-md p-3 text-lg font-medium transition-colors hover:bg-secondary',
                      pathname === '/dashboard' ? 'bg-secondary text-primary' : 'text-foreground/80'
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  }
                  <Separator className="my-2" />
                  </>
                )}
                 <Button asChild className="w-full justify-start text-lg p-3">
                  <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4">
                    <Search className="h-5 w-5" />
                    Search
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start text-lg p-3">
                  <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4">
                    <ShoppingCart className="h-5 w-5" />
                    Shopping Cart
                    {isClient && itemCount > 0 && (
                      <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Separator className="my-2" />
                {isClient && <MobileAuth />}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
