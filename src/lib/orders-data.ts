// src/lib/orders-data.ts
'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { dbAdmin, authAdmin } from './firebase-admin';
import type { CartItem } from '@/context/cart-context';
import type { AppUser } from '@/context/auth-context';

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export type Order = {
  userId: string | null;
  orderId: string;
  orderDate: string; // ISO 8601 string
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  customerInfo?: Partial<AppUser>; // Populated server-side for the admin view
};


export async function addOrder(orderData: Omit<Order, 'customerInfo'>) {
  if (!dbAdmin) {
    throw new Error('Firestore Admin not initialized. Cannot add order.');
  }

  const ordersCollection = dbAdmin.collection('orders');
  const orderRef = ordersCollection.doc(orderData.orderId);

  try {
    await orderRef.set(orderData);
    console.log(`Order ${orderData.orderId} successfully added.`);
  } catch (error) {
    console.error(`Error adding order ${orderData.orderId}: `, error);
    throw new Error('Failed to add new order.');
  }
}


export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  noStore();
  if (!dbAdmin) {
    throw new Error('Firestore Admin is not initialized. Cannot get orders.');
  }
  
  try {
    const ordersSnapshot = await dbAdmin.collection('orders')
      .where('userId', '==', userId)
      .orderBy('orderDate', 'desc')
      .get();
    
    return ordersSnapshot.docs.map(doc => doc.data() as Order);
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    return [];
  }
}


export async function getAllOrders(): Promise<Order[]> {
  noStore();
  if (!dbAdmin) {
    throw new Error('Database admin instance is not initialized.');
  }

  try {
    const ordersSnapshot = await dbAdmin.collection('orders').orderBy('orderDate', 'desc').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Omit<Order, 'customerInfo'>);

    const userIds = [...new Set(orders.map(o => o.userId).filter((id): id is string => !!id))];
    if (userIds.length === 0) {
        return orders.map(order => ({ ...order, customerInfo: undefined }));
    }

    if (!authAdmin) {
        console.warn("Auth Admin not available, cannot fetch user info for orders.");
        return orders.map(order => ({ ...order, customerInfo: undefined }));
    }

    // Note: listUsers is more efficient for larger sets of UIDs if available/needed.
    // For smaller batches, individual lookups are fine.
    const userRecords = await Promise.all(
      userIds.map(uid => authAdmin.getUser(uid).catch(() => null))
    );

    const usersMap = userRecords.reduce((acc, user) => {
      if (user) {
        acc[user.uid] = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        };
      }
      return acc;
    }, {} as Record<string, Partial<AppUser>>);

    return orders.map(order => ({
      ...order,
      customerInfo: order.userId ? usersMap[order.userId] : undefined,
    }));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
}


export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!dbAdmin) {
    throw new Error('Firestore Admin not initialized. Cannot update status.');
  }
  const orderRef = dbAdmin.collection('orders').doc(orderId);
  
  try {
    await orderRef.update({ status });
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw new Error('Failed to update order status.');
  }
}
