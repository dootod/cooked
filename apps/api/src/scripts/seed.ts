import {
  db,
  categories,
  tags,
  recipes,
  ingredients,
  steps,
  macros,
  recipesCategories,
  recipesTags,
  equipment,
  recipesEquipment,
} from "@cooked/db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding database...");

  // Categories
  const cats = await db
    .insert(categories)
    .values([
      { name: "Plat", slug: "plat", description: "Plats principaux", icon: "pizza", order: 1 },
      { name: "Dessert", slug: "dessert", description: "Desserts et patisseries", icon: "flame", order: 2 },
      { name: "Entree", slug: "entree", description: "Entrees et appetizers", icon: "utensils", order: 3 },
      { name: "Snack", slug: "snack", description: "Encas et collations", icon: "meat", order: 4 },
      { name: "Boisson", slug: "boisson", description: "Boissons et smoothies", icon: "soup", order: 5 },
    ])
    .onConflictDoNothing()
    .returning();
  console.log(`  Categories: ${cats.length} inserted`);

  // Tags
  const tagList = await db
    .insert(tags)
    .values([
      { name: "Japonais", slug: "japonais" },
      { name: "Fitness", slug: "fitness" },
      { name: "Vegetarien", slug: "vegetarien" },
      { name: "Rapide", slug: "rapide" },
      { name: "Comfort Food", slug: "comfort-food" },
      { name: "Italien", slug: "italien" },
      { name: "Healthy", slug: "healthy" },
      { name: "Francais", slug: "francais" },
      { name: "Creole", slug: "creole" },
    ])
    .onConflictDoNothing()
    .returning();
  console.log(`  Tags: ${tagList.length} inserted`);

  // Equipment
  const equips = await db
    .insert(equipment)
    .values([
      { name: "Poele", iconSlug: "frying-pan" },
      { name: "Casserole", iconSlug: "pot" },
      { name: "Four", iconSlug: "oven" },
      { name: "Blender", iconSlug: "blender" },
      { name: "Couteau de chef", iconSlug: "knife" },
      { name: "Planche a decouper", iconSlug: "cutting-board" },
      { name: "Fouet", iconSlug: "whisk" },
      { name: "Spatule", iconSlug: "spatula" },
    ])
    .onConflictDoNothing()
    .returning();
  console.log(`  Equipment: ${equips.length} inserted`);

  // Helper to find by slug/name
  const allCats = await db.select().from(categories);
  const allTags = await db.select().from(tags);
  const allEquip = await db.select().from(equipment);
  const catBySlug = (s: string) => allCats.find((c) => c.slug === s)!;
  const tagBySlug = (s: string) => allTags.find((t) => t.slug === s)!;
  const equipByName = (n: string) => allEquip.find((e) => e.name === n)!;

  // Recipe: Rougail Saucisse
  const [rougail] = await db
    .insert(recipes)
    .values({
      title: "Rougail Saucisse",
      slug: "rougail-saucisse",
      description: "Plat traditionnel reunionnais, saucisses de Toulouse mijotees dans une sauce tomate epicee au curcuma, gingembre et piment oiseau. Genereux et reconfortant.",
      prepTime: 10,
      cookTime: 50,
      difficulty: "intermediate",
      servings: 2,
      status: "published",
    })
    .onConflictDoNothing()
    .returning();

  if (rougail) {
    await db.insert(ingredients).values([
      { recipeId: rougail.id, name: "Saucisses de Toulouse", quantity: 600, unit: "g", note: "4 grosses", order: 0 },
      { recipeId: rougail.id, name: "Tomates pelees", quantity: 800, unit: "g", note: "1 boite", order: 1 },
      { recipeId: rougail.id, name: "Oignons", quantity: 2, unit: "", note: "moyens", order: 2 },
      { recipeId: rougail.id, name: "Huile d'olive", quantity: 1, unit: "c.a.s", order: 3 },
      { recipeId: rougail.id, name: "Piment oiseau", quantity: 2, unit: "", note: "ajuster selon gout", order: 4 },
      { recipeId: rougail.id, name: "Curcuma", quantity: 1, unit: "c.a.c", order: 5 },
      { recipeId: rougail.id, name: "Gingembre en poudre", quantity: 0.5, unit: "c.a.c", order: 6 },
      { recipeId: rougail.id, name: "Ail en poudre", quantity: 1, unit: "c.a.c", order: 7 },
      { recipeId: rougail.id, name: "Bouquet garni", quantity: 1, unit: "", order: 8 },
      { recipeId: rougail.id, name: "Sel", quantity: 0.5, unit: "c.a.c", order: 9 },
      { recipeId: rougail.id, name: "Poivre", quantity: 1, unit: "c.a.c", order: 10 },
      { recipeId: rougail.id, name: "Riz thai", quantity: 160, unit: "g", note: "pese cru", order: 11 },
    ]);

    await db.insert(steps).values([
      { recipeId: rougail.id, content: "Couper les oignons en lamelles puis reserver.", order: 1 },
      { recipeId: rougail.id, content: "Piquer les saucisses a la fourchette puis les cuire dans l'eau bouillante 10 minutes. Egoutter.", order: 2 },
      { recipeId: rougail.id, content: "Faire revenir les oignons dans l'huile d'olive a feu moyen jusqu'a legere coloration.", order: 3 },
      { recipeId: rougail.id, content: "Ajouter les saucisses et les faire dorer avec les oignons.", order: 4 },
      { recipeId: rougail.id, content: "Ajouter l'ail en poudre, remuer 1 minute.", order: 5 },
      { recipeId: rougail.id, content: "Ajouter les tomates concassees, le curcuma, le gingembre, le piment oiseau, le bouquet garni, le sel et le poivre.", order: 6 },
      { recipeId: rougail.id, content: "Couvrir et laisser mijoter 40 minutes a feu doux en remuant toutes les 10 minutes.", order: 7 },
      { recipeId: rougail.id, content: "Cuire le riz et assembler.", order: 8 },
    ]);

    await db.insert(macros).values({
      recipeId: rougail.id, kcal: 2117, protein: 110, carbs: 195, fat: 99,
    });

    await db.insert(recipesCategories).values({ recipeId: rougail.id, categoryId: catBySlug("plat").id }).onConflictDoNothing();
    await db.insert(recipesTags).values([
      { recipeId: rougail.id, tagId: tagBySlug("creole").id },
      { recipeId: rougail.id, tagId: tagBySlug("comfort-food").id },
    ]).onConflictDoNothing();
    await db.insert(recipesEquipment).values([
      { recipeId: rougail.id, equipmentId: equipByName("Casserole").id },
      { recipeId: rougail.id, equipmentId: equipByName("Couteau de chef").id },
    ]).onConflictDoNothing();

    console.log("  Recipe: Rougail Saucisse");
  }

  // Recipe: Pate a Crepes Maison
  const [crepes] = await db
    .insert(recipes)
    .values({
      title: "Pate a Crepes Maison",
      slug: "pate-a-crepes-maison",
      description: "Recette classique de pate a crepes moelleuses et legeres, parfumee a la vanille. Base incontournable pour crepes sucrees.",
      prepTime: 10,
      cookTime: 20,
      difficulty: "easy",
      servings: 12,
      status: "published",
    })
    .onConflictDoNothing()
    .returning();

  if (crepes) {
    await db.insert(ingredients).values([
      { recipeId: crepes.id, name: "Farine de ble", quantity: 250, unit: "g", note: "T55, T65 ou T80", order: 0 },
      { recipeId: crepes.id, name: "Oeufs", quantity: 4, unit: "", order: 1 },
      { recipeId: crepes.id, name: "Lait", quantity: 450, unit: "ml", note: "legerement tiede", order: 2 },
      { recipeId: crepes.id, name: "Extrait de vanille", quantity: 1, unit: "c.a.s", note: "ou 1 sachet sucre vanille", order: 3 },
      { recipeId: crepes.id, name: "Sucre", quantity: 2, unit: "c.a.s", order: 4 },
      { recipeId: crepes.id, name: "Sel", quantity: 1, unit: "pincee", order: 5 },
      { recipeId: crepes.id, name: "Beurre fondu", quantity: 50, unit: "g", order: 6 },
    ]);

    await db.insert(steps).values([
      { recipeId: crepes.id, content: "Faire fondre le beurre au micro-ondes.", order: 1 },
      { recipeId: crepes.id, content: "Melanger dans un grand saladier la farine tamisee, le sucre et le sel.", order: 2 },
      { recipeId: crepes.id, content: "Ajouter les oeufs puis le beurre fondu, melanger.", order: 3 },
      { recipeId: crepes.id, content: "Verser progressivement le lait tout en fouettant pour eviter les grumeaux.", order: 4 },
      { recipeId: crepes.id, content: "Ajouter la vanille et melanger.", order: 5 },
      { recipeId: crepes.id, content: "Laisser reposer la pate 30 minutes minimum avant cuisson.", order: 6 },
      { recipeId: crepes.id, content: "Cuire les crepes dans une poele chaude legerement beurree, 1-2 min par face.", order: 7 },
    ]);

    await db.insert(macros).values({
      recipeId: crepes.id, kcal: 1911, protein: 70, carbs: 246, fat: 71,
    });

    await db.insert(recipesCategories).values({ recipeId: crepes.id, categoryId: catBySlug("dessert").id }).onConflictDoNothing();
    await db.insert(recipesTags).values([
      { recipeId: crepes.id, tagId: tagBySlug("francais").id },
      { recipeId: crepes.id, tagId: tagBySlug("rapide").id },
    ]).onConflictDoNothing();
    await db.insert(recipesEquipment).values([
      { recipeId: crepes.id, equipmentId: equipByName("Fouet").id },
      { recipeId: crepes.id, equipmentId: equipByName("Poele").id },
    ]).onConflictDoNothing();

    console.log("  Recipe: Pate a Crepes Maison");
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
