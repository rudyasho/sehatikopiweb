
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { getProducts, type Product } from '@/lib/products-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, Newspaper, ShoppingBag } from 'lucide-react';
import { getBlogPosts } from '@/app/blog/page';

type BlogPost = ReturnType<typeof getBlogPosts>[0];

export function SearchClientPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        async function loadData() {
            const fetchedProducts = await getProducts();
            const fetchedBlogPosts = getBlogPosts();
            setProducts(fetchedProducts);
            setBlogPosts(fetchedBlogPosts);
        }
        loadData();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, products]);

    const filteredBlogPosts = useMemo(() => {
        if (!searchTerm) return [];
        return blogPosts.filter(p => 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, blogPosts]);

    const hasResults = filteredProducts.length > 0 || filteredBlogPosts.length > 0;

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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {searchTerm && (
                    <div className="mt-12">
                        {hasResults ? (
                            <div className="space-y-12">
                                {filteredProducts.length > 0 && (
                                    <section>
                                        <h2 className="font-headline text-3xl font-semibold text-primary mb-6 flex items-center gap-3"><ShoppingBag/> Products</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {filteredProducts.map((product) => (
                                                <Card key={product.slug} className="flex flex-col overflow-hidden shadow-lg bg-background">
                                                    <CardHeader className="p-0">
                                                        <Link href={`/products/${product.slug}`}>
                                                            <div className="relative h-52 w-full">
                                                                <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={product.aiHint}/>
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

                                {filteredBlogPosts.length > 0 && (
                                     <section>
                                        <h2 className="font-headline text-3xl font-semibold text-primary mb-6 flex items-center gap-3"><Newspaper/> Blog Articles</h2>
                                        <div className="space-y-6">
                                            {filteredBlogPosts.map((post) => (
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
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <SearchIcon className="mx-auto h-24 w-24 text-foreground/30" />
                                <h2 className="mt-6 text-2xl font-semibold">No Results Found</h2>
                                <p className="mt-2 text-foreground/60">We couldn't find anything matching "{searchTerm}". Please try another search term.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
