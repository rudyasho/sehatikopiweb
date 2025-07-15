
import { SearchClientPage } from './client-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for your favorite coffee products and insightful blog posts from Sehati Kopi.',
  robots: {
    index: false, // Don't index the search page itself, but follow links
    follow: true,
  }
};

export default function SearchPage() {
  return <SearchClientPage />;
}
