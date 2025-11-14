import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeReservation } from "@/lib/serializers/reservation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Handle links like /api/reservations-admin/:id?action=approved
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const action = req.nextUrl.searchParams.get("action");

  if (!action) {
    // If no action → return list of reservations
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reservations.map(serializeReservation));
  }

  // Otherwise → approving or rejecting
  try {
    const { id } = params;

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: action },
    });

    // Send email to customer after approving/rejecting
    await resend.emails.send({
      from: "Reservation System <onboarding@resend.dev>",
      to: updated.email,
      subject: `Your Reservation is ${action}`,
      html: `
        <h2>Your reservation has been ${action}</h2>
        <p><strong>Name:</strong> ${updated.name}</p>
        <p><strong>Date:</strong> ${updated.date.toDateString()}</p>
        <p><strong>Time:</strong> ${updated.time}</p>
        <p>Status: <strong>${action}</strong></p>
      `,
    });

    return NextResponse.json(serializeReservation(updated));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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
