// src/app/dashboard/manage-orders-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';

import { updateOrderStatus, type Order, type OrderStatus } from '@/lib/orders-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

interface ManageOrdersViewProps {
    orders: Order[];
}

const ManageOrdersView = ({ orders: initialOrders }: ManageOrdersViewProps) => {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Store orderId being submitted
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOrderDialogOpen, setOrderDialogOpen] = useState(false);

    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setIsSubmitting(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            toast({ title: 'Status Updated', description: `Order ${orderId} is now "${newStatus}".` });
            
            // This will be updated on router refresh
            router.refresh();
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update order status.' });
        } finally {
            setIsSubmitting(null);
        }
    };
    
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
                                        <Select
                                            value={order.status}
                                            onValueChange={(value) => handleStatusChange(order.orderId, value as OrderStatus)}
                                            disabled={isSubmitting === order.orderId}
                                        >
                                            <SelectTrigger className="w-[120px] mx-auto">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="outline" size="sm" onClick={() => handleViewClick(order)}>View Details</Button>
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

export default ManageOrdersView;
