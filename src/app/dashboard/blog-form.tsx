// src/app/dashboard/blog-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';
import { updateBlogPost, addBlogPost, type BlogPost, type NewBlogPostData } from '@/lib/blog-data';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';


const blogPostFormSchema = z.object({
    title: z.string().min(5, "Title is required."),
    category: z.enum(['Brewing Tips', 'Storytelling', 'Coffee Education', 'News']),
    content: z.string().min(50, "Content needs to be at least 50 characters."),
    image: z.string().url("Please provide a valid image URL."),
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

interface BlogPostFormProps {
    post?: BlogPost | null;
    onFormSubmit: () => void;
    onFormCancel: () => void;
}

export function BlogPostForm({ post, onFormSubmit, onFormCancel }: BlogPostFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostFormSchema),
        defaultValues: { 
            title: post?.title || '',
            category: post?.category || 'Coffee Education',
            content: post?.content || '', 
            image: post?.image || '',
        },
    });

    const onSubmit = async (data: BlogPostFormValues) => {
        setIsSubmitting(true);
        try {
            if (post) {
                await updateBlogPost(post.id, data);
                toast({ title: "Post Updated!", description: `"${data.title}" has been updated.` });
            } else {
                await addBlogPost(data as NewBlogPostData);
                toast({ title: "Post Created!", description: `"${data.title}" has been created.` });
            }
            onFormSubmit();
            router.refresh();
        } catch (error) {
            console.error("Failed to submit blog post:", error);
            const errorMessage = error instanceof Error ? error.message : `Could not ${post ? 'update' : 'create'} the post.`;
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
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
                <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Content (Markdown)</FormLabel>
                        <FormControl><Textarea placeholder="Write your post content here..." {...field} rows={12} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <div className="flex justify-end gap-2 !mt-6">
                    <Button type="button" variant="outline" onClick={onFormCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {post ? 'Update Post' : 'Create Post'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
