// src/app/dashboard/analytics-overview.tsx
import { Coffee, Star, Calendar, Newspaper } from 'lucide-react';

import { getProducts } from '@/lib/products-data';
import { getBlogPostsForAdmin } from '@/lib/blog-data';
import { getEvents } from '@/lib/events-data';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricCard } from './metric-card';
import { ProductPopularityChart } from './product-popularity-chart';
import { RoastDistributionChart } from './roast-distribution-chart';
import { OriginDistributionChart } from './origin-distribution-chart';
import { TopProductsTable } from './top-products-table';
import { BarChart3 } from 'lucide-react';


const AnalyticsOverview = async () => {
    const [productsData, blogPostsData, eventsData] = await Promise.all([
        getProducts(),
        getBlogPostsForAdmin(),
        getEvents()
    ]);
    
    const totalProducts = productsData.length;
    const totalReviews = productsData.reduce((acc, product) => acc + product.reviews, 0);

    const stats = {
        totalProducts,
        totalReviews,
        blogPosts: blogPostsData.length,
        events: eventsData.length
    };
    
    return (
    <div className="space-y-8">
        <section>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Products" value={stats.totalProducts} icon={Coffee} />
                <MetricCard title="Customer Reviews" value={stats.totalReviews} icon={Star} />
                <MetricCard title="Upcoming Events" value={stats.events} icon={Calendar} />
                <MetricCard title="Blog Posts" value={stats.blogPosts} icon={Newspaper} />
            </div>
        </section>

        <section>
            <Card className="shadow-lg bg-background">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                        <BarChart3 /> Business Analytics
                    </CardTitle>
                     <CardDescription>An overview of product performance and distribution.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-headline text-lg text-primary mb-2">Top 5 Products</h3>
                            <TopProductsTable products={productsData} isLoading={false} />
                        </div>
                        <div className="h-[300px] md:h-[400px]">
                             <h3 className="font-headline text-lg text-primary mb-2">Roast Distribution</h3>
                            <RoastDistributionChart products={productsData} isLoading={false} />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 pt-4">
                        <div className="xl:col-span-3 h-[400px]">
                            <h3 className="font-headline text-lg text-primary mb-2">Product Popularity (by Reviews)</h3>
                            <ProductPopularityChart products={productsData} isLoading={false} />
                        </div>
                        <div className="xl:col-span-2 h-full flex flex-col justify-center items-center">
                            <h3 className="font-headline text-lg text-primary mb-2 text-center">Origin Distribution</h3>
                            <OriginDistributionChart products={productsData} isLoading={false} />
                        </div>
                     </div>
                </CardContent>
            </Card>
        </section>
    </div>
    )
};

export default AnalyticsOverview;

export const AnalyticsOverviewSkeleton = () => {
    return (
    <div className="space-y-8">
        <section>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card className="shadow-lg bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Coffee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
                </Card>
                 <Card className="shadow-lg bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customer Reviews</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
                </Card>
                 <Card className="shadow-lg bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
                </Card>
                 <Card className="shadow-lg bg-background">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                        <Newspaper className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><Skeleton className="h-8 w-1/2" /></CardContent>
                </Card>
            </div>
        </section>
        <section>
             <Card className="shadow-lg bg-background">
                 <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                       <Skeleton className="h-8 w-8 rounded-full" />
                       <Skeleton className="h-8 w-48" />
                    </CardTitle>
                     <Skeleton className="h-5 w-64" />
                </CardHeader>
                 <CardContent className="space-y-8">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <Skeleton className="h-[200px] w-full" />
                        <Skeleton className="h-[400px] w-full" />
                     </div>
                      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 pt-4">
                        <Skeleton className="xl:col-span-3 h-[400px] w-full" />
                        <Skeleton className="xl:col-span-2 h-[400px] w-full" />
                      </div>
                 </CardContent>
             </Card>
        </section>
    </div>
    )
}
