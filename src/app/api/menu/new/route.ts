import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/menu/:id — fetch a single menu item
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
    });

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Failed to fetch menu item:", error);
    return NextResponse.json({ error: "Failed to fetch menu item" }, { status: 500 });
  }
}

// PUT /api/menu/:id — update menu item
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();

    const updatedItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        available: data.available,
        discountPct: data.discountPct,
        categoryId: data.categoryId,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

// DELETE /api/menu/:id — delete menu item
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.menuItem.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Menu item deleted" });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
