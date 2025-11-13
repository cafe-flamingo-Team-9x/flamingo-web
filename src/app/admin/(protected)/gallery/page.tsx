'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  ImageIcon,
  Plus,
  RefreshCcw,
  Trash2,
  UploadCloud,
  Pencil,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { GalleryItemDTO } from '@/lib/serializers/gallery';
import type {
  GalleryItemCreateInput,
  GalleryItemUpdateInput,
} from '@/lib/validation/gallery';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const galleryFormSchema = z.object({
  gCategory: z.string().trim().min(1, 'Category is required.'),
  caption: z
    .union([z.string().trim(), z.literal(''), z.null()])
    .transform((value) => {
      if (value === '') return null;
      return value;
    })
    .optional(),
  visible: z.boolean(),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

type UploadResult = { key: string; url: string };
type GalleryMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  totalCategories: number;
  categoryCounts: Record<string, number>;
  latestCreatedAt: string | null;
};

type GalleryResponse = {
  data: GalleryItemDTO[];
  meta: GalleryMeta;
};

type FetchGalleryItemsParams = {
  page: number;
  pageSize: number;
};

const galleryQueryKeyRoot = ['admin', 'gallery-items'] as const;
const galleryQueryKey = (page: number, pageSize: number) =>
  [...galleryQueryKeyRoot, { page, pageSize }] as const;
type GalleryQueryKey = ReturnType<typeof galleryQueryKey>;

const GALLERY_BUCKET_KEY = 'flamingo-cafe/';

function normalizeCaptionValue(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

async function fetchGalleryItems(
  params: FetchGalleryItemsParams
): Promise<GalleryResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  const response = await fetch(`/api/gallery?${searchParams.toString()}`, {
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: unknown;
    meta?: Partial<GalleryMeta> & {
      categoryCounts?: Record<string, unknown>;
    };
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Failed to load gallery items.');
  }

  const data = Array.isArray(payload?.data)
    ? (payload.data as GalleryItemDTO[])
    : [];

  const rawMeta = payload?.meta ?? {};
  const categoryCounts =
    rawMeta.categoryCounts && typeof rawMeta.categoryCounts === 'object'
      ? Object.entries(rawMeta.categoryCounts).reduce<Record<string, number>>(
          (accumulator, [key, value]) => {
            if (typeof value === 'number' && Number.isFinite(value)) {
              accumulator[key] = value;
            }
            return accumulator;
          },
          {}
        )
      : {};

  const totalItems =
    typeof rawMeta.totalItems === 'number' &&
    Number.isFinite(rawMeta.totalItems)
      ? rawMeta.totalItems
      : data.length;

  const totalPages =
    typeof rawMeta.totalPages === 'number' &&
    Number.isFinite(rawMeta.totalPages)
      ? Math.max(1, rawMeta.totalPages)
      : Math.max(1, Math.ceil(Math.max(totalItems, 1) / params.pageSize));

  const meta: GalleryMeta = {
    page:
      typeof rawMeta.page === 'number' && Number.isFinite(rawMeta.page)
        ? Math.max(1, rawMeta.page)
        : params.page,
    pageSize:
      typeof rawMeta.pageSize === 'number' && Number.isFinite(rawMeta.pageSize)
        ? Math.max(1, Math.min(50, rawMeta.pageSize))
        : params.pageSize,
    totalItems,
    totalPages,
    totalCategories:
      typeof rawMeta.totalCategories === 'number' &&
      Number.isFinite(rawMeta.totalCategories)
        ? Math.max(0, rawMeta.totalCategories)
        : Object.keys(categoryCounts).length,
    categoryCounts,
    latestCreatedAt:
      typeof rawMeta.latestCreatedAt === 'string' &&
      rawMeta.latestCreatedAt.length > 0
        ? rawMeta.latestCreatedAt
        : null,
  };

  return { data, meta };
}

type PaginationRangeItem = number | 'ellipsis';

function buildPaginationRange(
  currentPage: number,
  totalPages: number
): PaginationRangeItem[] {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const range: PaginationRangeItem[] = [1];
  const siblings = 1;

  const clamp = (value: number, minimum: number, maximum: number) =>
    Math.min(Math.max(value, minimum), maximum);

  let leftSibling = clamp(currentPage - siblings, 2, totalPages - 1);
  let rightSibling = clamp(currentPage + siblings, 2, totalPages - 1);

  if (currentPage <= 3) {
    leftSibling = 2;
    rightSibling = 3;
  } else if (currentPage >= totalPages - 2) {
    leftSibling = totalPages - 3;
    rightSibling = totalPages - 2;
  }

  if (leftSibling > 2) {
    range.push('ellipsis');
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    range.push(page);
  }

  if (rightSibling < totalPages - 1) {
    range.push('ellipsis');
  }

  range.push(totalPages);

  return range.filter((value, index, array) => array.indexOf(value) === index);
}

async function uploadGalleryImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/gallery/upload', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Failed to upload image.');
  }

  return payload as UploadResult;
}

