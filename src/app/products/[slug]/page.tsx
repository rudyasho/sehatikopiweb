import { notFound } from 'next/navigation';
import { products } from '@/lib/products-data';
import { ProductClientPage } from './client-page';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }
  
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.name,
    description: product.description.substring(0, 160), // Keep it concise for meta description
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [product.image, ...previousImages],
    },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Sehati Kopi',
    },
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      url: `https://sehatikopi.id/products/${product.slug}`, // Replace with your domain
      priceCurrency: 'IDR',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClientPage product={product} />
    </>
  );
}
