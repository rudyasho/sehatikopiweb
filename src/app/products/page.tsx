
import type { Metadata } from 'next';
import { ProductsClientPage } from './products-client';

export const metadata: Metadata = {
  title: 'Our Coffee Collection',
  description: 'Explore our hand-picked selection of the finest single-origin Indonesian coffees. From the earthy notes of Aceh Gayo to the fruity aroma of Bali Kintamani, find your perfect brew.',
};

export default function ProductsPage() {
    return <ProductsClientPage />;
}
