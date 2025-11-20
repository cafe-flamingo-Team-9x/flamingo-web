import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeReservation } from '@/lib/serializers/reservation';

// GET all reservations
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const serialized = reservations.map(serializeReservation);
    return NextResponse.json(serialized);
  } catch (err: any) {
    console.error("Error fetching reservations:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// We'll handle status updates in the [id] route instead