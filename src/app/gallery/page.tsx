import Image from "next/image";

import Footer from "@/components/footer";
import Navigation from "@/components/navigation";

export const metadata = {
  title: "Gallery | Flamingo Restaurant",
  description: "Discover the ambiance, cuisine, and moments that define Flamingo Café",
};

const GALLERY_ITEMS = [
  {
    src: "/assets/hero-dining.jpg",
    alt: "Candlelit tables inside Flamingo Café",
    category: "Interior",
    caption: "Elegant dining setup bathed in warm candlelight",
  },
  {
    src: "/assets/restaurant-interior.jpg",
    alt: "Lounge seating at Flamingo Café",
    category: "Interior",
    caption: "Our cozy lounge perfect for intimate conversations",
  },
  {
    src: "/assets/food-main.jpg",
    alt: "Signature grilled sea bass plated",
    category: "Food",
    caption: "Signature sea bass with saffron risotto",
  },
  {
    src: "/assets/food-starter.jpg",
    alt: "Appetizer trio on marble table",
    category: "Food",
    caption: "Starter trio featuring seasonal ingredients",
  },
  {
    src: "/assets/food-dessert.jpg",
    alt: "Chocolate dessert at Flamingo Café",
    category: "Food",
    caption: "Decadent desserts to end the night sweetly",
  },
  {
    src: "/assets/food-main.jpg",
    alt: "Guests dining at Flamingo Café",
    category: "Moments",
    caption: "Memorable celebrations hosted with style",
  },
  {
    src: "/assets/hero-dining.jpg",
    alt: "Outdoor dining terrace",
    category: "Interior",
    caption: "Starlit terrace open for relaxed evenings",
  },
  {
    src: "/assets/restaurant-interior.jpg",
    alt: "Bar at Flamingo Café",
    category: "Moments",
    caption: "Mixology crafted at our intimate bar",
  },
];

export default function Gallery() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="bg-gradient-dark pt-32 pb-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            Our <span className="text-gradient-accent">Gallery</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/80">
            Take a visual journey through our culinary creations and inviting atmosphere
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GALLERY_ITEMS.map((item) => (
              <div
                key={`${item.category}-${item.alt}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-soft transition-all duration-300 hover-lift hover:shadow-elegant"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/80 via-slate-900/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="p-5 text-white">
                    <span className="mb-2 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      {item.category}
                    </span>
                    <p className="text-sm text-white/90">{item.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 rounded-3xl bg-gradient-hero px-8 py-14 text-center text-white shadow-pink-glow">
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl">Experience It Yourself</h2>
            <p className="mx-auto max-w-2xl text-lg text-white/85">
              These pictures don’t do justice to the real experience. Visit us and create your own
              memories!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
