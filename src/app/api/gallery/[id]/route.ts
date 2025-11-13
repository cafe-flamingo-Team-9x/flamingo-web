import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Prisma } from '@prisma/client';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { serializeGalleryItem } from '@/lib/serializers/gallery';
import { galleryItemUpdateSchema } from '@/lib/validation/gallery';

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

function isValidObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: 'Invalid gallery item id.' },
      { status: 400 }
    );
  }

  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json(
      { error: 'Gallery item not found.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: serializeGalleryItem(item)! });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: 'Invalid gallery item id.' },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => undefined);
  const parsed = galleryItemUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid gallery item payload.',
        details: parsed.error.format(),
      },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.gCategory !== undefined) {
    updateData.gCategory = parsed.data.gCategory;
  }
  if (parsed.data.caption !== undefined) {
    updateData.caption = parsed.data.caption;
  }
  if (parsed.data.galleryUrl !== undefined) {
    updateData.galleryUrl = parsed.data.galleryUrl;
  }
  if (parsed.data.visible !== undefined) {
    updateData.visible = parsed.data.visible;
  }

  try {
    const updated = await prisma.galleryItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: serializeGalleryItem(updated)! });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Gallery item not found.' },
        { status: 404 }
      );
    }

    console.error('Failed to update gallery item', error);
    return NextResponse.json(
      { error: 'Failed to update gallery item. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: 'Invalid gallery item id.' },
      { status: 400 }
    );
  }

  try {
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Gallery item not found.' },
        { status: 404 }
      );
    }

    console.error('Failed to delete gallery item', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item. Please try again.' },
      { status: 500 }
    );
  }
}
