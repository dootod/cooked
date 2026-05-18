import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth.js";
import { recipes } from "./recipes.js";

export const commentStatusEnum = pgEnum("comment_status", [
  "pending",
  "approved",
  "rejected",
]);

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.recipeId] }),
    index("idx_favorites_user_id").on(t.userId),
    index("idx_favorites_recipe_id").on(t.recipeId),
  ],
);

export const ratings = pgTable(
  "ratings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("uq_ratings_user_recipe").on(t.userId, t.recipeId),
    index("idx_ratings_recipe_id").on(t.recipeId),
    index("idx_ratings_user_id").on(t.userId),
    check("check_score_range", sql`${t.score} >= 1 AND ${t.score} <= 5`),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    status: commentStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_comments_recipe_id").on(t.recipeId),
    index("idx_comments_user_id").on(t.userId),
  ],
);

export type Favorite = typeof favorites.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Comment = typeof comments.$inferSelect;
