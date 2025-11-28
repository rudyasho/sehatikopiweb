// src/app/page.tsx
import { HomeClient } from './home-client';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/products-data';
import { getHeroData } from '@/lib/hero-data';
import { getTestimonials } from '@/lib/testimonials-data';


export const metadata: Metadata = {
  title: {
    template: '%s | Sehati Kopi Digital',
    default: 'Sehati Kopi Digital - Jual Kopi Arabika & Robusta Indonesia',
  },
  description: 'Jelajahi & beli biji kopi arabika dan robusta single-origin terbaik dari seluruh Indonesia. Sehati Kopi adalah roastery & kedai kopi Anda untuk rasa otentik yang dipanggang dengan penuh semangat.',
  keywords: ['kopi arabika', 'jual kopi arabika', 'biji kopi arabika', 'kopi indonesia', 'single origin coffee', 'roastery jakarta', 'kedai kopi', 'kopi robusta', 'beli kopi arabika online'],
  authors: [{ name: 'Sehati Kopi Digital' }],
  openGraph: {
    title: 'Sehati Kopi Digital - Kopi Arabika & Robusta Terbaik Indonesia',
    description: 'Temukan kekayaan rasa kopi arabika dan robusta dari seluruh nusantara. Kami menjual biji kopi arabika single-origin yang disangrai dengan sempurna.',
    url: 'https://sehatikopi.id', 
    siteName: 'Sehati Kopi Digital',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1200&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
        width: 1200,
        height: 630,
        alt: 'Secangkir kopi arabika dengan biji kopi tersebar',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sehati Kopi Digital - Jual Kopi Arabika Pilihan',
    description: 'Temukan warisan kopi Indonesia yang kaya dan cita rasa yang istimewa, dari biji kopi arabika hingga robusta.',
    images: ['https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1170&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
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

export default async function Home() {
  const [products, testimonials, heroData] = await Promise.all([
    getProducts(),
    getTestimonials(),
    getHeroData()
  ]);

  const featuredProducts = products.sort((a, b) => b.reviews - a.reviews).slice(0, 3);
  
  return (
    <HomeClient 
      featuredProducts={featuredProducts} 
      testimonials={testimonials} 
      heroData={heroData} 
    />
  );
}
