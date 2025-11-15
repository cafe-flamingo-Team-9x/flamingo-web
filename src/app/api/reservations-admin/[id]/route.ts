import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeReservation } from "@/lib/serializers/reservation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);


// FUNCTION TO SEND EMAIL TO USER
async function sendStatusEmailToUser(reservation: any, status: string) {
  try {
    const emailSubject = status === 'approved' 
      ? '✅ Your Reservation is Confirmed!' 
      : '❌ Reservation Update';

    const emailMessage = status === 'approved'
      ? '<p style="color: green; font-size: 16px;"><strong>Good news!</strong> Your reservation has been confirmed.</p>'
      : '<p style="color: #d9534f; font-size: 16px;">Unfortunately, your reservation could not be accommodated at this time.</p>';

    await resend.emails.send({
      from: "Reservation System <onboarding@resend.dev>",
      to: reservation.email,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${emailSubject}</h2>
          ${emailMessage}
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <h3 style="color: #555;">Reservation Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Name:</td>
              <td style="padding: 8px;">${reservation.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Phone:</td>
              <td style="padding: 8px;">${reservation.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Date:</td>
              <td style="padding: 8px;">${reservation.date.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Time:</td>
              <td style="padding: 8px;">${reservation.time}</td>
            </tr>
            ${reservation.comments ? `
            <tr>
              <td style="padding: 8px; font-weight: bold;">Comments:</td>
              <td style="padding: 8px;">${reservation.comments}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px; font-weight: bold;">Status:</td>
              <td style="padding: 8px;"><strong>${status.toUpperCase()}</strong></td>
            </tr>
          </table>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #777; font-size: 14px;">Thank you for your interest!</p>
        </div>
      `,
    });

    console.log(`✅ Email sent successfully to ${reservation.email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

// GET - Handle email link clicks (approve/reject)
export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const action = req.nextUrl.searchParams.get("action");
    const { id } = params;

    // Validate action
    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid or missing action parameter" }, 
        { status: 400 }
      );
    }

    console.log(`📧 Email link clicked: ${action} for reservation ${id}`);

    // Update reservation status
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: action },
    });

    console.log(`✅ Reservation ${id} updated to ${action}`);

    // Send email to user
    const emailSent = await sendStatusEmailToUser(updated, action);

    if (!emailSent) {
      console.warn("⚠️ Reservation updated but email failed to send");
    }

    // Return success page (you can customize this)
    return new NextResponse(
      `
      <html>
        <head>
          <title>Reservation ${action}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 {
              color: ${action === 'approved' ? '#5cb85c' : '#d9534f'};
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reservation ${action === 'approved' ? 'Approved' : 'Rejected'}</h1>
            <p>The customer has been notified via email.</p>
            <p><strong>Reservation ID:</strong> ${id}</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (err: any) {
    console.error("❌ Error in GET handler:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - Handle dashboard approve/reject
export async function PATCH(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await req.json();

    console.log(`🔄 Dashboard update: ${status} for reservation ${id}`);

    // Validate status
    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'" }, 
        { status: 400 }
      );
    }

    // Update reservation
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    console.log(`✅ Reservation ${id} updated to ${status}`);

    // Send email to user
    const emailSent = await sendStatusEmailToUser(updated, status);

    if (!emailSent) {
      console.warn("⚠️ Reservation updated but email failed to send");
    }

    return NextResponse.json({
      ...serializeReservation(updated),
      emailSent,
    });
  } catch (err: any) {
    console.error("❌ Error in PATCH handler:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
