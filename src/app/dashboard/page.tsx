

// src/app/dashboard/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
    Coffee, Star, Calendar, Newspaper, Loader2, PlusCircle, Edit, BarChart3, LayoutGrid, 
    Save, ListOrdered, Trash2, BookText, Image as ImageIcon, CalendarCheck,
    CalendarPlus, FilePlus2, Users, Settings, ImageUp, ShoppingBag, X, Menu
} from 'lucide-react';

import { useAuth, type User, type AppUser, SUPER_ADMIN_EMAIL, ADMIN_EMAILS } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getProducts, updateProduct, deleteProduct, addProduct, type Product } from '@/lib/products-data';
import { getBlogPosts, updateBlogPost, deleteBlogPost, addBlogPost, type BlogPost } from '@/lib/blog-data';
import { getEvents, updateEvent, deleteEvent, addEvent, type Event, type EventFormData } from '@/lib/events-data';
import { listAllUsers, updateUserDisabledStatus, deleteUserAccount } from '@/lib/users-data';
import { getSettings, updateSettings, type SettingsFormData } from '@/lib/settings-data';
import { getHeroData, updateHeroData, type HeroFormData } from '@/lib/hero-data';
import { getAllOrders, updateOrderStatus, type Order, type OrderStatus } from '@/lib/orders-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductPopularityChart } from './product-popularity-chart';
import { RoastDistributionChart } from './roast-distribution-chart';
import { OriginDistributionChart } from './origin-distribution-chart';
import { TopProductsTable } from './top-products-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { BlogEditor } from './blog-editor';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';


const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

type DashboardView = 'overview' | 'addProduct' | 'addBlog' | 'manageProducts' | 'manageBlog' | 'manageEvents' | 'manageUsers' | 'settings' | 'heroSettings' | 'manageOrders';


