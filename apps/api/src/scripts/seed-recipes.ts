/**
 * Seeds test recipes with categories, tags, ingredients, steps, macros, and images.
 * Run: cd apps/api && node --env-file=.env --import tsx/esm src/scripts/seed-recipes.ts
 */
import {
  db,
  categories,
  tags,
  recipes,
  ingredients,
  steps,
  macros,
  medias,
  recipesCategories,
  recipesTags,
  equipment,
  recipesEquipment,
} from "@cooked/db";

const CATEGORIES = [
  { name: "Plat", slug: "plat", description: "Plats principaux", order: 1 },
  { name: "Dessert", slug: "dessert", description: "Desserts et patisseries", order: 2 },
  { name: "Entree", slug: "entree", description: "Entrees et appetizers", order: 3 },
  { name: "Snack", slug: "snack", description: "Encas et collations", order: 4 },
  { name: "Boisson", slug: "boisson", description: "Boissons et smoothies", order: 5 },
];

const TAGS = [
  { name: "Japonais", slug: "japonais" },
  { name: "Fitness", slug: "fitness" },
  { name: "Vegetarien", slug: "vegetarien" },
  { name: "Rapide", slug: "rapide" },
  { name: "Comfort Food", slug: "comfort-food" },
  { name: "Italien", slug: "italien" },
  { name: "Healthy", slug: "healthy" },
  { name: "Francais", slug: "francais" },
  { name: "Creole", slug: "creole" },
];

const EQUIPMENT_LIST = [
  { name: "Poele", iconSlug: "frying-pan" },
  { name: "Casserole", iconSlug: "pot" },
  { name: "Four", iconSlug: "oven" },
  { name: "Blender", iconSlug: "blender" },
  { name: "Couteau de chef", iconSlug: "knife" },
  { name: "Planche a decouper", iconSlug: "cutting-board" },
  { name: "Fouet", iconSlug: "whisk" },
  { name: "Spatule", iconSlug: "spatula" },
];

const RECIPES = [
  {
    title: "Rougail Saucisse",
    slug: "rougail-saucisse",
    description: "Plat traditionnel reunionnais, saucisses de Toulouse mijotees dans une sauce tomate epicee au curcuma, gingembre et piment oiseau. Genereux et reconfortant.",
    prepTime: 10,
    cookTime: 50,
    difficulty: "easy" as const,
    servings: 4,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1556741601-487d577bc244?w=800&q=80",
    categorySlug: "plat",
    tagSlugs: ["creole", "comfort-food"],
    equipmentNames: ["Casserole", "Couteau de chef"],
    macroData: { kcal: 548, protein: 27, carbs: 13, fat: 42 },
    ingredientList: [
      { name: "Saucisses de Toulouse", quantity: 600, unit: "g", note: "4 grosses", order: 0 },
      { name: "Tomates concassees", quantity: 800, unit: "g", note: "1 boite", order: 1 },
      { name: "Oignons", quantity: 2, unit: null, note: "moyens", order: 2 },
      { name: "Huile d'olive", quantity: 1, unit: "c.a.s", order: 3 },
      { name: "Piment oiseau", quantity: 2, unit: null, note: "ajuster selon gout", order: 4 },
      { name: "Curcuma", quantity: 1, unit: "c.a.c", order: 5 },
      { name: "Gingembre en poudre", quantity: 0.5, unit: "c.a.c", order: 6 },
      { name: "Ail en poudre", quantity: 1, unit: "c.a.c", order: 7 },
      { name: "Bouquet garni", quantity: 1, unit: null, order: 8 },
      { name: "Sel", quantity: 0.5, unit: "c.a.c", order: 9 },
      { name: "Poivre", quantity: 2, unit: "pincees", order: 10 },
    ],
    stepList: [
      { content: "Couper les oignons en lamelles puis reserver.", order: 0 },
      { content: "Piquer les saucisses a la fourchette puis les cuire dans l'eau bouillante 10 minutes. Egoutter.", order: 1 },
      { content: "Faire revenir les oignons dans l'huile d'olive a feu moyen jusqu'a legere coloration.", order: 2 },
      { content: "Ajouter les saucisses et les faire dorer avec les oignons.", order: 3 },
      { content: "Ajouter l'ail en poudre, remuer 1 minute.", order: 4 },
      { content: "Ajouter les tomates concassees, le curcuma, le gingembre, le piment oiseau, le bouquet garni, le sel et le poivre.", order: 5 },
      { content: "Couvrir et laisser mijoter 40 minutes a feu doux en remuant toutes les 10 minutes.", order: 6 },
    ],
  },
  {
    title: "Pate a Crepes Maison",
    slug: "pate-a-crepes-maison",
    description: "Recette classique de pate a crepes moelleuses et legeres, parfumee a la vanille. Base incontournable pour crepes sucrees.",
    prepTime: 10,
    cookTime: 20,
    difficulty: "easy" as const,
    servings: 12,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1656057205408-4a0a62cf2dfb?w=800&q=80",
    categorySlug: "dessert",
    tagSlugs: ["francais", "rapide"],
    equipmentNames: ["Fouet", "Poele"],
    macroData: { kcal: 155, protein: 5, carbs: 18, fat: 7 },
    ingredientList: [
      { name: "Farine de ble", quantity: 250, unit: "g", note: "T55, T65 ou T80", order: 0 },
      { name: "Oeufs", quantity: 4, unit: null, order: 1 },
      { name: "Lait", quantity: 450, unit: "ml", note: "legerement tiede", order: 2 },
      { name: "Extrait de vanille", quantity: 1, unit: "c.a.s", note: "ou 1 sachet sucre vanille", order: 3 },
      { name: "Sucre", quantity: 2, unit: "c.a.s", order: 4 },
      { name: "Sel", quantity: 1, unit: "pincee", order: 5 },
      { name: "Beurre fondu", quantity: 50, unit: "g", order: 6 },
    ],
    stepList: [
      { content: "Faire fondre le beurre au micro-ondes.", order: 0 },
      { content: "Melanger dans un grand saladier la farine tamisee, le sucre et le sel.", order: 1 },
      { content: "Ajouter les oeufs puis le beurre fondu, melanger.", order: 2 },
      { content: "Verser progressivement le lait tout en fouettant pour eviter les grumeaux.", order: 3 },
      { content: "Ajouter la vanille et melanger.", order: 4 },
      { content: "Laisser reposer la pate 30 minutes minimum avant cuisson.", order: 5 },
      { content: "Cuire les crepes dans une poele chaude legerement beurrée, 1-2 min par face.", order: 6 },
    ],
  },
];

