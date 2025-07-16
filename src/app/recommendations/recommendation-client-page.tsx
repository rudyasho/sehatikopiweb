
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2, Coffee, ArrowRight } from 'lucide-react';

import { recommendCoffee, type RecommendCoffeeOutput } from '@/ai/flows/coffee-recommendation';
import { getProductBySlug, type Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const recommendationSchema = z.object({
  flavorPreferences: z.string().min(10, 'Please describe your flavor preferences in more detail (e.g., "I like sweet, fruity, and not too bitter coffee").'),
  brewingMethod: z.string({
    required_error: 'Please select a brewing method.',
  }),
  caffeineLevel: z.enum(['Low', 'Medium', 'High'], {
    required_error: "Please select your preferred caffeine level."
  }),
  timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening'], {
    required_error: "Please select a time of day."
  }),
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

function RecommendedProductCard({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      const p = await getProductBySlug(slug);
      setProduct(p);
    }
    fetchProduct();
  }, [slug]);

  if (!product) {
    return (
        <div className="text-center text-sm text-destructive mt-4">
            Could not find the recommended product in our catalog.
        </div>
    );
  }

  return (
    <Card className="mt-6 animate-in fade-in-50 duration-700 bg-background/50">
        <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative h-28 w-28 rounded-md overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" data-ai-hint={product.aiHint} />
                </div>
                <div className="flex-grow">
                    <h5 className="font-headline text-lg font-semibold text-primary">{product.name}</h5>
                    <p className="text-sm text-foreground/70 mt-1">{product.description.substring(0, 80)}...</p>
                     <p className="text-lg font-bold text-primary mt-2">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                    </p>
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Button asChild className="w-full">
                <Link href={`/products/${product.slug}`}>View Product Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </CardFooter>
    </Card>
  )
}

export function RecommendationForm() {
  const [recommendation, setRecommendation] = useState<RecommendCoffeeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      flavorPreferences: '',
      caffeineLevel: 'Medium',
      timeOfDay: 'Morning'
    },
  });

  async function onSubmit(data: RecommendationFormValues) {
    setIsLoading(true);
    setRecommendation(null);
    try {
      const result = await recommendCoffee(data);
      setRecommendation(result);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch coffee recommendation. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
      <Card className="shadow-lg bg-background">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Your Preferences</CardTitle>
          <CardDescription>Help us understand your taste.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="flavorPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flavor Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., sweet, fruity, chocolatey, low acidity..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brewingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brewing Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Espresso">Espresso</SelectItem>
                        <SelectItem value="Pour Over (V60, etc.)">Pour Over (V60, etc.)</SelectItem>
                        <SelectItem value="French Press">French Press</SelectItem>
                        <SelectItem value="Aeropress">Aeropress</SelectItem>
                        <SelectItem value="Drip Coffee Maker">Drip Coffee Maker</SelectItem>
                        <SelectItem value="Moka Pot">Moka Pot</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="caffeineLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Caffeine Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl><RadioGroupItem value="Low" /></FormControl>
                          <FormLabel className="font-normal">Low</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl><RadioGroupItem value="Medium" /></FormControl>
                          <FormLabel className="font-normal">Medium</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl><RadioGroupItem value="High" /></FormControl>
                          <FormLabel className="font-normal">High</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>When do you usually drink coffee?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl><RadioGroupItem value="Morning" /></FormControl>
                          <FormLabel className="font-normal">Morning</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl><RadioGroupItem value="Afternoon" /></FormControl>
                          <FormLabel className="font-normal">Afternoon</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl><RadioGroupItem value="Evening" /></FormControl>
                          <FormLabel className="font-normal">Evening</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full !mt-8" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding your coffee...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Get Recommendation
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        {isLoading ? (
            <div className="text-center text-foreground/60">
                <Coffee className="h-16 w-16 mx-auto text-primary animate-bounce" />
                <p className="mt-4 font-semibold">Brewing up the perfect recommendation...</p>
            </div>
        ) : recommendation ? (
          <Card className="w-full shadow-lg bg-background animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Our Recommendation For You</CardTitle>
              <CardDescription>Based on your preferences, here is our suggestion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary">Recommended Bean</h4>
                <p className="text-lg font-medium">{recommendation.beanRecommendation}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-primary">Roast Level</h4>
                <p>{recommendation.roastLevel}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-primary">Why You'll Love It</h4>
                <p className="italic text-foreground/80">{recommendation.notes}</p>
              </div>
              <RecommendedProductCard slug={recommendation.productSlug} />
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-foreground/60 p-8 border-2 border-dashed rounded-lg h-full flex flex-col justify-center items-center bg-background/50">
            <Wand2 className="h-12 w-12 mx-auto text-primary" />
            <p className="mt-4 max-w-xs">Your personalized recommendation will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
