
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, useEffect } from 'react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const EmptyCart = () => (
    <div className="text-center py-16">
        <ShoppingCart className="mx-auto h-24 w-24 text-foreground/30" />
        <h2 className="mt-6 text-2xl font-semibold">Your Cart is Empty</h2>
        <p className="mt-2 text-foreground/60">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild size="lg" className="mt-6">
            <Link href="/products">Start Shopping</Link>
        </Button>
    </div>
);

const LoadingSpinner = () => (
    <div className="text-center py-16">
        <Loader2 className="mx-auto h-24 w-24 text-primary animate-spin" />
        <h2 className="mt-6 text-2xl font-semibold">Loading Your Cart...</h2>
    </div>
)


export function CartClientPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, shipping, total, clearCart, setLastOrder } = useCart();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCheckout = () => {
    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp Anda
    const message = `Halo Sehati Kopi, saya ingin memesan:\n\n${cart
      .map(item => `${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})`)
      .join('\n')}\n\nSubtotal: ${formatCurrency(subtotal)}\nShipping: ${formatCurrency(shipping)}\n*Total: ${formatCurrency(total)}*\n\nTerima kasih!`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Set the order details for the confirmation page
    setLastOrder({
      items: cart,
      subtotal,
      shipping,
      total,
      orderDate: new Date().toISOString(),
      orderId: `SK-${Date.now()}`
    });

    // Open WhatsApp link
    window.open(whatsappUrl, '_blank');
    
    // Clear the cart
    clearCart();

    // Redirect to success page
    router.push('/checkout/success');
  };


  if (!isClient) {
    return (
        <div className="bg-secondary/50">
            <div className="container mx-auto px-4 py-12">
                 <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Your Shopping Cart</h1>
                </div>
                <LoadingSpinner />
            </div>
        </div>
    )
  }

  if (cart.length === 0) {
    return (
        <div className="bg-secondary/50">
            <div className="container mx-auto px-4 py-12">
                 <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Your Shopping Cart</h1>
                </div>
                <EmptyCart />
            </div>
        </div>
    )
  }

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Your Shopping Cart</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Card className="shadow-lg bg-background">
                <CardContent className="p-6">
                    <div className="space-y-6">
                    {cart.map((item) => (
                        <div key={item.slug} className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                                <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" data-ai-hint={item.aiHint} />
                            </div>
                            <div className="flex-grow">
                                <Link href={`/products/${item.slug}`} className="font-semibold text-lg hover:underline text-primary">{item.name}</Link>
                                <p className="text-foreground/70">{formatCurrency(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.slug, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-4 w-4" /></Button>
                                <Input type="number" value={item.quantity} readOnly className="h-8 w-12 text-center" />
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.slug, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <p className="font-semibold text-lg w-28 text-right hidden sm:block">{formatCurrency(item.price * item.quantity)}</p>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.slug)}>
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Remove item</span>
                            </Button>
                        </div>
                    ))}
                    </div>
                </CardContent>
                 <CardFooter className="p-6 border-t bg-secondary/50">
                    <Link href="/products" className="inline-flex items-center text-primary hover:underline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </CardFooter>
            </Card>
          </div>
          
          <div className="lg:col-span-1 lg:sticky lg:top-24">
             <Card className="shadow-lg bg-background">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{formatCurrency(shipping)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full" onClick={handleCheckout}>Checkout via WhatsApp</Button>
                </CardFooter>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
