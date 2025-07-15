// src/app/dashboard/page.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, type User } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductPopularityChart } from './product-popularity-chart';
import { Coffee, Star, Calendar, Newspaper, Loader2, PlusCircle, Wand2, Edit, BarChart3, Bot, LayoutGrid, Send, Clipboard, Check, Save, ListOrdered, Trash2, BookText, Image as ImageIcon, FileText, CalendarCheck, Clock, MapPin, CalendarPlus, FilePlus2, Users } from 'lucide-react';
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
import { addBlogPost, getBlogPosts, updateBlogPost, deleteBlogPost, type BlogPost } from '@/lib/blog-data';
import { generateBlogPost, type GenerateBlogPostOutput } from '@/ai/flows/blog-post-generator';
import { generateImage } from '@/ai/flows/image-generator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BlogEditor } from './blog-editor';
import { addEvent, getEvents, updateEvent, deleteEvent, type Event, type EventFormData } from '@/lib/events-data';
import { format } from 'date-fns';
import { listAllUsers, updateUserDisabledStatus, deleteUserAccount, type AppUser } from '@/lib/users-data';


const totalEvents = 3; 
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

type DashboardView = 'overview' | 'addProduct' | 'addBlog' | 'blogGenerator' | 'manageProducts' | 'manageBlog' | 'manageEvents' | 'manageUsers';
export type GeneratedPost = GenerateBlogPostOutput;


const productFormSchema = z.object({
  name: z.string().min(3, "Product name is required."),
  origin: z.string().min(3, "Origin is required."),
  description: z.string().min(10, "Description is required."),
  price: z.coerce.number().min(1, "Price must be greater than 0."),
  roast: z.string().min(3, "Roast level is required."),
  tags: z.string().min(3, "Please add at least one tag, comma separated."),
  image: z.string().min(1, "Image URL is required. You can generate one with AI."),
  aiHint: z.string().min(2, "AI hint is required for image search.")
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const blogGeneratorSchema = z.object({
  topic: z.string().min(5, 'Please provide a more detailed topic.'),
});

type BlogGeneratorFormValues = z.infer<typeof blogGeneratorSchema>;

const blogPostFormSchema = z.object({
    title: z.string().min(5, "Title is required."),
    category: z.enum(['Brewing Tips', 'Storytelling', 'Coffee Education', 'News']),
    content: z.string().min(50, "Content needs to be at least 50 characters.").max(500000, "Content is too long. Please reduce its size."),
    image: z.string().url("Please provide a valid image URL."),
    aiHint: z.string().min(2, "AI hint is required for image search."),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

const eventFormSchema = z.object({
  title: z.string().min(5, "Event title is required."),
  date: z.string().min(10, "Event date is required."),
  time: z.string().min(5, "Event time is required."),
  location: z.string().min(5, "Event location is required."),
  description: z.string().min(10, "Description is required."),
  image: z.string().url("Image URL is required."),
  aiHint: z.string().min(2, "AI hint is required for image search.")
});

type EventFormValues = z.infer<typeof eventFormSchema>;



const MetricCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading?: boolean }) => {
    const [counts, setCounts] = useState({ blogPosts: 0, events: 0});

    useEffect(() => {
        async function fetchCounts() {
            if (title === "Blog Posts" || title === "Upcoming Events") {
                const [posts, events] = await Promise.all([getBlogPosts(), getEvents()]);
                setCounts({ blogPosts: posts.length, events: events.length });
            }
        }
        fetchCounts();
    }, [title]);

    const displayValue = title === "Blog Posts" ? counts.blogPosts : title === "Upcoming Events" ? counts.events : value;

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{displayValue}</div>}
            </CardContent>
        </Card>
    )
};

