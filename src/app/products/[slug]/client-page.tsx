'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';

export function ProductClientPage({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    toast({
      title: 'Added to Cart',
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Link href="/products" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
            <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={product.aiHint} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline">{product.origin}</Badge>
              <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mt-2">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-400'}`} />
                    ))}
                </div>
                <span className="text-foreground/60">({product.reviews} reviews)</span>
              </div>
            </div>
            
            <p className="text-lg text-foreground/80">{product.description}</p>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold">Roast:</span>
              <span>{product.roast}</span>
            </div>

            <div className="flex items-center gap-2">
              {product.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            <div className="text-4xl font-bold text-primary">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
              <span className="text-base font-normal text-foreground/60"> / 250g</span>
            </div>
            
            <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus className="h-4 w-4"/></Button>
                    <span className="px-4 font-bold">{quantity}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(q => q+1)}><Plus className="h-4 w-4"/></Button>
                </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isAdded}>
              {isAdded ? (
                <>
                  <Check className="mr-2" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
