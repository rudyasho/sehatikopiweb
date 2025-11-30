// src/app/dashboard/manage-blog-view.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { BookText, FilePlus2, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { deleteBlogPost, updateBlogPost, type BlogPost } from '@/lib/blog-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BlogPostForm } from './blog-form';
import { Badge } from '@/components/ui/badge';

interface ManageBlogPostsViewProps {
    posts: BlogPost[];
}

const ManageBlogPostsView = ({ posts }: ManageBlogPostsViewProps) => {
    const { toast } = useToast();
    const router = useRouter();

    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);


    const handleDelete = async (postId: string, postTitle: string) => {
        try {
            await deleteBlogPost(postId);
            toast({ title: "Post Deleted", description: `"${postTitle}" has been removed.` });
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
        router.refresh();
    };
    
    const handlePublishToggle = async (post: BlogPost) => {
        const newStatus = post.status === 'published' ? 'pending' : 'published';
        try {
            await updateBlogPost(post.id, { status: newStatus });
            toast({ title: "Status Updated", description: `"${post.title}" has been ${newStatus}.` });
            router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update post status.' });
        }
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
                    <DialogContent className="max-w-6xl w-full">
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
                                        {post.status !== 'published' && (
                                            <Button variant="secondary" size="sm" onClick={() => handlePublishToggle(post)}>
                                                Publish
                                            </Button>
                                        )}
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
