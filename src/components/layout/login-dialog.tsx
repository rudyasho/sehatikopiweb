// src/components/layout/login-dialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginDialogProps {
  onLoginSuccess?: () => void;
  isMobile?: boolean;
}

export function LoginDialog({ onLoginSuccess, isMobile = false }: LoginDialogProps) {
  const [open, setOpen] = useState(false);
  const { login, loading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
    toast({
      title: 'Login Successful',
      description: 'Welcome back!',
    });
    setOpen(false);
    form.reset();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const TriggerButton = isMobile ? (
    <Button className="w-full justify-start text-lg p-6">
      <LogIn className="mr-3 h-5 w-5" />
      Login
    </Button>
  ) : (
    <Button>
      <LogIn className="mr-2" />
      Login
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Login to Your Account</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your profile and order history.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full !mt-6" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Login'}
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-2">
              Note: This is a demo. Any email/password will work.
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
