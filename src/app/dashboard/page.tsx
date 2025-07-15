
// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductPopularityChart } from './product-popularity-chart';
import { Coffee, Star, Calendar, Newspaper, Loader2, List, PlusCircle } from 'lucide-react';
import { products, type Product } from '@/lib/products-data';
import { RoastDistributionChart } from './roast-distribution-chart';
import { OriginDistributionChart } from './origin-distribution-chart';
import { TopProductsTable } from './top-products-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogPostGenerator, type GeneratedPost } from '@/app/blog/blog-post-generator';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const totalProducts = products.length;
const totalReviews = products.reduce((acc, product) => acc + product.reviews, 0);
const totalEvents = 3; 
const totalBlogPosts = 4;

const newProductSchema = z.object({
  name: z.string().min(3, "Product name is required."),
  origin: z.string().min(3, "Origin is required."),
  description: z.string().min(10, "Description is required."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  roast: z.string().min(3, "Roast level is required."),
  tags: z.string().min(3, "Please add at least one tag, comma separated."),
});

type NewProductFormValues = z.infer<typeof newProductSchema>;


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

const AddProductForm = () => {
    const { toast } = useToast();
    const form = useForm<NewProductFormValues>({
        resolver: zodResolver(newProductSchema),
        defaultValues: { name: '', origin: '', description: '', price: 0, roast: '', tags: '' },
    });

    const onSubmit = (data: NewProductFormValues) => {
        console.log("New Product Data:", data);
        toast({
            title: "Product Added (Simulated)!",
            description: `${data.name} has been added to the product list.`,
        });
        form.reset();
    };

    return (
         <Card className="bg-background shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <PlusCircle /> Add New Product
                </CardTitle>
                <CardDescription>
                    Fill in the details to add a new coffee to your collection.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Papua Wamena" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="origin" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Origin</FormLabel>
                                    <FormControl><Input placeholder="e.g., Wamena, Papua" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea placeholder="Describe the coffee's flavor profile..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (IDR)</FormLabel>
                                    <FormControl><Input type="number" placeholder="150000" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="roast" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Roast Level</FormLabel>
                                    <FormControl><Input placeholder="e.g., Medium-Light" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                         <FormField control={form.control} name="tags" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl><Input placeholder="e.g., Fruity, Aromatic, Clean" {...field} /></FormControl>
                                <CardDescription className="text-xs pt-1">Enter tags separated by commas.</CardDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit">Add Product</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handlePublishPost = (post: GeneratedPost) => {
    toast({
      title: 'Post Published (Simulated)!',
      description: `"${post.title}" has been created and is now available on the blog page.`,
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Dashboard</h1>
          <p className="mt-1 text-lg text-foreground/80">Welcome back, {user.name}!</p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="analytics">Business Analytics</TabsTrigger>
                <TabsTrigger value="content">Content Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analytics">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <MetricCard title="Total Products" value={totalProducts} icon={Coffee} />
                    <MetricCard title="Customer Reviews" value={totalReviews} icon={Star} />
                    <MetricCard title="Upcoming Events" value={totalEvents} icon={Calendar} />
                    <MetricCard title="Blog Posts" value={totalBlogPosts} icon={Newspaper} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="shadow-lg bg-background">
                    <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Top 5 Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <TopProductsTable />
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

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3 shadow-lg bg-background">
                    <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Product Popularity (by Reviews)</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="h-[400px]">
                        <ProductPopularityChart />
                    </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 shadow-lg bg-background">
                    <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Origin Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="h-[400px] w-full flex justify-center">
                        <OriginDistributionChart />
                    </div>
                    </CardContent>
                </Card>
                </div>
            </TabsContent>

            <TabsContent value="content">
                <Tabs defaultValue="blog" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="blog">Blog Post Generator</TabsTrigger>
                        <TabsTrigger value="product">Add New Product</TabsTrigger>
                    </TabsList>
                    <TabsContent value="blog">
                        <BlogPostGenerator onPublish={handlePublishPost} />
                    </TabsContent>
                    <TabsContent value="product">
                        <AddProductForm />
                    </TabsContent>
                </Tabs>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;
