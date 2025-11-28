// src/app/events/page.tsx
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { getEvents, type Event } from '@/lib/events-data';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCardClient } from './event-card-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events & Workshops',
  description: 'Join our coffee community. Sign up for cupping sessions, latte art workshops, and other exclusive events at Sehati Kopi.',
};


const EventCardSkeleton = () => (
    <Card className="grid md:grid-cols-5 gap-0 md:gap-6 overflow-hidden items-center bg-background">
        <Skeleton className="md:col-span-2 relative h-60 md:h-full w-full" />
        <div className="md:col-span-3 p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-32" />
        </div>
    </Card>
);

const EventsPage = async () => {
  const events = await getEvents();
  
  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Events & Workshops</h1>
          <p className="mt-2 text-lg text-foreground/80">Join our community and deepen your coffee knowledge.</p>
        </div>
        <div className="space-y-12">
          {!events ? (
            <>
                <EventCardSkeleton />
                <EventCardSkeleton />
            </>
          ) : events.length > 0 ? (
            events.map((event) => (
                <Card key={event.id} className="grid md:grid-cols-5 gap-0 md:gap-6 overflow-hidden shadow-xl items-center bg-background">
                  <div className="md:col-span-2 relative h-60 md:h-full w-full">
                    <Image src={event.image} alt={event.title} fill className="object-cover" />
                  </div>
                  <div className="md:col-span-3 p-6">
                    <CardHeader className="p-0">
                      <CardTitle className="font-headline text-3xl text-primary">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                      <div className="space-y-3 text-foreground/80 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <CardDescription>{event.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-0 pt-6">
                      <EventCardClient eventId={event.id} eventTitle={event.title} />
                    </CardFooter>
                  </div>
                </Card>
            ))
          ) : (
             <div className="text-center py-16">
                <Calendar className="mx-auto h-24 w-24 text-foreground/30" />
                <h2 className="mt-6 text-2xl font-semibold">No Upcoming Events</h2>
                <p className="mt-2 text-foreground/60">Check back soon for new events and workshops!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
