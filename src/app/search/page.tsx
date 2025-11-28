// src/app/search/page.tsx
import { SearchClientPage } from './client-page';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/products-data';
import { getBlogPosts } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for your favorite coffee products and insightful blog posts from Sehati Kopi.',
  robots: {
    index: false, // Don't index the search page itself, but follow links
    follow: true,
  }
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const searchTerm = typeof searchParams?.q === 'string' ? searchParams.q : undefined;

    const allProducts = await getProducts();
    const allBlogPosts = await getBlogPosts();

    const filteredProducts = searchTerm
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

    const filteredBlogPosts = searchTerm
    ? allBlogPosts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
    
  return (
    <SearchClientPage 
        initialSearchTerm={searchTerm} 
        products={filteredProducts} 
        blogPosts={filteredBlogPosts}
    />
  );
}
