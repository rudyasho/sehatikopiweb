// src/app/products/[slug]/reviews-section.tsx
'use client';

import { Testimonial } from '@/lib/testimonials-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ReviewsSectionProps {
    initialReviews: Testimonial[];
    productName: string;
}

export function ReviewsSection({ initialReviews, productName }: ReviewsSectionProps) {
    if (!initialReviews || initialReviews.length === 0) {
        return null;
    }

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16">
                 <Separator />
                <div className="max-w-4xl mx-auto mt-12">
                    <h2 className="font-headline text-3xl md:text-4xl text-primary mb-8">
                        Customer Reviews for {productName}
                    </h2>
                    <div className="space-y-8">
                        {initialReviews.map((review) => (
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
                </div>
            </div>
        </div>
    );
}
