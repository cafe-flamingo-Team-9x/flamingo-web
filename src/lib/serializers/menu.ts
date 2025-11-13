import type { MenuItem } from '@prisma/client';

type SerializableMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

function normalizeImageUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('.storage.supabase.co')) {
      parsed.hostname = parsed.hostname.replace(
        '.storage.supabase.co',
        '.supabase.co'
      );
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function serializeMenuItem(
  menuItem: MenuItem | null
): SerializableMenuItem | null {
  if (!menuItem) {
    return null;
  }

  return {
    id: menuItem.id,
    name: menuItem.name,
    description: menuItem.description ?? null,
    price: menuItem.price,
    category: menuItem.category,
    imageUrl: normalizeImageUrl(menuItem.imageUrl),
    visible: menuItem.visible,
    createdAt: menuItem.createdAt.toISOString(),
    updatedAt: menuItem.updatedAt.toISOString(),
  };
}

export type { SerializableMenuItem as MenuItemDTO };
