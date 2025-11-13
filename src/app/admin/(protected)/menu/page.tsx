'use client';

import type { KeyboardEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MenuIcon,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  Eye,
  EyeOff,
  RefreshCcw,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Path, UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import type { MenuItemDTO } from '@/lib/serializers/menu';
import {
  menuItemCreateSchema,
  type MenuItemCreateInput,
  type MenuItemUpdateInput,
} from '@/lib/validation/menu';

const MENU_BUCKET_KEY = 'flamingo-cafe/';
const menuQueryKey = ['admin', 'menu-items'];

type MenuItemFormValues = z.input<typeof menuItemCreateSchema>;

type MenuItemFormProps = {
  form: UseFormReturn<MenuItemFormValues>;
  onSubmit: (values: MenuItemFormValues) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
  imagePreview: string | null;
  currentImageUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  onClearImage: () => void;
  footerContent?: React.ReactNode;
};

async function fetchMenuItems(): Promise<MenuItemDTO[]> {
  const response = await fetch('/api/menu', { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Failed to load menu items.');
  }

  return (payload?.data ?? []) as MenuItemDTO[];
}

async function uploadMenuImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/menu/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.error ?? 'Failed to upload image.');
  }

  return result as { key: string; url: string };
}

function buildDeletePayloadFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const index = url.indexOf(MENU_BUCKET_KEY);
  if (index === -1) return null;
  return url.slice(index + MENU_BUCKET_KEY.length);
}

