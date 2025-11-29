// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Loader2, Mail, LogOut, LayoutDashboard, ShoppingBag, FilePlus2, Star } from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { getOrdersByUserId, type Order } from '@/lib/orders-data';
import { getBlogPosts, type BlogPost } from '@/lib/blog-data';
import { getTestimonials, type Testimonial } from '@/lib/testimonials-data';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BlogPostForm } from '@/app/dashboard/blog-form';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const getStatusVariant = (status: string) => {
    switch(status.toLowerCase()) {
        case 'shipped': return 'default';
        case 'delivered': return 'secondary';
        case 'pending': return 'outline';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
}

const OrderHistory = ({ userId }: { userId: string }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!userId) return;
        
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const userOrders = await getOrdersByUserId(userId);
                setOrders(userOrders);
            } catch (error) {
                console.error("Failed to fetch order history:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not load your order history.',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [userId, toast]);
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading your order history...</p>
            </div>
        )
    }
    
    if (orders.length === 0) {
        return (
             <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-16 w-16 text-foreground/30" />
                <h3 className="mt-4 text-xl font-semibold">No Orders Yet</h3>
                <p className="mt-1 text-foreground/60">Your past orders will appear here.</p>
                <Button asChild size="sm" className="mt-4">
                    <Link href="/products">Start Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.orderId}>
                            <TableCell className="font-medium font-mono text-xs">{order.orderId}</TableCell>
                            <TableCell>{format(new Date(order.orderDate), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

const MyPosts = ({ userId }: { userId: string }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const [isFormOpen, setFormOpen] = useState(false);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const allPosts = await getBlogPosts(true); // show pending for the author
            if (user) {
              setPosts(allPosts.filter(p => p.authorId === user.uid));
            }
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
      if (user) {
        fetchPosts();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    
    if (!user) return null;

    return (
        <div className="space-y-4">
             <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                <DialogTrigger asChild>
                    <Button><FilePlus2 className="mr-2 h-4 w-4"/> Write New Post</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Submit a New Blog Post</DialogTitle>
                        <CardDescription>Your post will be reviewed by an admin before publication.</CardDescription>
                    </DialogHeader>
                    <BlogPostForm
                        post={null} 
                        onFormSubmit={() => {
                            setFormOpen(false);
                            fetchPosts();
                        }}
                        onFormCancel={() => setFormOpen(false)}
                    />
                </DialogContent>
             </Dialog>
            {posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">You haven't written any posts yet.</p>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{format(new Date(post.date), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant={post.status === 'published' ? 'secondary' : 'outline'}>
                                            {post.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
};

const MyTestimonials = ({ userId }: { userId: string }) => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        const fetchTestimonials = async () => {
            setIsLoading(true);
            try {
                const allTestimonials = await getTestimonials(0, true); // fetch all for user
                setTestimonials(allTestimonials.filter(t => t.userId === userId));
            } catch(e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTestimonials();
    }, [userId]);

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

     if (testimonials.length === 0) {
        return <p className="text-center text-muted-foreground py-8">You haven't written any reviews yet.</p>
    }

    return (
        <div className="space-y-4">
            {testimonials.map(item => (
                <Card key={item.id} className="bg-secondary/50">
                    <CardContent className="p-4 flex items-start gap-4">
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                     <Badge variant={item.status === 'published' ? 'secondary' : 'outline'}>
                                        {item.status}
                                    </Badge>
                                    <div className="flex text-amber-500">
                                        {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{item.date ? format(new Date(item.date), 'MMM d, yyyy') : ''}</p>
                            </div>
                            <p className="text-sm mt-2 italic">"{item.review}"</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


const ProfilePage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login'); 
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isUserAdmin = user.role === 'Admin' || user.role === 'Super Admin';

  return (
    <div className="bg-secondary/50 min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl bg-background">
            <CardHeader className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                     <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                            <CardTitle className="font-headline text-4xl text-primary">{user.displayName}</CardTitle>
                            {user.role && user.role !== 'User' && <Badge>{user.role}</Badge>}
                        </div>
                        <CardDescription className="text-lg flex items-center justify-center sm:justify-start gap-2 mt-1 text-muted-foreground">
                            <Mail className="h-4 w-4"/> {user.email}
                        </CardDescription>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2 self-center sm:self-start">
                        {isUserAdmin && (
                            <Button asChild variant="outline">
                               <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                               </Link>
                            </Button>
                        )}
                        <Button variant="outline" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <Separator/>
            <CardContent className="p-6">
                 <Tabs defaultValue="orders">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="orders">Order History</TabsTrigger>
                        <TabsTrigger value="posts">My Posts</TabsTrigger>
                        <TabsTrigger value="testimonials">My Reviews</TabsTrigger>
                    </TabsList>
                    <TabsContent value="orders" className="pt-6">
                        <OrderHistory userId={user.uid} />
                    </TabsContent>
                    <TabsContent value="posts" className="pt-6">
                        <MyPosts userId={user.uid} />
                    </TabsContent>
                    <TabsContent value="testimonials" className="pt-6">
                        <MyTestimonials userId={user.uid} />
                    </TabsContent>
                 </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
