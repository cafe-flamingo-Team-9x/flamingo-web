import Image from "next/image";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Menu | Flamingo Restaurant",
  description: "Explore our delicious menu featuring starters, mains, desserts, and beverages",
};

export default function Menu() {
  // Menu data
  const menuData = {
    starters: [
      {
        name: "Bruschetta Trio",
        description: "Classic tomato basil, mushroom truffle, and olive tapenade",
        price: "LKR 1,200",
        image: "/assets/food-starter.jpg",
      },
      {
        name: "Crispy Calamari",
        description: "Tender squid rings with lemon aioli and sweet chili sauce",
        price: "LKR 1,500",
        image: "/assets/food-starter.jpg",
      },
      {
        name: "Caesar Salad",
        description: "Crisp romaine, parmesan, croutons, and classic caesar dressing",
        price: "LKR 950",
        image: "/assets/food-starter.jpg",
      },
    ],
    mains: [
      {
        name: "Grilled Salmon",
        description: "Atlantic salmon with roasted vegetables and lemon butter sauce",
        price: "LKR 2,800",
        image: "/assets/food-main.jpg",
      },
      {
        name: "Beef Tenderloin",
        description: "Prime beef with mushroom sauce, mashed potatoes, and seasonal greens",
        price: "LKR 3,500",
        image: "/assets/food-main.jpg",
      },
      {
        name: "Chicken Parmigiana",
        description: "Breaded chicken breast with marinara, mozzarella, and pasta",
        price: "LKR 2,200",
        image: "/assets/food-main.jpg",
      },
    ],
    desserts: [
      {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center, served with vanilla ice cream",
        price: "LKR 850",
        image: "/assets/food-dessert.jpg",
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with mascarpone and coffee-soaked ladyfingers",
        price: "LKR 750",
        image: "/assets/food-dessert.jpg",
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Our <span className="text-gradient-accent">Menu</span>
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto">
            Discover our carefully curated selection of dishes
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="starters" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="starters">Starters</TabsTrigger>
              <TabsTrigger value="mains">Mains</TabsTrigger>
              <TabsTrigger value="desserts">Desserts</TabsTrigger>
            </TabsList>

            {Object.entries(menuData).map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((item, idx) => (
                    <Card
                      key={idx}
                      className="overflow-hidden hover-lift hover:shadow-elegant transition-all duration-300"
                    >
                      <div className="relative h-48">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                          <span className="text-primary font-bold">{item.price}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
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
