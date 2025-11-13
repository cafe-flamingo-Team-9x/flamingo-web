import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { serializeMenuItem } from '@/lib/serializers/menu';

export async function GET() {
  const menuItems = await prisma.menuItem.findMany({
    where: { visible: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  const data = menuItems.map((item) => serializeMenuItem(item)!);

  return NextResponse.json({ data });
}
