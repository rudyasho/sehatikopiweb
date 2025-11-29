// src/app/dashboard/manage-blog-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BookText, FilePlus2, Edit, Trash2 } from 'lucide-react';

import { getBlogPosts, deleteBlogPost, type BlogPost } from '@/lib/blog-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BlogPostForm } from './blog-form';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const ManageBlogPostsView = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

    const fetchAndSetPosts = async () => {
        setIsLoading(true);
        try {
            const postsData = await getBlogPosts(true); // Fetch all posts including pending
            setPosts(postsData);
        } catch (error) {
            console.error("Failed to fetch blog posts for management:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch blog posts.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAndSetPosts();
    }, []);

    const handleDelete = async (postId: string, postTitle: string) => {
        try {
            await deleteBlogPost(postId);
            toast({ title: "Post Deleted", description: `"${postTitle}" has been removed.` });
            fetchAndSetPosts();
            router.refresh();
        } catch (error) {
            console.error(`Failed to delete post ${postId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the post.' });
        }
    };
    
    const openDialog = (post: BlogPost | null) => {
        setEditingPost(post);
        setIsPostDialogOpen(true);
    };

    const closeDialog = () => {
        setEditingPost(null);
        setIsPostDialogOpen(false);
    }
    
    const handleFormSubmit = () => {
        closeDialog();
        fetchAndSetPosts();
        router.refresh();
    };

    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-64 w-full" />
            </Card>
        )
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                        <BookText /> Manage Blog Posts
                    </CardTitle>
                    <CardDescription>Create, edit, or delete your blog articles.</CardDescription>
                </div>
                <Button onClick={() => openDialog(null)}>
                    <FilePlus2 className="mr-2 h-4 w-4" /> Create New Post
                </Button>
            </CardHeader>
            <CardContent>
                <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                    <DialogContent className="max-w-4xl">
                         <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">{editingPost ? 'Edit Blog Post' : 'Create New Post'}</DialogTitle>
                            <DialogDescription>
                                {editingPost ? 'Update the details of this post.' : 'Create a new article for your blog.'}
                            </DialogDescription>
                         </DialogHeader>
                         <BlogPostForm 
                            post={editingPost} 
                            onFormSubmit={handleFormSubmit}
                            onFormCancel={closeDialog}
                        />
                    </DialogContent>
                </Dialog>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{post.category}</TableCell>
                                    <TableCell>{post.date ? format(new Date(post.date), "MMM d, yyyy") : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={post.status === 'published' ? 'secondary' : 'outline'}>{post.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => openDialog(post)} aria-label={`Edit ${post.title}`}>
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

export default ManageBlogPostsView;
