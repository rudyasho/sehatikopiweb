
// src/app/checkout/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package } from 'lucide-react';
import type { CartItem } from '@/context/cart-context';

interface OrderSummary {
    orderId: string;
    orderDate: string;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
}


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const CheckoutSuccessPage = () => {
  const router = useRouter();
  const [lastOrder, setLastOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('sehati-last-order');
    if (savedOrder) {
      setLastOrder(JSON.parse(savedOrder));
      // Clean up the order from sessionStorage after displaying it
      return () => {
          sessionStorage.removeItem('sehati-last-order');
      }
    } else {
        // If there's no order data, redirect to home.
        router.replace('/');
    }
  }, [router]);

  if (!lastOrder) {
    // Show a loading or empty state while client-side checks are running
    return null;
  }

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl bg-background">
            <CardHeader className="text-center items-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <CardTitle className="font-headline text-4xl text-primary mt-4">Thank You For Your Order!</CardTitle>
                <CardDescription className="text-lg">
                    Your order has been placed. Our team will contact you shortly via WhatsApp to confirm payment and shipping.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 space-y-2">
                    <p><strong>Order ID:</strong> {lastOrder.orderId}</p>
                    <p><strong>Order Date:</strong> {formatDate(lastOrder.orderDate)}</p>
                </div>
                <div>
                  <h3 className="font-headline text-xl text-primary mb-4 flex items-center gap-2"><Package/> Order Summary</h3>
                   <div className="space-y-4">
                        {lastOrder.items.map(item => (
                            <div key={item.slug} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                    <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={item.aiHint}/>
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-foreground/70">{item.quantity} x {formatCurrency(item.price)}</p>
                                </div>
                                <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                   </div>
                </div>
                 <Separator />
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(lastOrder.subtotal)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{formatCurrency(lastOrder.shipping)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg text-primary">
                        <span>Total</span>
                        <span>{formatCurrency(lastOrder.total)}</span>
                    </div>
                </div>
                <Separator/>
                <Button asChild size="lg" className="w-full">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
