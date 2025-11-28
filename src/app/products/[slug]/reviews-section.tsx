// src/app/products/[slug]/reviews-section.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { addTestimonial, Testimonial } from '@/lib/testimonials-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Star, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ReviewsSectionProps {
    initialReviews: Testimonial[];
    productName: string;
    productId: string;
}

const reviewFormSchema = z.object({
  review: z.string().min(10, { message: "Review must be at least 10 characters." }).max(500, { message: "Review cannot exceed 500 characters." }),
  rating: z.number().min(1, { message: "Please select a rating."}).max(5),
});

const ReviewForm = ({ productId }: { productId: string }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<{review: string; rating: number;}>({
        resolver: zodResolver(reviewFormSchema),
        defaultValues: { review: "", rating: 0 },
    });

    if (!user) {
        return <p className="text-muted-foreground">Please <a href="/login" className="underline text-primary">log in</a> to leave a review.</p>;
    }

    const onSubmit = async (data: {review: string; rating: number;}) => {
        setIsSubmitting(true);
        try {
            await addTestimonial({
                name: user.displayName || 'Anonymous',
                avatar: user.photoURL || '',
                review: data.review,
                rating: data.rating,
                status: 'pending',
                date: new Date().toISOString(),
                productId: productId,
            });
            toast({
                title: "Review Submitted!",
                description: "Thank you! Your review is pending approval from our team.",
            });
            form.reset();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Submission Failed",
                description: "Could not submit your review. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-secondary/50 p-6">
            <h3 className="font-headline text-2xl text-primary mb-4">Write a Review</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="rating" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Rating</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-1">
                                    {[1,2,3,4,5].map(star => (
                                        <Star
                                            key={star}
                                            className={`h-6 w-6 cursor-pointer transition-colors ${ (hoverRating || field.value) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => field.onChange(star)}
                                        />
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="review" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Review</FormLabel>
                            <FormControl>
                                <Textarea placeholder={`What did you think of the ${name}?`} {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </form>
            </Form>
        </Card>
    );
}


export function ReviewsSection({ initialReviews, productName, productId }: ReviewsSectionProps) {
    const publishedReviews = initialReviews.filter(r => r.status === 'published' && r.productId === productId);

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16">
                 <Separator />
                <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <h2 className="font-headline text-3xl md:text-4xl text-primary">
                            Customer Reviews for {productName}
                        </h2>
                        {publishedReviews.length > 0 ? (
                             <div className="space-y-8">
                                {publishedReviews.map((review) => (
                                    <Card key={review.id} className="bg-secondary/50 border-none shadow-sm">
                                        <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={review.avatar} alt={review.name} />
                                                <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-base font-semibold">{review.name}</CardTitle>
                                                <div className="flex text-amber-500 mt-1">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 fill-current" />
                                                    ))}
                                                    {[...Array(5-review.rating)].map((_, i) => (
                                                        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
                                                    ))}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-foreground/80 italic">"{review.review}"</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Be the first to review this product!</p>
                        )}
                    </div>
                     <div>
                        <ReviewForm productId={productId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
