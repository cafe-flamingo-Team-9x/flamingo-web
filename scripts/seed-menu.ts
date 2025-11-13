import { prisma } from "@/lib/prisma";

async function main() {
  const starters = await prisma.category.create({
    data: {
      name: "Starters",
      slug: "starters",
      order: 1,
      items: {
        create: [
          {
            name: "Bruschetta Trio",
            description: "Toasted baguette topped with tomato basil...",
            price: "LKR 1,200",
            image: "/assets/food-starter.jpg",
          },
          {
            name: "Prawn Ceviche",
            description: "Citrus-marinated prawns...",
            price: "LKR 1,650",
            image: "/assets/food-starter.jpg",
          },
        ],
      },
    },
  });

  const mains = await prisma.category.create({
    data: {
      name: "Mains",
      slug: "mains",
      order: 2,
      items: {
        create: [
          {
            name: "Grilled Sea Bass",
            description: "Pan-seared sea bass, saffron risotto...",
            price: "LKR 3,200",
            image: "/assets/food-main.jpg",
          },
        ],
      },
    },
  });

  console.log("Seeded categories:", { starters, mains });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
