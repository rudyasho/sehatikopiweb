import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductPopularityChart } from './product-popularity-chart';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'An overview of Sehati Kopi business metrics and analytics.',
};

const DashboardPage = () => {
  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Dashboard</h1>
          <p className="mt-2 text-lg text-foreground/80">Business Analytics Overview</p>
        </div>
        <div className="grid grid-cols-1 gap-8">
          <Card className="shadow-lg bg-background">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Product Popularity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ProductPopularityChart />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
