// src/lib/orders-data.ts
'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { dbAdmin } from './firebase-admin';
import type { CartItem } from '@/context/cart-context';
import type { AppUser } from '@/context/auth-context';

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = {
    userId: string;
    orderId: string;
    orderDate: string; // ISO 8601 string
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
    status: OrderStatus;
    customerInfo?: AppUser; // To be populated after fetching
}

const ordersCollection = dbAdmin?.collection('orders');

export async function addOrder(orderData: Omit<Order, 'id'>) {
    if (!dbAdmin || !ordersCollection) throw new Error("Firestore Admin not initialized.");
    
    // The document ID will be the unique orderId
    const orderRef = ordersCollection.doc(orderData.orderId);
    await orderRef.set(orderData);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    noStore();
    if (!dbAdmin || !ordersCollection) {
        console.error("Firestore Admin is not initialized. Cannot get orders.");
        return [];
    }

    const ordersSnapshot = await ordersCollection.where('userId', '==', userId).orderBy('orderDate', 'desc').get();
    
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);
    return orders;
}

export async function getAllOrders(): Promise<Order[]> {
    noStore();
    // Add a definitive guard clause at the top of the function.
    if (!dbAdmin || !ordersCollection) {
        console.error("Firestore Admin is not initialized. Cannot get all orders.");
        return [];
    }

    const ordersSnapshot = await ordersCollection.orderBy('orderDate', 'desc').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

    // Fetch user info for each order
    const userIds = [...new Set(orders.map(o => o.userId))];
    
    const userRecords = await Promise.all(userIds.map(uid => dbAdmin.auth().getUser(uid).catch(() => null)));
    
    const usersMap = userRecords.reduce((acc, user) => {
        if (user) {
            acc[user.uid] = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                creationTime: user.metadata.creationTime,
                disabled: user.disabled,
            };
        }
        return acc;
    }, {} as Record<string, AppUser>);

    return orders.map(order => ({
        ...order,
        customerInfo: usersMap[order.userId],
    }));
}


export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (!dbAdmin || !ordersCollection) throw new Error("Firestore Admin not initialized.");
    
    const orderRef = ordersCollection.doc(orderId);
    await orderRef.update({ status });
}
