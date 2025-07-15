import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products-data';

const ProductsPage = () => {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Our Coffee Collection</h1>
          <p className="mt-2 text-lg text-foreground/80">Explore our hand-picked selection of the finest single-origin Indonesian beans.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
             <Card key={product.slug} className="text-left overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg">
                <CardHeader className="p-0">
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-60 w-full">
                      <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={product.aiHint}/>
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-2xl text-primary">{product.name}</CardTitle>
                  <CardDescription className="mt-2 h-16">{product.description.substring(0, 100)}...</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-6 bg-secondary/50">
                   <span className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                  </span>
                  <Button asChild>
                    <Link href={`/products/${product.slug}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
