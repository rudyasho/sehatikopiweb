import type { Metadata } from 'next';
import { ProductsClientPage } from './products-client';
import { getProducts } from '@/lib/products-data';

export const metadata: Metadata = {
  title: 'Jual Biji Kopi Arabika & Robusta Specialty',
  description: 'Jelajahi dan beli koleksi biji kopi arabika dan robusta single-origin terbaik dari Indonesia. Dari Aceh Gayo yang bersahaja hingga Bali Kintamani yang fruity, temukan kopi specialty sempurna Anda.',
};

export default async function ProductsPage() {
    const products = await getProducts();
    return <ProductsClientPage initialProducts={products} />;
}
