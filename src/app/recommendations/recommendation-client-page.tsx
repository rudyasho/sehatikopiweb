'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { recommendCoffee, type RecommendCoffeeOutput } from '@/ai/flows/coffee-recommendation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Coffee } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const recommendationSchema = z.object({
  flavorPreferences: z.string().min(10, 'Please describe your flavor preferences in more detail (e.g., "I like sweet, fruity, and not too bitter coffee").'),
  brewingMethod: z.string({
    required_error: 'Please select a brewing method.',
  }),
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

export function RecommendationForm() {
  const [recommendation, setRecommendation] = useState<RecommendCoffeeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      flavorPreferences: '',
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Your Preferences</CardTitle>
          <CardDescription>Help us understand your taste.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        rows={5}
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
              <Button type="submit" disabled={isLoading} className="w-full">
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
                <Coffee className="h-16 w-16 mx-auto animate-bounce" />
                <p className="mt-4 font-semibold">Brewing up the perfect recommendation...</p>
            </div>
        ) : recommendation ? (
          <Card className="w-full shadow-lg bg-secondary animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Our Recommendation For You</CardTitle>
              <CardDescription>Based on your preferences, here is our suggestion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary">Recommended Bean</h4>
                <p>{recommendation.beanRecommendation}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-primary">Roast Level</h4>
                <p>{recommendation.roastLevel}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold text-primary">Tasting Notes</h4>
                <p className="italic">{recommendation.notes}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-foreground/60 p-8 border-2 border-dashed rounded-lg">
            <Wand2 className="h-12 w-12 mx-auto" />
            <p className="mt-4">Your personalized recommendation will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
