import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationCreateSchema } from "@/lib/validation/reservation";
import { serializeReservation } from "@/lib/serializers/reservation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = reservationCreateSchema.parse(body);

    // 1. Save reservation
    const created = await prisma.reservation.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        date: new Date(data.date),
        time: data.time,
        comments: data.comments,
        status: "pending",
      },
    });

    // 2. Generate approve/reject links
    const approveUrl = `${BASE_URL}/api/reservations-admin/${created.id}?action=approved`;
    const rejectUrl = `${BASE_URL}/api/reservations-admin/${created.id}?action=rejected`;

    // 3. Send email to admin
    await resend.emails.send({
      from: "Reservation System <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: "New Reservation Request",
      html: `
        <h2>New Reservation Request</h2>
        <p><strong>Name:</strong> ${created.name}</p>
        <p><strong>Email:</strong> ${created.email}</p>
        <p><strong>Phone:</strong> ${created.phone}</p>
        <p><strong>Date:</strong> ${created.date.toDateString()}</p>
        <p><strong>Time:</strong> ${created.time}</p>
        <p><strong>Comments:</strong> ${created.comments ?? "None"}</p>

        <h3>Actions</h3>
        <a href="${approveUrl}">Approve</a><br/>
        <a href="${rejectUrl}">Reject</a>
      `,
    });

    return NextResponse.json(serializeReservation(created));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
