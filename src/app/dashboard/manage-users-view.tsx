// src/app/dashboard/manage-users-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Users, UserPlus, ChevronDown, UserCog, Shield, 
    UserCheck, Trash2 
} from 'lucide-react';

import { listAllUsers, updateUserDisabledStatus, deleteUserAccount, setUserRole, type AppUser } from '@/lib/users-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AddUserForm } from './add-user-form';

interface ManageUsersViewProps {
    currentUser: AppUser;
}

const ManageUsersView = ({ currentUser }: ManageUsersViewProps) => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    
    const [isAddUserOpen, setAddUserOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

    const refreshUsers = async () => {
        setIsLoading(true);
        try {
            const usersData = await listAllUsers();
            setUsers(usersData.filter(u => u.uid !== currentUser.uid));
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch users.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        refreshUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSetRole = async (uid: string, role: 'Admin' | 'User') => {
        try {
            await setUserRole(uid, role);
            toast({ title: 'Role Updated', description: `User role has been changed to ${role}.` });
            refreshUsers(); // Refetch users to show updated role
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not update user role.' });
        }
    };

    const handleToggleDisabled = async (uid: string, disabled: boolean) => {
        try {
            await updateUserDisabledStatus(uid, !disabled);
            toast({ title: 'User Updated', description: `User has been ${!disabled ? 'disabled' : 'enabled'}.` });
            refreshUsers(); // Refetch users to show updated status
            router.refresh();
        } catch (error: any) {
            console.error("Failed to update user status:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not update user status.' });
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await deleteUserAccount(userToDelete.uid);
            toast({ title: 'User Deleted', description: 'User account has been permanently deleted.' });
            refreshUsers(); // Refetch users
            router.refresh();
        } catch (error: any) {
            console.error("Failed to delete user:", error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not delete user account.' });
        } finally {
            setUserToDelete(null);
        }
    };
    
    const handleFormSubmit = () => {
        setAddUserOpen(false);
        refreshUsers(); // Refetch users after adding one
        router.refresh();
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
        );
    }
    
    return (
        <>
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the account for "{userToDelete?.email}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser}>
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="shadow-lg bg-background">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                            <Users /> Manage Users
                        </CardTitle>
                        <CardDescription>View, create, or manage user accounts and roles.</CardDescription>
                    </div>
                    <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
                        <Button onClick={() => setAddUserOpen(true)}><UserPlus className="mr-2 h-4 w-4"/> Add New User</Button>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-headline text-2xl text-primary">Create New User Account</DialogTitle>
                            </DialogHeader>
                            <AddUserForm onFormSubmit={handleFormSubmit} onFormCancel={() => setAddUserOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="font-medium">{user.displayName || 'N/A'}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'Super Admin' ? 'default' : user.role === 'Admin' ? 'secondary' : 'outline'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.disabled ? 'destructive' : 'secondary'}>
                                                {user.disabled ? 'Disabled' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center space-x-1">
                                            {user.role !== 'Super Admin' && currentUser.role === 'Super Admin' ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            Actions <ChevronDown className="ml-2 h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => handleSetRole(user.uid, user.role === 'Admin' ? 'User' : 'Admin')}>
                                                            {user.role === 'Admin' ? <UserCog className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                                            Make {user.role === 'Admin' ? 'User' : 'Admin'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleToggleDisabled(user.uid, user.disabled)}>
                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                            {user.disabled ? 'Enable' : 'Disable'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                            onSelect={() => setUserToDelete(user)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default ManageUsersView;
