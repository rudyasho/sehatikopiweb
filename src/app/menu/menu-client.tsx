// src/app/menu/menu-client.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function MenuClient({ itemName }: { itemName: string }) {
    const { toast } = useToast();
    
    const handleOrderClick = () => {
        toast({
        title: "Item Added!",
        description: `1x ${itemName}. Please confirm your order at the counter.`,
        });
    };

    return (
        <Button variant="secondary" onClick={handleOrderClick}>Order</Button>
    )
}
