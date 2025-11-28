// src/app/home-client.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee, Leaf, Star, ShoppingCart, Check, BookOpen } from 'lucide-react';

import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/lib/products-data';
import { type HeroData } from '@/lib/hero-data';
import { type Testimonial } from '@/lib/testimonials-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

interface FeaturedProductsProps {
  products: Product[];
}

function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedProducts(prev => ({ ...prev, [product.slug]: true }));
    toast({
      title: 'Ditambahkan ke Keranjang',
      description: `1 x ${product.name} telah ditambahkan.`,
    });
    setTimeout(() => {
      setAddedProducts(prev => ({ ...prev, [product.slug]: false }));
    }, 2000);
  };

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <motion.div
            key={product.id}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ y: -5, scale: 1.03 }}
            className="h-full"
        >
          <Card className="text-left overflow-hidden shadow-lg bg-background flex flex-col h-full">
            <CardHeader className="p-0">
              <Link href={`/products/${product.slug}`}>
                <div className="relative h-60 w-full">
                  <Image 
                      src={product.image} 
                      alt={`Biji Kopi Arabika ${product.name}`} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover" 
                  />
                </div>
              </Link>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <CardTitle className="font-headline text-2xl text-primary">{product.name}</CardTitle>
              <CardDescription className="mt-2 h-12">{product.description.substring(0, 80)}...</CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 bg-secondary/50 gap-4 mt-auto">
              <span className="text-xl font-bold text-primary self-center sm:self-auto">
                 {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/products/${product.slug}`}>Lihat</Link>
                </Button>
                <Button onClick={() => handleAddToCart(product)} disabled={addedProducts[product.slug]} className="flex-1" aria-label={`Tambah ${product.name} ke keranjang`}>
                  {addedProducts[product.slug] ? <Check /> : <ShoppingCart />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

const HeroSection = ({ heroData }: { heroData: HeroData }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white">
      <Image
        src={heroData.imageUrl}
        alt="Latar belakang biji kopi arabika panggang"
        fill
        sizes="100vw"
        className="absolute z-0 object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 container mx-auto px-4"
      >
        <motion.h1
            variants={itemVariants}
            className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold"
        >
          {heroData.title}
        </motion.h1>
        <motion.p
            variants={itemVariants}
            className="mt-4 text-lg md:text-xl max-w-2xl mx-auto"
        >
          {heroData.subtitle}
        </motion.p>
        <motion.div variants={itemVariants}>
            <Button asChild size="lg" className="mt-8 font-bold">
            <Link href="/products">
                Jelajahi Kopi Kami <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};


function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials && testimonials.map((testimonial) => (
         <motion.div
            key={testimonial.id}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            whileHover={{ y: -5, scale: 1.03 }}
         >
            <Card className="text-left shadow-lg bg-secondary/50 h-full">
            <CardHeader className="flex flex-row items-center gap-4 p-6">
                <Avatar className="h-16 w-16">
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                <div className="flex text-amber-500">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <p className="text-foreground/80 italic">"{testimonial.review}"</p>
            </CardContent>
            </Card>
        </motion.div>
      ))}
    </div>
  );
}

interface HomeClientProps {
    featuredProducts: Product[];
    testimonials: Testimonial[];
    heroData: HeroData;
}

export function HomeClient({ featuredProducts, testimonials, heroData }: HomeClientProps) {
  return (
    <div className="flex flex-col">
      {heroData && <HeroSection heroData={heroData} />}

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-semibold">
              Dari Hati, Untuk Pecinta Kopi
            </h2>
            <p className="mt-4 text-lg text-foreground/80">
              Sehati Kopi Indonesia lahir dari kecintaan pada budaya kopi yang kaya di nusantara. Kami bermitra dengan petani lokal untuk memberikan Anda biji kopi terbaik, menyangrai setiap batch dengan sempurna untuk menonjolkan karakter uniknya. Filosofi kami sederhana: kualitas, keberlanjutan, dan semangat bersama untuk kopi yang nikmat.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center gap-2">
                <Coffee className="text-primary h-5 w-5" />
                <span className="font-semibold">Sangrai Artisan</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="text-primary h-5 w-5" />
                <span className="font-semibold">Sumber Berkelanjutan</span>
              </div>
            </div>
            <Button asChild variant="link" className="mt-4 px-0 text-primary">
              <Link href="/about">Pelajari cerita kami <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
             <Image
              src="https://images.unsplash.com/photo-1630411870702-8f6f8fd80ce2?q=80&w=1332&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Mesin sangrai kopi artisan"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">Kopi Unggulan</h2>
          <p className="mt-2 text-lg max-w-2xl mx-auto text-foreground/80">
            Pilihan biji kopi terbaik kami, dikurasi untuk pengalaman yang luar biasa.
          </p>
          <FeaturedProducts products={featuredProducts} />
           <Button asChild variant="outline" size="lg" className="mt-12">
            <Link href="/products">
              Belanja Semua Kopi
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">Apa Kata Pelanggan Kami</h2>
          <Testimonials testimonials={testimonials} />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="bg-background p-8 rounded-lg shadow-xl text-center flex flex-col items-center justify-center">
            <BookOpen className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-headline text-2xl md:text-3xl font-semibold text-primary">Jelajahi Dunia Kopi</h3>
            <p className="mt-2 text-foreground/80 max-w-md mx-auto">
              Selami cerita kami, panduan menyeduh, dan berita terbaru dari dunia kopi.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/blog">
                Baca Blog Kami <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
