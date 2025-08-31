// src/app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardClientPage } from './client-page';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardLoading = () => (
    <div className="bg-secondary/50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">
            <header className="mb-8">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-6 w-1/4 mt-2" />
            </header>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <aside className="hidden md:block md:col-span-1 sticky top-24">
                     <Skeleton className="h-96 w-full" />
                </aside>
                 <main className="md:col-span-3 space-y-8">
                     <Skeleton className="h-[80vh] w-full" />
                 </main>
            </div>
        </div>
    </div>
);


export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardClientPage />
        </Suspense>
    );
}
