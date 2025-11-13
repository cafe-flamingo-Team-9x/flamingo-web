"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Category = { id: string; name: string };

export default function AdminMenuEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch(`/api/menu/${id}`),
          fetch("/api/category"),
        ]);
        if (!menuRes.ok) throw new Error("Menu not found");
        if (!catRes.ok) throw new Error("Failed to load categories");

        const menuData = await menuRes.json();
        const catData = await catRes.json();

        setName(menuData.name);
        setPrice(menuData.price);
        setDescription(menuData.description || "");
        setImageUrl(menuData.image || null);
        setCategoryId(menuData.categoryId);
        setCategories(catData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  // Preview for selected file
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      let uploadedUrl = imageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Image upload failed");

        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
      }

      const res = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, description, categoryId, image: uploadedUrl }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Menu item updated");
      router.push("/admin/menu");
    } catch (err) {
      console.error(err);
      toast.error("Could not update menu item");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-semibold">Edit Menu Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label>Price</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <Label>Category</Label>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-primary focus:border-primary"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Image</Label>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected Image"
              className="mb-2 h-24 w-24 object-cover rounded-md"
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Current Image"
              className="mb-2 h-24 w-24 object-cover rounded-md"
            />
          ) : null}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Updating…" : "Update"}
        </Button>
      </form>
    </div>
  );
}
