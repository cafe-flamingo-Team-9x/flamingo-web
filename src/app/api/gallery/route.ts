import { z } from 'zod';
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

const galleryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(request: NextRequest) {
  const sessionOrResponse = await ensureAdmin();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const { searchParams } = request.nextUrl;
  const pageParam = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const pageSizeParam = Number.parseInt(
    searchParams.get('pageSize') ?? '10',
    10
  );

  const pageSize = Number.isFinite(pageSizeParam)
    ? Math.min(Math.max(pageSizeParam, 1), 50)
    : 10;

  const totalItems = await prisma.galleryItem.count();
  const totalPages =
    totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));

  const requestedPage = Number.isFinite(pageParam) ? pageParam : 1;
  const safePage =
    totalItems === 0 ? 1 : Math.min(Math.max(requestedPage, 1), totalPages);

  const skip = totalItems === 0 ? 0 : (safePage - 1) * pageSize;

  const items = await prisma.galleryItem.findMany({
    orderBy: { createdAt: 'desc' },
    skip,
    take: pageSize,
  });

  let categoryCounts: Record<string, number> = {};
  if (totalItems > 0) {
    try {
      type CategoryAggregationResult = { _id?: string; count?: number };
      const aggregationResult = (await prisma.galleryItem.aggregateRaw({
        pipeline: [
          {
            $group: {
              _id: '$gCategory',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
        ],
      })) as unknown;

      if (!Array.isArray(aggregationResult)) {
        throw new Error('Unexpected aggregation result');
      }

      const mappedCounts: Record<string, number> = {};
      (aggregationResult as CategoryAggregationResult[]).forEach((entry) => {
        const rawKey = typeof entry._id === 'string' ? entry._id : '';
        const normalizedKey =
          rawKey.trim().length > 0 ? rawKey : 'Uncategorised';
        const value = typeof entry.count === 'number' ? entry.count : 0;
        mappedCounts[normalizedKey] = value;
      });
      categoryCounts = mappedCounts;
    } catch (error) {
      console.error('Failed to aggregate gallery category counts', error);
      const categories = await prisma.galleryItem.findMany({
        select: { gCategory: true },
      });
      categoryCounts = categories.reduce<Record<string, number>>(
        (accumulator, item) => {
          const normalized =
            item.gCategory.trim().length > 0 ? item.gCategory : 'Uncategorised';
          accumulator[normalized] = (accumulator[normalized] ?? 0) + 1;
          return accumulator;
        },
        {}
      );
    }
  }

  const latestItem =
    totalItems === 0
      ? null
      : await prisma.galleryItem.findFirst({
          orderBy: { createdAt: 'desc' },
        });

  const data = items.map((item) => serializeGalleryItem(item)!);

  return NextResponse.json({
    data,
    meta: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
      totalCategories: Object.keys(categoryCounts).length,
      categoryCounts,
      latestCreatedAt: latestItem?.createdAt.toISOString() ?? null,
    },
  });
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
