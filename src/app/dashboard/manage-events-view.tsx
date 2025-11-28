// src/app/dashboard/manage-events-view.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, CalendarPlus, Edit, Trash2 } from 'lucide-react';

import { getEvents, deleteEvent, type Event } from '@/lib/events-data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EventForm } from './event-form';

const ManageEventsView = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const fetchAndSetEvents = async () => {
        setIsLoading(true);
        try {
            const eventsData = await getEvents();
            setEvents(eventsData);
        } catch (error) {
            console.error("Failed to fetch events:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch events.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAndSetEvents();
    }, []);

    const handleDelete = async (eventId: string, eventTitle: string) => {
        try {
            await deleteEvent(eventId);
            toast({ title: "Event Deleted", description: `"${eventTitle}" has been removed.` });
            fetchAndSetEvents(); // Refetch
            router.refresh();
        } catch (error) {
            console.error(`Failed to delete event ${eventId}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete event.' });
        }
    };

    const openForm = (event: Event | null) => {
        setEditingEvent(event);
        setIsFormOpen(true);
    }
    
    const closeForm = () => {
        setEditingEvent(null);
        setIsFormOpen(false);
    }

    const handleFormSubmit = () => {
        closeForm();
        fetchAndSetEvents();
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
        <Card className="shadow-lg bg-background">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                        <CalendarCheck /> Manage Events
                    </CardTitle>
                    <CardDescription>Add, edit, or delete events and workshops.</CardDescription>
                </div>
                <Button onClick={() => openForm(null)}>
                    <CalendarPlus className="mr-2 h-4 w-4" /> Add New Event
                </Button>
            </CardHeader>
            <CardContent>
                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl text-primary">{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                        </DialogHeader>
                        <EventForm
                            event={editingEvent}
                            onFormSubmit={handleFormSubmit}
                            onFormCancel={closeForm}
                        />
                    </DialogContent>
                </Dialog>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.title}</TableCell>
                                    <TableCell>{event.date}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => openForm(event)} aria-label={`Edit ${event.title}`}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" aria-label={`Delete ${event.title}`}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the event "{event.title}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(event.id, event.title)}>
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
};

export default ManageEventsView;
