import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Coffee, Leaf, Star, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { products } from '@/lib/products-data';
import type { Metadata } from 'next';
import { ProductsClientPage } from './products/client-page';
import { HomeClient } from './client-page';


export const metadata: Metadata = {
  title: {
    template: '%s | Sehati Kopi Digital',
    default: 'Sehati Kopi Digital - Indonesian Coffee House & Roastery',
  },
  description: 'Discover the rich heritage and exquisite taste of single-origin Indonesian coffee, roasted with passion and precision. Sehati Kopi Indonesia - Coffee House & Roastery.',
  keywords: ['kopi indonesia', 'indonesian coffee', 'single origin coffee', 'roastery jakarta', 'kedai kopi', 'biji kopi'],
  authors: [{ name: 'Sehati Kopi Digital' }],
  openGraph: {
    title: 'Sehati Kopi Digital',
    description: 'A journey of Indonesian flavor.',
    url: 'https://sehatikopi.id', 
    siteName: 'Sehati Kopi Digital',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
        width: 1200,
        height: 630,
        alt: 'Sehati Kopi Digital',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sehati Kopi Digital',
    description: 'Discover the rich heritage and exquisite taste of single-origin Indonesian coffee.',
    images: ['https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Home() {
  return <HomeClient />;
}
