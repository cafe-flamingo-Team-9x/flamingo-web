import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeMessage } from '@/lib/serializers/message';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json(serializeMessage(message));
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { read } = body;

    const message = await prisma.message.update({
      where: { id },
      data: {
        read: read ?? undefined,
      },
    });

    return NextResponse.json(serializeMessage(message));
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const message = await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json(serializeMessage(message));
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
