import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';

const events = [
  {
    title: 'Coffee Cupping 101',
    date: 'Saturday, August 17, 2024',
    time: '10:00 AM - 12:00 PM',
    location: 'Sehati Kopi Roastery, Jakarta',
    description: 'Join us for an immersive coffee cupping session. Learn to identify different flavor notes and aromas from our single-origin Indonesian coffees. Perfect for beginners and enthusiasts alike.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'coffee cupping',
  },
  {
    title: 'Latte Art Workshop',
    date: 'Sunday, August 25, 2024',
    time: '2:00 PM - 4:00 PM',
    location: 'Sehati Kopi Flagship Store',
    description: 'Unleash your inner artist! Our expert baristas will guide you through the basics of milk steaming and pouring techniques to create beautiful latte art. All materials provided.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'latte art workshop',
  },
  {
    title: 'Meet the Farmer: Gayo Highlands',
    date: 'Saturday, September 7, 2024',
    time: '3:00 PM - 5:00 PM',
    location: 'Online via Zoom',
    description: 'A special virtual event where you can meet the farmers behind our Aceh Gayo beans. Hear their stories, learn about their farming practices, and participate in a live Q&A session.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'coffee farmer',
  },
];

const EventsPage = () => {
  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Events & Workshops</h1>
          <p className="mt-2 text-lg text-foreground/80">Join our community and deepen your coffee knowledge.</p>
        </div>
        <div className="space-y-12">
          {events.map((event) => (
            <Card key={event.title} className="grid md:grid-cols-5 gap-0 md:gap-6 overflow-hidden shadow-xl items-center bg-background">
              <div className="md:col-span-2 relative h-60 md:h-full w-full">
                <Image src={event.image} alt={event.title} layout="fill" objectFit="cover" data-ai-hint={event.aiHint} />
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
                  <Button size="lg">Register Now</Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
