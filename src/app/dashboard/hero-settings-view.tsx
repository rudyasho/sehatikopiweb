// src/app/dashboard/hero-settings-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImageUp, Save, Loader2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { getHeroData, updateHeroData, type HeroFormData } from '@/lib/hero-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const heroFormSchema = z.object({
  title: z.string().min(10, "Title is required."),
  subtitle: z.string().min(10, "Subtitle is required."),
  imageUrl: z.string().url("A valid image URL is required."),
});

const HeroSettingsView = () => {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const form = useForm<HeroFormData>({
        resolver: zodResolver(heroFormSchema),
    });

    useEffect(() => {
        const fetchHeroData = async () => {
            setIsLoading(true);
            try {
                const heroData = await getHeroData();
                form.reset(heroData);
                setImageUrl(heroData.imageUrl);
            } catch (error) {
                console.error("Failed to load hero data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load hero settings.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchHeroData();
    }, [form, toast]);

    const onSubmit = async (data: HeroFormData) => {
        setIsSubmitting(true);
        try {
            await updateHeroData(data);
            toast({ title: "Hero Section Saved!", description: "Your homepage hero has been updated." });
            router.refresh();
        } catch (error) {
            console.error("Failed to save hero data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save hero settings.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="space-y-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </Card>
        )
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <ImageUp /> Homepage Hero Settings
                </CardTitle>
                <CardDescription>
                    Manage the main image and text on your homepage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                             <Label>Image Preview</Label>
                            <div className="mt-2 w-full aspect-video relative bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                {imageUrl ? (
                                    <Image src={imageUrl} alt="Hero image preview" fill className="object-cover" />
                                ) : (
                                    <span className="text-sm text-muted-foreground">No Image URL</span>
                                )}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image URL</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="https://example.com/your-hero-image.jpg"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setImageUrl(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., A Journey of Indonesian Flavor" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subtitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtitle</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Discover the rich heritage and exquisite taste..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Save Hero Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default HeroSettingsView;
