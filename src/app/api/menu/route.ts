import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { serializeMenuItem } from '@/lib/serializers/menu';
import { menuItemCreateSchema } from '@/lib/validation/menu';

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

  const menuItems = await prisma.menuItem.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  const data = menuItems.map((item) => serializeMenuItem(item)!);

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const body = await request.json().catch(() => undefined);

  const parsed = menuItemCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid menu item payload.',
        details: parsed.error.format(),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  try {
    const created = await prisma.menuItem.create({
      data: {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        imageUrl: payload.imageUrl,
        visible: payload.visible ?? true,
      },
    });

    return NextResponse.json(
      { data: serializeMenuItem(created) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create menu item', error);
    return NextResponse.json(
      { error: 'Failed to create menu item. Please try again.' },
      { status: 500 }
    );
  }
}
