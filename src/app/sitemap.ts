import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products-data';
import { getBlogPosts } from '@/lib/blog-data';

const BASE_URL = 'https://sehatikopi.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const blogPosts = await getBlogPosts();

  const staticRoutes = [
    '',
    '/about',
    '/products',
    '/blog',
    '/contact',
    '/menu',
    '/events',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  
  const blogRoutes = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  const otherPublicRoutes = [
      '/cart',
      '/login',
      '/signup',
  ].map(route => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));


  return [...staticRoutes, ...productRoutes, ...blogRoutes, ...otherPublicRoutes];
}
