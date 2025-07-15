import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const menuItems = {
  hot: [
    { name: 'Espresso', description: 'A concentrated coffee beverage brewed by forcing a small amount of nearly boiling water through finely-ground coffee beans.', price: 'Rp 20.000', image: 'https://placehold.co/600x400.png', aiHint: 'espresso shot' },
    { name: 'Americano', description: 'A style of coffee prepared by brewing espresso with added hot water, giving it a similar strength to, but different flavor from, traditionally brewed coffee.', price: 'Rp 25.000', image: 'https://placehold.co/600x400.png', aiHint: 'americano coffee' },
    { name: 'Latte', description: 'A coffee drink made with espresso and steamed milk.', price: 'Rp 30.000', image: 'https://placehold.co/600x400.png', aiHint: 'latte art' },
    { name: 'Cappuccino', description: 'An espresso-based coffee drink that originated in Italy, and is traditionally prepared with steamed milk foam.', price: 'Rp 30.000', image: 'https://placehold.co/600x400.png', aiHint: 'cappuccino cup' },
  ],
  cold: [
    { name: 'Iced Americano', description: 'Espresso shots topped with cold water produce a light layer of crema, then served over ice.', price: 'Rp 27.000', image: 'https://placehold.co/600x400.png', aiHint: 'iced americano' },
    { name: 'Iced Latte', description: 'A chilled version of the classic latte, made with espresso and cold milk over ice.', price: 'Rp 32.000', image: 'https://placehold.co/600x400.png', aiHint: 'iced latte' },
    { name: 'Cold Brew', description: 'Coffee brewed with cold water over a long period, resulting in a smooth, less acidic flavor.', price: 'Rp 35.000', image: 'https://placehold.co/600x400.png', aiHint: 'cold brew coffee' },
  ],
  manual: [
    { name: 'V60', description: 'A pour-over brewing method that produces a clean, clear, and nuanced cup of coffee.', price: 'Rp 40.000', image: 'https://placehold.co/600x400.png', aiHint: 'v60 dripper' },
    { name: 'French Press', description: 'An immersion brewing method that creates a full-bodied, rich, and aromatic cup of coffee.', price: 'Rp 38.000', image: 'https://placehold.co/600x400.png', aiHint: 'french press' },
    { name: 'Aeropress', description: 'A versatile brewing device that can produce a range of coffee styles, from espresso-like to filter coffee.', price: 'Rp 42.000', image: 'https://placehold.co/600x400.png', aiHint: 'aeropress coffee maker' },
  ],
  signature: [
    { name: 'Kopi Susu Sehati', description: 'Our signature iced coffee with creamy milk and a touch of Gula Aren.', price: 'Rp 28.000', image: 'https://placehold.co/600x400.png', aiHint: 'iced coffee milk' },
    { name: 'Pandan Latte', description: 'A unique blend of espresso, steamed milk, and fragrant pandan syrup.', price: 'Rp 35.000', image: 'https://placehold.co/600x400.png', aiHint: 'green latte' },
  ],
};

type MenuCategory = keyof typeof menuItems;

const Page = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Our Menu</h1>
        <p className="mt-2 text-lg text-foreground/80">Crafted with passion, served with a smile.</p>
      </div>
      <Tabs defaultValue="hot" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="hot">Hot Coffee</TabsTrigger>
          <TabsTrigger value="cold">Cold Coffee</TabsTrigger>
          <TabsTrigger value="manual">Manual Brew</TabsTrigger>
          <TabsTrigger value="signature">Signature</TabsTrigger>
        </TabsList>
        {(Object.keys(menuItems) as MenuCategory[]).map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {menuItems[category].map((item) => (
                <Card key={item.name} className="flex flex-col overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                  <CardHeader className="p-0">
                    <div className="relative h-52 w-full">
                      <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={item.aiHint} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <CardTitle className="font-headline text-xl text-primary">{item.name}</CardTitle>
                    <CardDescription className="mt-2 text-sm">{item.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center p-4 bg-background">
                    <span className="text-lg font-bold text-primary">{item.price}</span>
                    <Button variant="secondary">Order</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Page;
