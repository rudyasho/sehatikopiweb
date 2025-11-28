// src/app/dashboard/settings-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Settings, Save, Loader2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings, type SettingsFormData } from '@/lib/settings-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const settingsFormSchema = z.object({
  siteName: z.string().min(3, "Site name is required."),
  contactPhone: z.string().min(10, "Phone number is required."),
  contactEmail: z.string().email("A valid email is required."),
  contactAddress: z.string().min(10, "Address is required."),
  socialInstagram: z.string().url("A valid Instagram URL is required."),
  socialFacebook: z.string().url("A valid Facebook URL is required."),
  socialTwitter: z.string().url("A valid Twitter/X URL is required."),
});

const SettingsView = () => {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SettingsFormData>({
        resolver: zodResolver(settingsFormSchema),
    });

    useEffect(() => {
        const fetchSettingsData = async () => {
            setIsLoading(true);
            try {
                const settingsData = await getSettings();
                form.reset(settingsData);
            } catch (error) {
                console.error("Failed to load settings:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load website settings.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettingsData();
    }, [form, toast]);

    const onSubmit = async (data: SettingsFormData) => {
        setIsSubmitting(true);
        try {
            await updateSettings(data);
            toast({ title: "Settings Saved!", description: "Your website settings have been updated." });
            router.refresh();
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            </Card>
        )
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                    <Settings /> Website Settings
                </CardTitle>
                <CardDescription>
                    Manage your site's name, contact information and social media links here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card className="p-6 bg-secondary/50">
                            <h3 className="text-lg font-semibold text-primary mb-4">General</h3>
                             <div className="space-y-4">
                                <FormField control={form.control} name="siteName" render={({ field }) => (
                                    <FormItem><FormLabel>Site Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                             </div>
                        </Card>
                        <Card className="p-6 bg-secondary/50">
                            <h3 className="text-lg font-semibold text-primary mb-4">Contact Information</h3>
                             <div className="space-y-4">
                                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="contactAddress" render={({ field }) => (
                                    <FormItem><FormLabel>Physical Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                             </div>
                        </Card>
                        
                        <Card className="p-6 bg-secondary/50">
                             <h3 className="text-lg font-semibold text-primary mb-4">Social Media Links</h3>
                             <div className="space-y-4">
                                <FormField control={form.control} name="socialInstagram" render={({ field }) => (
                                    <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="socialFacebook" render={({ field }) => (
                                    <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="socialTwitter" render={({ field }) => (
                                    <FormItem><FormLabel>Twitter (X) URL</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                             </div>
                        </Card>

                        <Button type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Save Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default SettingsView;
