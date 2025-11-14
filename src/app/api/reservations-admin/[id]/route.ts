import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeReservation } from '@/lib/serializers/reservation';

// GET all reservations
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' }, // newest first
    });

    const serialized = reservations.map(serializeReservation);
    return NextResponse.json(serialized);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH reservation status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // get id from URL
    const { status } = await req.json();

    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(serializeReservation(updated));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
