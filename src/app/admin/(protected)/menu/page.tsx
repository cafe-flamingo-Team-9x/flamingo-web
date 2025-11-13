"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | null;
  image?: string | null;
  available?: boolean;
};

type Category = {
  id: string;
  name: string;
  items: MenuItem[];
};

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/menu");
      if (!res.ok) throw new Error("Failed to load menu data");
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) setActiveCategory(data[0].id);
    } catch (error) {
      console.error(error);
      toast.error("Could not load menu data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const activeItems = categories.find(c => c.id === activeCategory)?.items || [];

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete menu item");

      toast.success("Menu item deleted");
      await load();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete menu item");
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header + Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Menu Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and remove menu items and categories.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/menu/new">
            <Button>Create Menu Item</Button>
          </Link>
          <Link href="/admin/menu/newCategory">
            <Button variant="outline">Create Category</Button>
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b pb-2 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-t-md ${
              activeCategory === cat.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name} ({cat.items.length})
          </button>
        ))}
      </div>

      {/* Active Category Items */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : activeItems.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No items in this category</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create your first menu item for this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          activeItems.map(item => (
            <Card key={item.id} className="p-4 flex flex-col md:flex-row gap-4">
              {/* Image */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 object-cover rounded-md flex-shrink-0"
                />
              ) : (
                <div className="h-24 w-24 bg-gray-200 rounded-md flex items-center justify-center text-sm flex-shrink-0">
                  No Image
                </div>
              )}

              {/* Name + Description + Price */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                    {item.description || "No description"}
                  </div>
                </div>
                <div className="mt-2 text-sm font-medium text-primary">{item.price}</div>
              </div>

              {/* Edit + Delete Buttons */}
              <div className="flex flex-col items-start gap-2">
                <Link href={`/admin/menu/${item.id}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
