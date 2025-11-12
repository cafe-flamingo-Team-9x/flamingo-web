import { z } from 'zod';

const sanitizedDescription = z
  .union([z.string().trim(), z.literal('')])
  .transform((value) => (value === '' ? undefined : value))
  .optional();

const sanitizedImageUrl = z
  .union([z.string().trim().url(), z.literal(''), z.null()])
  .transform((value) => {
    if (value === '') return undefined;
    if (value === null) return null;
    return value;
  })
  .optional();

const priceField = z
  .union([z.number(), z.string()])
  .transform((value) => {
    const numericValue =
      typeof value === 'string' ? Number.parseFloat(value) : value;
    if (Number.isNaN(numericValue)) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          message: 'Price must be a valid number.',
          path: ['price'],
        },
      ]);
    }

    return numericValue;
  })
  .refine((value) => value >= 0, 'Price cannot be negative.');

const menuItemBaseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  description: sanitizedDescription,
  price: priceField,
  category: z.string().trim().min(1, 'Category is required.'),
  imageUrl: sanitizedImageUrl,
  visible: z.boolean().optional(),
});

export const menuItemCreateSchema = menuItemBaseSchema;

export const menuItemUpdateSchema = menuItemBaseSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Provide at least one field to update.',
    path: [],
  });

export type MenuItemCreateInput = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;
