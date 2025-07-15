import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Share2 } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="bg-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Get In Touch</h1>
          <p className="mt-2 text-lg text-foreground/80">We'd love to hear from you. Visit us or drop us a line.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Your Name" />
                  <Input type="email" placeholder="Your Email" />
                </div>
                <Input placeholder="Subject" />
                <Textarea placeholder="Your Message" rows={6} />
                <Button type="submit" size="lg" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg">
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span>Jl. Kopi Nikmat No. 1, Jakarta, Indonesia</span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <a href="mailto:info@sehatikopi.id" className="hover:underline">info@sehatikopi.id</a>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-primary" />
                  <a href="tel:+621234567890" className="hover:underline">+62 123 4567 890</a>
                </div>
                <div className="flex items-center gap-4">
                    <Share2 className="h-6 w-6 text-primary" />
                    <a href="https://wa.me/621234567890" target="_blank" rel="noopener noreferrer" className="hover:underline">Chat on WhatsApp</a>
                </div>
              </CardContent>
            </Card>
            
            <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-xl">
              {/* 
                An interactive map would be placed here.
                Using a placeholder as an API key for services like Google Maps is required.
              */}
              <Image 
                src="https://placehold.co/800x600.png" 
                alt="Map of Sehati Kopi location" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="indonesia map"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <p className="text-white bg-black/50 p-2 rounded">Map Placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
