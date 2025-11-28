// src/app/dashboard/event-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';
import { updateEvent, addEvent, type Event, type EventFormData } from '@/lib/events-data';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const eventFormSchema = z.object({
  title: z.string().min(5, "Event title is required."),
  date: z.string().min(10, "Event date is required."),
  time: z.string().min(5, "Event time is required."),
  location: z.string().min(5, "Event location is required."),
  description: z.string().min(10, "Description is required."),
  image: z.string().url("Image URL is required."),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    event?: Event | null;
    onFormSubmit: () => void;
    onFormCancel: () => void;
}

export function EventForm({ event, onFormSubmit, onFormCancel }: EventFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: { 
            title: event?.title || '',
            date: event?.date || '',
            time: event?.time || '',
            location: event?.location || '',
            description: event?.description || '',
            image: event?.image || '',
        },
    });

    const onSubmit = async (data: EventFormValues) => {
        setIsSubmitting(true);
        try {
            if (event) {
                await updateEvent(event.id, data);
                toast({ title: "Event Updated!", description: `"${data.title}" has been updated.` });
            } else {
                await addEvent(data as EventFormData);
                toast({ title: "Event Added!", description: `"${data.title}" has been added.` });
            }
            onFormSubmit();
            router.refresh();
        } catch (error) {
            console.error("Failed to submit event:", error);
            toast({
                variant: 'destructive',
                title: "Error!",
                description: `Could not ${event ? 'update' : 'add'} the event.`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl><Input placeholder="e.g., Latte Art Workshop" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl><Input placeholder="e.g., Saturday, August 17, 2024" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="time" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl><Input placeholder="e.g., 10:00 AM - 12:00 PM" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input placeholder="e.g., Sehati Kopi Roastery, Jakarta" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Describe the event..." {...field} rows={4} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl><Input type="url" placeholder="https://example.com/image.png" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <div className="flex justify-end gap-2 !mt-6">
                    <Button type="button" variant="outline" onClick={onFormCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {event ? 'Update Event' : 'Add Event'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
