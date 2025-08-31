
// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, ADMIN_EMAILS } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getOrdersByUserId, type Order } from '@/lib/orders-data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

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
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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


const ProfilePage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login'); 
    }
  }, [user, loading, router]);

  if (loading || !isClient || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const isUserAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  return (
    <div className="bg-secondary/50">
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
                            {isUserAdmin && <Badge>Admin</Badge>}
                        </div>
                        <CardDescription className="text-lg flex items-center justify-center sm:justify-start gap-2 mt-1 text-muted-foreground">
                            <Mail className="h-4 w-4"/> {user.email}
                        </CardDescription>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2 self-center sm:self-start">
                        {isUserAdmin && (
                            <Button asChild variant="outline">
                               <Link href="/dashboard">
                                <LayoutDashboard /> Dashboard
                               </Link>
                            </Button>
                        )}
                        <Button variant="outline" onClick={logout}>
                            <LogOut/> Logout
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <Separator/>
            <CardContent className="p-6">
                <h3 className="font-headline text-2xl text-primary mb-4">Order History</h3>
                <OrderHistory userId={user.uid} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
