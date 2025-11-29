// src/app/dashboard/manage-testimonials-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { updateTestimonial, deleteTestimonial, type Testimonial } from '@/lib/testimonials-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ManageTestimonialsViewProps {
    testimonials: Testimonial[];
}

const ManageTestimonialsView = ({ testimonials: initialTestimonials }: ManageTestimonialsViewProps) => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        setTestimonials(initialTestimonials);
    }, [initialTestimonials]);

    const handlePublish = async (testimonial: Testimonial) => {
        try {
            await updateTestimonial(testimonial.id, { status: 'published' });
            toast({ title: 'Testimonial Published!', description: `Review from ${testimonial.name} is now live.`});
            router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not publish testimonial.'});
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTestimonial(id);
            toast({ title: "Testimonial Deleted", description: "The testimonial has been removed." });
            router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the testimonial.' });
        }
    };

    const publishedTestimonials = testimonials.filter(t => t.status === 'published');
    const pendingTestimonials = testimonials.filter(t => t.status === 'pending');
    
    const TestimonialList = ({ items, isPending = false }: { items: Testimonial[], isPending?: boolean }) => (
        <div className="space-y-4">
            {items.map(item => (
                <Card key={item.id} className="bg-secondary/50">
                    <CardContent className="p-4 flex items-start gap-4">
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={item.avatar} alt={item.name} />
                            <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <div className="flex text-amber-500 mt-1">
                                        {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{item.date ? format(new Date(item.date), 'MMM d, yyyy') : 'No date'}</p>
                            </div>
                            <p className="text-sm mt-2 italic">"{item.review}"</p>
                        </div>
                        <div className="flex flex-col gap-2">
                             {isPending && (
                                <Button size="sm" variant="outline" onClick={() => handlePublish(item)}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Publish
                                </Button>
                            )}
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete the testimonial from {item.name}.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <Star /> Manage Testimonials
                </CardTitle>
                <CardDescription>Approve or delete customer-submitted testimonials and reviews.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="pending">
                    <TabsList className="mb-4">
                        <TabsTrigger value="pending">
                            <Clock className="mr-2 h-4 w-4"/> Pending Approval ({pendingTestimonials.length})
                            {pendingTestimonials.length > 0 && <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />}
                        </TabsTrigger>
                        <TabsTrigger value="published"><CheckCircle className="mr-2 h-4 w-4"/> Published ({publishedTestimonials.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending">
                        {pendingTestimonials.length > 0 ? (
                             <TestimonialList items={pendingTestimonials} isPending />
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No testimonials are pending approval.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="published">
                        {publishedTestimonials.length > 0 ? (
                            <TestimonialList items={publishedTestimonials} />
                        ) : (
                             <p className="text-center text-muted-foreground py-8">No testimonials have been published yet.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default ManageTestimonialsView;
