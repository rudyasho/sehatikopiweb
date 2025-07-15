import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Share2 } from 'lucide-react';
import { ContactForm } from './contact-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Have a question or want to visit us? Find our contact details, location map, and a quick form to get in touch with the Sehati Kopi team.',
};

const ContactPage = () => {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Get In Touch</h1>
          <p className="mt-2 text-lg text-foreground/80">We'd love to hear from you. Visit us or drop us a line.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-xl bg-secondary/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <Card className="shadow-xl bg-secondary/50">
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
            
            <div className="w-full rounded-lg overflow-hidden shadow-xl">
               <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.7384168657313!2d119.5848007!3d-4.6412198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbe373914eb2a7f%3A0xf7fe281c34f57e72!2sSehati%20Kopi%20Indonesia!5e1!3m2!1sid!2sid!4v1752583564301!5m2!1sid!2sid"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sehati Kopi Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
