// src/app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts, Product } from '@/lib/products-data';
import { Metadata } from 'next';
import { ProductClientPage } from './client-page';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
        title: `${product.name} - Sehati Kopi`,
        description: product.description,
        images: [
            {
                url: product.image,
                width: 800,
                height: 800,
                alt: product.name,
            }
        ],
    }
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductClientPage product={product} />;
}
