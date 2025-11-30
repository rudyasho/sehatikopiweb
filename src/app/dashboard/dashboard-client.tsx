// src/app/dashboard/dashboard-client.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Menu, LayoutGrid, ShoppingBag, ListOrdered, BookText, 
    CalendarCheck, Star, Users, ImageUp, Settings 
} from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import type { AppUser } from '@/lib/users-data';

type DashboardView = 'overview' | 'manageOrders' | 'manageProducts' | 'manageBlog' | 'manageEvents' | 'manageUsers' | 'manageTestimonials' | 'heroSettings' | 'settings';

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ElementType;
    role?: 'Super Admin';
}

const sidebarNavItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'manageOrders', label: 'Manage Orders', icon: ShoppingBag },
    { id: 'manageProducts', label: 'Manage Products', icon: ListOrdered },
    { id: 'manageBlog', label: 'Manage Posts', icon: BookText },
    { id: 'manageEvents', label: 'Manage Events', icon: CalendarCheck },
    { id: 'manageTestimonials', label: 'Manage Testimonials', icon: Star },
    { id: 'manageUsers', label: 'Manage Users', icon: Users, role: 'Super Admin' },
    { id: 'heroSettings', label: 'Hero Settings', icon: ImageUp },
    { id: 'settings', label: 'Website Settings', icon: Settings },
];

interface DashboardClientPageProps {
    activeView: DashboardView;
    user: AppUser;
    children: React.ReactNode;
}

export function DashboardClientPage({
    activeView,
    user,
    children
}: DashboardClientPageProps) {
    const router = useRouter();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleViewChange = (view: DashboardView) => {
        router.push(`/dashboard?view=${view}`, { scroll: false });
        if (isMobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    }

    const filteredNavItems = sidebarNavItems.filter(item => !item.role || item.role === user.role);

    const SidebarNav = ({ className }: { className?: string }) => (
        <nav className={`flex flex-col space-y-2 ${className}`}>
            {filteredNavItems.map(item => (
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
    
    const activeViewLabel = sidebarNavItems.find(item => item.id === activeView)?.label || 'Dashboard';

    return (
        <div className="bg-secondary/50 min-h-screen">
             <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b md:hidden">
                <div className="container mx-auto px-4 flex items-center justify-between h-16">
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
                     <h1 className="font-headline text-xl font-bold text-primary">{activeViewLabel}</h1>
                     <div className="w-10"></div>
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
                      {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
