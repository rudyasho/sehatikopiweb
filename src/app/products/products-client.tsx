
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProducts, type Product } from '@/lib/products-data';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Check, ListFilter } from 'lucide-react';
import { ProductFilters, type Filters } from './product-filters';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductsClientPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>(
    {}
  );
  const [filters, setFilters] = useState<Filters>({
    roasts: [],
    origins: [],
    sort: 'name-asc',
  });

  useEffect(() => {
    async function fetchProducts() {
        setIsLoading(true);
        try {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchProducts();
  }, []);

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
  
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (filters.roasts.length > 0) {
      filtered = filtered.filter(p => filters.roasts.includes(p.roast));
    }

    if (filters.origins.length > 0) {
      filtered = filtered.filter(p => filters.origins.includes(p.origin));
    }

    switch (filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-asc':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [filters, products]);
  
  const renderLoadingState = () => (
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
            <Card key={i} className="text-left overflow-hidden bg-background flex flex-col">
                <Skeleton className="h-60 w-full" />
                <CardContent className="p-6 flex-grow">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter className="flex justify-between items-center p-6 bg-secondary/50">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        ))}
      </div>
  );

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
        
        <ProductFilters onFilterChange={setFilters} allProducts={products} />

        {isLoading ? renderLoadingState() : 
        
        filteredAndSortedProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map((product, i) => (
              <motion.div
                  key={product.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: (i % 3) * 0.1 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  className="h-full"
              >
                  <Card
                    className="text-left overflow-hidden shadow-lg bg-background flex flex-col h-full"
                  >
                    <CardHeader className="p-0">
                      <Link href={`/products/${product.slug}`}>
                        <div className="relative h-60 w-full">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
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
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 bg-secondary/50 gap-4 mt-auto">
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
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ListFilter className="mx-auto h-24 w-24 text-foreground/30" />
            <h2 className="mt-6 text-2xl font-semibold">No Products Found</h2>
            <p className="mt-2 text-foreground/60">
              Try adjusting your filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
