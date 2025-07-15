// src/app/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailLogin = async (data: LoginFormValues) => {
    try {
      await loginWithEmail(data.email, data.password);
      router.push('/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Login Failed",
        description: error.message || "An unknown error occurred.",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // The auth context will redirect upon successful login
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: "Google Login Failed",
        description: error.message || "Could not sign in with Google.",
      });
    }
  }

  return (
    <div className="bg-secondary/50 min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl text-primary">Welcome Back</CardTitle>
            <CardDescription>Sign in to your Sehati Kopi account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-6">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">OR</span>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                 <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.5l-63.5 63.5C334.6 97.4 294.8 80 248 80c-82.3 0-149.3 67-149.3 149.3s67 149.3 149.3 149.3c96.1 0 133.3-67.4 137-104.5H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                Continue with Google
            </Button>
            
            <div className="mt-6 text-center text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
