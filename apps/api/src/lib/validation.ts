import { z } from "zod";

const MAX_TEXT = 500;
const MAX_CONTENT = 5000;

export const createRecipeSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200),
  slug: z.string().max(200).optional(),
  description: z.string().max(MAX_CONTENT).nullable().optional(),
  prepTime: z.coerce.number().int().min(0).max(1440),
  cookTime: z.coerce.number().int().min(0).max(1440),
  difficulty: z.enum(["easy", "intermediate", "hard"]),
  servings: z.coerce.number().int().min(1).max(100),
  status: z.enum(["draft", "published"]).optional(),
  videoUrl: z.string().url().max(MAX_TEXT).nullable().optional(),
  macros: z
    .object({
      kcal: z.coerce.number().min(0).max(99999),
      protein: z.coerce.number().min(0).max(9999),
      carbs: z.coerce.number().min(0).max(9999),
      fat: z.coerce.number().min(0).max(9999),
    })
    .optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        quantity: z.coerce.number().min(0).nullable().optional(),
        unit: z.string().max(50).nullable().optional(),
        note: z.string().max(MAX_TEXT).nullable().optional(),
      }),
    )
    .max(100)
    .optional(),
  steps: z
    .array(
      z.object({
        content: z.string().min(1).max(MAX_CONTENT),
      }),
    )
    .max(50)
    .optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  slug: z.string().max(100).optional(),
  description: z.string().max(MAX_TEXT).nullable().optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const commentStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const userPatchSchema = z.object({
  role: z.string().max(50).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().max(MAX_TEXT).nullable().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
