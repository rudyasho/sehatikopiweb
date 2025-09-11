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
  userId: string | null; // Allow null for guest users
  orderId: string;
  orderDate: string; // ISO 8601 string
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  customerInfo?: AppUser; // Populated after fetching
};

// -----------------------------
// Firestore Collection Ref
// -----------------------------

const ordersCollection = dbAdmin?.collection('orders');

// -----------------------------
// Add New Order
// -----------------------------

export async function addOrder(orderData: Omit<Order, 'customerInfo'>) {
  if (!dbAdmin || !ordersCollection) {
    throw new Error('Firestore Admin not initialized.');
  }

  const orderRef = ordersCollection.doc(orderData.orderId);
  await orderRef.set(orderData);
}

// -----------------------------
// Get Orders by User ID
// -----------------------------

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  noStore();

  if (!dbAdmin || !ordersCollection) {
    console.error('Firestore Admin is not initialized. Cannot get orders.');
    return [];
  }

  const ordersSnapshot = await ordersCollection
    .where('userId', '==', userId)
    .orderBy('orderDate', 'desc')
    .get();

  return ordersSnapshot.docs.map((doc) => doc.data() as Order);
}

// -----------------------------
// Get All Orders (with User Info)
// -----------------------------

export async function getAllOrders(): Promise<Order[]> {
  noStore();

  if (!dbAdmin) {
    throw new Error('Firestore Admin not initialized.');
  }
  
  const ordersCollection = dbAdmin.collection('orders');
  const ordersSnapshot = await ordersCollection.orderBy('orderDate', 'desc').get();
  const orders = ordersSnapshot.docs.map((doc) => doc.data() as Order);

  // Collect unique userIds (exclude null)
  const userIds = [...new Set(orders.map((o) => o.userId).filter((id): id is string => !!id))];

  if (userIds.length === 0) return orders;

  const userRecords = await Promise.all(
    userIds.map((uid) =>
      dbAdmin.auth().getUser(uid).catch(() => null)
    )
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

  return orders.map((order) => ({
    ...order,
    customerInfo: order.userId ? usersMap[order.userId] : undefined,
  }));
}

// -----------------------------
// Update Order Status
// -----------------------------

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!dbAdmin || !ordersCollection) {
    throw new Error('Firestore Admin not initialized.');
  }

  const orderRef = ordersCollection.doc(orderId);
  await orderRef.update({ status });
}
