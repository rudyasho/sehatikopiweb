// src/components/layout/providers.tsx
'use client';

import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
