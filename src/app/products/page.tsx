
import type { Metadata } from 'next';
import { ProductsClientPage } from './products-client';

export const metadata: Metadata = {
  title: 'Jual Biji Kopi Arabika & Robusta',
  description: 'Jelajahi dan beli koleksi biji kopi arabika dan robusta single-origin terbaik dari Indonesia. Dari Aceh Gayo yang bersahaja hingga Bali Kintamani yang fruity, temukan minuman sempurna Anda.',
};

export default function ProductsPage() {
    return <ProductsClientPage />;
}
