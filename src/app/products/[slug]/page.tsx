// src/app/products/[slug]/page.tsx
'use client';

import { notFound, useParams } from 'next/navigation';
import { getProductBySlug } from '@/lib/products-data';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;

      setIsLoading(true);
      try {
        const fetchedProduct = await getProductBySlug(slug);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);


  const handleAddToCart = () => {
    if (!product) return;
    if (quantity < 1) {
      toast({
        variant: 'destructive',
        title: 'Jumlah Tidak Valid',
        description: `Silakan masukkan jumlah 1 atau lebih.`,
      });
      return;
    }
    addToCart(product, quantity);
    setIsAdded(true);
    toast({
      title: 'Ditambahkan ke Keranjang',
      description: `${quantity} x ${product.name} telah ditambahkan ke keranjang Anda.`,
    });
    setTimeout(() => setIsAdded(false), 2000);
  };
  
  if (isLoading) {
    return (
        <div className="bg-secondary/50">
            <div className="container mx-auto px-4 py-8 md:py-12">
                 <Skeleton className="h-6 w-48 mb-8" />
                 <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                     <Skeleton className="aspect-square w-full rounded-lg" />
                     <div className="space-y-6">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                     </div>
                 </div>
            </div>
        </div>
    );
  }

  if (!product) {
    return notFound();
  }
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Sehati Kopi Digital',
    },
    offers: {
      '@type': 'Offer',
      url: `https://sehatikopi.id/products/${product.slug}`,
      priceCurrency: 'IDR',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews
    }
  };

  return (
    <>
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-secondary/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
              <Button asChild variant="link" className="p-0 text-base">
                  <Link href="/products" className="inline-flex items-center text-primary hover:underline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali ke Produk
                  </Link>
              </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
              <Image 
                  src={product.image} 
                  alt={`Kopi Arabika ${product.name}`} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
              />
            </div>

            <div className="space-y-6">
              <div>
                <Badge variant="outline">{product.origin}</Badge>
                <h1 className="font-headline text-3xl md:text-5xl font-bold text-primary mt-2">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                          <Star key={`star-${i}`} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                      ))}
                  </div>
                  <span className="text-foreground/60">({product.reviews} ulasan)</span>
                </div>
              </div>
              
              <p className="text-lg text-foreground/80">{product.description}</p>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold">Tingkat Sangrai:</span>
                <span>{product.roast}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {product.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div className="text-3xl md:text-4xl font-bold text-primary">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                <span className="text-base font-normal text-foreground/60"> / 250g</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="font-semibold flex-shrink-0">Jumlah:</span>
                  <div className="flex items-center border rounded-md self-start">
                      <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus/></Button>
                      <span className="px-4 font-bold text-lg">{quantity}</span>
                      <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q+1)}><Plus/></Button>
                  </div>
              </div>

              <Button size="lg" className="w-full sm:w-auto" onClick={handleAddToCart} disabled={isAdded}>
                {isAdded ? (
                  <>
                    <Check/>
                    Ditambahkan!
                  </>
                ) : (
                  <>
                    <ShoppingCart/>
                    Tambah ke Keranjang
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
