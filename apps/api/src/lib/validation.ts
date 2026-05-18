import { z } from "zod";

const MAX_TEXT = 500;
const MAX_CONTENT = 5000;

const VIDEO_URL_PATTERN = /^https:\/\/(www\.)?(youtube\.com|youtu\.be|player\.vimeo\.com|vimeo\.com)\/.+/;

function isAllowedMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost") return true;
    const apiBase = process.env.API_PUBLIC_URL;
    if (apiBase) {
      if (parsed.hostname === new URL(apiBase).hostname) return true;
    }
    const r2Base = process.env.R2_PUBLIC_URL;
    if (r2Base) {
      if (parsed.hostname === new URL(r2Base).hostname) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const createRecipeSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200),
  slug: z.string().max(200).optional(),
  description: z.string().max(MAX_CONTENT).nullable().optional(),
  prepTime: z.coerce.number().int().min(0).max(1440),
  cookTime: z.coerce.number().int().min(0).max(1440),
  difficulty: z.enum(["easy", "intermediate", "hard"]),
  servings: z.coerce.number().int().min(1).max(100),
  status: z.enum(["draft", "published"]).optional(),
  videoUrl: z.string().url().max(MAX_TEXT)
    .refine((url) => VIDEO_URL_PATTERN.test(url), { message: "URL video doit etre YouTube ou Vimeo" })
    .nullable().optional(),
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
  categoryIds: z.array(z.string().max(100)).max(20).optional(),
  tagIds: z.array(z.string().max(100)).max(30).optional(),
  medias: z
    .array(
      z.object({
        url: z.string().url().max(500)
          .refine((url) => isAllowedMediaUrl(url), { message: "URL media non autorisee" }),
        alt: z.string().max(200).nullable().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .max(10)
    .optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nom requis").max(100),
  slug: z.string().max(100).optional(),
  description: z.string().max(MAX_TEXT).nullable().optional(),
  icon: z.enum(["utensils", "pizza", "cake", "salad", "soup", "drink", "cookie", "fish", "meat", "bread", "egg", "flame"]).optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const commentStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const userPatchSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().max(MAX_TEXT).nullable().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
