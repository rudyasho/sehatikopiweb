// src/app/dashboard/add-user-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';
import { createUser, type CreateUserFormData } from '@/lib/users-data';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const userFormSchema = z.object({
  displayName: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

interface AddUserFormProps {
    onFormSubmit: () => void;
    onFormCancel: () => void;
}

export function AddUserForm({ onFormSubmit, onFormCancel }: AddUserFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateUserFormData>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            displayName: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: CreateUserFormData) => {
        setIsSubmitting(true);
        try {
            await createUser(data);
            toast({
                title: "User Created!",
                description: `Account for ${data.email} has been created successfully.`,
            });
            onFormSubmit();
            router.refresh();
        } catch (error: any) {
            console.error("Failed to create user:", error);
            toast({
                variant: 'destructive',
                title: "Creation Failed!",
                description: error.message || 'Could not create the new user account.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="displayName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex justify-end gap-2 !mt-6">
                    <Button type="button" variant="outline" onClick={onFormCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create User
                    </Button>
                </div>
            </form>
        </Form>
    );
};
