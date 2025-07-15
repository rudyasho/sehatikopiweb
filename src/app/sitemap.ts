
import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products-data';

const BASE_URL = 'https://sehatikopi.id'; // Replace with your actual domain

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getProducts();
  const staticRoutes = [
    '',
    '/about',
    '/products',
    '/blog',
    '/contact',
    '/menu',
    '/events',
    '/cart',
    '/recommendations',
    '/search',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  
  const blogPosts = [
    { slug: 'v60-guide' },
    { slug: 'gayo-journey' },
    { slug: 'processing-methods' },
    { slug: 'single-origin' },
  ];

  const blogRoutes = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const protectedRoutes = [
    '/dashboard',
    '/profile',
  ].map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.1,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes, ...protectedRoutes];
}
