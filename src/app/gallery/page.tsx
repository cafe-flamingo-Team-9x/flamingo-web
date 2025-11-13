import Footer from '@/components/footer';
import Navigation from '@/components/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { buildPaginationRange } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import GalleryGrid from './_components/gallery-grid';
import type { GalleryDisplayItem } from './types';

export const metadata = {
  title: 'Gallery | Flamingo Restaurant',
  description:
    'Discover the ambiance, cuisine, and moments that define Flamingo Café',
};

export const revalidate = 120;
const PAGE_SIZE = 12;

type GalleryItemRecord = {
  id: string;
  gCategory: string;
  caption: string | null;
  galleryUrl: string;
  visible: boolean | null | undefined;
  createdAt: Date;
  updatedAt: Date;
};

const FALLBACK_GALLERY_ITEMS: GalleryDisplayItem[] = [
  {
    id: 'fallback-hero-dining',
    galleryUrl: '/assets/hero-dining.jpg',
    gCategory: 'Interior',
    caption: 'Elegant dining setup bathed in warm candlelight',
  },
  {
    id: 'fallback-restaurant-interior',
    galleryUrl: '/assets/restaurant-interior.jpg',
    gCategory: 'Interior',
    caption: 'Our cozy lounge perfect for intimate conversations',
  },
  {
    id: 'fallback-food-main',
    galleryUrl: '/assets/food-main.jpg',
    gCategory: 'Food',
    caption: 'Signature sea bass with saffron risotto',
  },
  {
    id: 'fallback-food-starter',
    galleryUrl: '/assets/food-starter.jpg',
    gCategory: 'Food',
    caption: 'Starter trio featuring seasonal ingredients',
  },
  {
    id: 'fallback-food-dessert',
    galleryUrl: '/assets/food-dessert.jpg',
    gCategory: 'Food',
    caption: 'Decadent desserts to end the night sweetly',
  },
  {
    id: 'fallback-moments-dining',
    galleryUrl: '/assets/food-main.jpg',
    gCategory: 'Moments',
    caption: 'Memorable celebrations hosted with style',
  },
  {
    id: 'fallback-terrace',
    galleryUrl: '/assets/hero-dining.jpg',
    gCategory: 'Interior',
    caption: 'Starlit terrace open for relaxed evenings',
  },
  {
    id: 'fallback-bar',
    galleryUrl: '/assets/restaurant-interior.jpg',
    gCategory: 'Moments',
    caption: 'Mixology crafted at our intimate bar',
  },
];

async function getGalleryItems(page: number = 1): Promise<{
  items: GalleryDisplayItem[];
  totalPages: number;
  currentPage: number;
}> {
  const totalCount = await prisma.galleryItem.count({
    where: { visible: { not: false } },
  });

  // If no items in database, return fallback items
  if (totalCount === 0) {
    const totalPages = Math.ceil(FALLBACK_GALLERY_ITEMS.length / PAGE_SIZE);
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    return {
      items: FALLBACK_GALLERY_ITEMS.slice(startIndex, endIndex),
      totalPages,
      currentPage: safePage,
    };
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const safePage = Math.max(1, Math.min(page, totalPages));
  const skip = (safePage - 1) * PAGE_SIZE;

  const items: GalleryItemRecord[] = await prisma.galleryItem.findMany({
    where: { visible: { not: false } },
    orderBy: { createdAt: 'desc' },
    skip,
    take: PAGE_SIZE,
  });

  return {
    items: items.map((item) => ({
      id: item.id,
      gCategory: item.gCategory,
      caption: item.caption ?? null,
      galleryUrl: item.galleryUrl,
    })),
    totalPages,
    currentPage: safePage,
  };
}

type GalleryPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function Gallery({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const pageParam = params.page;
  const currentPage = pageParam ? Number.parseInt(pageParam, 10) : 1;
  const safePage =
    Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;

  const {
    items,
    totalPages,
    currentPage: actualPage,
  } = await getGalleryItems(safePage);
  const paginationRange = buildPaginationRange(actualPage, totalPages);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-dark pt-32 pb-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold font-heading md:text-5xl">
            Our <span className="text-gradient-accent">Gallery</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/80 leading-relaxed">
            Take a visual journey through our culinary creations and inviting
            atmosphere
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <GalleryGrid items={items} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
                  <PaginationItem>
                    {actualPage > 1 ? (
                      <PaginationPrevious
                        href={`/gallery?page=${actualPage - 1}`}
                        className="bg-white text-slate-900 border-slate-900 hover:bg-slate-900 hover:text-white"
                      />
                    ) : (
                      <PaginationPrevious className="pointer-events-none opacity-50 bg-white text-slate-400 border-slate-300" />
                    )}
                  </PaginationItem>

                  {/* Page Numbers */}
                  {paginationRange.map((pageItem, index) => (
                    <PaginationItem
                      key={`page-${typeof pageItem === 'number'
                        ? pageItem
                        : `ellipsis-${index}`
                        }`}
                    >
                      {pageItem === 'ellipsis' ? (
                        <PaginationEllipsis className="text-slate-900" />
                      ) : (
                        <PaginationLink
                          href={`/gallery?page=${pageItem}`}
                          isActive={pageItem === actualPage}
                          className={
                            pageItem === actualPage
                              ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                              : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-900 hover:text-white'
                          }
                        >
                          {pageItem}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  {/* Next Button */}
                  <PaginationItem>
                    {actualPage < totalPages ? (
                      <PaginationNext
                        href={`/gallery?page=${actualPage + 1}`}
                        className="bg-white text-slate-900 border-slate-900 hover:bg-slate-900 hover:text-white"
                      />
                    ) : (
                      <PaginationNext className="pointer-events-none opacity-50 bg-white text-slate-400 border-slate-300" />
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