async function createGalleryItem(input: GalleryItemCreateInput) {
  const response = await fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error ?? 'Failed to create gallery item.');
  }

  return payload.data as GalleryItemDTO;
}

async function updateGalleryItem(id: string, input: GalleryItemUpdateInput) {
  const response = await fetch(`/api/gallery/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error ?? 'Failed to update gallery item.');
  }

  return payload.data as GalleryItemDTO;
}

async function deleteGalleryItem(id: string) {
  const response = await fetch(`/api/gallery/${id}`, {
    method: 'DELETE',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error ?? 'Failed to delete gallery item.');
  }

  return true;
}

function buildDeletePayloadFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const index = url.indexOf(GALLERY_BUCKET_KEY);
  if (index === -1) return null;
  const key = url.slice(index + GALLERY_BUCKET_KEY.length);
  return key.startsWith('gallery/') ? key : null;
}

export default function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemDTO | null>(null);

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      gCategory: '',
      caption: '',
      visible: true,
    },
  });

  const editForm = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      gCategory: '',
      caption: '',
      visible: true,
    },
  });

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  useEffect(() => {
    if (!createDialogOpen) {
      form.reset({ gCategory: '', caption: '', visible: true });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [createDialogOpen, form]);

  useEffect(() => {
    if (!editDialogOpen) {
      setEditingItem(null);
      editForm.reset({ gCategory: '', caption: '', visible: true });
    }
  }, [editDialogOpen, editForm]);

  const [pagination, setPagination] = useState<FetchGalleryItemsParams>({
    page: 1,
    pageSize: 10,
  });

  const galleryQuery = useQuery<
    GalleryResponse,
    Error,
    GalleryResponse,
    GalleryQueryKey
  >({
    queryKey: galleryQueryKey(pagination.page, pagination.pageSize),
    queryFn: () => fetchGalleryItems(pagination),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const metaPage = galleryQuery.data?.meta?.page;
    if (!metaPage) return;
    if (metaPage !== pagination.page) {
      setPagination((previous) =>
        previous.page === metaPage ? previous : { ...previous, page: metaPage }
      );
    }
  }, [galleryQuery.data?.meta?.page, pagination.page]);

  const createGalleryItemMutation = useMutation({
    mutationFn: createGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeyRoot });
      toast.success('Gallery item added.');
      setCreateDialogOpen(false);
      setPagination((previous) =>
        previous.page === 1 ? previous : { ...previous, page: 1 }
      );
    },
  });

  const updateGalleryItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GalleryItemUpdateInput }) =>
      updateGalleryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeyRoot });
      toast.success('Gallery item updated.');
      setEditDialogOpen(false);
    },
  });

  const deleteGalleryItemMutation = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryQueryKeyRoot });
      toast.success('Gallery item removed.');
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete gallery item.');
      }
    },
  });

  const isSubmitting = createGalleryItemMutation.isPending;
  const isUpdating = updateGalleryItemMutation.isPending;
  const isDeleting = deleteGalleryItemMutation.isPending;

  const items = galleryQuery.data?.data ?? [];
  const fallbackCategoryCounts = useMemo(() => {
    return items.reduce<Record<string, number>>((accumulator, item) => {
      const key = item.gCategory.trim() || 'Uncategorised';
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [items]);

  const meta = galleryQuery.data?.meta;
  const categoryCounts = meta?.categoryCounts ?? fallbackCategoryCounts;
  const totalItems = meta?.totalItems ?? items.length;
  const totalCategories =
    meta?.totalCategories ?? Object.keys(categoryCounts).length;
  const totalPages =
    meta?.totalPages ??
    Math.max(1, Math.ceil(Math.max(totalItems, 1) / pagination.pageSize));
  const currentPage = meta?.page ?? pagination.page;
  const pageSize = meta?.pageSize ?? pagination.pageSize;

  const latestItemTimestamp = useMemo(() => {
    if (items.length === 0) return null;
    return items
      .map((item) => new Date(item.createdAt).getTime())
      .filter((value) => !Number.isNaN(value))
      .reduce((latest, current) => Math.max(latest, current), 0);
  }, [items]);

  const resolvedLatestTimestamp = meta?.latestCreatedAt
    ? new Date(meta.latestCreatedAt).getTime()
    : latestItemTimestamp;

  const formattedLatestUpload = resolvedLatestTimestamp
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(resolvedLatestTimestamp))
    : '--';

  const paginationRange = useMemo(
    () => buildPaginationRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const isPageLoading = galleryQuery.isFetching;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const currentRangeStart =
    totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const currentRangeEnd =
    totalItems === 0 ? 0 : currentRangeStart + items.length - 1;

  const handlePageChange = (nextPage: number) => {
    if (nextPage === currentPage) return;
    if (nextPage < 1 || nextPage > totalPages) return;
    if (isPageLoading) return;
    setPagination((previous) => ({ ...previous, page: nextPage }));
  };

  const handleSubmit = async (values: GalleryFormValues) => {
    if (!selectedFile) {
      toast.error('Select an image to upload.');
      return;
    }

    let uploaded: UploadResult | null = null;
    try {
      uploaded = await uploadGalleryImage(selectedFile);

      await createGalleryItemMutation.mutateAsync({
        gCategory: values.gCategory,
        caption: normalizeCaptionValue(values.caption),
        galleryUrl: uploaded.url,
        visible: values.visible,
      });
    } catch (error) {
      if (uploaded?.key) {
        await fetch('/api/gallery/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: uploaded.key }),
        }).catch(() => undefined);
      }

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add gallery item.');
      }
    }
  };

  const handleEditSubmit = async (values: GalleryFormValues) => {
    if (!editingItem) {
      toast.error('No gallery item selected.');
      return;
    }

    const payload: GalleryItemUpdateInput = {};
    if (values.gCategory !== editingItem.gCategory) {
      payload.gCategory = values.gCategory;
    }

    const normalizedCaption = normalizeCaptionValue(values.caption);
    if ((editingItem.caption ?? null) !== normalizedCaption) {
      payload.caption = normalizedCaption;
    }

    if (values.visible !== editingItem.visible) {
      payload.visible = values.visible;
    }

    if (Object.keys(payload).length === 0) {
      toast.info('No changes to update.');
      return;
    }

    try {
      await updateGalleryItemMutation.mutateAsync({
        id: editingItem.id,
        data: payload,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update gallery item.');
      }
    }
  };

  const handleEditClick = (item: GalleryItemDTO) => {
    setEditingItem(item);
    editForm.reset({
      gCategory: item.gCategory,
      caption: item.caption ?? '',
      visible: item.visible ?? true,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (item: GalleryItemDTO) => {
    setPendingDeleteId(item.id);
    try {
      await deleteGalleryItemMutation.mutateAsync(item.id);

      const keyToDelete = buildDeletePayloadFromUrl(item.galleryUrl);
      if (keyToDelete) {
        await fetch('/api/gallery/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: keyToDelete }),
        }).catch(() => undefined);
      }
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-semibold text-primary">
            <ImageIcon className="h-6 w-6" aria-hidden />
            Gallery management
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload new visuals and maintain the stories that showcase the space.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => galleryQuery.refetch()}
            disabled={galleryQuery.isFetching}
            aria-label="Refresh gallery data"
            className="transition-transform duration-150 hover:-translate-y-0.5"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden />
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 transition-transform duration-150 hover:-translate-y-0.5">
                <Plus className="h-4 w-4" aria-hidden />
                Add gallery item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add gallery item</DialogTitle>
                <DialogDescription>
                  Pair each image with a meaningful category and caption to help
                  guests explore the ambiance.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="flex flex-col gap-6"
                  noValidate
                >
                  <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px] md:items-start">
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="gCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Interior, Food, Exterior"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(event) =>
                                  field.onChange(event.target.value)
                                }
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Caption</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Share the story behind this image"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(event) =>
                                  field.onChange(event.target.value)
                                }
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="visible"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 p-4">
                            <div className="space-y-1">
                              <FormLabel>Visibility</FormLabel>
                              <FormDescription>
                                Hide an image to remove it from the public
                                gallery without deleting it.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                                aria-label="Toggle gallery item visibility"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/70 p-4">
                        <UploadCloud
                          className="mt-1 h-5 w-5 text-primary"
                          aria-hidden
                        />
                        <div className="flex-1 space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Gallery image</p>
                            <p className="text-xs text-muted-foreground">
                              Upload a JPG, PNG, or WEBP. Aim for
                              high-resolution assets to keep the gallery crisp.
                            </p>
                          </div>
                          <Input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              setSelectedFile(file ?? null);
                            }}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Preview
                      </p>
                      {previewUrl ? (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border/50">
                          <Image
                            src={previewUrl}
                            alt="Gallery preview"
                            fill
                            sizes="(min-width: 768px) 260px, 100vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/30 text-xs text-muted-foreground">
                          No image selected
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        disabled={!selectedFile || isSubmitting}
                      >
                        Remove image
                      </Button>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" aria-hidden />
                          Save item
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed border-primary/30 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Total items</CardTitle>
            <CardDescription>
              Images available across the gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-semibold">
            {totalItems}
          </CardContent>
        </Card>
        <Card className="border-dashed border-primary/30 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Categories</CardTitle>
            <CardDescription>
              Distinct themes represented visually
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-semibold">
            {totalCategories}
          </CardContent>
        </Card>
        <Card className="border-dashed border-primary/30 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Latest upload</CardTitle>
            <CardDescription>
              Most recent addition to the gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-lg font-medium text-muted-foreground">
            {formattedLatestUpload}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-background/90">
        <CardHeader>
          <CardTitle className="text-xl">Gallery items</CardTitle>
          <CardDescription>
            {items.length > 0
              ? 'Review, curate, and keep the gallery current for guests browsing online.'
              : 'No gallery items yet. Upload your first image to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {galleryQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-md" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/60 p-10 text-center">
              <ImageIcon
                className="h-10 w-10 text-muted-foreground"
                aria-hidden
              />
              <div className="space-y-1">
                <p className="text-lg font-medium">Your gallery is empty</p>
                <p className="text-sm text-muted-foreground">
                  Upload your first image to showcase the ambience and dishes of
                  Flamingo Cafe.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex w-full flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative hidden h-16 w-24 overflow-hidden rounded-md border border-border/50 sm:block">
                        <Image
                          src={item.galleryUrl}
                          alt={item.caption ?? `${item.gCategory} showcase`}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="secondary"
                          className="w-fit uppercase tracking-wide"
                        >
                          {item.gCategory}
                        </Badge>
                        {item.caption ? (
                          <p className="max-w-xl text-sm text-muted-foreground line-clamp-2">
                            {item.caption}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:ml-auto sm:items-end">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
                          item.visible
                            ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20'
                        }`}
                      >
                        {item.visible ? 'Visible' : 'Hidden'}
                      </span>
                      <span>
                        Added{' '}
                        {new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'medium',
                        }).format(new Date(item.createdAt))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleEditClick(item)}
                      disabled={isUpdating && editingItem?.id === item.id}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          aria-label="Remove gallery item"
                          disabled={isDeleting && pendingDeleteId === item.id}
                        >
                          {isDeleting && pendingDeleteId === item.id ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove this gallery item?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The image will be
                            removed from the gallery immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item)}
                            disabled={isDeleting && pendingDeleteId === item.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting && pendingDeleteId === item.id
                              ? 'Removing...'
                              : 'Remove'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && totalPages > 1 ? (
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {currentRangeStart.toLocaleString()}-
                {currentRangeEnd.toLocaleString()} of{' '}
                {totalItems.toLocaleString()} items
              </p>
              <Pagination className="w-full justify-center sm:w-auto sm:justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={!canGoPrevious || isPageLoading}
                      onClick={(event) => {
                        event.preventDefault();
                        if (!canGoPrevious || isPageLoading) return;
                        handlePageChange(currentPage - 1);
                      }}
                      className={cn(
                        'transition-opacity',
                        (!canGoPrevious || isPageLoading) &&
                          'pointer-events-none opacity-50'
                      )}
                    />
                  </PaginationItem>

                  {paginationRange.map((pageEntry, index) => (
                    <PaginationItem
                      key={
                        pageEntry === 'ellipsis'
                          ? `ellipsis-${index}`
                          : `page-${pageEntry}`
                      }
                    >
                      {pageEntry === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={pageEntry === currentPage}
                          aria-label={`Go to page ${pageEntry}`}
                          onClick={(event) => {
                            event.preventDefault();
                            handlePageChange(pageEntry);
                          }}
                          className={cn(
                            'transition-opacity',
                            isPageLoading && pageEntry !== currentPage
                              ? 'pointer-events-none opacity-50'
                              : undefined
                          )}
                        >
                          {pageEntry}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={!canGoNext || isPageLoading}
                      onClick={(event) => {
                        event.preventDefault();
                        if (!canGoNext || isPageLoading) return;
                        handlePageChange(currentPage + 1);
                      }}
                      className={cn(
                        'transition-opacity',
                        (!canGoNext || isPageLoading) &&
                          'pointer-events-none opacity-50'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Categories:</span>
              {(Object.entries(categoryCounts) as Array<[string, number]>).map(
                ([category, count]) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1"
                  >
                    {category}
                    <span className="text-xs text-muted-foreground">
                      ({count})
                    </span>
                  </span>
                )
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit gallery item</DialogTitle>
            <DialogDescription>
              Update the category, caption, or visibility without re-uploading
              the image.
            </DialogDescription>
          </DialogHeader>

          {editingItem ? (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]"
                noValidate
              >
                <div className="space-y-5">
                  <FormField
                    control={editForm.control}
                    name="gCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Interior, Food, Exterior"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                            disabled={isUpdating}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Share the story behind this image"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                            disabled={isUpdating}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="visible"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 p-4">
                        <div className="space-y-1">
                          <FormLabel>Visibility</FormLabel>
                          <FormDescription>
                            Toggle to include or hide this image from the public
                            gallery.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isUpdating}
                            aria-label="Toggle gallery item visibility"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Current image
                  </p>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border/50">
                    <Image
                      src={editingItem.galleryUrl}
                      alt={
                        editingItem.caption ??
                        `${editingItem.gCategory} showcase`
                      }
                      fill
                      sizes="(min-width: 768px) 260px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Image updates are managed through a new upload. Remove the
                    item and add it again to replace the visual.
                  </p>
                </div>

                <DialogFooter className="md:col-span-2">
                  <Button type="submit" className="gap-2" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4" aria-hidden />
                        Save changes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
