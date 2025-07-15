
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, Check, BookAudio, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';
import { generateCoffeeStory } from '@/ai/flows/story-teller-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';


export function ProductClientPage({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const { toast } = useToast();
  const [isStoryLoading, startStoryTransition] = useTransition();
  const [storyText, setStoryText] = useState<string | null>(null);
  const [audioStory, setAudioStory] = useState<string | null>(null);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    toast({
      title: 'Added to Cart',
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
    setTimeout(() => setIsAdded(false), 2000);
  };
  
  const handleGenerateStory = () => {
    startStoryTransition(async () => {
      setStoryText(null);
      setAudioStory(null);
      try {
        const result = await generateCoffeeStory({
          name: product.name,
          origin: product.origin,
          description: product.description,
        });
        setStoryText(result.storyText);
        setAudioStory(result.audioDataUri);
      } catch (error) {
        console.error("Error generating audio story:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate the audio story. Please try again.',
        });
      }
    });
  };

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
            <Link href="/products" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
            <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={product.aiHint} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline">{product.origin}</Badge>
              <h1 className="font-headline text-3xl md:text-5xl font-bold text-primary mt-2">{product.name}</h1>
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

            <div className="text-3xl md:text-4xl font-bold text-primary">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
              <span className="text-base font-normal text-foreground/60"> / 250g</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="font-semibold flex-shrink-0">Quantity:</span>
                <div className="flex items-center border rounded-md self-start">
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
             <Alert>
              <BookAudio className="h-4 w-4" />
              <AlertTitle className="font-headline">AI Story Teller</AlertTitle>
              <AlertDescription>
                Want to hear the story of this coffee? Let our AI narrator tell you.
              </AlertDescription>
                <div className="mt-4">
                    <Button variant="outline" onClick={handleGenerateStory} disabled={isStoryLoading} className="w-full">
                    {isStoryLoading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Story...
                        </>
                    ) : (
                        "Listen to the Story"
                    )}
                    </Button>
                </div>

                {isStoryLoading && !storyText && (
                    <div className="text-center p-4 text-sm text-muted-foreground">
                        <p>The storyteller is clearing their throat... Please wait.</p>
                    </div>
                )}
                
                {storyText && (
                  <Card className="mt-4 bg-background/50 animate-in fade-in-50 duration-500">
                      <CardContent className="p-4 space-y-4">
                        <p className="text-foreground/90 italic whitespace-pre-wrap">{storyText}</p>
                        {audioStory ? (
                          <audio controls autoPlay className="w-full">
                              <source src={audioStory} type="audio/wav" />
                              Your browser does not support the audio element.
                          </audio>
                        ) : (
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                               <Loader2 className="h-4 w-4 animate-spin" />
                               <span>Preparing audio...</span>
                           </div>
                        )}
                      </CardContent>
                  </Card>
                )}
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