const productFormSchema = z.object({
  name: z.string().min(3, "Product name is required."),
  origin: z.string().min(3, "Origin is required."),
  description: z.string().min(10, "Description is required."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  roast: z.string().min(3, "Roast level is required."),
  tags: z.string().min(3, "Please add at least one tag, comma separated."),
  image: z.string().url("Image URL is required."),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const blogPostFormSchema = z.object({
    title: z.string().min(5, "Title is required."),
    category: z.enum(['Brewing Tips', 'Storytelling', 'Coffee Education', 'News']),
    content: z.string().min(50, "Content needs to be at least 50 characters.").max(500000, "Content is too long. Please reduce its size."),
    image: z.string().url("Please provide a valid image URL."),
    author: z.string().min(1, "Author name is required."),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

const eventFormSchema = z.object({
  title: z.string().min(5, "Event title is required."),
  date: z.string().min(10, "Event date is required."),
  time: z.string().min(5, "Event time is required."),
  location: z.string().min(5, "Event location is required."),
  description: z.string().min(10, "Description is required."),
  image: z.string().url("Image URL is required."),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const settingsFormSchema = z.object({
  contactPhone: z.string().min(10, "Phone number is required."),
  contactEmail: z.string().email("A valid email is required."),
  contactAddress: z.string().min(10, "Address is required."),
  socialInstagram: z.string().url("A valid Instagram URL is required."),
  socialFacebook: z.string().url("A valid Facebook URL is required."),
  socialTwitter: z.string().url("A valid Twitter/X URL is required."),
});

const heroFormSchema = z.object({
  title: z.string().min(10, "Title is required."),
  subtitle: z.string().min(10, "Subtitle is required."),
  imageUrl: z.string().url("A valid image URL is required."),
});


const MetricCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading?: boolean }) => {
    return (
        <Card className="shadow-lg bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
            </CardContent>
        </Card>
    )
};

const ProductForm = ({ product, onFormSubmit, onFormCancel }: { product?: Product | null, onFormSubmit: () => void, onFormCancel: () => void }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [imageUrl, setImageUrl] = useState(product?.image || '');
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
        },
    });
    
    const convertGoogleDriveLink = (url: string): string => {
        const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return url;
    };

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawUrl = event.target.value;
        const convertedUrl = convertGoogleDriveLink(rawUrl);
        setImageUrl(convertedUrl);
        form.setValue('image', convertedUrl, { shouldValidate: true });
    }

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true);
        try {
            if (product) {
                await updateProduct(product.id, data);
                 toast({
                    title: "Product Updated!",
                    description: `${data.name} has been updated.`,
                });
            } else {
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
                setImageUrl('');
            }
            onFormSubmit();
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
                    
                    <div className="md:col-span-1 space-y-4">
                        <FormLabel>Product Photo</FormLabel>
                        <Card className="p-4 bg-secondary/30">
                            <div className="w-full aspect-square relative bg-muted rounded-md flex items-center justify-center overflow-hidden">
                             {imageUrl ? (
                                <Image src={imageUrl} alt="Product Preview" fill className="object-cover" />
                            ) : (
                                <ImageIcon className="h-16 w-16 text-muted-foreground" />
                            )}
                            </div>
                        </Card>
                         
                        <FormField control={form.control} name="image" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                    <Input
                                        type="url"
                                        placeholder="https://example.com/image.png or Google Drive link"
                                        defaultValue={field.value}
                                        onChange={handleUrlChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                 <div className="flex gap-2 !mt-8">
                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {product ? 'Update Product' : 'Add Product'}
                    </Button>
                    {product && <Button type="button" variant="outline" onClick={onFormCancel}>Cancel</Button>}
                </div>
            </form>
        </Form>
    )
}

const EventForm = ({ event, onFormSubmit, onFormCancel }: { event?: Event | null, onFormSubmit: () => void, onFormCancel: () => void }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: { 
            title: event?.title || '',
            date: event?.date || '',
            time: event?.time || '',
            location: event?.location || '',
            description: event?.description || '',
            image: event?.image || '',
        },
    });

    const onSubmit = async (data: EventFormValues) => {
        setIsSubmitting(true);
        try {
            if (event) {
                await updateEvent(event.id, data);
                toast({ title: "Event Updated!", description: `"${data.title}" has been updated.` });
            } else {
                await addEvent(data);
                toast({ title: "Event Added!", description: `"${data.title}" has been added.` });
            }
            onFormSubmit();
        } catch (error) {
            console.error("Failed to submit event:", error);
            toast({
                variant: 'destructive',
                title: "Error!",
                description: `Could not ${event ? 'update' : 'add'} the event.`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl><Input placeholder="e.g., Latte Art Workshop" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl><Input placeholder="e.g., Saturday, August 17, 2024" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="time" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl><Input placeholder="e.g., 10:00 AM - 12:00 PM" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input placeholder="e.g., Sehati Kopi Roastery, Jakarta" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Describe the event..." {...field} rows={4} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl><Input type="url" placeholder="https://example.com/image.png" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <div className="flex gap-2 !mt-6">
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {event ? 'Update Event' : 'Add Event'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onFormCancel}>Cancel</Button>
                </div>
            </form>
        </Form>
    );
};


const AddProductView = ({ onDataChange }: { onDataChange: () => void }) => (
  <Card className="shadow-lg bg-background">
    <CardHeader>
      <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
        <PlusCircle /> Add New Product
      </CardTitle>
      <CardDescription>Fill in the details to add a new coffee to the collection.</CardDescription>
    </CardHeader>
    <CardContent>
        <ProductForm onFormSubmit={onDataChange} onFormCancel={() => {}} />
    </CardContent>
  </Card>
);

const ManageProductsView = ({ onDataChange }: { onDataChange: () => void }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

    useEffect(() => {
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
        fetchProducts();
    }, [toast, onDataChange]);

    const handleDelete = async (productId: string, productName: string) => {
        try {
            await deleteProduct(productId);
            toast({ title: "Product Deleted", description: `"${productName}" has been removed.` });
            onDataChange();
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

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsProductDialogOpen(true);
    }
    
    const handleProductFormSubmit = () => {
        setIsProductDialogOpen(false);
        setEditingProduct(null);
        onDataChange();
    };

    const handleProductFormCancel = () => {
        setIsProductDialogOpen(false);
        setEditingProduct(null);
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
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogContent>
                         <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">Edit Product</DialogTitle>
                         </DialogHeader>
                         {editingProduct && (
                             <ProductForm 
                                product={editingProduct} 
                                onFormSubmit={handleProductFormSubmit}
                                onFormCancel={handleProductFormCancel}
                            />
                         )}
                    </DialogContent>
                </Dialog>
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
                                         <Button variant="outline" size="icon" aria-label={`Edit ${product.name}`} onClick={() => handleEditClick(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" aria-label={`Delete ${product.name}`}>
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

const BlogPostForm = ({ post, onFormSubmit, onFormCancel, isCreatingNew, currentUser }: { post?: BlogPost | null, onFormSubmit: () => void, onFormCancel: () => void, isCreatingNew?: boolean, currentUser?: User | null }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostFormSchema),
        defaultValues: {
            title: post?.title || '',
            category: post?.category || 'Coffee Education',
            content: post?.content || '', 
            image: post?.image || '',
            author: post?.author || currentUser?.displayName || 'Sehati Kopi Team',
        },
    });

    const convertGoogleDriveLink = (url: string): string => {
        const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return url;
    };

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawUrl = event.target.value;
        const convertedUrl = convertGoogleDriveLink(rawUrl);
        form.setValue('image', convertedUrl, { shouldValidate: true });
    };

    const onSubmit = async (data: BlogPostFormValues) => {
        setIsSubmitting(true);
        try {
            if (isCreatingNew) {
                await addBlogPost(data);
                toast({ title: "Post Created!", description: `"${data.title}" has been created.` });
                form.reset({ category: 'Coffee Education', title: '', content: '', image: '', author: currentUser?.displayName || '' });
            } else if (post) {
                await updateBlogPost(post.id, data);
                toast({ title: "Post Updated!", description: `"${data.title}" has been updated.` });
            }
            onFormSubmit();
        } catch (error) {
            console.error("Failed to submit blog post:", error);
            const errorMessage = error instanceof Error ? error.message : `Could not ${isCreatingNew ? 'create' : 'update'} the post.`;
            toast({
                variant: 'destructive',
                title: "Error!",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="max-h-[70vh] overflow-y-auto p-1 space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Post Title</FormLabel>
                            <FormControl><Input placeholder="e.g., The Ultimate Guide to V60" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Brewing Tips">Brewing Tips</SelectItem>
                                    <SelectItem value="Storytelling">Storytelling</SelectItem>
                                    <SelectItem value="Coffee Education">Coffee Education</SelectItem>
                                    <SelectItem value="News">News</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="author" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Author</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="image" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl><Input 
                                type="url" 
                                placeholder="https://example.com/image.png or Google Drive link"
                                defaultValue={field.value}
                                onChange={handleUrlChange}
                            /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <BlogEditor 
                                        value={field.value} 
                                        onChange={field.onChange} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <div className="flex gap-2 !mt-8">
                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isCreatingNew ? 'Create Post' : 'Update Post'}
                    </Button>
                    {!isCreatingNew && <Button type="button" variant="outline" onClick={onFormCancel}>Cancel</Button>}
                </div>
            </form>
        </Form>
    );
};

const AddBlogPostView = ({ currentUser, onDataChange }: { currentUser: User, onDataChange: () => void }) => (
    <Card className="shadow-lg bg-background">
        <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                <FilePlus2 /> Create New Blog Post
            </CardTitle>
            <CardDescription>Manually craft a new article for your blog.</CardDescription>
        </CardHeader>
        <CardContent>
            <BlogPostForm isCreatingNew currentUser={currentUser} onFormSubmit={onDataChange} onFormCancel={() => {}} />
        </CardContent>
    </Card>
);

const ManageBlogPostsView = ({ onDataChange, initialPostToEdit }: { onDataChange: () => void, initialPostToEdit?: string | null }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const { user } = useAuth();
    const router = useRouter();
    const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const postsData = await getBlogPosts();
                setPosts(postsData);
                if (initialPostToEdit) {
                    const postToEdit = postsData.find(p => p.id === initialPostToEdit);
                    if (postToEdit) {
                        setEditingPost(postToEdit);
                        setIsPostDialogOpen(true);
                        router.replace('/dashboard?view=manageBlog', { scroll: false });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch blog posts for management:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch blog posts.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [initialPostToEdit, toast, onDataChange, router]);

    const handleDelete = async (postId: string, postTitle: string) => {
        try {
            await deleteBlogPost(postId);
            toast({ title: "Post Deleted", description: `"${postTitle}" has been removed.` });
            onDataChange();
        } catch (error) {
            console.error(`Failed to delete post ${postId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the post.' });
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

    const handleEditClick = (post: BlogPost) => {
        setEditingPost(post);
        setIsPostDialogOpen(true);
    };

    const handlePostFormSubmit = () => {
        setIsPostDialogOpen(false);
        setEditingPost(null);
        onDataChange();
    };

    const handlePostFormCancel = () => {
        setIsPostDialogOpen(false);
        setEditingPost(null);
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <BookText /> Manage Blog Posts
                </CardTitle>
                <CardDescription>Edit or delete existing articles from your blog.</CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                    <DialogContent className="max-w-4xl">
                         <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">Edit Blog Post</DialogTitle>
                            <CardDescription>Editing post: "{editingPost?.title}"</CardDescription>
                         </DialogHeader>
                         {editingPost && (
                            <BlogPostForm 
                                post={editingPost}
                                currentUser={user}
                                onFormSubmit={handlePostFormSubmit}
                                onFormCancel={handlePostFormCancel}
                            />
                         )}
                    </DialogContent>
                </Dialog>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{post.author}</TableCell>
                                    <TableCell>{post.date ? format(new Date(post.date), "MMM d, yyyy") : 'N/A'}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                         <Button variant="outline" size="icon" onClick={() => handleEditClick(post)} aria-label={`Edit ${post.title}`}>
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" aria-label={`Delete ${post.title}`}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the post "{post.title}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(post.id, post.title)}>
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
};

const ManageEventsView = ({ onDataChange }: { onDataChange: () => void }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const eventsData = await getEvents();
                setEvents(eventsData);
            } catch (error) {
                console.error("Failed to fetch events:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch events.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [toast, onDataChange]);

    const handleDelete = async (eventId: string, eventTitle: string) => {
        try {
            await deleteEvent(eventId);
            toast({ title: "Event Deleted", description: `"${eventTitle}" has been removed.` });
            onDataChange();
        } catch (error) {
            console.error(`Failed to delete event ${eventId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete event.' });
        }
    };

    const openForm = (event: Event | null) => {
        setEditingEvent(event);
        setIsFormOpen(true);
    }
    
    const closeForm = () => {
        setEditingEvent(null);
        setIsFormOpen(false);
    }

    const handleFormSubmit = () => {
        closeForm();
        onDataChange();
    };

    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-64 w-full" />
            </Card>
        );
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                        <CalendarCheck /> Manage Events
                    </CardTitle>
                    <CardDescription>Add, edit, or delete events and workshops.</CardDescription>
                </div>
                <Button onClick={() => openForm(null)}>
                    <CalendarPlus className="mr-2 h-4 w-4" /> Add New Event
                </Button>
            </CardHeader>
            <CardContent>
                 <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                        </DialogHeader>
                        <EventForm
                            event={editingEvent}
                            onFormSubmit={handleFormSubmit}
                            onFormCancel={closeForm}
                        />
                    </DialogContent>
                </Dialog>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.title}</TableCell>
                                    <TableCell>{event.date}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => openForm(event)} aria-label={`Edit ${event.title}`}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" aria-label={`Delete ${event.title}`}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the event "{event.title}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(event.id, event.title)}>
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
};


const AnalyticsOverview = ({ stats, products, isLoading }: { stats: any, products: Product[], isLoading: boolean }) => {
    return (
    <div className="space-y-8">
        <section>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Products" value={stats.totalProducts} icon={Coffee} isLoading={isLoading} />
                <MetricCard title="Customer Reviews" value={stats.totalReviews} icon={Star} isLoading={isLoading} />
                <MetricCard title="Upcoming Events" value={stats.events} icon={Calendar} isLoading={isLoading} />
                <MetricCard title="Blog Posts" value={stats.blogPosts} icon={Newspaper} isLoading={isLoading} />
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
                            <TopProductsTable products={products} isLoading={isLoading} />
                        </div>
                        <div className="h-[300px] md:h-[400px]">
                             <h3 className="font-headline text-lg text-primary mb-2">Roast Distribution</h3>
                            <RoastDistributionChart products={products} isLoading={isLoading} />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 pt-4">
                        <div className="xl:col-span-3 h-[400px]">
                            <h3 className="font-headline text-lg text-primary mb-2">Product Popularity (by Reviews)</h3>
                            <ProductPopularityChart products={products} isLoading={isLoading} />
                        </div>
                        <div className="xl:col-span-2 h-[400px] flex justify-center items-center">
                            <div>
                                <h3 className="font-headline text-lg text-primary mb-2 text-center">Origin Distribution</h3>
                                <OriginDistributionChart products={products} isLoading={isLoading} />
                            </div>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </section>
    </div>
    )
};

const ManageUsersView = ({ currentUser }: { currentUser: User }) => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const refreshUsers = async () => {
        setIsLoading(true);
        try {
            const usersData = await listAllUsers();
            // Filter out the current admin and the super admin
            setUsers(usersData.filter(user => user.email !== currentUser.email && user.email !== SUPER_ADMIN_EMAIL));
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch users.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        refreshUsers();
    }, [currentUser.email, toast]);

    const handleToggleDisabled = async (uid: string, disabled: boolean) => {
        try {
            await updateUserDisabledStatus(uid, !disabled);
            toast({ title: 'User Updated', description: `User has been ${!disabled ? 'disabled' : 'enabled'}.` });
            refreshUsers();
        } catch (error: any) {
            console.error("Failed to update user status:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not update user status.' });
        }
    };

    const handleDeleteUser = async (uid: string) => {
        try {
            await deleteUserAccount(uid);
            toast({ title: 'User Deleted', description: 'User account has been permanently deleted.' });
            refreshUsers();
        } catch (error: any) {
            console.error("Failed to delete user:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not delete user account.' });
        }
    };

    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-64 w-full" />
            </Card>
        );
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <Users /> Manage Users
                </CardTitle>
                <CardDescription>View, enable/disable, and delete user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>UID</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div className="font-medium">{user.displayName || 'N/A'}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{user.uid}</TableCell>
                                    <TableCell>{format(new Date(user.creationTime), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.disabled ? 'destructive' : 'secondary'}>
                                            {user.disabled ? 'Disabled' : 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    {user.disabled ? 'Enable' : 'Disable'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will {user.disabled ? 'enable' : 'disable'} the user account for "{user.email}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleToggleDisabled(user.uid, user.disabled)}>
                                                        Confirm
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the account for "{user.email}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(user.uid)}>
                                                        Delete Permanently
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
};

const SettingsView = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SettingsFormData>({
        resolver: zodResolver(settingsFormSchema),
    });

    useEffect(() => {
        const fetchSettingsData = async () => {
            setIsLoading(true);
            try {
                const settingsData = await getSettings();
                form.reset(settingsData);
            } catch (error) {
                console.error("Failed to load settings:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load website settings.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettingsData();
    }, [form, toast]);

    const onSubmit = async (data: SettingsFormData) => {
        setIsSubmitting(true);
        try {
            await updateSettings(data);
            toast({ title: "Settings Saved!", description: "Your website settings have been updated." });
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            </Card>
        )
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <Settings /> Website Settings
                </CardTitle>
                <CardDescription>
                    Manage your site's contact information and social media links here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card className="p-6 bg-secondary/50">
                            <h3 className="text-lg font-semibold text-primary mb-4">Contact Information</h3>
                             <div className="space-y-4">
                                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="contactAddress" render={({ field }) => (
                                    <FormItem><FormLabel>Physical Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                             </div>
                        </Card>
                        
                        <Card className="p-6 bg-secondary/50">
                             <h3 className="text-lg font-semibold text-primary mb-4">Social Media Links</h3>
                             <div className="space-y-4">
                                <FormField control={form.control} name="socialInstagram" render={({ field }) => (
                                    <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="socialFacebook" render={({ field }) => (
                                    <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="socialTwitter" render={({ field }) => (
                                    <FormItem><FormLabel>Twitter (X) URL</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                             </div>
                        </Card>

                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Save Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const HeroSettingsView = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const form = useForm<HeroFormData>({
        resolver: zodResolver(heroFormSchema),
    });

    useEffect(() => {
        const fetchHeroData = async () => {
            setIsLoading(true);
            try {
                const heroData = await getHeroData();
                form.reset(heroData);
                setImageUrl(heroData.imageUrl);
            } catch (error) {
                console.error("Failed to load hero data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load hero settings.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchHeroData();
    }, [form, toast]);

    const onSubmit = async (data: HeroFormData) => {
        setIsSubmitting(true);
        try {
            await updateHeroData(data);
            toast({ title: "Hero Section Saved!", description: "Your homepage hero has been updated." });
        } catch (error) {
            console.error("Failed to save hero data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save hero settings.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="space-y-4">
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </Card>
        )
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <ImageUp /> Homepage Hero Settings
                </CardTitle>
                <CardDescription>
                    Manage the main image and text on your homepage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                             <Label>Image Preview</Label>
                            <div className="mt-2 w-full aspect-video relative bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                {imageUrl ? (
                                    <Image src={imageUrl} alt="Hero image preview" fill className="object-cover" />
                                ) : (
                                    <span className="text-sm text-muted-foreground">No Image URL</span>
                                )}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image URL</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="https://example.com/your-hero-image.jpg"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setImageUrl(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., A Journey of Indonesian Flavor" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subtitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtitle</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Discover the rich heritage and exquisite taste..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Save Hero Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

const getStatusVariant = (status: string) => {
    switch(status.toLowerCase()) {
        case 'shipped': return 'default';
        case 'delivered': return 'secondary';
        case 'pending': return 'outline';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
}

const ManageOrdersView = ({ onDataChange }: { onDataChange: () => void }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOrderDialogOpen, setOrderDialogOpen] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const ordersData = await getAllOrders();
                setOrders(ordersData);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch orders.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [toast, onDataChange]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        if (!selectedOrder) return;
        setIsSubmitting(true);
        try {
            await updateOrderStatus(orderId, newStatus);
            toast({ title: 'Status Updated', description: `Order ${orderId} is now "${newStatus}".` });
            onDataChange();
            // Optimistically update the selected order in the dialog
            setSelectedOrder(prev => prev ? {...prev, status: newStatus} : null);
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update order status.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-64 w-full" />
            </Card>
        );
    }

    const handleViewClick = (order: Order) => {
        setSelectedOrder(order);
        setOrderDialogOpen(true);
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <ShoppingBag /> Manage Orders
                </CardTitle>
                <CardDescription>View customer orders and update their fulfillment status.</CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isOrderDialogOpen} onOpenChange={setOrderDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">Order Details</DialogTitle>
                            <CardDescription>Order ID: {selectedOrder?.orderId}</CardDescription>
                        </DialogHeader>
                        {selectedOrder && (
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                                <div className="p-4 border rounded-lg bg-secondary/50">
                                    <h3 className="font-semibold mb-2">Customer Info</h3>
                                    <p><strong>Name:</strong> {selectedOrder.customerInfo?.displayName || 'Guest User'}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customerInfo?.email || 'N/A'}</p>
                                    <p><strong>Order Date:</strong> {format(new Date(selectedOrder.orderDate), 'PPP p')}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-secondary/50">
                                    <h3 className="font-semibold mb-2">Items</h3>
                                    {selectedOrder.items.map(item => (
                                        <div key={item.slug} className="flex justify-between items-center py-1">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                    <Separator className="my-2"/>
                                    <div className="flex justify-between items-center font-semibold">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-semibold">
                                        <span>Shipping</span>
                                        <span>{formatCurrency(selectedOrder.shipping)}</span>
                                    </div>
                                     <Separator className="my-2"/>
                                    <div className="flex justify-between items-center font-bold text-lg text-primary">
                                        <span>Total</span>
                                        <span>{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-lg bg-secondary/50">
                                    <h3 className="font-semibold mb-2">Update Status</h3>
                                    <div className="flex items-center gap-2">
                                        <Select 
                                            defaultValue={selectedOrder.status}
                                            onValueChange={(value) => handleStatusChange(selectedOrder.orderId, value as OrderStatus)}
                                        >
                                            <SelectTrigger disabled={isSubmitting}>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                 <DialogClose asChild>
                                    <Button variant="outline" className="w-full">Close</Button>
                                 </DialogClose>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
                                    <TableCell>
                                        <div>{order.customerInfo?.displayName || 'Guest User'}</div>
                                        <div className="text-xs text-muted-foreground">{order.customerInfo?.email}</div>
                                    </TableCell>
                                    <TableCell>{format(new Date(order.orderDate), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="outline" size="sm" onClick={() => handleViewClick(order)}>View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [initialPostToEdit, setInitialPostToEdit] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState({ totalProducts: 0, totalReviews: 0, blogPosts: 0, events: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
        setIsDataLoading(true);
        try {
            const [productsData, blogPostsData, eventsData] = await Promise.all([
                getProducts(),
                getBlogPosts(),
                getEvents()
            ]);
            
            const totalProducts = productsData.length;
            const totalReviews = productsData.reduce((acc, product) => acc + product.reviews, 0);

            setProducts(productsData);
            setStats({
                totalProducts,
                totalReviews,
                blogPosts: blogPostsData.length,
                events: eventsData.length
            });
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsDataLoading(false);
        }
    }
    fetchDashboardData();
  }, [refreshKey]);


  useEffect(() => {
    if (!loading && (!user || !ADMIN_EMAILS.includes(user.email || ''))) {
      router.replace('/');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
      const view = searchParams.get('view') as DashboardView;
      const editPostId = searchParams.get('edit');
      
      if (view) {
        setActiveView(view);
      } else {
        setActiveView('overview');
      }

      if (editPostId) {
          setInitialPostToEdit(editPostId);
          if (view !== 'manageBlog') {
            setActiveView('manageBlog');
          }
      } else {
        setInitialPostToEdit(null);
      }
  }, [searchParams]);

  
  if (loading || !user || !ADMIN_EMAILS.includes(user.email || '')) {
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
            return <AnalyticsOverview stats={stats} products={products} isLoading={isDataLoading} />;
        case 'addProduct':
            return <AddProductView onDataChange={handleDataChange} />;
        case 'addBlog':
            return <AddBlogPostView currentUser={user} onDataChange={handleDataChange} />;
        case 'manageProducts':
            return <ManageProductsView onDataChange={handleDataChange} />;
        case 'manageBlog':
            return <ManageBlogPostsView onDataChange={handleDataChange} initialPostToEdit={initialPostToEdit} />;
        case 'manageEvents':
            return <ManageEventsView onDataChange={handleDataChange} />;
        case 'manageOrders':
            return <ManageOrdersView onDataChange={handleDataChange} />;
        case 'manageUsers':
            return <ManageUsersView currentUser={user} />;
        case 'settings':
            return <SettingsView />;
        case 'heroSettings':
            return <HeroSettingsView />;
        default:
            return <AnalyticsOverview stats={stats} products={products} isLoading={isDataLoading} />;
    }
  }
  
  const sidebarNavItems = [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'manageOrders', label: 'Manage Orders', icon: ShoppingBag },
      { id: 'manageProducts', label: 'Manage Products', icon: ListOrdered },
      { id: 'addProduct', label: 'Add Product', icon: PlusCircle },
      { id: 'manageBlog', label: 'Manage Posts', icon: BookText },
      { id: 'addBlog', label: 'Create Post', icon: FilePlus2 },
      { id: 'manageEvents', label: 'Manage Events', icon: CalendarCheck },
      { id: 'manageUsers', label: 'Manage Users', icon: Users },
      { id: 'heroSettings', label: 'Hero Settings', icon: ImageUp },
      { id: 'settings', label: 'Website Settings', icon: Settings },
  ];

  const handleViewChange = (view: DashboardView) => {
    setActiveView(view);
    setInitialPostToEdit(null); // Reset post-to-edit when explicitly changing views
    router.push('/dashboard?view=' + view, { scroll: false });
    setMobileMenuOpen(false); // Close mobile menu on selection
  }
  
  const SidebarNav = ({ className }: { className?: string }) => (
    <nav className={`flex flex-col space-y-2 ${className}`}>
        {sidebarNavItems.map(item => (
             <Button
                key={item.id}
                variant={activeView === item.id ? 'secondary' : 'ghost'}
                onClick={() => handleViewChange(item.id as DashboardView)}
                className="justify-start text-base px-4 py-6"
             >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
             </Button>
        ))}
    </nav>
  );

  return (
    <div className="bg-secondary/50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Dashboard</h1>
                    <p className="mt-1 text-lg text-foreground/80">Welcome back, {user.displayName}!</p>
                </div>
                 <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild className="md:hidden">
                      <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6"/>
                        <span className="sr-only">Open Menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full max-w-sm p-4">
                        <h2 className="font-headline text-2xl font-bold text-primary mb-4 border-b pb-4">Menu</h2>
                        <SidebarNav />
                    </SheetContent>
                </Sheet>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <aside className="hidden md:block md:col-span-1 sticky top-24">
                    <Card className="shadow-lg bg-background">
                        <CardContent className="p-4">
                            <SidebarNav />
                        </CardContent>
                    </Card>
                </aside>

                <main className="md:col-span-3 space-y-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    </div>
  );
};


export default function DashboardPageWithSuspense() {
    return (
        <DashboardPage />
    );
}
