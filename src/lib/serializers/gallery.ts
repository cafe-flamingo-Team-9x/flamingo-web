type SerializableGalleryItem = {
  id: string;
  gCategory: string;
  caption: string | null;
  galleryUrl: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

type GalleryItemRecord = {
  id: string;
  gCategory: string;
  caption: string | null;
  galleryUrl: string;
  visible: boolean | null | undefined;
  createdAt: Date;
  updatedAt: Date;
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

export function serializeGalleryItem(
  item: GalleryItemRecord | null
): SerializableGalleryItem | null {
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    gCategory: item.gCategory,
    caption: item.caption ?? null,
    galleryUrl: normalizeImageUrl(item.galleryUrl) ?? item.galleryUrl,
    visible: typeof item.visible === 'boolean' ? item.visible : true,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export type { SerializableGalleryItem as GalleryItemDTO };