function MenuItemForm({
  form,
  onSubmit,
  submitLabel,
  submitting,
  imagePreview,
  currentImageUrl,
  onFileSelect,
  onClearImage,
  footerContent,
}: MenuItemFormProps) {
  const displayImage = imagePreview ?? currentImageUrl ?? null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField<MenuItemFormValues, 'name'>
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Smoked salmon tart"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<MenuItemFormValues, 'price'>
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (LKR)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="1950"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField<MenuItemFormValues, 'category'>
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input
                  placeholder="Starters"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<MenuItemFormValues, 'description'>
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Tell guests why this dish is special"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
          <div className="space-y-4 rounded-lg border border-dashed border-border/60 p-4">
            <FormLabel>Feature image</FormLabel>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                onFileSelect(file ?? null);
              }}
            />
            {displayImage ? (
              <div className="relative overflow-hidden rounded-md border border-border/60 bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt="Menu item preview"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No image selected.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearImage}
                disabled={!displayImage || submitting}
              >
                Remove image
              </Button>
            </div>
          </div>

          <FormField<MenuItemFormValues, 'visible'>
            control={form.control}
            name="visible"
            render={({ field }) => (
              <FormItem className="flex h-full flex-col gap-3 rounded-lg border border-border/60 bg-muted/10 p-4">
                <FormLabel className="text-sm font-medium">
                  Visibility
                </FormLabel>
                <div className="flex items-center gap-3 rounded-md border border-border/50 bg-background/80 p-3">
                  <Switch
                    checked={field.value ?? true}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    disabled={submitting}
                    aria-label="Toggle visibility"
                  />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">
                      {field.value ?? true
                        ? 'Visible to guests'
                        : 'Hidden from guests'}
                    </p>
                    <p className="text-muted-foreground">
                      Hidden items remain stored but will not appear on the
                      public menu.
                    </p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {footerContent}
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : submitLabel}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminMenuPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'visible' | 'hidden'
  >('all');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDTO | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [shouldRemoveExistingImage, setShouldRemoveExistingImage] =
    useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemDTO | null>(null);

  const createForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemCreateSchema),
    defaultValues: {
      visible: true,
    },
  });

  const editForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemCreateSchema),
    defaultValues: {
      visible: true,
    },
  });

  useEffect(() => {
    if (!createImageFile) return;
    const nextUrl = URL.createObjectURL(createImageFile);
    setCreatePreview(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [createImageFile]);

  useEffect(() => {
    if (!editImageFile) return;
    const nextUrl = URL.createObjectURL(editImageFile);
    setEditPreview(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [editImageFile]);

  useEffect(() => {
    if (!createDialogOpen) {
      createForm.reset({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        visible: true,
      });
      setCreateImageFile(null);
      setCreatePreview(null);
    }
  }, [createDialogOpen, createForm]);

  useEffect(() => {
    if (!editDialogOpen) {
      editForm.reset({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        visible: true,
      });
      setEditingItem(null);
      setEditImageFile(null);
      setEditPreview(null);
      setShouldRemoveExistingImage(false);
    }
  }, [editDialogOpen, editForm]);

  const menuQuery = useQuery({
    queryKey: menuQueryKey,
    queryFn: fetchMenuItems,
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (payload: MenuItemCreateInput) => {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error ?? 'Failed to create menu item.');
      }

      return result as { data: MenuItemDTO };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuQueryKey });
      toast.success('Menu item created.');
      setCreateDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create menu item.'
      );
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: MenuItemUpdateInput;
    }) => {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error ?? 'Failed to update menu item.');
      }

      return result as { data: MenuItemDTO };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuQueryKey });
      toast.success('Menu item updated.');
      setEditDialogOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update menu item.'
      );
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error ?? 'Failed to delete menu item.');
      }

      return result as { success: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuQueryKey });
      toast.success('Menu item removed.');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete menu item.'
      );
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error ?? 'Failed to update visibility.');
      }

      return result as { data: MenuItemDTO };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuQueryKey });
      toast.success('Visibility updated.');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update visibility.'
      );
    },
  });

  const items = menuQuery.data ?? [];
  const totalVisible = items.filter((item) => item.visible).length;
  const totalHidden = items.length - totalVisible;

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (statusFilter === 'visible') return item.visible;
        if (statusFilter === 'hidden') return !item.visible;
        return true;
      })
      .filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term) ||
          (item.description?.toLowerCase().includes(term) ?? false)
        );
      });
  }, [items, searchTerm, statusFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category))).sort();
  }, [items]);

  const handleCreateSubmit = async (values: MenuItemFormValues) => {
    try {
      const parsed = menuItemCreateSchema.parse(values);
      let imageUrl = parsed.imageUrl ?? undefined;

      if (createImageFile) {
        const uploaded = await uploadMenuImage(createImageFile);
        imageUrl = uploaded.url;
      }

      const payload: MenuItemCreateInput = {
        ...parsed,
        visible: parsed.visible ?? true,
        imageUrl,
      };

      await createMenuItemMutation.mutateAsync(payload);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create menu item.');
      }
    }
  };

  const handleEditSubmit = async (values: MenuItemFormValues) => {
    if (!editingItem) return;

    try {
      const parsed = menuItemCreateSchema.parse(values);
      let imageUrl: string | null | undefined =
        parsed.imageUrl ?? editingItem.imageUrl ?? undefined;
      const previousImageUrl = editingItem.imageUrl ?? undefined;

      if (editImageFile) {
        const uploaded = await uploadMenuImage(editImageFile);
        imageUrl = uploaded.url;
        setShouldRemoveExistingImage(false);
      }

      if (!editImageFile && shouldRemoveExistingImage) {
        imageUrl = null;
      }

      const payload: MenuItemUpdateInput = {};
      if (parsed.name !== editingItem.name) {
        payload.name = parsed.name;
      }

      const parsedDescription = parsed.description ?? null;
      if (parsedDescription !== (editingItem.description ?? null)) {
        payload.description = parsedDescription;
      }

      if (parsed.price !== editingItem.price) {
        payload.price = parsed.price;
      }

      if (parsed.category !== editingItem.category) {
        payload.category = parsed.category;
      }

      if (
        typeof parsed.visible === 'boolean' &&
        parsed.visible !== editingItem.visible
      ) {
        payload.visible = parsed.visible;
      }

      const nextImageComparable = imageUrl ?? null;
      const currentImageComparable = editingItem.imageUrl ?? null;
      if (nextImageComparable !== currentImageComparable) {
        payload.imageUrl = nextImageComparable;
      }

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save.');
        return;
      }

      await updateMenuItemMutation.mutateAsync({
        id: editingItem.id,
        data: payload,
      });

      const keyToDelete = buildDeletePayloadFromUrl(previousImageUrl);
      if ((editImageFile || shouldRemoveExistingImage) && keyToDelete) {
        await fetch('/api/menu/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: keyToDelete }),
        }).catch(() => undefined);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update menu item.');
      }
    }
  };

  const handleDelete = async (item: MenuItemDTO) => {
    await deleteMenuItemMutation.mutateAsync(item.id);
    const keyToDelete = buildDeletePayloadFromUrl(item.imageUrl);
    if (keyToDelete) {
      await fetch('/api/menu/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToDelete }),
      }).catch(() => undefined);
    }
  };

  const openEditDialog = (item: MenuItemDTO) => {
    setEditingItem(item);
    editForm.reset({
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl ?? '',
      visible: item.visible,
    });
    setEditPreview(item.imageUrl ?? null);
    setEditImageFile(null);
    setShouldRemoveExistingImage(false);
    setEditDialogOpen(true);
  };

  const openDetailDialog = (item: MenuItemDTO) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    item: MenuItemDTO
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetailDialog(item);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-semibold text-primary">
            <MenuIcon className="h-6 w-6" aria-hidden />
            Menu management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create new dishes, update existing ones, or temporarily hide items
            from guests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => menuQuery.refetch()}
            disabled={menuQuery.isFetching}
            aria-label="Refresh"
            className="transition-transform duration-150 hover:-translate-y-0.5"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden />
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 transition-transform duration-150 hover:-translate-y-0.5">
                <Plus className="h-4 w-4" aria-hidden />
                Add menu item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add menu item</DialogTitle>
                <DialogDescription>
                  Provide guests with a compelling description and image to
                  highlight this dish.
                </DialogDescription>
              </DialogHeader>

              <MenuItemForm
                form={createForm}
                onSubmit={handleCreateSubmit}
                submitLabel="Create item"
                submitting={createMenuItemMutation.isPending}
                imagePreview={createPreview}
                currentImageUrl={null}
                onFileSelect={setCreateImageFile}
                onClearImage={() => {
                  setCreateImageFile(null);
                  setCreatePreview(null);
                  createForm.setValue('imageUrl', '');
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-dashed border-primary/30 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Total items</CardTitle>
            <CardDescription>Published and draft menu items</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-semibold">
            {items.length}
          </CardContent>
        </Card>
        <Card className="border-dashed border-primary/30 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" aria-hidden />
              Visible
            </CardTitle>
            <CardDescription>
              Guests see these items on the website
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-semibold">
            {totalVisible}
          </CardContent>
        </Card>
        <Card className="border-dashed border-primary/30 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden />
              Hidden
            </CardTitle>
            <CardDescription>Kept in draft for future service</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-semibold">
            {totalHidden}
          </CardContent>
        </Card>
        <Card className="border-dashed border-primary/30 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Categories</CardTitle>
            <CardDescription>
              Organise specials by course or theme
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-semibold">
            {categories.length}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-background/90">
        <CardHeader className="gap-4 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl">Menu items</CardTitle>
              <CardDescription>
                Search, filter, and maintain your menu in one place.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                placeholder="Search by name, category, or description"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full sm:w-72"
              />
              <Tabs
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as typeof statusFilter)
                }
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="all"
                    className="cursor-pointer transition-colors hover:text-primary"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="visible"
                    className="cursor-pointer transition-colors hover:text-primary"
                  >
                    Visible
                  </TabsTrigger>
                  <TabsTrigger
                    value="hidden"
                    className="cursor-pointer transition-colors hover:text-primary"
                  >
                    Hidden
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {menuQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/10 p-12 text-center">
              <UploadCloud
                className="h-10 w-10 text-muted-foreground"
                aria-hidden
              />
              <div className="space-y-1">
                <p className="text-lg font-medium">
                  No menu items match your filters
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting the filters or create a new dish using the
                  button above.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border transition-shadow duration-200 hover:shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openDetailDialog(item)}
                      onKeyDown={(event) => handleRowKeyDown(event, item)}
                      className="group cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <TableCell className="transition-colors group-hover:text-primary">
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="capitalize transition-colors group-hover:bg-secondary/80"
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium transition-colors group-hover:text-primary">
                        LKR{' '}
                        {item.price.toLocaleString('en-LK', {
                          minimumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.visible}
                            onCheckedChange={(checked) =>
                              toggleVisibilityMutation.mutate({
                                id: item.id,
                                visible: checked,
                              })
                            }
                            disabled={
                              toggleVisibilityMutation.isPending ||
                              deleteMenuItemMutation.isPending
                            }
                            aria-label={`Toggle visibility for ${item.name}`}
                            className="transition-transform duration-150"
                            onClick={(event) => event.stopPropagation()}
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.visible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditDialog(item);
                            }}
                            aria-label={`Edit ${item.name}`}
                            className="transition-colors hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Delete ${item.name}`}
                                disabled={deleteMenuItemMutation.isPending}
                                onClick={(event) => event.stopPropagation()}
                                className="transition-colors hover:text-destructive"
                              >
                                <Trash2
                                  className="h-4 w-4 text-destructive"
                                  aria-hidden
                                />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete menu item
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The item will no
                                  longer appear in admin or guest views.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={detailDialogOpen && !!selectedItem}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) {
            setSelectedItem(null);
          }
        }}
      >
        <DialogContent className="max-h-[80vh] max-w-xl">
          {selectedItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedItem.name}
                  <Badge
                    variant={selectedItem.visible ? 'default' : 'secondary'}
                  >
                    {selectedItem.visible ? 'Visible' : 'Hidden'}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Review full details for this menu item.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[50vh] pr-4">
                <div className="space-y-4">
                  {selectedItem.imageUrl ? (
                    <div className="overflow-hidden rounded-lg border border-border/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedItem.imageUrl}
                        alt={`${selectedItem.name} image`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="secondary" className="capitalize">
                      {selectedItem.category}
                    </Badge>
                    <span className="font-medium">
                      LKR{' '}
                      {selectedItem.price.toLocaleString('en-LK', {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      Created{' '}
                      {new Date(selectedItem.createdAt).toLocaleString('en-LK')}
                    </span>
                    <span className="text-muted-foreground">
                      Updated{' '}
                      {new Date(selectedItem.updatedAt).toLocaleString('en-LK')}
                    </span>
                  </div>
                  <div className="space-y-1 pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Description
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {selectedItem.description ?? 'No description provided.'}
                    </p>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="gap-2 sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  Item ID: {selectedItem.id}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    openEditDialog(selectedItem);
                  }}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit item
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit menu item</DialogTitle>
            <DialogDescription>
              Update details and availability before publishing to guests.
            </DialogDescription>
          </DialogHeader>

          <MenuItemForm
            form={editForm}
            onSubmit={handleEditSubmit}
            submitLabel="Save changes"
            submitting={updateMenuItemMutation.isPending}
            imagePreview={editPreview}
            currentImageUrl={
              shouldRemoveExistingImage ? null : editingItem?.imageUrl ?? null
            }
            onFileSelect={(file) => {
              setEditImageFile(file);
              if (file) {
                setShouldRemoveExistingImage(false);
              }
            }}
            onClearImage={() => {
              setEditImageFile(null);
              setEditPreview(null);
              editForm.setValue('imageUrl', '');
              setShouldRemoveExistingImage(true);
            }}
            footerContent={
              editingItem ? (
                <p className="text-xs text-muted-foreground">
                  Last updated{' '}
                  {new Date(editingItem.updatedAt).toLocaleString('en-LK')}
                </p>
              ) : null
            }
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
