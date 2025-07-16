
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Product } from '@/lib/products-data';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductPopularityChart({ products, isLoading }: { products: Product[], isLoading: boolean }) {
  const chartData = useMemo(() => {
    if (!products) return [];
    return products.map(product => ({
        name: product.name,
        reviews: product.reviews,
    }));
  }, [products]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
        <YAxis />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Legend />
        <Bar dataKey="reviews" fill="hsl(var(--primary))" name="Number of Reviews" />
      </BarChart>
    </ResponsiveContainer>
  );
}
