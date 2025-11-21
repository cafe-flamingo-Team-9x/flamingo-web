import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { type MenuItemDTO, serializeMenuItem } from '@/lib/serializers/menu';

export async function GET() {
  const menuItems = await prisma.menuItem.findMany({
    where: { visible: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  const data = menuItems
    .map((item) => serializeMenuItem(item))
    .filter((item): item is MenuItemDTO => item !== null);

  return NextResponse.json({ data });
}
