// src/app/signup/page.tsx
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
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';


const signUpFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export default function SignUpPage() {
  const { signUpWithEmail, loginWithGoogle, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleEmailSignUp = async (data: SignUpFormValues) => {
    try {
      await signUpWithEmail(data.email, data.password, data.name);
      toast({
          title: "Account Created!",
          description: "Welcome to Sehati Kopi. You are now logged in.",
      });
      router.push('/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Sign Up Failed",
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
        title: "Google Sign-In Failed",
        description: error.message || "Could not sign in with Google.",
      });
    }
  }

  return (
    <div className="bg-secondary/50 min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl text-primary">Create an Account</CardTitle>
            <CardDescription>Join the Sehati Kopi community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEmailSignUp)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Budi Santoso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  Create Account
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">OR</span>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.5l-63.5 63.5C334.6 97.4 294.8 80 248 80c-82.3 0-149.3 67-149.3 149.3s67 149.3 149.3 149.3c96.1 0 133.3-67.4 137-104.5H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                Sign up with Google
            </Button>
            
            <div className="mt-6 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Login
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
