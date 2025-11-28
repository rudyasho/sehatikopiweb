// src/app/events/event-card-client.tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface EventCardClientProps {
  eventId: string;
  eventTitle: string;
}

export function EventCardClient({ eventId, eventTitle }: EventCardClientProps) {
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = () => {
    setIsRegistered(true);
    toast({
      title: 'Registration Confirmed!',
      description: `You have successfully registered for "${eventTitle}". We've sent a confirmation to your email.`,
    });
  };

  return (
    <Button size="lg" onClick={handleRegister} disabled={isRegistered}>
      {isRegistered ? (
        <>
          <Check className="mr-2" /> Registered
        </>
      ) : (
        'Register Now'
      )}
    </Button>
  );
}
