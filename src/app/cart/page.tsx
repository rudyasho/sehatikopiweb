import { CartClientPage } from './client-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review the items in your shopping cart, update quantities, and proceed to checkout.',
};

export default function CartPage() {
  return <CartClientPage />;
}
