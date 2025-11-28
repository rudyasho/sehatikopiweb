// src/app/dashboard/manage-products-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ListOrdered, PlusCircle, Edit, Trash2 } from 'lucide-react';

import { getProducts, deleteProduct, type Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProductForm } from './product-form';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const ManageProductsView = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    
    const fetchAndSetProducts = async () => {
        setIsLoading(true);
        try {
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to fetch products for management:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products.' });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAndSetProducts();
    }, []);

    const handleDelete = async (productId: string, productName: string) => {
        try {
            await deleteProduct(productId);
            toast({ title: "Product Deleted", description: `"${productName}" has been removed.` });
            fetchAndSetProducts(); // Refetch
            router.refresh();
        } catch (error) {
            console.error(`Failed to delete product ${productId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete product.' });
        }
    };
    
    const openDialog = (product: Product | null) => {
        setEditingProduct(product);
        setIsProductDialogOpen(true);
    };

    const closeDialog = () => {
        setEditingProduct(null);
        setIsProductDialogOpen(false);
    }
    
    const handleFormSubmit = () => {
        closeDialog();
        fetchAndSetProducts(); // Refetch data
    };

    if (isLoading) {
        return (
            <Card className="shadow-lg bg-background p-6">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-64 w-full" />
            </Card>
        )
    }

    return (
        <Card className="shadow-lg bg-background">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                        <ListOrdered /> Manage Products
                    </CardTitle>
                    <CardDescription>Add, edit, or delete products from your catalog.</CardDescription>
                </div>
                <Button onClick={() => openDialog(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                </Button>
            </CardHeader>
            <CardContent>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogContent className="max-w-4xl">
                         <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </DialogTitle>
                         </DialogHeader>
                         <ProductForm 
                            product={editingProduct} 
                            onFormSubmit={handleFormSubmit}
                            onFormCancel={closeDialog}
                        />
                    </DialogContent>
                </Dialog>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Origin</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{product.origin}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                                    <TableCell className="text-right">{product.stock}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                         <Button variant="outline" size="icon" aria-label={`Edit ${product.name}`} onClick={() => openDialog(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" aria-label={`Delete ${product.name}`}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the product "{product.name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(product.id, product.name)}>
                                                        Continue
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default ManageProductsView;
