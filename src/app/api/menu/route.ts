import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all categories with available menu items
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        items: {
          where: { available: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

// POST create a new menu item
export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data?.name || !data?.price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    // Validate categoryId
    if (data.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!categoryExists) {
        return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
      }
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        image: data.image ?? null,
        available: data.available ?? true,
        discountPct: data.discountPct ?? null,
        categoryId: data.categoryId ?? null,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
