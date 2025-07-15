// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Mail, LogOut } from 'lucide-react';
import type { Metadata } from 'next';

// This is client-side metadata. For a full implementation, you'd fetch this.
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

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl bg-background">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-6">
               <Avatar className="h-24 w-24 border-4 border-primary">
                  <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person smiling"/>
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <CardTitle className="font-headline text-4xl text-primary">{user.name}</CardTitle>
                  <CardDescription className="text-lg flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4"/> {user.email}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => {logout(); router.push('/');}}>
                  <LogOut className="mr-2"/> Logout
                </Button>
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
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockOrderHistory.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>{order.status}</TableCell>
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
