import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { serializeMessage } from '@/lib/serializers/message';
import { messageCreateSchema } from '@/lib/validation/message';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = messageCreateSchema.parse(body);

    const message = await prisma.message.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });

    return NextResponse.json(serializeMessage(message));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.issues }, { status: 400 });
    }
    const errorMessage =
      err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(messages.map(serializeMessage));
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
