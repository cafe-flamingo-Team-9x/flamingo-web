import Image from "next/image";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Menu | Flamingo Restaurant",
  description: "Explore our menus featuring seasonal starters, mains, desserts, and beverages",
};

const MENU_TABS = [
  { value: "starters", label: "Starters" },
  { value: "mains", label: "Mains" },
  { value: "desserts", label: "Desserts" },
  { value: "beverages", label: "Beverages" },
];

const MENU_DATA: Record<string, Array<{ name: string; description: string; price: string; image?: string | null }>> = {
  starters: [
    {
      name: "Bruschetta Trio",
      description: "Toasted baguette topped with tomato basil, wild mushroom, and olive tapenade",
      price: "LKR 1,200",
      image: "/assets/food-starter.jpg",
    },
    {
      name: "Prawn Ceviche",
      description: "Citrus-marinated prawns, avocado, pickled shallots, and micro herbs",
      price: "LKR 1,650",
      image: "/assets/food-starter.jpg",
    },
    {
      name: "Roasted Pumpkin Soup",
      description: "Silky pumpkin velouté with coconut cream and toasted pepitas",
      price: "LKR 980",
      image: "/assets/food-starter.jpg",
    },
  ],
  mains: [
    {
      name: "Grilled Sea Bass",
      description: "Pan-seared sea bass, saffron risotto, blistered cherry tomatoes",
      price: "LKR 3,200",
      image: "/assets/food-main.jpg",
    },
    {
      name: "Herb-Crusted Lamb",
      description: "New Zealand lamb rack, rosemary jus, truffle mash, glazed baby carrots",
      price: "LKR 3,850",
      image: "/assets/food-main.jpg",
    },
    {
      name: "Flamingo Signature Pasta",
      description: "Handmade fettuccine with lobster tail, garlic confit, and chili butter",
      price: "LKR 2,650",
      image: "/assets/food-main.jpg",
    },
  ],
  desserts: [
    {
      name: "Chocolate Lava Cake",
      description: "Molten dark chocolate centre with vanilla bean ice cream",
      price: "LKR 890",
      image: "/assets/food-dessert.jpg",
    },
    {
      name: "Rose Panna Cotta",
      description: "Fragrant rose panna cotta, berry compote, pistachio crumble",
      price: "LKR 820",
      image: "/assets/food-dessert.jpg",
    },
    {
      name: "Tropical Pavlova",
      description: "Coconut meringue, passionfruit curd, seasonal tropical fruit",
      price: "LKR 760",
      image: "/assets/food-dessert.jpg",
    },
  ],
  beverages: [
    {
      name: "Flamingo Sunrise Mocktail",
      description: "Guava, pineapple, grenadine, and lime over crushed ice",
      price: "LKR 650",
      image: null,
    },
    {
      name: "Cold Brew Tonic",
      description: "Single-origin cold brew, citrus peel, and artisanal tonic",
      price: "LKR 580",
      image: null,
    },
    {
      name: "Classic Espresso Martini",
      description: "Espresso, vanilla, and roasted cacao bitters",
      price: "LKR 1,100",
      image: null,
    },
    {
      name: "Ceylon Spiced Chai",
      description: "Hand-ground spices simmered with premium Ceylon black tea",
      price: "LKR 540",
      image: null,
    },
  ],
};

export default function Menu() {
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
          <Tabs defaultValue="starters" className="w-full">
            <TabsList className="mx-auto mb-12 grid w-full max-w-2xl grid-cols-2 gap-2 md:grid-cols-4">
              {MENU_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-sm md:text-base">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {MENU_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="focus-visible:outline-none">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {MENU_DATA[tab.value].map((item) => (
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
            ))}
          </Tabs>

        </div>
      </section>

      <Footer />
    </div>
  );
}
