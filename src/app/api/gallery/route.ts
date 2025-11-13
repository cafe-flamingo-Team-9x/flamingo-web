import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { serializeGalleryItem } from '@/lib/serializers/gallery';
import { galleryItemCreateSchema } from '@/lib/validation/gallery';

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json(
      { error: 'You are not authorized to perform this action.' },
      { status: 403 }
    );
  }

  return session;
}

export async function GET() {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const items = await prisma.galleryItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const data = items.map((item) => serializeGalleryItem(item)!);

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const body = await request.json().catch(() => undefined);

  const parsed = galleryItemCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid gallery item payload.',
        details: parsed.error.format(),
      },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.galleryItem.create({
      data: {
        gCategory: parsed.data.gCategory,
        caption: parsed.data.caption ?? null,
        galleryUrl: parsed.data.galleryUrl,
        visible: parsed.data.visible ?? true,
      },
    });

    return NextResponse.json(
      { data: serializeGalleryItem(created) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create gallery item', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item. Please try again.' },
      { status: 500 }
    );
  }
}
