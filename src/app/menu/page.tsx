import Image from 'next/image';
import Footer from '@/components/footer';
import Navigation from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Menu | Flamingo Restaurant',
  description:
    'Explore our menus featuring seasonal starters, mains, desserts, and beverages',
};

export const revalidate = 60;

type VisibleMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
};

const FALLBACK_MENU_ITEMS: VisibleMenuItem[] = [
  {
    id: 'fallback-starters-1',
    name: 'Bruschetta Trio',
    description:
      'Toasted baguette topped with tomato basil, wild mushroom, and olive tapenade',
    price: 1200,
    category: 'starters',
    imageUrl: '/assets/food-starter.jpg',
  },
  {
    id: 'fallback-starters-2',
    name: 'Prawn Ceviche',
    description:
      'Citrus-marinated prawns, avocado, pickled shallots, and micro herbs',
    price: 1650,
    category: 'starters',
    imageUrl: '/assets/food-starter.jpg',
  },
  {
    id: 'fallback-starters-3',
    name: 'Roasted Pumpkin Soup',
    description: 'Silky pumpkin velouté with coconut cream and toasted pepitas',
    price: 980,
    category: 'starters',
    imageUrl: '/assets/food-starter.jpg',
  },
  {
    id: 'fallback-mains-1',
    name: 'Grilled Sea Bass',
    description:
      'Pan-seared sea bass, saffron risotto, blistered cherry tomatoes',
    price: 3200,
    category: 'mains',
    imageUrl: '/assets/food-main.jpg',
  },
  {
    id: 'fallback-mains-2',
    name: 'Herb-Crusted Lamb',
    description:
      'New Zealand lamb rack, rosemary jus, truffle mash, glazed baby carrots',
    price: 3850,
    category: 'mains',
    imageUrl: '/assets/food-main.jpg',
  },
  {
    id: 'fallback-mains-3',
    name: 'Flamingo Signature Pasta',
    description:
      'Handmade fettuccine with lobster tail, garlic confit, and chili butter',
    price: 2650,
    category: 'mains',
    imageUrl: '/assets/food-main.jpg',
  },
  {
    id: 'fallback-desserts-1',
    name: 'Chocolate Lava Cake',
    description: 'Molten dark chocolate centre with vanilla bean ice cream',
    price: 890,
    category: 'desserts',
    imageUrl: '/assets/food-dessert.jpg',
  },
  {
    id: 'fallback-desserts-2',
    name: 'Rose Panna Cotta',
    description: 'Fragrant rose panna cotta, berry compote, pistachio crumble',
    price: 820,
    category: 'desserts',
    imageUrl: '/assets/food-dessert.jpg',
  },
  {
    id: 'fallback-desserts-3',
    name: 'Tropical Pavlova',
    description: 'Coconut meringue, passionfruit curd, seasonal tropical fruit',
    price: 760,
    category: 'desserts',
    imageUrl: '/assets/food-dessert.jpg',
  },
  {
    id: 'fallback-beverages-1',
    name: 'Flamingo Sunrise Mocktail',
    description: 'Guava, pineapple, grenadine, and lime over crushed ice',
    price: 650,
    category: 'beverages',
    imageUrl: null,
  },
  {
    id: 'fallback-beverages-2',
    name: 'Cold Brew Tonic',
    description: 'Single-origin cold brew, citrus peel, and artisanal tonic',
    price: 580,
    category: 'beverages',
    imageUrl: null,
  },
  {
    id: 'fallback-beverages-3',
    name: 'Classic Espresso Martini',
    description: 'Espresso, vanilla, and roasted cacao bitters',
    price: 1100,
    category: 'beverages',
    imageUrl: null,
  },
  {
    id: 'fallback-beverages-4',
    name: 'Ceylon Spiced Chai',
    description: 'Hand-ground spices simmered with premium Ceylon black tea',
    price: 540,
    category: 'beverages',
    imageUrl: null,
  },
];

async function getVisibleMenuItems(): Promise<VisibleMenuItem[]> {
  const menuItems = await prisma.menuItem.findMany({
    where: { visible: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  if (menuItems.length === 0) {
    return [...FALLBACK_MENU_ITEMS];
  }

  return menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    price: item.price,
    category: item.category,
    imageUrl: item.imageUrl ?? null,
  }));
}

export default async function Menu() {
  const menuItems = await getVisibleMenuItems();

  const groupedByCategory = menuItems.reduce<Record<string, VisibleMenuItem[]>>(
    (acc, item) => {
      const key = item.category.trim() || 'Featured';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {}
  );

  const categories = Object.keys(groupedByCategory).sort((a, b) =>
    a.localeCompare(b)
  );

  if (categories.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="bg-gradient-dark pt-32 pb-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-5xl">
              Our <span className="text-gradient-accent">Menu</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-white/80">
              We are curating our seasonal menu. Please check back soon for new
              dishes.
            </p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="bg-gradient-dark pt-32 pb-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-5xl">
            Our <span className="text-gradient-accent">Menu</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/80">
            Explore our carefully curated selection of dishes crafted with the
            finest ingredients
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="mx-auto mb-12 grid w-full max-w-2xl grid-cols-2 gap-2 md:grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-sm capitalize md:text-base"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent
                key={category}
                value={category}
                className="focus-visible:outline-none"
              >
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedByCategory[category]?.map((item) => (
                    <Card
                      key={item.id}
                      className="group overflow-hidden border-border bg-card transition-all duration-300 hover-lift hover:shadow-elegant"
                    >
                      {item.imageUrl ? (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-gradient-soft text-center">
                          <span className="px-6 text-lg font-semibold text-primary">
                            Crafted Refreshments
                          </span>
                        </div>
                      )}

                      <CardContent className="space-y-3 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold text-foreground">
                            {item.name}
                          </h3>
                          <span className="text-base font-semibold text-primary">
                            LKR{' '}
                            {item.price.toLocaleString('en-LK', {
                              minimumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                        {item.description ? (
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
