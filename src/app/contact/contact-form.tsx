'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsLoading(true);
    // Here you would typically send the data to your backend API
    // For this prototype, we'll simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    
    console.log(data);

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We will get back to you shortly.",
    });

    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Regarding my order..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Your message here..." rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Message
        </Button>
      </form>
    </Form>
  </change>
  <change>
    <file>/src/app/products/[slug]/page.tsx</file>
    <content><![CDATA[import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const products = [
  {
    slug: 'aceh-gayo',
    name: 'Aceh Gayo',
    origin: 'Gayo Highlands, Aceh',
    description: 'A rich, full-bodied coffee with earthy notes of dark chocolate, cedar, and a hint of spice. Known for its smooth finish and low acidity, making it a classic Indonesian favorite.',
    price: 120000,
    image: 'https://placehold.co/800x800.png',
    aiHint: 'coffee beans bag',
    rating: 4.8,
    reviews: 125,
    tags: ['Earthy', 'Spicy', 'Full Body'],
    roast: 'Medium-Dark',
  },
  {
    slug: 'bali-kintamani',
    name: 'Bali Kintamani',
    origin: 'Kintamani Highlands, Bali',
    description: 'A smooth, sweet coffee with a clean finish and bright, citrusy undertones. Grown on volcanic soil alongside citrus fruits, which imparts a unique fruity aroma and flavor.',
    price: 135000,
    image: 'https://placehold.co/800x800.png',
    aiHint: 'bali landscape',
    rating: 4.9,
    reviews: 98,
    tags: ['Fruity', 'Citrus', 'Clean'],
    roast: 'Medium',
  },
  {
    slug: 'flores-bajawa',
    name: 'Flores Bajawa',
    origin: 'Bajawa, Flores',
    description: 'A complex coffee with beautiful floral aromas, sweet chocolate notes, and a syrupy, lingering body. The unique terroir of Flores gives this coffee a truly memorable character.',
    price: 150000,
    image: 'https://placehold.co/800x800.png',
    aiHint: 'indonesian flowers',
    rating: 4.7,
    reviews: 82,
    tags: ['Floral', 'Chocolate', 'Syrupy'],
    roast: 'Medium',
  },
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
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
                    <Button variant="ghost" size="icon" className="h-10 w-10"><Minus className="h-4 w-4"/></Button>
                    <span className="px-4 font-bold">1</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10"><Plus className="h-4 w-4"/></Button>
                </div>
            </div>

            <Button size="lg" className="w-full">
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
