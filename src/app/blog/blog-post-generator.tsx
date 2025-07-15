
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateBlogPost, type GenerateBlogPostOutput } from '@/ai/flows/blog-post-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Clipboard, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const blogPostSchema = z.object({
  topic: z.string().min(5, 'Please provide a more detailed topic.'),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export function BlogPostGenerator() {
  const [generatedPost, setGeneratedPost] = useState<GenerateBlogPostOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: { topic: '' },
  });

  async function onSubmit(data: BlogPostFormValues) {
    setIsLoading(true);
    setGeneratedPost(null);
    try {
      const result = await generateBlogPost(data.topic);
      setGeneratedPost(result);
      toast({
        title: 'Blog Post Generated!',
        description: 'Your new blog post draft is ready below.',
      });
    } catch (error) {
      console.error('Error generating blog post:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate the blog post. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyToClipboard = () => {
    if (!generatedPost?.content) return;
    navigator.clipboard.writeText(generatedPost.content);
    setHasCopied(true);
    toast({ title: 'Content Copied!' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="mb-12">
      <Card className="bg-background shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Wand2 /> AI Blog Post Generator
          </CardTitle>
          <CardDescription>
            Enter a topic and let our AI create a draft for you. This feature is only visible to logged-in admins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog Post Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The history of coffee in West Java" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Post'
                )}
              </Button>
            </form>
          </Form>

          {isLoading && (
            <div className="text-center p-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">The AI is writing, please wait...</p>
            </div>
          )}

          {generatedPost && (
            <Card className="mt-6 animate-in fade-in-50 duration-500 bg-secondary/50">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">{generatedPost.category}</Badge>
                <CardTitle className="font-headline text-3xl text-primary">{generatedPost.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose lg:prose-xl max-w-none text-foreground/90 prose-headings:text-primary prose-h3:font-headline"
                     dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
                <Button onClick={handleCopyToClipboard} variant="outline" className="mt-6">
                  {hasCopied ? <Check className="mr-2"/> : <Clipboard className="mr-2"/>}
                  Copy HTML Content
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
