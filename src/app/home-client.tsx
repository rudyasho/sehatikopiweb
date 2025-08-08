
'use client';

import React, 'useState', useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Coffee, Leaf, Star, ShoppingCart, Check, Loader2, BookOpen, Wand2 } from 'lucide-react';

import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { getProducts, type Product } from '@/lib/products-data';
import { getHeroData, type HeroData } from '@/lib/hero-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const testimonials = [
  {
    name: 'Andi P.',
    avatar: 'https://placehold.co/100x100.png',
    aiHint: 'man smiling',
    review: 'The best Indonesian coffee I have ever tasted! The aroma and flavor are simply unmatched. A true gem.',
    rating: 5,
  },
  {
    name: 'Siti K.',
    avatar: 'https://placehold.co/100x100.png',
    aiHint: 'woman portrait',
    review: 'Sehati Kopi has become my daily ritual. Their roasts are consistent and the delivery is always fast. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Budi S.',
    avatar: 'https://placehold.co/100x100.png',
    aiHint: 'person drinking coffee',
    review: 'I love the story behind the coffee and the passion of the team. You can taste the quality in every cup.',
    rating: 5,
  },
];

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [addedProducts, setAddedProducts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchProducts() {
        setIsLoading(true);
        try {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts.slice(0, 3));
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
    setAddedProducts(prev => ({ ...prev, [product.slug]: true }));
    toast({
      title: 'Added to Cart',
      description: `1 x ${product.name} has been added.`,
    });
    setTimeout(() => {
      setAddedProducts(prev => ({ ...prev, [product.slug]: false }));
    }, 2000);
  };

  if (isLoading) {
    return (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="text-left overflow-hidden bg-background flex flex-col">
                    <Skeleton className="h-60 w-full" />
                    <CardContent className="p-6 flex-grow">
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                    <CardFooter className="flex justify-between items-center p-6 bg-secondary/50">
                       <Skeleton className="h-8 w-1/3" />
                       <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <Card key={product.id} className="text-left overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg bg-background flex flex-col">
          <CardHeader className="p-0">
            <Link href={`/products/${product.slug}`}>
              <div className="relative h-60 w-full">
                <Image src={product.image} alt={product.name} fill className="object-cover" data-ai-hint={product.aiHint}/>
              </div>
            </Link>
          </CardHeader>
          <CardContent className="p-6 flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">{product.name}</CardTitle>
            <CardDescription className="mt-2 h-12">{product.description.substring(0, 80)}...</CardDescription>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 bg-secondary/50 gap-4">
            <span className="text-xl font-bold text-primary self-center sm:self-auto">
               {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/products/${product.slug}`}>View</Link>
              </Button>
              <Button onClick={() => handleAddToCart(product)} disabled={addedProducts[product.slug]} className="flex-1" aria-label={`Add ${product.name} to cart`}>
                {addedProducts[product.slug] ? <Check /> : <ShoppingCart />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

const HeroSection = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
        setIsLoading(true);
        try {
            const data = await getHeroData();
            setHeroData(data);
        } catch (error) {
            console.error("Failed to load hero data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchHeroData();
  }, []);

  if (isLoading) {
    return (
      <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white bg-secondary/50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </section>
    );
  }

  if (!heroData) {
    return (
        <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white bg-destructive">
            <p>Could not load hero content.</p>
        </section>
    );
  }

  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white">
      <Image
        src={heroData.imageUrl}
        alt={heroData.title}
        fill
        className="absolute z-0 object-cover"
        data-ai-hint="coffee beans cup"
        priority
      />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 container mx-auto px-4">
        <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold">
          {heroData.title}
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
          {heroData.subtitle}
        </p>
        <Button asChild size="lg" className="mt-8 font-bold">
          <Link href="/products">
            Explore Our Coffee <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};


export function HomeClient() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-semibold">
              From Heart, For Coffee Lovers
            </h2>
            <p className="mt-4 text-lg text-foreground/80">
              Sehati Kopi Indonesia was born from a love for the rich coffee culture of our archipelago. We partner with local farmers to bring you the finest beans, roasting each batch to perfection to highlight its unique character. Our philosophy is simple: quality, sustainability, and a shared passion for great coffee.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center gap-2">
                <Coffee className="text-primary h-5 w-5" />
                <span className="font-semibold">Artisanal Roasting</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="text-primary h-5 w-5" />
                <span className="font-semibold">Sustainably Sourced</span>
              </div>
            </div>
            <Button asChild variant="link" className="mt-4 px-0 text-primary">
              <Link href="/about">Learn more about our story <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
             <Image
              src="https://images.unsplash.com/photo-1630411870702-8f6f8fd80ce2?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Roasting coffee beans"
              fill
              className="object-cover"
              data-ai-hint="coffee roasting machine"
            />
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">Featured Coffee</h2>
          <p className="mt-2 text-lg max-w-2xl mx-auto text-foreground/80">
            A selection of our finest beans, curated for an exceptional experience.
          </p>
          <FeaturedProducts />
           <Button asChild variant="outline" size="lg" className="mt-12">
            <Link href="/products">
              Shop All Coffee
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">What Our Customers Say</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-left shadow-lg bg-secondary/50">
                <CardHeader className="flex flex-row items-center gap-4 p-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.aiHint} />
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
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="bg-background p-8 rounded-lg shadow-xl text-center flex flex-col items-center justify-center">
            <BookOpen className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-headline text-2xl md:text-3xl font-semibold text-primary">Explore the World of Coffee</h3>
            <p className="mt-2 text-foreground/80 max-w-md mx-auto">
              Dive into our stories, brewing guides, and the latest news from the coffee world.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/blog">
                Read Our Blog <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
