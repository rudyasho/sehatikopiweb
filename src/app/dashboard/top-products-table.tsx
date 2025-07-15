
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { products } from '@/lib/products-data';
import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export function TopProductsTable() {
  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 5);
  }, []);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Rating</TableHead>
            <TableHead className="text-center">Reviews</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topProducts.map((product) => (
            <TableRow key={product.slug}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="gap-1 pl-2 pr-2.5">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                  {product.rating.toFixed(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{product.reviews}</TableCell>
              <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
