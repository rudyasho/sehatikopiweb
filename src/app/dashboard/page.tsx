
// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductPopularityChart } from './product-popularity-chart';
import { Coffee, Star, Calendar, Newspaper, Loader2, PlusCircle, Upload, Link as LinkIcon, Edit, BarChart3, Settings, Bot, LayoutGrid } from 'lucide-react';
import { products } from '@/lib/products-data';
import { RoastDistributionChart } from './roast-distribution-chart';
import { OriginDistributionChart } from './origin-distribution-chart';
import { TopProductsTable } from './top-products-table';
import { BlogPostGenerator, type GeneratedPost } from '@/app/blog/blog-post-generator';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const totalProducts = products.length;
const totalReviews = products.reduce((acc, product) => acc + product.reviews, 0);
const totalEvents = 3; 
const totalBlogPosts = 4;

type DashboardView = 'overview' | 'addProduct' | 'blogGenerator';


const newProductSchema = z.object({
  name: z.string().min(3, "Product name is required."),
  origin: z.string().min(3, "Origin is required."),
  description: z.string().min(10, "Description is required."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  roast: z.string().min(3, "Roast level is required."),
  tags: z.string().min(3, "Please add at least one tag, comma separated."),
  photo: z.string().optional(),
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
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const form = useForm<NewProductFormValues>({
        resolver: zodResolver(newProductSchema),
        defaultValues: { name: '', origin: '', description: '', price: 0, roast: '', tags: '', photo: '' },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                form.setValue('photo', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const url = event.target.value;
        if (url) {
            setImagePreview(url);
            form.setValue('photo', url);
        } else {
            setImagePreview(null);
        }
    }

    const onSubmit = (data: NewProductFormValues) => {
        console.log("New Product Data:", data);
        toast({
            title: "Product Added (Simulated)!",
            description: `${data.name} has been added to the product list.`,
        });
        form.reset();
        setImagePreview(null);
    };

    return (
      <Card className="shadow-lg bg-background">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <PlusCircle /> Add New Product
          </CardTitle>
          <CardDescription>Fill in the details to add a new coffee to the collection.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Form Fields */}
                        <div className="md:col-span-2 space-y-4">
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
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea placeholder="Describe the coffee's flavor profile..." {...field} rows={6} /></FormControl>
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
                        </div>
                        
                        {/* Photo Upload */}
                        <div className="md:col-span-1 space-y-4">
                            <FormLabel>Product Photo</FormLabel>
                            <Card className="p-4 bg-secondary/30">
                                <div className="w-full aspect-square relative bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Product Preview" layout="fill" objectFit="cover" />
                                ) : (
                                    <span className="text-sm text-muted-foreground">Image Preview</span>
                                )}
                                </div>
                            </Card>
                            <Tabs defaultValue="local" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="local"><Upload className="mr-2 h-4 w-4"/>Local</TabsTrigger>
                                    <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4"/>URL</TabsTrigger>
                                </TabsList>
                                <TabsContent value="local" className="pt-2">
                                    <FormField control={form.control} name="photo" render={() => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="file" accept="image/*" onChange={handleFileChange} className="file:text-primary file:font-semibold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </TabsContent>
                                <TabsContent value="url" className="pt-2">
                                    <FormField control={form.control} name="photo" render={() => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="url" placeholder="https://example.com/image.png" onChange={handleUrlChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    <Button type="submit" size="lg" className="!mt-8 w-full md:w-auto">Add Product</Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    )
}

const AnalyticsOverview = () => (
    <div className="space-y-8">
        <section>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Products" value={totalProducts} icon={Coffee} />
                <MetricCard title="Customer Reviews" value={totalReviews} icon={Star} />
                <MetricCard title="Upcoming Events" value={totalEvents} icon={Calendar} />
                <MetricCard title="Blog Posts" value={totalBlogPosts} icon={Newspaper} />
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
                            <TopProductsTable />
                        </div>
                        <div className="h-[300px] md:h-[400px]">
                             <h3 className="font-headline text-lg text-primary mb-2">Roast Distribution</h3>
                            <RoastDistributionChart />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 pt-4">
                        <div className="xl:col-span-3 h-[400px]">
                            <h3 className="font-headline text-lg text-primary mb-2">Product Popularity (by Reviews)</h3>
                            <ProductPopularityChart />
                        </div>
                        <div className="xl:col-span-2 h-[400px] flex justify-center items-center">
                            <div>
                                <h3 className="font-headline text-lg text-primary mb-2 text-center">Origin Distribution</h3>
                                <OriginDistributionChart />
                            </div>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </section>
    </div>
);


const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<DashboardView>('overview');

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
      <div className="flex h-screen items-center justify-center bg-secondary/50">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const renderContent = () => {
    switch (activeView) {
        case 'overview':
            return <AnalyticsOverview />;
        case 'addProduct':
            return <AddProductForm />;
        case 'blogGenerator':
            return <BlogPostGenerator onPublish={handlePublishPost} />;
        default:
            return <AnalyticsOverview />;
    }
  }
  
  const sidebarNavItems = [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'addProduct', label: 'Add Product', icon: PlusCircle },
      { id: 'blogGenerator', label: 'AI Blog Generator', icon: Bot },
  ];

  return (
    <div className="bg-secondary/50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
            <header className="mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Dashboard</h1>
                <p className="mt-1 text-lg text-foreground/80">Welcome back, {user.name}!</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block md:col-span-1 sticky top-24">
                    <Card className="shadow-lg bg-background">
                        <CardContent className="p-4">
                            <nav className="flex flex-col space-y-2">
                                {sidebarNavItems.map(item => (
                                     <Button
                                        key={item.id}
                                        variant={activeView === item.id ? 'secondary' : 'ghost'}
                                        onClick={() => setActiveView(item.id as DashboardView)}
                                        className="justify-start text-base px-4 py-6"
                                     >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.label}
                                     </Button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* Mobile Dropdown */}
                 <div className="md:hidden">
                    <Select value={activeView} onValueChange={(value) => setActiveView(value as DashboardView)}>
                      <SelectTrigger className="w-full h-12 text-base">
                        <SelectValue placeholder="Select a view" />
                      </SelectTrigger>
                      <SelectContent>
                        {sidebarNavItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                {/* Main Content */}
                <main className="md:col-span-3 space-y-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    </div>
  );
};

export default DashboardPage;
