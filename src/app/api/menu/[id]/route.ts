import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { type NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { serializeMenuItem } from '@/lib/serializers/menu';
import { menuItemUpdateSchema } from '@/lib/validation/menu';

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
      { error: 'Invalid menu item id.' },
      { status: 400 }
    );
  }

  const menuItem = await prisma.menuItem.findUnique({ where: { id } });
  if (!menuItem) {
    return NextResponse.json(
      { error: 'Menu item not found.' },
      { status: 404 }
    );
  }

  const serialized = serializeMenuItem(menuItem);
  if (!serialized) {
    return NextResponse.json(
      { error: 'Failed to load menu item.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: serialized });
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
      { error: 'Invalid menu item id.' },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => undefined);
  const parsed = menuItemUpdateSchema.safeParse(body);

  if (!parsed.success) {
    console.error('menu item update validation failed', parsed.error.flatten());
    return NextResponse.json(
      {
        error: 'Invalid menu item payload.',
        details: parsed.error.format(),
      },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.menuItem.update({
      where: { id },
      data: parsed.data,
    });

    const serialized = serializeMenuItem(updated);
    if (!serialized) {
      return NextResponse.json(
        { error: 'Failed to update menu item.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: serialized });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Menu item not found.' },
        { status: 404 }
      );
    }

    console.error('Failed to update menu item', error);
    return NextResponse.json(
      { error: 'Failed to update menu item. Please try again.' },
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
      { error: 'Invalid menu item id.' },
      { status: 400 }
    );
  }

  try {
    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Menu item not found.' },
        { status: 404 }
      );
    }

    console.error('Failed to delete menu item', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item. Please try again.' },
      { status: 500 }
    );
  }
}