function BlogGenerator({ currentUser, onPostPublished }: { currentUser: User, onPostPublished: () => void }) {
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [imageState, setImageState] = useState({
      url: 'https://placehold.co/800x450.png',
      prompt: '',
      isLoading: false,
  });

  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const blogTopicForm = useForm<BlogGeneratorFormValues>({
    resolver: zodResolver(blogGeneratorSchema),
    defaultValues: { topic: '' },
  });

  const blogContentForm = useForm<BlogPostFormValues>({
      resolver: zodResolver(blogPostFormSchema),
      defaultValues: { title: '', category: 'News', content: '', image: '', aiHint: ''}
  });
  
  useEffect(() => {
    if (generatedPost) {
        blogContentForm.reset({
            title: generatedPost.title,
            category: generatedPost.category,
            content: generatedPost.content,
            image: imageState.url,
            aiHint: generatedPost.imagePrompt
        });
    }
  }, [generatedPost, blogContentForm, imageState.url]);

  useEffect(() => {
      blogContentForm.setValue('image', imageState.url);
  }, [imageState.url, blogContentForm]);
  
   useEffect(() => {
      blogContentForm.setValue('aiHint', imageState.prompt);
  }, [imageState.prompt, blogContentForm]);


  async function onTopicSubmit(data: BlogGeneratorFormValues) {
    setIsGeneratingText(true);
    setGeneratedPost(null);
    setImageState({ url: 'https://placehold.co/800x450.png', prompt: '', isLoading: false });
    try {
      const result = await generateBlogPost(data.topic);
      setGeneratedPost(result);
      setImageState(prev => ({ ...prev, prompt: result.imagePrompt }));
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate the blog post. Please try again.',
      });
    } finally {
      setIsGeneratingText(false);
    }
  }

  const handleGenerateImage = async () => {
    if (!imageState.prompt) return;
    setImageState(prev => ({...prev, isLoading: true}));
    try {
        const { imageDataUri } = await generateImage(imageState.prompt);
        setImageState(prev => ({...prev, url: imageDataUri}));
    } catch (error) {
        console.error('Error generating image:', error);
        toast({ variant: 'destructive', title: 'Image Generation Failed', description: 'Could not create image. Please try again.' });
    } finally {
        setImageState(prev => ({...prev, isLoading: false}));
    }
  }

  const handlePublish = async (data: BlogPostFormValues) => {
    if (!generatedPost || !currentUser.displayName) return;
    setIsPublishing(true);
    try {
      const newPost = await addBlogPost(data, currentUser.displayName);
      toast({
          title: "Post Published!",
          description: `"${newPost.title}" is now on the blog.`,
          action: (
              <Button variant="outline" size="sm" onClick={() => router.push(`/blog/${newPost.slug}`)}>
                  View Post
              </Button>
          )
      });
      setGeneratedPost(null);
      blogTopicForm.reset();
      blogContentForm.reset();
      setImageState({ url: 'https://placehold.co/800x450.png', prompt: '', isLoading: false });
      onPostPublished();
    } catch (error) {
        console.error("Error publishing post:", error);
        toast({
            variant: 'destructive',
            title: 'Publishing Error',
            description: 'Could not publish the post to the database.'
        });
    } finally {
        setIsPublishing(false);
    }
  };


  return (
    <Card className="shadow-lg bg-background">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
          <Wand2 /> AI Blog Post Generator
        </CardTitle>
        <CardDescription>
          Enter a topic and let our AI create a draft for you. Then manage the content and image before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...blogTopicForm}>
          <form onSubmit={blogTopicForm.handleSubmit(onTopicSubmit)} className="space-y-4">
            <FormField
              control={blogTopicForm.control}
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
            <Button type="submit" disabled={isGeneratingText}>
              {isGeneratingText ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Post Content'
              )}
            </Button>
          </form>
        </Form>

        {isGeneratingText && (
          <div className="text-center p-8">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">The AI is writing, please wait...</p>
          </div>
        )}

        {generatedPost && (
          <Form {...blogContentForm}>
            <form onSubmit={blogContentForm.handleSubmit(handlePublish)}>
              <div className="mt-6 animate-in fade-in-50 duration-500 space-y-6">
                
                <Card className="bg-secondary/50 p-6 space-y-4">
                    <h3 className="font-headline text-xl text-primary mb-2 flex items-center gap-2"><ImageIcon /> Featured Image</h3>
                    <Card className="p-4 bg-background/50">
                        <div className="w-full aspect-video relative bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            {imageState.isLoading ? (
                                 <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                            ) : (
                                <Image src={imageState.url} alt="Blog post featured image" layout="fill" objectFit="cover" />
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                                control={blogContentForm.control}
                                name="image"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image URL</FormLabel>
                                    <FormControl>
                                    <Input 
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setImageState(prev => ({ ...prev, url: e.target.value }))
                                        }}
                                        placeholder="https://example.com/image.png"
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={blogContentForm.control}
                                name="aiHint"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>AI Image Prompt</FormLabel>
                                    <FormControl>
                                    <div className="flex gap-2">
                                        <Input
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setImageState(prev => ({...prev, prompt: e.target.value}))
                                            }}
                                            placeholder="AI prompt for generating an image"
                                        />
                                        <Button type="button" variant="outline" onClick={handleGenerateImage} disabled={imageState.isLoading}>
                                            <Wand2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    </Card>
                </Card>
                  
                <Card className="bg-secondary/50 p-6 space-y-4">
                   <h3 className="font-headline text-xl text-primary mb-2 flex items-center gap-2"><FileText /> Post Content</h3>
                    <div className="space-y-4">
                        <FormField
                            control={blogContentForm.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input {...field} className="text-xl font-bold h-11"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={blogContentForm.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                            )}
                        />
                        <FormField
                            control={blogContentForm.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content (Markdown)</FormLabel>
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
                </Card>

                <Button type="submit" disabled={isPublishing} size="lg">
                   {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2"/>}
                   {isPublishing ? 'Publishing...' : 'Publish to Blog'}
                </Button>

              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}


const ProductForm = ({ product, onFormSubmit, closeDialog }: { product?: Product | null, onFormSubmit: () => void, closeDialog?: () => void }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [imageState, setImageState] = useState({
        url: product?.image || '',
        isLoading: false,
    });
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

    useEffect(() => {
        form.setValue('image', imageState.url);
    }, [imageState.url, form]);
    
    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const url = event.target.value;
        setImageState(prev => ({...prev, url }));
    }

    const handleGenerateImage = async () => {
        const aiHint = form.getValues('aiHint');
        if (!aiHint) {
            form.setError('aiHint', { type: 'manual', message: 'Please provide a hint for the AI.' });
            return;
        }
        setImageState(prev => ({...prev, isLoading: true}));
        try {
            const { imageDataUri } = await generateImage(aiHint);
            setImageState(prev => ({...prev, url: imageDataUri}));
        } catch (error) {
            console.error('Error generating product image:', error);
            toast({ variant: 'destructive', title: 'Image Generation Failed', description: 'Could not create image. Please try again.' });
        } finally {
            setImageState(prev => ({...prev, isLoading: false}));
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
                setImageState({ url: '', isLoading: false });
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
                            {imageState.isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :
                             imageState.url ? (
                                <Image src={imageState.url} alt="Product Preview" layout="fill" objectFit="cover" />
                            ) : (
                                <span className="text-sm text-muted-foreground">Image Preview</span>
                            )}
                            </div>
                        </Card>
                         <FormField control={form.control} name="aiHint" render={({ field }) => (
                            <FormItem>
                                <FormLabel>AI Image Hint</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input placeholder="e.g., coffee cup" {...field} />
                                    <Button type="button" variant="outline" size="icon" onClick={handleGenerateImage} disabled={imageState.isLoading}>
                                      <Wand2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="image" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                    <Input type="url" placeholder="https://example.com/image.png" {...field} onChange={(e) => {field.onChange(e); handleUrlChange(e);}} />
                                </FormControl>
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

const EventForm = ({ event, onFormSubmit, closeDialog, isCreatingNew }: { event?: Event | null, onFormSubmit: () => void, closeDialog: () => void, isCreatingNew: boolean }) => {
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
            aiHint: event?.aiHint || ''
        },
    });

    const onSubmit = async (data: EventFormValues) => {
        setIsSubmitting(true);
        try {
            if (isCreatingNew) {
                await addEvent(data);
                toast({ title: "Event Added!", description: `"${data.title}" has been added.` });
            } else if (event) {
                await updateEvent(event.id, data);
                toast({ title: "Event Updated!", description: `"${data.title}" has been updated.` });
            }
            onFormSubmit();
            closeDialog();
        } catch (error) {
            console.error("Failed to submit event:", error);
            toast({
                variant: 'destructive',
                title: "Error!",
                description: `Could not ${isCreatingNew ? 'add' : 'update'} the event.`,
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
                <FormField control={form.control} name="aiHint" render={({ field }) => (
                    <FormItem>
                        <FormLabel>AI Hint</FormLabel>
                        <FormControl><Input placeholder="e.g., coffee cupping" {...field} /></FormControl>
                        <CardDescription className="text-xs pt-1">Keywords for Unsplash search.</CardDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                 <Button type="submit" size="lg" className="!mt-6 w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCreatingNew ? 'Add Event' : 'Update Event'}
                </Button>
            </form>
        </Form>
    );
};


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

const ManageProductsView = ({ onProductsChanged }: { onProductsChanged: () => void }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchProducts = useCallback(async () => {
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
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (productId: string, productName: string) => {
        try {
            await deleteProduct(productId);
            toast({ title: "Product Deleted", description: `"${productName}" has been removed.` });
            fetchProducts();
            onProductsChanged();
        } catch (error) {
            console.error(`Failed to delete product ${productId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete product.' });
        }
    };

    const handleFormSubmit = () => {
        fetchProducts();
        onProductsChanged();
    }
    
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
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Edit />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-4xl">
                                                <DialogHeader>
                                                    <DialogTitle className="font-headline text-2xl text-primary">Edit Product</DialogTitle>
                                                </DialogHeader>
                                                <ProductForm product={product} onFormSubmit={handleFormSubmit} closeDialog={() => (document.querySelector('[data-radix-dialog-close]') as HTMLElement)?.click()} />
                                            </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 />
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

const BlogPostForm = ({ post, onFormSubmit, closeDialog, isCreatingNew, currentUser }: { post?: BlogPost | null, onFormSubmit: () => void, closeDialog?: () => void, isCreatingNew?: boolean, currentUser?: User | null }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostFormSchema),
        defaultValues: {
            title: post?.title || '',
            category: post?.category || 'Coffee Education',
            content: post?.content || '', 
            image: post?.image || '',
            aiHint: post?.aiHint || '',
        },
    });

    const onSubmit = async (data: BlogPostFormValues) => {
        if (!currentUser?.displayName) {
            toast({ variant: 'destructive', title: "Error", description: "Author name is missing."});
            return;
        }

        setIsSubmitting(true);
        try {
            if (isCreatingNew) {
                await addBlogPost(data, currentUser.displayName);
                toast({ title: "Post Created!", description: `"${data.title}" has been created.` });
                form.reset({ category: 'Coffee Education', title: '', content: '', image: '', aiHint: '' });
            } else if (post) {
                await updateBlogPost(post.id, data);
                toast({ title: "Post Updated!", description: `"${data.title}" has been updated.` });
            }
            onFormSubmit();
            if (closeDialog) closeDialog();
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
                    <FormField control={form.control} name="image" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl><Input type="url" placeholder="https://example.com/image.png" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="aiHint" render={({ field }) => (
                        <FormItem>
                            <FormLabel>AI Hint</FormLabel>
                            <FormControl><Input placeholder="e.g., coffee cup" {...field} /></FormControl>
                             <CardDescription className="text-xs pt-1">Keywords for Unsplash search.</CardDescription>
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
                <Button type="submit" size="lg" className="!mt-8 w-full md:w-auto" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCreatingNew ? 'Create Post' : 'Update Post'}
                </Button>
            </form>
        </Form>
    );
};

const AddBlogPostView = ({ currentUser, onPostAdded }: { currentUser: User, onPostAdded: () => void }) => (
    <Card className="shadow-lg bg-background">
        <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                <FilePlus2 /> Create New Blog Post
            </CardTitle>
            <CardDescription>Manually craft a new article for your blog.</CardDescription>
        </CardHeader>
        <CardContent>
            <BlogPostForm isCreatingNew currentUser={currentUser} onFormSubmit={onPostAdded} />
        </CardContent>
    </Card>
);

const ManageBlogPostsView = ({ onPostsChanged, initialPostToEdit }: { onPostsChanged: () => void, initialPostToEdit?: string | null }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const postsData = await getBlogPosts();
            setPosts(postsData);
            if (initialPostToEdit) {
                const postToEdit = postsData.find(p => p.id === initialPostToEdit);
                if (postToEdit) {
                    setEditingPost(postToEdit);
                }
            }
        } catch (error) {
            console.error("Failed to fetch blog posts for management:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch blog posts.' });
        } finally {
            setIsLoading(false);
        }
    }, [initialPostToEdit, toast]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDelete = async (postId: string, postTitle: string) => {
        try {
            await deleteBlogPost(postId);
            toast({ title: "Post Deleted", description: `"${postTitle}" has been removed.` });
            fetchPosts(); 
            onPostsChanged();
        } catch (error) {
            console.error(`Failed to delete post ${postId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the post.' });
        }
    };

    const handleFormSubmit = () => {
        fetchPosts();
        onPostsChanged();
    }
    
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
                    <BookText /> Manage Blog Posts
                </CardTitle>
                <CardDescription>Edit or delete existing articles from your blog.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                                    <TableCell><Badge variant="secondary">{post.category}</Badge></TableCell>
                                    <TableCell>{post.date ? format(new Date(post.date), "MMM d, yyyy") : 'N/A'}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Dialog open={editingPost?.id === post.id} onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon" onClick={() => setEditingPost(post)}>
                                                    <Edit />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-4xl">
                                                <DialogHeader>
                                                    <DialogTitle className="font-headline text-2xl text-primary">Edit Blog Post</DialogTitle>
                                                </DialogHeader>
                                                 {editingPost && <BlogPostForm post={editingPost} onFormSubmit={handleFormSubmit} closeDialog={() => setEditingPost(null)} />}
                                            </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 />
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

const ManageEventsView = ({ onEventsChanged }: { onEventsChanged: () => void }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const fetchEvents = useCallback(async () => {
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
    }, [toast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleDelete = async (eventId: string, eventTitle: string) => {
        try {
            await deleteEvent(eventId);
            toast({ title: "Event Deleted", description: `"${eventTitle}" has been removed.` });
            onEventsChanged();
            fetchEvents();
        } catch (error) {
            console.error(`Failed to delete event ${eventId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete event.' });
        }
    };

    const handleFormSubmit = () => {
        onEventsChanged();
        fetchEvents();
        setIsFormOpen(false);
        setEditingEvent(null);
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
                <Dialog open={isFormOpen} onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingEvent(null);
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingEvent(null); setIsFormOpen(true); }}>
                           <CalendarPlus /> Add New Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                        </DialogHeader>
                        <EventForm
                            isCreatingNew={!editingEvent}
                            event={editingEvent}
                            onFormSubmit={handleFormSubmit}
                            closeDialog={() => setIsFormOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
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
                                        <Button variant="outline" size="icon" onClick={() => { setEditingEvent(event); setIsFormOpen(true); }}>
                                            <Edit />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 />
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


const AnalyticsOverview = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalReviews: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setIsLoading(true);
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
                <MetricCard title="Upcoming Events" value={0} icon={Calendar} isLoading={isLoading} />
                <MetricCard title="Blog Posts" value={0} icon={Newspaper} isLoading={isLoading} />
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

const ManageUsersView = ({ currentUser }: { currentUser: User }) => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersData = await listAllUsers();
            // Filter out the current admin user from the list
            setUsers(usersData.filter(user => user.uid !== currentUser.uid));
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch users.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, currentUser.uid]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleDisabled = async (uid: string, disabled: boolean) => {
        try {
            await updateUserDisabledStatus(uid, !disabled);
            toast({ title: 'User Updated', description: `User has been ${!disabled ? 'disabled' : 'enabled'}.` });
            fetchUsers();
        } catch (error) {
            console.error("Failed to update user status:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update user status.' });
        }
    };

    const handleDeleteUser = async (uid: string) => {
        try {
            await deleteUserAccount(uid);
            toast({ title: 'User Deleted', description: 'User account has been permanently deleted.' });
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete user account.' });
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


const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [initialPostToEdit, setInitialPostToEdit] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.email !== 'dev@sidepe.com')) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
      const view = searchParams.get('view') as DashboardView;
      const editPostId = searchParams.get('edit');
      
      if (view) {
          setActiveView(view);
      }
      if (editPostId) {
          setInitialPostToEdit(editPostId);
          // Ensure the view is set to manageBlog when an edit is requested
          if (view !== 'manageBlog') {
              setActiveView('manageBlog');
          }
      }
  }, [searchParams]);

  
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/50">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (user.email !== 'dev@sidepe.com') {
    return (
        <div className="flex h-screen items-center justify-center bg-secondary/50">
            <Card className="p-8 text-center">
                <CardTitle className="font-headline text-2xl text-destructive">Access Denied</CardTitle>
                <CardDescription className="mt-2">You do not have permission to view this page.</CardDescription>
                <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
            </Card>
        </div>
    )
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
        case 'addBlog':
            return <AddBlogPostView currentUser={user} onPostAdded={handleDataChange} />;
        case 'blogGenerator':
            return <BlogGenerator currentUser={user} onPostPublished={handleDataChange} />;
        case 'manageProducts':
            return <ManageProductsView onProductsChanged={handleDataChange} />;
        case 'manageBlog':
            return <ManageBlogPostsView onPostsChanged={handleDataChange} initialPostToEdit={initialPostToEdit} />;
        case 'manageEvents':
            return <ManageEventsView onEventsChanged={handleDataChange} />;
        case 'manageUsers':
            return <ManageUsersView currentUser={user} />;
        default:
            return <AnalyticsOverview key={refreshKey} />;
    }
  }
  
  const sidebarNavItems = [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'manageProducts', label: 'Manage Products', icon: ListOrdered },
      { id: 'addProduct', label: 'Add Product', icon: PlusCircle },
      { id: 'manageBlog', label: 'Manage Posts', icon: BookText },
      { id: 'addBlog', label: 'Create Post', icon: FilePlus2 },
      { id: 'manageEvents', label: 'Manage Events', icon: CalendarCheck },
      { id: 'manageUsers', label: 'Manage Users', icon: Users },
      { id: 'blogGenerator', label: 'AI Blog Generator', icon: Bot },
  ];

  return (
    <div className="bg-secondary/50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
            <header className="mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Dashboard</h1>
                <p className="mt-1 text-lg text-foreground/80">Welcome back, {user.displayName}!</p>
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
                                        onClick={() => {
                                            setActiveView(item.id as DashboardView);
                                            // Reset edit state when changing views
                                            setInitialPostToEdit(null);
                                            router.push('/dashboard?view=' + item.id, { scroll: false });
                                        }}
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
                    <Select value={activeView} onValueChange={(value) => {
                        setActiveView(value as DashboardView)
                        setInitialPostToEdit(null);
                        router.push('/dashboard?view=' + value, { scroll: false });
                     }}>
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
