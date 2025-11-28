// src/lib/orders-data.ts
'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { dbAdmin } from './firebase-admin';

import type { CartItem } from '@/context/cart-context';
import type { AppUser } from '@/context/auth-context';

// -----------------------------
// Types
// -----------------------------

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
  customerInfo?: AppUser; // Populated server-side for the admin view
};

// -----------------------------
// Add New Order
// -----------------------------

export async function addOrder(orderData: Omit<Order, 'customerInfo'>) {
  if (!dbAdmin) {
    throw new Error('Firestore Admin not initialized.');
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

// -----------------------------
// Get Orders by User ID
// -----------------------------
/**
 * Fetches all orders belonging to a specific user.
 * @param userId - The UID of the user whose orders are to be fetched.
 * @returns A promise that resolves to an array of orders.
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  noStore();
  if (!dbAdmin) {
    console.error('Firestore Admin is not initialized. Cannot get orders.');
    return [];
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

// -----------------------------
// Get All Orders (for Admin Dashboard)
// -----------------------------

export async function getAllOrders(): Promise<Order[]> {
  noStore();
  if (!dbAdmin) {
    throw new Error('Database admin instance is not initialized.');
  }

  const ordersCollection = dbAdmin.collection('orders');

  try {
    const ordersSnapshot = await ordersCollection.orderBy('orderDate', 'desc').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Omit<Order, 'customerInfo'>);

    const userIds = [...new Set(orders.map(o => o.userId).filter((id): id is string => !!id))];
    if (userIds.length === 0) {
        // Return orders with guest user info structure
        return orders.map(order => ({ ...order, customerInfo: undefined }));
    }

    const userRecords = await Promise.all(
      userIds.map(uid => dbAdmin.auth().getUser(uid).catch(() => null))
    );

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
      customerInfo: order.userId ? usersMap[order.userId] : undefined,
    }));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
}

// -----------------------------
// Update Order Status
// -----------------------------

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!dbAdmin) {
    throw new Error('Firestore Admin not initialized.');
  }
  const orderRef = dbAdmin.collection('orders').doc(orderId);
  
  try {
    await orderRef.update({ status });
    console.log(`Order ${orderId} status updated to ${status}.`);
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw new Error('Failed to update order status.');
  }
}
