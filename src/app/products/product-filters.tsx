
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/lib/products-data';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface Filters {
  roasts: string[];
  origins: string[];
  sort: string;
}

interface ProductFiltersProps {
  onFilterChange: (filters: Filters) => void;
  allProducts: Product[];
}

export function ProductFilters({ onFilterChange, allProducts }: ProductFiltersProps) {
  const [selectedRoasts, setSelectedRoasts] = useState<string[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState('name-asc');
  
  const { allRoasts, allOrigins } = useMemo(() => {
    const roasts = [...new Set(allProducts.map(p => p.roast))];
    const origins = [...new Set(allProducts.map(p => p.origin))];
    return { allRoasts: roasts, allOrigins: origins };
  }, [allProducts]);


  useEffect(() => {
    onFilterChange({
      roasts: selectedRoasts,
      origins: selectedOrigin && selectedOrigin !== 'all' ? [selectedOrigin] : [],
      sort: sortOrder,
    });
  }, [selectedRoasts, selectedOrigin, sortOrder, onFilterChange]);

  const toggleRoast = (roast: string) => {
    setSelectedRoasts(prev =>
      prev.includes(roast) ? prev.filter(r => r !== roast) : [...prev, roast]
    );
  };

  const resetFilters = () => {
    setSelectedRoasts([]);
    setSelectedOrigin('all');
    setSortOrder('name-asc');
  };
  
  const hasActiveFilters = selectedRoasts.length > 0 || selectedOrigin !== 'all';

  return (
    <Card className="mb-8 shadow-md bg-background">
      <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:flex-wrap md:items-center md:justify-between gap-4">
        {/* Roast Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h3 className="font-semibold text-sm flex-shrink-0">Roast Level:</h3>
            <div className="flex flex-wrap gap-2">
            {allRoasts.map(roast => (
                <Button
                key={roast}
                variant={selectedRoasts.includes(roast) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleRoast(roast)}
                >
                {roast}
                </Button>
            ))}
            </div>
        </div>

        {/* Origin & Sort Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 flex-1">
                 <h3 className="font-semibold text-sm">Origin:</h3>
                <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Origins" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Origins</SelectItem>
                        {allOrigins.map(origin => (
                            <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 flex-1">
                 <h3 className="font-semibold text-sm">Sort by:</h3>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name-asc">Name</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="mr-2 h-4 w-4" /> Reset
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
