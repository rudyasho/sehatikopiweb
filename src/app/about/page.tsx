import Image from 'next/image';
import { Leaf, Users, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami - Sejarah Sehati Kopi',
  description: 'Pelajari tentang cerita, nilai, dan tim di balik Sehati Kopi. Temukan komitmen kami terhadap keaslian, keberlanjutan, dan komunitas dalam dunia kopi specialty Indonesia.',
};

const teamMembers = [
  { name: 'Budi Santoso', role: 'Founder & Head Roaster', avatar: 'https://images.unsplash.com/photo-1574091983337-b78650545f93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8cG90cmV0JTIwbGVsYWtpfGVufDB8fHx8MTc1NjYyMzE3NXww&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Siti Aminah', role: 'Head of Farmer Relations', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Adi Prasetyo', role: 'Lead Barista & Trainer', avatar: 'https://images.unsplash.com/photo-1593628525442-f94a810619e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8cG90cmV0JTIwcHJpYSUyMHxlbnwwfHx8fDE3NTY2MjMwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
];

const AboutPage = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center text-center text-white">
        <Image
          src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1337&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Interior kedai kopi yang hangat dan nyaman"
          fill
          priority
          className="absolute z-0 object-cover"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 container mx-auto px-4">
          <h1 className="font-headline text-4xl md:text-6xl font-bold">Tentang Sehati Kopi</h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            Menghubungkan hati melalui cita rasa otentik kopi Indonesia, dari petani kami hingga ke cangkir Anda.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl order-last md:order-first">
             <Image
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Foto lama petani kopi sedang memanen"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-semibold">Cerita Kami</h2>
            <p className="mt-4 text-lg text-foreground/80">
              Sehati Kopi Indonesia dimulai dari mimpi sederhana: untuk berbagi cita rasa kopi Indonesia yang beragam dan luar biasa kepada dunia. Didirikan pada tahun 2020, kami memulai perjalanan melintasi nusantara, dari dataran tinggi Gayo hingga tanah vulkanik Flores. Kami tidak hanya mencari biji terbaik, tetapi juga cerita dan orang-orang di baliknya.
            </p>
            <p className="mt-4 text-lg text-foreground/80">
              Nama kami, 'Sehati', melambangkan keyakinan inti kami pada semangat bersama yang menghubungkan semua orang dalam rantai kopi—petani yang berdedikasi, penyangrai kami yang penuh semangat, dan Anda, para pencinta kopi. Kami lebih dari sekadar merek kopi; kami adalah komunitas yang dibangun di atas rasa hormat, kualitas, dan kecintaan pada keahlian kami.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl text-primary font-semibold">Nilai-Nilai Kami</h2>
          <p className="mt-2 text-lg max-w-2xl mx-auto text-foreground/80">
            Prinsip-prinsip yang memandu setiap biji yang kami sangrai dan setiap cangkir yang kami sajikan.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg bg-background transform hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl pt-4">Keaslian</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p>Kami menghormati karakter unik dari setiap asal kopi, menceritakan kisah sejatinya melalui penyangraian yang teliti dan sumber yang transparan.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg bg-background transform hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl pt-4">Keberlanjutan</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p>Kami berkomitmen pada praktik ramah lingkungan dan memastikan kompensasi yang adil bagi para petani mitra kami, menopang tanah dan mata pencaharian.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg bg-background transform hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl pt-4">Komunitas</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p>Kami percaya dalam membangun komunitas yang kuat, dari petani hingga pelanggan, disatukan oleh kecintaan bersama terhadap kopi yang luar biasa.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Meet The Team */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold text-primary">Tim Kami</h2>
          <p className="mt-2 text-lg max-w-2xl mx-auto text-foreground/80">
            Individu-individu penuh semangat di balik Sehati Kopi.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="pt-6 border-0 shadow-none bg-transparent">
                <CardContent className="flex flex-col items-center p-0">
                  <Avatar className="h-32 w-32 mb-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-primary">{member.name}</h3>
                  <p className="text-accent-foreground">{member.role}</p>
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
