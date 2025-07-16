// src/context/cart-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '@/lib/products-data';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('sehati-cart');
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
        localStorage.setItem('sehati-cart', JSON.stringify(cart));
    } catch (e) {
        console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.slug === product.slug);
      if (existingItem) {
        return prevCart.map(item =>
          item.slug === product.slug
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (slug: string) => {
    setCart(prevCart => prevCart.filter(item => item.slug !== slug));
  };

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(slug);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.slug === slug ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 15000 : 0; 
  const total = subtotal + shipping;


  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shipping,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
