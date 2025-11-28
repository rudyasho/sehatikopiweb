'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, Newspaper, ShoppingBag, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/products-data';
import type { BlogPost } from '@/lib/blog-data';


interface SearchClientPageProps {
    initialSearchTerm?: string;
    products: Product[];
    blogPosts: BlogPost[];
}


export function SearchClientPage({ initialSearchTerm = '', products, blogPosts }: SearchClientPageProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const [text, setText] = useState(initialSearchTerm);
    const [query] = useDebounce(text, 500); // 500ms debounce
    
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }
        
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });

    }, [query, pathname, replace, searchParams]);

    const hasResults = products.length > 0 || blogPosts.length > 0;
    const hasSearched = !!initialSearchTerm;

    return (
        <div className="bg-secondary/50 min-h-[calc(100vh-8rem)]">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary text-center">Search</h1>
                    <p className="mt-2 text-lg text-foreground/80 text-center">Find products and articles across our site.</p>
                    
                    <div className="relative mt-8">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search for 'Bali Kintamani' or 'V60'..."
                            className="w-full pl-12 h-12 text-lg"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                
                 <div className="mt-12">
                    {isPending ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : hasSearched ? (
                            <div className="space-y-12">
                                {hasResults ? (
                                    <>
                                        {products.length > 0 && (
                                            <section>
                                                <h2 className="font-headline text-3xl font-semibold text-primary mb-6 flex items-center gap-3"><ShoppingBag/> Products</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {products.map((product) => (
                                                        <Card key={product.id} className="flex flex-col overflow-hidden shadow-lg bg-background">
                                                            <CardHeader className="p-0">
                                                                <Link href={`/products/${product.slug}`}>
                                                                    <div className="relative h-52 w-full">
                                                                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                                    </div>
                                                                </Link>
                                                            </CardHeader>
                                                            <CardContent className="p-4 flex-grow">
                                                                <CardTitle className="font-headline text-xl text-primary">{product.name}</CardTitle>
                                                                <CardDescription className="mt-2 text-sm">{product.description.substring(0, 80)}...</CardDescription>
                                                            </CardContent>
                                                            <CardFooter className="p-4 bg-secondary/50">
                                                                <Button asChild className="w-full">
                                                                    <Link href={`/products/${product.slug}`}>View Details</Link>
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {blogPosts.length > 0 && (
                                             <section>
                                                <h2 className="font-headline text-3xl font-semibold text-primary mb-6 flex items-center gap-3"><Newspaper/> Blog Articles</h2>
                                                <div className="space-y-6">
                                                    {blogPosts.map((post) => (
                                                        <Card key={post.slug} className="shadow-lg bg-background">
                                                            <CardContent className="p-6">
                                                                 <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                                                                <Link href={`/blog/${post.slug}`}>
                                                                    <h3 className="font-headline text-2xl text-primary hover:underline">{post.title}</h3>
                                                                </Link>
                                                                <p className="mt-2 text-base text-foreground/80">{post.excerpt}</p>
                                                                 <Button asChild variant="link" className="p-0 h-auto text-primary mt-4">
                                                                    <Link href={`/blog/${post.slug}`}>Read More &rarr;</Link>
                                                                </Button>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </>
                                ) : (
                                     <div className="text-center py-16">
                                        <SearchIcon className="mx-auto h-24 w-24 text-foreground/30" />
                                        <h2 className="mt-6 text-2xl font-semibold">No Results Found</h2>
                                        <p className="mt-2 text-foreground/60">We couldn't find anything matching "{initialSearchTerm}". Please try another search term.</p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                </div>
            </div>
        </div>
    );
}
