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
  userId: string | null; // Null jika guest user
  orderId: string;
  orderDate: string; // ISO 8601 string
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  customerInfo?: AppUser; // Opsional
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
// Get Orders by User ID (login / guest)
// -----------------------------

export async function getOrdersByUserId(userId: string | null): Promise<Order[]> {
  noStore();

  if (!dbAdmin) {
    console.error('Firestore Admin is not initialized. Cannot get orders.');
    return [];
  }

  try {
    const ordersCollection = dbAdmin.collection('orders');

    // Jika guest (null), ambil order tanpa userId
    let query;
    if (userId) {
      query = ordersCollection.where('userId', '==', userId);
    } else {
      query = ordersCollection.where('userId', '==', null);
    }

    const ordersSnapshot = await query.orderBy('orderDate', 'desc').get();

    return ordersSnapshot.docs.map((doc) => doc.data() as Order);
  } catch (error) {
    console.error('Error fetching orders by user ID:', error);
    return [];
  }
}

// -----------------------------
// Get All Orders (with User Info if available)
// -----------------------------

export async function getAllOrders(): Promise<Order[]> {
  noStore();

  if (!dbAdmin) {
    throw new Error('Database admin instance is not initialized.');
  }

  const ordersCollection = dbAdmin.collection('orders');

  try {
    const ordersSnapshot = await ordersCollection
      .orderBy('orderDate', 'desc')
      .get();

    const orders = ordersSnapshot.docs.map((doc) => ({
      ...doc.data(),
      orderId: doc.id,
    })) as Order[];

    // Ambil hanya userId valid (bukan null)
    const userIds = [
      ...new Set(orders.map((o) => o.userId).filter((id): id is string => !!id)),
    ];

    if (userIds.length === 0) return orders;

    // Ambil info user
    const userRecords = await Promise.all(
      userIds.map((uid) =>
        dbAdmin
          .auth()
          .getUser(uid)
          .catch(() => null) // kalau error (misal user sudah dihapus), abaikan
      )
    );

    const usersMap = userRecords.reduce((acc, user) => {
      if (user) {
        acc[user.uid] = {
          uid: user.uid,
          email: user.email || 'N/A',
          displayName: user.displayName || 'Guest',
          creationTime: user.metadata.creationTime,
          disabled: user.disabled,
        };
      }
      return acc;
    }, {} as Record<string, AppUser>);

    return orders.map((order) => ({
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

  const ordersCollection = dbAdmin.collection('orders');

  try {
    const orderRef = ordersCollection.doc(orderId);
    await orderRef.update({ status });
    console.log(`Order ${orderId} status updated to ${status}.`);
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw new Error('Failed to update order status.');
  }
}
