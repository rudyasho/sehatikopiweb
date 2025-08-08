'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMenuItems, type MenuItems, type MenuCategory } from '@/lib/menu-data';
import { Skeleton } from '@/components/ui/skeleton';

const MenuSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="flex flex-col overflow-hidden bg-background">
        <Skeleton className="h-52 w-full" />
        <CardContent className="p-4 flex-grow space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 bg-secondary/50">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const Page = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load menu items.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [toast]);

  const handleOrderClick = (itemName: string) => {
    toast({
      title: "Item Added!",
      description: `1x ${itemName}. Please confirm your order at the counter.`,
    });
  };

  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Our Menu</h1>
          <p className="mt-2 text-lg text-foreground/80">Crafted with passion, served with a smile.</p>
        </div>
        <Tabs defaultValue="hot" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto mb-8">
            <TabsTrigger value="hot" className="py-2">Hot Coffee</TabsTrigger>
            <TabsTrigger value="cold" className="py-2">Cold Coffee</TabsTrigger>
            <TabsTrigger value="manual" className="py-2">Manual Brew</TabsTrigger>
            <TabsTrigger value="signature" className="py-2">Signature</TabsTrigger>
          </TabsList>
          {isLoading || !menuItems ? (
            <TabsContent value="hot">
              <MenuSkeleton />
            </TabsContent>
          ) : (
            (Object.keys(menuItems) as MenuCategory[]).map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {menuItems[category].map((item) => (
                    <Card key={item.name} className="flex flex-col overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 bg-background">
                      <CardHeader className="p-0">
                        <div className="relative h-52 w-full">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow">
                        <CardTitle className="font-headline text-xl text-primary">{item.name}</CardTitle>
                        <CardDescription className="mt-2 text-sm">{item.description}</CardDescription>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center p-4 bg-secondary/50">
                        <span className="text-lg font-bold text-primary">{item.price}</span>
                        <Button variant="secondary" onClick={() => handleOrderClick(item.name)}>Order</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
