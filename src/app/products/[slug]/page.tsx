import { notFound } from 'next/navigation';
import { products } from '@/lib/products-data';
import { ProductClientPage } from './client-page';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return <ProductClientPage product={product} />;
}
