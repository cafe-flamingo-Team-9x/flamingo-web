import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // import your Prisma client
import { reservationCreateSchema } from "@/lib/validation/reservation";
import { serializeReservation } from "@/lib/serializers/reservation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = reservationCreateSchema.parse(body);

    const created = await prisma.reservation.create({
      data: {
        name: data.name,
        phone: data.phone,
        date: new Date(data.date),
        time: data.time,
        comments: data.comments,
        status: "pending", // default
      },
    });

    return NextResponse.json(serializeReservation(created));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
