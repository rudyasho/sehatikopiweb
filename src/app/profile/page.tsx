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
import { Loader2, Mail, LogOut, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// This is a client-side only page, so we can't export metadata directly.
// In a real-world scenario with server-side rendering, you would export this.
// export const metadata: Metadata = {
//   title: 'My Profile',
//   description: 'View your profile information and order history.',
// };

const mockOrderHistory = [
  { id: 'ORD-2024-001', date: '2024-08-10', total: 255000, status: 'Shipped' },
  { id: 'ORD-2024-002', date: '2024-07-25', total: 135000, status: 'Delivered' },
  { id: 'ORD-2024-003', date: '2024-07-12', total: 140000, status: 'Delivered' },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const getStatusVariant = (status: string) => {
    switch(status.toLowerCase()) {
        case 'shipped': return 'default';
        case 'delivered': return 'secondary';
        case 'pending': return 'outline';
        default: return 'secondary';
    }
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
      router.push('/'); // Redirect to home if not logged in
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
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="person smiling"/>
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
                            <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            <LayoutDashboard /> Dashboard
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
                            {mockOrderHistory.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
