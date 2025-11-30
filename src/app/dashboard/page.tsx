// src/app/dashboard/page.tsx
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';

import { getProducts } from '@/lib/products-data';
import { getBlogPostsForAdmin } from '@/lib/blog-data';
import { getEvents } from '@/lib/events-data';
import { getAllOrders } from '@/lib/orders-data';
import { getTestimonials } from '@/lib/testimonials-data';
import { listAllUsers, type AppUser } from '@/lib/users-data';
import { getAuth } from '@/lib/firebase-admin';

import AnalyticsOverview from './analytics-overview';
import ManageOrdersView from './manage-orders-view';
import ManageProductsView from './manage-products-view';
import ManageBlogPostsView from './manage-blog-view';
import ManageEventsView from './manage-events-view';
import ManageUsersView from './manage-users-view';
import HeroSettingsView from './hero-settings-view';
import SettingsView from './settings-view';
import ManageTestimonialsView from './manage-testimonials-view';
import { DashboardClientPage } from './dashboard-client';

type DashboardView = 'overview' | 'manageOrders' | 'manageProducts' | 'manageBlog' | 'manageEvents' | 'manageUsers' | 'manageTestimonials' | 'heroSettings' | 'settings';

// This new Server Component handles data fetching based on the active view
const DashboardViewLoader = async ({ view, currentUser }: { view: DashboardView; currentUser: AppUser }) => {
  noStore();
  
  switch (view) {
    case 'overview':
      return <AnalyticsOverview />;
    case 'manageProducts':
      const products = await getProducts();
      return <ManageProductsView products={products} />;
    case 'manageBlog':
        const posts = await getBlogPostsForAdmin();
        return <ManageBlogPostsView posts={posts} />;
    case 'manageEvents':
        const events = await getEvents();
        return <ManageEventsView events={events} />;
    case 'manageOrders':
        const orders = await getAllOrders();
        return <ManageOrdersView orders={orders} />;
    case 'manageTestimonials':
        const testimonials = await getTestimonials(0, true);
        return <ManageTestimonialsView testimonials={testimonials} />;
    case 'manageUsers':
        if (currentUser.role !== 'Super Admin') return <p>You do not have permission to view this page.</p>;
        const users = await listAllUsers();
        return <ManageUsersView currentUser={currentUser} users={users} />;
    case 'heroSettings':
        return <HeroSettingsView />;
    case 'settings':
        return <SettingsView />;
    default:
      return <AnalyticsOverview />;
  }
};


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { view?: DashboardView };
}) {
    // This is a placeholder for getting the current user's full data on the server.
    // In a real app, you would get this from the session. For now, we simulate it.
    // We can't use the client-side useAuth() hook in a Server Component.
    const authAdmin = getAuth();
    // This is a simplified simulation. In a real app, you'd get the UID from a server-side session
    // and then fetch the user record. We'll pass a mock user for now.
    // A more robust implementation would involve server-side session management.
    const mockUser: AppUser = {
        uid: 'server-user',
        displayName: 'Admin',
        email: 'rd.lapawawoi@gmail.com', // Simulate super admin for now
        role: 'Super Admin',
        disabled: false,
        emailVerified: true
    };
    
    const view = searchParams.view || 'overview';

    return (
        <DashboardClientPage activeView={view} user={mockUser}>
            <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            }>
                <DashboardViewLoader view={view} currentUser={mockUser} />
            </Suspense>
        </DashboardClientPage>
    );
}
