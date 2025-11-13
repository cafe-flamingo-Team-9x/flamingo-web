import Image from "next/image";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Menu | Flamingo Restaurant",
  description: "Explore our menus featuring seasonal starters, mains, desserts, and beverages",
};

// Fetch menu categories and items from the API at runtime
async function fetchMenu() {
  // Use NEXTAUTH_URL when it's intentionally set, otherwise fetch relative to the current origin.
  const url = process.env.NEXTAUTH_URL
    ? new URL('/api/menu', process.env.NEXTAUTH_URL).toString()
    : '/api/menu';

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data as Array<{
      id: string;
      name: string;
      slug?: string | null;
      order?: number;
      items: Array<{ name: string; description?: string | null; price?: string | null; image?: string | null; available?: boolean | null; discountPct?: number | null }>;
    }>;
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return [];
  }
}

export default async function Menu() {
  const categories = await fetchMenu();

  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="bg-gradient-dark pt-32 pb-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Our <span className="text-gradient-accent">Menu</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-white/80">
              Menu is being prepared. Please check back soon.
            </p>
          </div>
        </section>
        <section className="bg-background py-16">
          <div className="container mx-auto px-4">
            <div className="text-center text-muted-foreground">No menu data available.</div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const tabs = categories.map((c) => ({
    value: c.slug ?? c.name.toLowerCase().replace(/\s+/g, '-'),
    label: c.name,
  }));

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="bg-gradient-dark pt-32 pb-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            Our <span className="text-gradient-accent">Menu</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-white/80">
            Explore our carefully curated selection of dishes crafted with the finest ingredients
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={tabs[0]?.value ?? ''} className="w-full">
            <TabsList className="mx-auto mb-12 grid w-full max-w-2xl grid-cols-2 gap-2 md:grid-cols-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-sm md:text-base">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => {
              const value = category.slug ?? category.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <TabsContent key={category.id} value={value} className="focus-visible:outline-none">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((item: any) => (
                      <Card
                        key={item.name}
                        className="group overflow-hidden border-border bg-card transition-all duration-300 hover-lift hover:shadow-elegant"
                      >
                        {item.image ? (
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={item.image}
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
                            <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                            <span className="text-base font-semibold text-primary">{item.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

        </div>
      </section>

      <Footer />
    </div>
  );
}
