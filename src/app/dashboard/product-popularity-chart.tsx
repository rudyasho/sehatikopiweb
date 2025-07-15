
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProducts, Product } from '@/lib/products-data';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductPopularityChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        try {
            const products = await getProducts();
            setChartData(products.map(product => ({
                name: product.name,
                reviews: product.reviews,
            })));
        } catch (error) {
            console.error("Failed to fetch product data for chart:", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

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
