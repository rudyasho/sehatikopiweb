
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { products, type Product } from '@/lib/products-data';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Check } from 'lucide-react';

export function ProductsClientPage() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>(
    {}
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedProducts((prev) => ({ ...prev, [product.slug]: true }));
    toast({
      title: 'Added to Cart',
      description: `1 x ${product.name} has been added.`,
    });
    setTimeout(() => {
      setAddedProducts((prev) => ({ ...prev, [product.slug]: false }));
    }, 2000);
  };

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
            Our Coffee Collection
          </h1>
          <p className="mt-2 text-lg text-foreground/80">
            Explore our hand-picked selection of the finest single-origin
            Indonesian beans.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.slug}
              className="text-left overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg bg-background flex flex-col"
            >
              <CardHeader className="p-0">
                <Link href={`/products/${product.slug}`}>
                  <div className="relative h-60 w-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={product.aiHint}
                    />
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <CardTitle className="font-headline text-2xl text-primary">
                  {product.name}
                </CardTitle>
                <CardDescription className="mt-2 h-16">
                  {product.description.substring(0, 100)}...
                </CardDescription>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 bg-secondary/50 gap-4">
                <span className="text-xl font-bold text-primary self-center sm:self-auto">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(product.price)}
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/products/${product.slug}`}>View</Link>
                  </Button>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={addedProducts[product.slug]}
                    className="flex-1"
                  >
                    {addedProducts[product.slug] ? (
                      <Check />
                    ) : (
                      <ShoppingCart />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