async function seed() {
  console.log("Seeding categories...");
  const insertedCategories = await db
    .insert(categories)
    .values(CATEGORIES)
    .onConflictDoNothing()
    .returning();
  const allCategories =
    insertedCategories.length > 0
      ? insertedCategories
      : await db.select().from(categories);
  const catMap = new Map(allCategories.map((c) => [c.slug, c.id]));

  console.log("Seeding tags...");
  const insertedTags = await db
    .insert(tags)
    .values(TAGS)
    .onConflictDoNothing()
    .returning();
  const allTags =
    insertedTags.length > 0 ? insertedTags : await db.select().from(tags);
  const tagMap = new Map(allTags.map((t) => [t.slug, t.id]));

  console.log("Seeding equipment...");
  const insertedEquipment = await db
    .insert(equipment)
    .values(EQUIPMENT_LIST)
    .onConflictDoNothing()
    .returning();
  const allEquipment =
    insertedEquipment.length > 0
      ? insertedEquipment
      : await db.select().from(equipment);
  const eqMap = new Map(allEquipment.map((e) => [e.name, e.id]));

  console.log("Seeding recipes...");
  for (const r of RECIPES) {
    const [recipe] = await db
      .insert(recipes)
      .values({
        title: r.title,
        slug: r.slug,
        description: r.description,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        difficulty: r.difficulty,
        servings: r.servings,
        status: r.status,
      })
      .onConflictDoNothing()
      .returning();

    if (!recipe) {
      console.log(`  Skipping "${r.title}" (already exists)`);
      continue;
    }

    console.log(`  Created: ${r.title}`);

    // Primary media
    await db.insert(medias).values({
      recipeId: recipe.id,
      url: r.image,
      alt: r.title,
      isPrimary: true,
    });

    // Macros
    await db.insert(macros).values({
      recipeId: recipe.id,
      ...r.macroData,
    });

    // Ingredients
    await db.insert(ingredients).values(
      r.ingredientList.map((ing) => ({
        recipeId: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        note: ing.note ?? null,
        order: ing.order,
      }))
    );

    // Steps
    await db.insert(steps).values(
      r.stepList.map((s) => ({
        recipeId: recipe.id,
        content: s.content,
        order: s.order,
      }))
    );

    // Category link
    const catId = catMap.get(r.categorySlug);
    if (catId) {
      await db
        .insert(recipesCategories)
        .values({ recipeId: recipe.id, categoryId: catId })
        .onConflictDoNothing();
    }

    // Tag links
    for (const slug of r.tagSlugs) {
      const tagId = tagMap.get(slug);
      if (tagId) {
        await db
          .insert(recipesTags)
          .values({ recipeId: recipe.id, tagId })
          .onConflictDoNothing();
      }
    }

    // Equipment links
    for (const name of r.equipmentNames) {
      const eqId = eqMap.get(name);
      if (eqId) {
        await db
          .insert(recipesEquipment)
          .values({ recipeId: recipe.id, equipmentId: eqId })
          .onConflictDoNothing();
      }
    }
  }

  console.log("\nDone! Seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
