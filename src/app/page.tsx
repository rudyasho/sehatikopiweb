import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Coffee, Leaf, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { products } from '@/lib/products-data';
import type { Metadata } from 'next';

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

const featuredProducts = products.slice(0, 3);

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

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white">
        <Image
          src="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Sehati Kopi Roastery"
          layout="fill"
          objectFit="cover"
          className="absolute z-0"
          data-ai-hint="coffee beans cup"
          priority
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold">
            A Journey of Indonesian Flavor
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Discover the rich heritage and exquisite taste of single-origin Indonesian coffee, roasted with passion and precision.
          </p>
          <Button asChild size="lg" className="mt-8 font-bold">
            <Link href="/products">
              Explore Our Coffee <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* About Us Snippet */}
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
                <Leaf className="text-accent h-5 w-5" />
                <span className="font-semibold">Sustainably Sourced</span>
              </div>
            </div>
            <Button asChild variant="link" className="mt-4 px-0 text-primary">
              <Link href="/about">Learn more about our story &rarr;</Link>
            </Button>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
             <Image
              src="https://images.unsplash.com/photo-1630411870702-8f6f8fd80ce2?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Roasting coffee beans"
              layout="fill"
              objectFit="cover"
              data-ai-hint="coffee roasting machine"
            />
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">Featured Coffee</h2>
          <p className="mt-2 text-lg max-w-2xl mx-auto text-foreground/80">
            A selection of our finest beans, curated for an exceptional experience.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.slug} className="text-left overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg bg-background">
                <CardHeader className="p-0">
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-60 w-full">
                      <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={product.aiHint}/>
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-2xl text-primary">{product.name}</CardTitle>
                  <CardDescription className="mt-2 h-12">{product.description.substring(0, 80)}...</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-6 bg-secondary/50">
                  <span className="text-xl font-bold text-primary">
                     {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                  </span>
                  <Button asChild>
                    <Link href={`/products/${product.slug}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
           <Button asChild variant="outline" size="lg" className="mt-12">
            <Link href="/products">
              Shop All Coffee
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">What Our Customers Say</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 text-left shadow-lg bg-secondary/50">
                <CardHeader className="flex flex-row items-center gap-4 p-0">
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
                <CardContent className="p-0 pt-4">
                  <p className="text-foreground/80 italic">"{testimonial.review}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog & AI Tool CTA */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background p-8 rounded-lg shadow-xl text-center flex flex-col items-center justify-center">
              <h3 className="font-headline text-2xl md:text-3xl font-semibold text-primary">Explore the World of Coffee</h3>
              <p className="mt-2 text-foreground/80 max-w-md mx-auto">
                Dive into our stories, brewing guides, and the latest news from the coffee world.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/blog">
                  Read Our Blog <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
            <div className="bg-primary text-primary-foreground p-8 rounded-lg shadow-xl text-center flex flex-col items-center justify-center">
              <h3 className="font-headline text-2xl md:text-3xl font-semibold">Find Your Perfect Coffee</h3>
              <p className="mt-2 text-primary-foreground/80 max-w-md mx-auto">
                Use our AI tool to get a personalized coffee recommendation based on your taste.
              </p>
              <Button asChild variant="secondary" className="mt-6">
                <Link href="/recommendations">
                  Get Recommendation <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
