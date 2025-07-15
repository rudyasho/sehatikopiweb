
// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductPopularityChart } from './product-popularity-chart';
import { Coffee, Star, Calendar, Newspaper, Loader2, PlusCircle, Wand2, Edit, BarChart3, Bot, LayoutGrid, Send, Clipboard, Check, Save, ListOrdered, Trash2 } from 'lucide-react';
import { addProduct, getProducts, updateProduct, deleteProduct, type Product } from '@/lib/products-data';
import { RoastDistributionChart } from './roast-distribution-chart';
import { OriginDistributionChart } from './origin-distribution-chart';
import { TopProductsTable } from './top-products-table';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addBlogPost, getBlogPosts } from '@/app/blog/page';
import { generateBlogPost, type GenerateBlogPostOutput } from '@/ai/flows/blog-post-generator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const totalEvents = 3; 
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

type DashboardView = 'overview' | 'addProduct' | 'blogGenerator' | 'manageProducts';
export type GeneratedPost = GenerateBlogPostOutput;


const productFormSchema = z.object({
  name: z.string().min(3, "Product name is required."),
  origin: z.string().min(3, "Origin is required."),
  description: z.string().min(10, "Description is required."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  roast: z.string().min(3, "Roast level is required."),
  tags: z.string().min(3, "Please add at least one tag, comma separated."),
  image: z.string().url("Please provide a valid image URL."),
  aiHint: z.string().min(2, "AI hint is required for image search.")
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const blogPostSchema = z.object({
  topic: z.string().min(5, 'Please provide a more detailed topic.'),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;


const MetricCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading?: boolean }) => (
    <Card className="shadow-lg bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

function BlogGenerator() {
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [editedPost, setEditedPost] = useState<{title: string, content: string} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: { topic: '' },
  });

  async function onSubmit(data: BlogPostFormValues) {
    setIsLoading(true);
    setGeneratedPost(null);
    setIsEditing(false);
    setEditedPost(null);
    try {
      const result = await generateBlogPost(data.topic);
      setGeneratedPost(result);
      setEditedPost({ title: result.title, content: result.content });
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate the blog post. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyToClipboard = () => {
    if (!generatedPost?.content) return;
    navigator.clipboard.writeText(isEditing ? editedPost!.content : generatedPost.content);
    setHasCopied(true);
    toast({ title: 'Content Copied!' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handlePublish = () => {
    if (!generatedPost) return;
    // Use edited content if available
    const postToPublish = {
      ...generatedPost,
      title: editedPost?.title || generatedPost.title,
      content: editedPost?.content || generatedPost.content,
    };
    const newPost = addBlogPost(postToPublish);
    toast({
        title: "Post Published!",
        description: `"${newPost.title}" is now on the blog.`,
        action: (
            <Button variant="outline" size="sm" onClick={() => router.push(`/blog/${newPost.slug}`)}>
                View Post
            </Button>
        )
    })
    setGeneratedPost(null);
    setEditedPost(null);
    setIsEditing(false);
    form.reset();
  };

  const handleSaveChanges = () => {
    if (!editedPost) return;
    setGeneratedPost(prev => prev ? ({...prev, title: editedPost.title, content: editedPost.content}) : null);
    setIsEditing(false);
    toast({ title: 'Changes saved locally.' });
  }

  return (
    <Card className="shadow-lg bg-background">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
          <Wand2 /> AI Blog Post Generator
        </CardTitle>
        <CardDescription>
          Enter a topic and let our AI create a draft and a feature image for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blog Post Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The history of coffee in West Java" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Post'
              )}
            </Button>
          </form>
        </Form>

        {isLoading && (
          <div className="text-center p-8">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">The AI is writing and drawing, please wait...</p>
          </div>
        )}

        {generatedPost && editedPost && (
          <Card className="mt-6 animate-in fade-in-50 duration-500 bg-secondary/50">
            <CardHeader>
              <div className="relative aspect-video w-full rounded-md overflow-hidden mb-4">
                <Image src={generatedPost.imageDataUri} alt={generatedPost.title} layout="fill" objectFit="cover" />
              </div>
              <Badge variant="secondary" className="w-fit mb-2">{generatedPost.category}</Badge>
              {isEditing ? (
                  <Input 
                      value={editedPost.title}
                      onChange={(e) => setEditedPost(prev => ({...prev!, title: e.target.value}))}
                      className="text-3xl font-headline font-bold h-auto p-2"
                  />
              ) : (
                <CardTitle className="font-headline text-3xl text-primary">{generatedPost.title}</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                  <Textarea
                     value={editedPost.content}
                     onChange={(e) => setEditedPost(prev => ({...prev!, content: e.target.value}))}
                     className="min-h-[300px] text-base"
                  />
              ) : (
                <div className="prose lg:prose-xl max-w-none text-foreground/90 prose-headings:text-primary prose-h3:font-headline"
                     dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
              )}
              <div className="flex flex-wrap gap-2 mt-6">
                {isEditing ? (
                  <Button onClick={handleSaveChanges}>
                    <Save className="mr-2"/>
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="mr-2"/>
                    Edit
                  </Button>
                )}
                <Button onClick={handleCopyToClipboard} variant="outline">
                  {hasCopied ? <Check className="mr-2"/> : <Clipboard className="mr-2"/>}
                  Copy HTML
                </Button>
                 <Button onClick={handlePublish} disabled={isEditing}>
                  <Send className="mr-2"/>
                  Publish to Blog
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}


const ProductForm = ({ product, onFormSubmit, closeDialog }: { product?: Product | null, onFormSubmit: () => void, closeDialog?: () => void }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState<string | null>(product?.image || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: { 
            name: product?.name || '', 
            origin: product?.origin || '', 
            description: product?.description || '', 
            price: product?.price || 0, 
            roast: product?.roast || '', 
            tags: product?.tags.join(', ') || '', 
            image: product?.image || '', 
            aiHint: product?.aiHint || '' 
        },
    });
    
    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const url = event.target.value;
        if (url) {
            setImagePreview(url);
            form.setValue('image', url);
        } else {
            setImagePreview(null);
        }
    }

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true);
        try {
            if (product) { // Update existing product
                await updateProduct(product.id, data);
                 toast({
                    title: "Product Updated!",
                    description: `${data.name} has been updated.`,
                });
            } else { // Add new product
                const newProduct = await addProduct(data);
                toast({
                    title: "Product Added!",
                    description: `${data.name} has been added to the product list.`,
                    action: (
                        <Button variant="outline" size="sm" onClick={() => router.push(`/products/${newProduct.slug}`)}>
                            View Product
                        </Button>
                    )
                });
                form.reset();
                setImagePreview(null);
            }
            onFormSubmit(); // Callback to refresh product list
            if (closeDialog) closeDialog();
        } catch (error) {
            console.error("Failed to submit product:", error);
            toast({
                variant: 'destructive',
                title: "Error!",
                description: `Could not ${product ? 'update' : 'add'} the product. Please try again.`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto p-1">
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
                        <FormField control={form.control} name="image" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                    <Input type="url" placeholder="https://example.com/image.png" {...field} onChange={(e) => {field.onChange(e); handleUrlChange(e);}} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                            <FormField control={form.control} name="aiHint" render={({ field }) => (
                            <FormItem>
                                <FormLabel>AI Hint</FormLabel>
                                <FormControl><Input placeholder="e.g., coffee cup" {...field} /></FormControl>
                                <CardDescription className="text-xs pt-1">Keywords for image search.</CardDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <Button type="submit" size="lg" className="!mt-8 w-full md:w-auto" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {product ? 'Update Product' : 'Add Product'}
                </Button>
            </form>
        </Form>
    )
}

const AddProductView = ({ onProductAdded }: { onProductAdded: () => void }) => (
  <Card className="shadow-lg bg-background">
    <CardHeader>
      <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
        <PlusCircle /> Add New Product
      </CardTitle>
      <CardDescription>Fill in the details to add a new coffee to the collection.</CardDescription>
    </CardHeader>
    <CardContent>
        <ProductForm onFormSubmit={onProductAdded} />
    </CardContent>
  </Card>
);

const ManageProductsView = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to fetch products for management:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId: string, productName: string) => {
        try {
            await deleteProduct(productId);
            toast({ title: "Product Deleted", description: `"${productName}" has been removed.` });
            fetchProducts(); // Refresh list after deleting
        } catch (error) {
            console.error(`Failed to delete product ${productId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete product.' });
        }
    };
    
    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-64 w-full" />
            </Card>
        )
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <ListOrdered /> Manage Products
                </CardTitle>
                <CardDescription>Edit or delete existing products from your catalog.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Origin</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{product.origin}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-4xl">
                                                <DialogHeader>
                                                    <DialogTitle className="font-headline text-2xl text-primary">Edit Product</DialogTitle>
                                                </DialogHeader>
                                                <ProductForm product={product} onFormSubmit={fetchProducts} closeDialog={() => setIsDialogOpen(false)} />
                                            </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the product "{product.name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(product.id, product.name)}>
                                                        Continue
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

const AnalyticsOverview = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalReviews: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const totalBlogPosts = getBlogPosts().length;

    useEffect(() => {
        async function fetchStats() {
            try {
                const products = await getProducts();
                const totalProducts = products.length;
                const totalReviews = products.reduce((acc, product) => acc + product.reviews, 0);
                setStats({ totalProducts, totalReviews });
            } catch (error) {
                console.error("Failed to fetch product stats:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
    <div className="space-y-8">
        <section>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Products" value={stats.totalProducts} icon={Coffee} isLoading={isLoading} />
                <MetricCard title="Customer Reviews" value={stats.totalReviews} icon={Star} isLoading={isLoading} />
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
    )
};


const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

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
  
  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const renderContent = () => {
    switch (activeView) {
        case 'overview':
            return <AnalyticsOverview key={refreshKey} />;
        case 'addProduct':
            return <AddProductView onProductAdded={handleDataChange} />;
        case 'blogGenerator':
            return <BlogGenerator />;
        case 'manageProducts':
            return <ManageProductsView />;
        default:
            return <AnalyticsOverview key={refreshKey} />;
    }
  }
  
  const sidebarNavItems = [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'manageProducts', label: 'Manage Products', icon: ListOrdered },
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
