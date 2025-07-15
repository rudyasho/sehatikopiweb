
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductPopularityChart } from './product-popularity-chart';
import { Coffee, Star, Calendar, Newspaper } from 'lucide-react';
import { products } from '@/lib/products-data';
import { RoastDistributionChart } from './roast-distribution-chart';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'An overview of Sehati Kopi business metrics and analytics.',
};

const totalProducts = products.length;
const totalReviews = products.reduce((acc, product) => acc + product.reviews, 0);
const totalEvents = 3; // Hardcoded based on events page
const totalBlogPosts = 4; // Hardcoded based on blog page

const MetricCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card className="shadow-lg bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const DashboardPage = () => {
  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Dashboard</h1>
          <p className="mt-2 text-lg text-foreground/80">Business Analytics Overview</p>
        </div>
        
        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard title="Total Products" value={totalProducts} icon={Coffee} />
            <MetricCard title="Customer Reviews" value={totalReviews} icon={Star} />
            <MetricCard title="Upcoming Events" value={totalEvents} icon={Calendar} />
            <MetricCard title="Blog Posts" value={totalBlogPosts} icon={Newspaper} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-lg bg-background">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Product Popularity (by Reviews)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ProductPopularityChart />
              </div>
            </CardContent>
          </Card>
           <Card className="shadow-lg bg-background">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">Roast Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <RoastDistributionChart />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
