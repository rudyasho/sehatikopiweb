import Image from 'next/image';
import { Leaf, Users, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the story, values, and passionate team behind Sehati Kopi. Discover our commitment to authenticity, sustainability, and community in the world of Indonesian coffee.',
};

const teamMembers = [
  { name: 'Budi Santoso', role: 'Founder & Head Roaster', avatar: 'https://placehold.co/100x100.png', aiHint: 'man portrait' },
  { name: 'Siti Aminah', role: 'Head of Farmer Relations', avatar: 'https://placehold.co/100x100.png', aiHint: 'woman smiling' },
  { name: 'Adi Prasetyo', role: 'Lead Barista & Trainer', avatar: 'https://placehold.co/100x100.png', aiHint: 'man with glasses' },
];

const AboutPage = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center text-center text-white">
        <Image
          src="https://placehold.co/1920x800.png"
          alt="Coffee beans in a hand"
          layout="fill"
          objectFit="cover"
          className="absolute z-0"
          data-ai-hint="coffee beans hand"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold">About Sehati Kopi</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            Connecting hearts through the authentic taste of Indonesian coffee, from our farmers to your cup.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl order-last md:order-first">
             <Image
              src="https://placehold.co/600x800.png"
              alt="Old photo of coffee farmers"
              layout="fill"
              objectFit="cover"
              data-ai-hint="vintage coffee farmer"
            />
          </div>
          <div>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-semibold">Our Story</h2>
            <p className="mt-4 text-lg text-foreground/80">
              Sehati Kopi Indonesia began with a simple dream: to share the diverse and extraordinary flavors of Indonesian coffee with the world. Founded in 2020, we embarked on a journey across the archipelago, from the highlands of Gayo to the volcanic soils of Flores. We sought not just the best beans, but the stories and the people behind them.
            </p>
            <p className="mt-4 text-lg text-foreground/80">
              Our name, 'Sehati', means 'one heart'. It represents our core belief in a shared passion that connects everyone in the coffee chain—the dedicated farmers, our passionate roasters, and you, the discerning coffee lover. We are more than just a coffee brand; we are a community built on respect, quality, and a love for our craft.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl text-primary font-semibold">Our Values</h2>
          <p className="mt-2 text-lg max-w-2xl mx-auto text-foreground/80">
            The principles that guide every bean we roast and every cup we serve.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl pt-4">Authenticity</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We honor the unique character of each coffee's origin, telling its true story through meticulous roasting and transparent sourcing.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl pt-4">Sustainability</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We are committed to environmentally-friendly practices and ensuring fair compensation for our partner farmers, sustaining both land and livelihood.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl pt-4">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We believe in building a strong community, from our farmers to our customers, united by a shared love for exceptional coffee.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Meet The Team */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">Meet The Team</h2>
          <p className="mt-2 text-lg max-w-2xl mx-auto text-foreground/80">
            The passionate individuals behind Sehati Kopi.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="pt-6 border-0 shadow-none bg-transparent">
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.aiHint}/>
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-primary">{member.name}</h3>
                  <p className="text-accent font-medium">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
