import Image from 'next/image';

import Footer from '@/components/footer';
import Navigation from '@/components/navigation';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Gallery | Flamingo Restaurant',
  description:
    'Discover the ambiance, cuisine, and moments that define Flamingo Café',
};

export const revalidate = 120;

type GalleryDisplayItem = {
  id: string;
  gCategory: string;
  caption: string | null;
  galleryUrl: string;
};

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

async function getGalleryItems(): Promise<GalleryDisplayItem[]> {
  const items: GalleryItemRecord[] = await prisma.galleryItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const visibleItems = items.filter((item) => item.visible !== false);

  if (visibleItems.length === 0) {
    return [...FALLBACK_GALLERY_ITEMS];
  }

  return visibleItems.map((item) => ({
    id: item.id,
    gCategory: item.gCategory,
    caption: item.caption ?? null,
    galleryUrl: item.galleryUrl,
  }));
}

export default async function Gallery() {
  const galleryItems = await getGalleryItems();

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="bg-gradient-dark pt-32 pb-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            Our <span className="text-gradient-accent">Gallery</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/80">
            Take a visual journey through our culinary creations and inviting
            atmosphere
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-soft transition-all duration-300 hover-lift hover:shadow-elegant"
              >
                <Image
                  src={item.galleryUrl}
                  alt={item.caption ?? `${item.gCategory} at Flamingo Café`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/80 via-slate-900/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="p-5 text-white">
                    <span className="mb-2 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      {item.gCategory}
                    </span>
                    {item.caption ? (
                      <p className="text-sm text-white/90">{item.caption}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 rounded-3xl bg-gradient-hero px-8 py-14 text-center text-white shadow-pink-glow">
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
              Experience It Yourself
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/85">
              These pictures don’t do justice to the real experience. Visit us
              and create your own memories!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
