// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    LayoutGrid, ShoppingBag, ListOrdered, BookText, CalendarCheck, 
    Users, ImageUp, Settings, Loader2, Menu, Star
} from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import AnalyticsOverview, { AnalyticsOverviewSkeleton } from './analytics-overview';
import ManageOrdersView from './manage-orders-view';
import ManageProductsView from './manage-products-view';
import ManageBlogPostsView from './manage-blog-view';
import ManageEventsView from './manage-events-view';
import ManageUsersView from './manage-users-view';
import HeroSettingsView from './hero-settings-view';
import SettingsView from './settings-view';
import ManageTestimonialsView from './manage-testimonials-view';
import { getProducts, type Product } from '@/lib/products-data';
import { getBlogPostsForAdmin, type BlogPost } from '@/lib/blog-data';
import { getEvents, type Event } from '@/lib/events-data';
import { getAllOrders, type Order } from '@/lib/orders-data';
import { getTestimonials, type Testimonial } from '@/lib/testimonials-data';
import { listAllUsers, type AppUser } from '@/lib/users-data';

type DashboardView = 'overview' | 'manageOrders' | 'manageProducts' | 'manageBlog' | 'manageEvents' | 'manageUsers' | 'manageTestimonials' | 'heroSettings' | 'settings';


const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/');
    }
  }, [user, loading, router, isAdmin]);
  
  useEffect(() => {
      const view = searchParams.get('view') as DashboardView;
      if (view) {
        setActiveView(view);
      } else {
        setActiveView('overview');
      }
  }, [searchParams]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary/50">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const sidebarNavItems = [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'manageOrders', label: 'Manage Orders', icon: ShoppingBag },
      { id: 'manageProducts', label: 'Manage Products', icon: ListOrdered },
      { id: 'manageBlog', label: 'Manage Posts', icon: BookText },
      { id: 'manageEvents', label: 'Manage Events', icon: CalendarCheck },
      { id: 'manageTestimonials', label: 'Manage Testimonials', icon: Star },
      ...(user.role === 'Super Admin' ? [{ id: 'manageUsers' as const, label: 'Manage Users', icon: Users }] : []),
      { id: 'heroSettings', label: 'Hero Settings', icon: ImageUp },
      { id: 'settings', label: 'Website Settings', icon: Settings },
  ];

  const handleViewChange = (view: DashboardView) => {
    setActiveView(view);
    router.push('/dashboard?view=' + view, { scroll: false });
    if (isMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }
  
  const SidebarNav = ({ className }: { className?: string }) => (
    <nav className={`flex flex-col space-y-2 ${className}`}>
        {sidebarNavItems.map(item => (
             <Button
                key={item.id}
                variant={activeView === item.id ? 'secondary' : 'ghost'}
                onClick={() => handleViewChange(item.id as DashboardView)}
                className="justify-start text-base px-4 py-6"
             >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
             </Button>
        ))}
    </nav>
  );

  return (
    <div className="bg-secondary/50 min-h-screen">
        <header className="sticky top-0 z-40 bg-secondary/50 backdrop-blur-sm border-b md:hidden">
            <div className="container mx-auto px-4 flex items-center justify-between h-16">
                 <h1 className="font-headline text-2xl font-bold text-primary">Dashboard</h1>
                 <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6"/>
                        <span className="sr-only">Open Menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full max-w-sm p-0 flex flex-col">
                         <div className="p-4 border-b">
                            <h2 className="font-headline text-2xl font-bold text-primary">Menu</h2>
                         </div>
                        <SidebarNav className="p-4 flex-grow"/>
                    </SheetContent>
                </Sheet>
            </div>
        </header>

        <div className="container mx-auto px-4 py-8 md:py-12">
            <header className="mb-8 hidden md:block">
                <div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Dashboard</h1>
                    <p className="mt-1 text-lg text-foreground/80">Welcome back, {user.displayName}!</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <aside className="hidden md:block md:col-span-1 sticky top-24">
                    <Card className="shadow-lg bg-background">
                        <CardContent className="p-4">
                            <SidebarNav />
                        </CardContent>
                    </Card>
                </aside>

                <main className="md:col-span-3 space-y-8">
                  <Suspense fallback={<div className="flex h-96 w-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
                     <DashboardViewLoader view={activeView} currentUser={user} />
                  </Suspense>
                </main>
            </div>
        </div>
    </div>
  );
};


// This new Server Component handles data fetching based on the active view
const DashboardViewLoader = async ({ view, currentUser }: { view: DashboardView; currentUser: AppUser }) => {
  switch (view) {
    case 'manageOrders': {
      const orders = await getAllOrders();
      return <ManageOrdersView orders={orders} />;
    }
    case 'manageProducts': {
      const products = await getProducts();
      return <ManageProductsView products={products} />;
    }
    case 'manageBlog': {
      const posts = await getBlogPostsForAdmin(); // Fetch all statuses for admin
      return <ManageBlogPostsView posts={posts} />;
    }
    case 'manageEvents': {
      const events = await getEvents();
      return <ManageEventsView events={events} />;
    }
    case 'manageTestimonials': {
      const testimonials = await getTestimonials(0, true);
      return <ManageTestimonialsView testimonials={testimonials} />;
    }
    case 'manageUsers': {
      if (currentUser.role !== 'Super Admin') {
        return <p>You do not have permission to view this page.</p>;
      }
      const users = await listAllUsers();
      return <ManageUsersView currentUser={currentUser} users={users} />;
    }
    case 'heroSettings': {
      return <HeroSettingsView />;
    }
    case 'settings': {
      return <SettingsView />;
    }
    case 'overview':
    default: {
      return <AnalyticsOverview />;
    }
  }
};


export default function DashboardPageWithSuspense() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-secondary/50"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <DashboardPage />
        </Suspense>
    );
}
