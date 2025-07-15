
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { products } from '@/lib/products-data';
import { useMemo } from 'react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function OriginDistributionChart() {
  const chartData = useMemo(() => {
    const originCounts = products.reduce((acc, product) => {
      const originName = product.origin.split(',')[0]; // Simplify name e.g., "Gayo Highlands, Aceh" -> "Gayo Highlands"
      acc[originName] = (acc[originName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(originCounts).map(([name, value]) => ({ name, value }));
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={400} className="max-w-md">
      <PieChart>
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{
            background: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{paddingTop: 20}}/>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
