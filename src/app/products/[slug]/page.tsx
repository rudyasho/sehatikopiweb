// src/app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts, Product } from '@/lib/products-data';
import { Metadata, ResolvingMetadata } from 'next';
import { ProductClientPage } from './client-page';
import { getSettings } from '@/lib/settings-data';
import { getTestimonials } from '@/lib/testimonials-data';
import { ReviewsSection } from './reviews-section';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  const settings = await getSettings();

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const title = `Jual ${product.name} - Biji Kopi Arabika Specialty`;
  const description = `Beli biji kopi ${product.name} dari ${product.origin}. ${product.description.substring(0, 120)}... disangrai oleh ${settings.siteName}.`;

  return {
    title: title,
    description: description,
    openGraph: {
        title: title,
        description: description,
        url: `https://sehatikopi.id/products/${product.slug}`,
        images: [
            {
                url: product.image,
                width: 800,
                height: 800,
                alt: product.name,
            }
        ],
        type: 'article',
        siteName: settings.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [product.image],
    }
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const reviews = await getTestimonials(10); // Fetch more for reviews section

  return (
      <>
        <ProductClientPage product={product} />
        <ReviewsSection initialReviews={reviews} productName={product.name} />
      </>
  );
}
