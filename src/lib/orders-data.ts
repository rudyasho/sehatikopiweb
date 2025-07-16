
// src/lib/orders-data.ts
'use server';

import { dbAdmin } from './firebase-admin';
import type { CartItem } from '@/context/cart-context';

export type Order = {
    userId: string;
    orderId: string;
    orderDate: string; // ISO 8601 string
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const ordersCollection = dbAdmin?.collection('orders');

export async function addOrder(orderData: Omit<Order, 'id'>) {
    if (!dbAdmin || !ordersCollection) throw new Error("Firestore Admin not initialized.");
    
    // The document ID will be the unique orderId
    const orderRef = ordersCollection.doc(orderData.orderId);
    await orderRef.set(orderData);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    if (!dbAdmin || !ordersCollection) {
        console.error("Firestore Admin is not initialized. Cannot get orders.");
        return [];
    }

    const ordersSnapshot = await ordersCollection.where('userId', '==', userId).get();
    
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

    // Sort by date descending
    orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return orders;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    if (!dbAdmin || !ordersCollection) throw new Error("Firestore Admin not initialized.");
    
    const orderRef = ordersCollection.doc(orderId);
    await orderRef.update({ status });
}
