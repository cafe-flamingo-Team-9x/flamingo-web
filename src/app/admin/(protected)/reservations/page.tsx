'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, RefreshCcw } from 'lucide-react';

type Reservation = {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

// Fetch reservations from backend
async function fetchReservations(): Promise<Reservation[]> {
  const res = await fetch('/api/reservations-admin', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch reservations');
  return res.json();
}

export default function AdminReservationPage() {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const reservationQuery = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: fetchReservations,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const res = await fetch(`/api/reservations-admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update reservation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
      toast.success('Reservation updated');
      setActionLoading(null);
    },
    onError: (err: any) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update reservation');
      setActionLoading(null);
    },
  });

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    updateStatusMutation.mutate({ id, status });
  };

  const reservations = reservationQuery.data ?? [];

  return (
    <section className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-3xl font-semibold text-primary flex items-center gap-2">
          <RefreshCcw className="h-6 w-6" />
          Reservation Management
        </h1>
        <Button
          variant="outline"
          onClick={() => reservationQuery.refetch()}
          disabled={reservationQuery.isFetching}
        >
          Refresh
        </Button>
      </div>

      {reservationQuery.isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No reservations found.
        </div>
      ) : (
        <ScrollArea className="flex-1 h-[calc(100vh-250px)] pr-4">
          <div className="space-y-4 pb-4">
            {reservations.map((res) => (
              <Card key={res.id} className="border-primary/30 hover:shadow-lg transition-all duration-150">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{res.guestName}</CardTitle>
                    <span
                      className={`capitalize text-sm font-medium px-3 py-1 rounded-full ${
                        res.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : res.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                  <CardDescription className="pt-1">
                    {res.email} | {res.phone}
                  </CardDescription>
                  <CardDescription>
                    {new Date(res.date).toLocaleDateString()} at {res.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleAction(res.id, 'approved')}
                    disabled={actionLoading === res.id || res.status !== 'pending'}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => handleAction(res.id, 'rejected')}
                    disabled={actionLoading === res.id || res.status !== 'pending'}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </section>
  );
}