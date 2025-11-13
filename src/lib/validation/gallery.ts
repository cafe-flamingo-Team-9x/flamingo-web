import { z } from 'zod';

const sanitizedCaption = z
  .union([z.string().trim(), z.literal(''), z.null()])
  .transform((value) => {
    if (value === '') return null;
    return value;
  })
  .optional();

export const galleryItemCreateSchema = z.object({
  gCategory: z.string().trim().min(1, 'Category is required.'),
  caption: sanitizedCaption,
  galleryUrl: z.string().trim().url('Image URL is required.'),
  visible: z.boolean().optional().default(true),
});

export const galleryItemUpdateSchema = z
  .object({
    gCategory: z.string().trim().min(1, 'Category is required.').optional(),
    caption: sanitizedCaption,
    galleryUrl: z.string().trim().url('Image URL is required.').optional(),
    visible: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Provide at least one field to update.',
    path: [],
  });

export type GalleryItemCreateInput = z.infer<typeof galleryItemCreateSchema>;
export type GalleryItemUpdateInput = z.infer<typeof galleryItemUpdateSchema>;
