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
    title: "Poulet Teriyaki",
    slug: "poulet-teriyaki",
    description: "Un poulet glace a la sauce teriyaki maison, tendre et caramelise. Accompagne de riz japonais et legumes croquants.",
    prepTime: 15,
    cookTime: 25,
    difficulty: "easy" as const,
    servings: 4,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1609183480237-ccfd2afd4e45?w=800&q=80",
    categorySlug: "plat",
    tagSlugs: ["japonais", "rapide"],
    equipmentNames: ["Poele", "Couteau de chef"],
    macroData: { kcal: 380, protein: 35, carbs: 28, fat: 12 },
    ingredientList: [
      { name: "Blancs de poulet", quantity: 600, unit: "g", order: 0 },
      { name: "Sauce soja", quantity: 4, unit: "c.a.s", order: 1 },
      { name: "Mirin", quantity: 3, unit: "c.a.s", order: 2 },
      { name: "Sucre", quantity: 2, unit: "c.a.s", order: 3 },
      { name: "Gingembre frais", quantity: 1, unit: "c.a.c", note: "rape", order: 4 },
      { name: "Ail", quantity: 2, unit: "gousses", note: "emincees", order: 5 },
      { name: "Huile de sesame", quantity: 1, unit: "c.a.s", order: 6 },
      { name: "Graines de sesame", quantity: 1, unit: "c.a.s", note: "pour decoration", order: 7 },
    ],
    stepList: [
      { content: "Melanger sauce soja, mirin, sucre, gingembre et ail dans un bol pour preparer la sauce teriyaki.", order: 0 },
      { content: "Couper les blancs de poulet en morceaux reguliers d'environ 3 cm.", order: 1 },
      { content: "Faire chauffer l'huile de sesame dans une poele a feu moyen-vif. Saisir le poulet 3 minutes de chaque cote.", order: 2 },
      { content: "Verser la sauce teriyaki sur le poulet. Laisser mijoter 8-10 minutes jusqu'a ce que la sauce epaississe et nappe le poulet.", order: 3 },
      { content: "Servir sur du riz chaud, parsemer de graines de sesame.", order: 4 },
    ],
  },
  {
    title: "Poke Bowl Saumon",
    slug: "poke-bowl-saumon",
    description: "Un bowl frais et colore avec du saumon cru marine, avocat, edamame et riz vinaigre. Le plat healthy par excellence.",
    prepTime: 20,
    cookTime: 15,
    difficulty: "easy" as const,
    servings: 2,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    categorySlug: "plat",
    tagSlugs: ["japonais", "healthy", "fitness"],
    equipmentNames: ["Couteau de chef", "Planche a decouper"],
    macroData: { kcal: 520, protein: 32, carbs: 58, fat: 18 },
    ingredientList: [
      { name: "Pave de saumon frais", quantity: 300, unit: "g", note: "qualite sushi", order: 0 },
      { name: "Riz a sushi", quantity: 200, unit: "g", order: 1 },
      { name: "Avocat", quantity: 1, unit: null, note: "mur", order: 2 },
      { name: "Edamame", quantity: 100, unit: "g", note: "decortiques", order: 3 },
      { name: "Concombre", quantity: 1, unit: null, order: 4 },
      { name: "Carotte", quantity: 1, unit: null, note: "rapee", order: 5 },
      { name: "Sauce soja", quantity: 3, unit: "c.a.s", order: 6 },
      { name: "Huile de sesame", quantity: 1, unit: "c.a.s", order: 7 },
      { name: "Graines de sesame", quantity: 1, unit: "c.a.s", order: 8 },
    ],
    stepList: [
      { content: "Cuire le riz a sushi selon les instructions. Laisser refroidir legerement et assaisonner avec du vinaigre de riz.", order: 0 },
      { content: "Couper le saumon en cubes de 2 cm. Mariner 10 minutes dans la sauce soja et l'huile de sesame.", order: 1 },
      { content: "Preparer les legumes : trancher l'avocat, couper le concombre en demi-rondelles, raper la carotte.", order: 2 },
      { content: "Repartir le riz dans les bols. Disposer harmonieusement le saumon, l'avocat, les edamame, le concombre et la carotte.", order: 3 },
      { content: "Parsemer de graines de sesame et servir avec un filet de sauce soja.", order: 4 },
    ],
  },
  {
    title: "Risotto aux Champignons",
    slug: "risotto-champignons",
    description: "Un risotto cremeux aux champignons de Paris et shiitake, parfume au parmesan et a la truffe. Reconfortant et elegant.",
    prepTime: 10,
    cookTime: 35,
    difficulty: "intermediate" as const,
    servings: 4,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80",
    categorySlug: "plat",
    tagSlugs: ["italien", "vegetarien", "comfort-food"],
    equipmentNames: ["Casserole", "Spatule", "Couteau de chef"],
    macroData: { kcal: 420, protein: 12, carbs: 52, fat: 18 },
    ingredientList: [
      { name: "Riz arborio", quantity: 300, unit: "g", order: 0 },
      { name: "Champignons de Paris", quantity: 250, unit: "g", order: 1 },
      { name: "Champignons shiitake", quantity: 100, unit: "g", order: 2 },
      { name: "Oignon", quantity: 1, unit: null, note: "emince", order: 3 },
      { name: "Vin blanc sec", quantity: 150, unit: "ml", order: 4 },
      { name: "Bouillon de legumes", quantity: 1, unit: "L", note: "chaud", order: 5 },
      { name: "Parmesan", quantity: 80, unit: "g", note: "rape", order: 6 },
      { name: "Beurre", quantity: 40, unit: "g", order: 7 },
      { name: "Huile d'olive", quantity: 2, unit: "c.a.s", order: 8 },
    ],
    stepList: [
      { content: "Emincer les champignons. Faire revenir dans l'huile d'olive a feu vif 5 min. Reserver.", order: 0 },
      { content: "Dans la meme casserole, faire suer l'oignon dans le beurre jusqu'a transparence.", order: 1 },
      { content: "Ajouter le riz arborio, toaster 2 minutes en remuant.", order: 2 },
      { content: "Deglaccer au vin blanc, laisser absorber completement.", order: 3 },
      { content: "Ajouter le bouillon chaud louche par louche, en remuant regulierement. Chaque louche doit etre absorbee avant d'ajouter la suivante. Compter 18-20 minutes.", order: 4 },
      { content: "Hors du feu, incorporer les champignons, le parmesan et une noix de beurre. Rectifier l'assaisonnement.", order: 5 },
    ],
  },
  {
    title: "Tiramisu Classique",
    slug: "tiramisu-classique",
    description: "Le tiramisu authentique italien avec mascarpone onctueux, cafe expresso et cacao amer. Un classique indemodable.",
    prepTime: 30,
    cookTime: 0,
    difficulty: "intermediate" as const,
    servings: 6,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
    categorySlug: "dessert",
    tagSlugs: ["italien", "comfort-food"],
    equipmentNames: ["Fouet", "Spatule"],
    macroData: { kcal: 340, protein: 8, carbs: 32, fat: 20 },
    ingredientList: [
      { name: "Mascarpone", quantity: 500, unit: "g", order: 0 },
      { name: "Oeufs", quantity: 4, unit: null, note: "separer blancs et jaunes", order: 1 },
      { name: "Sucre", quantity: 100, unit: "g", order: 2 },
      { name: "Cafe expresso", quantity: 300, unit: "ml", note: "froid", order: 3 },
      { name: "Biscuits cuillere", quantity: 200, unit: "g", order: 4 },
      { name: "Cacao amer en poudre", quantity: 2, unit: "c.a.s", order: 5 },
      { name: "Amaretto", quantity: 2, unit: "c.a.s", note: "optionnel", order: 6 },
    ],
    stepList: [
      { content: "Fouetter les jaunes d'oeufs avec le sucre jusqu'a blanchiment (ruban).", order: 0 },
      { content: "Incorporer delicatement le mascarpone au melange jaunes-sucre.", order: 1 },
      { content: "Monter les blancs en neige ferme. Incorporer a la spatule en 3 fois dans l'appareil.", order: 2 },
      { content: "Melanger le cafe froid avec l'amaretto si utilise. Tremper rapidement les biscuits.", order: 3 },
      { content: "Alterner couches de biscuits imbibes et creme mascarpone dans un plat. Terminer par la creme.", order: 4 },
      { content: "Refrigerer minimum 6h (idealement 12h). Saupoudrer de cacao avant de servir.", order: 5 },
    ],
  },
  {
    title: "Pad Thai Crevettes",
    slug: "pad-thai-crevettes",
    description: "Pad thai authentique aux crevettes, nouilles de riz sautees au wok avec tofu, cacahuetes et citron vert.",
    prepTime: 20,
    cookTime: 10,
    difficulty: "intermediate" as const,
    servings: 2,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    categorySlug: "plat",
    tagSlugs: ["rapide"],
    equipmentNames: ["Poele", "Spatule"],
    macroData: { kcal: 480, protein: 28, carbs: 56, fat: 16 },
    ingredientList: [
      { name: "Nouilles de riz", quantity: 200, unit: "g", order: 0 },
      { name: "Crevettes", quantity: 200, unit: "g", note: "decortiquees", order: 1 },
      { name: "Tofu ferme", quantity: 100, unit: "g", note: "en cubes", order: 2 },
      { name: "Oeufs", quantity: 2, unit: null, order: 3 },
      { name: "Pousse de soja", quantity: 100, unit: "g", order: 4 },
      { name: "Cacahuetes", quantity: 3, unit: "c.a.s", note: "concassees", order: 5 },
      { name: "Sauce poisson", quantity: 3, unit: "c.a.s", order: 6 },
      { name: "Tamarin", quantity: 2, unit: "c.a.s", note: "pate", order: 7 },
      { name: "Citron vert", quantity: 1, unit: null, order: 8 },
    ],
    stepList: [
      { content: "Tremper les nouilles de riz dans l'eau chaude 8 min. Egoutter.", order: 0 },
      { content: "Melanger sauce poisson, pate de tamarin et sucre dans un bol.", order: 1 },
      { content: "Saisir le tofu dans un wok huile a feu tres vif. Reserver.", order: 2 },
      { content: "Saisir les crevettes 2 min. Pousser sur le cote, brouiller les oeufs.", order: 3 },
      { content: "Ajouter les nouilles et la sauce. Sauter 2-3 min. Ajouter le tofu et les pousses de soja.", order: 4 },
      { content: "Servir avec cacahuetes concassees et quartiers de citron vert.", order: 5 },
    ],
  },
  {
    title: "Smoothie Bowl Acai",
    slug: "smoothie-bowl-acai",
    description: "Bowl de smoothie a l'acai, garni de granola, fruits frais et graines de chia. Petit-dejeuner energisant et colore.",
    prepTime: 10,
    cookTime: 0,
    difficulty: "easy" as const,
    servings: 1,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
    categorySlug: "snack",
    tagSlugs: ["healthy", "fitness", "vegetarien"],
    equipmentNames: ["Blender"],
    macroData: { kcal: 310, protein: 8, carbs: 48, fat: 10 },
    ingredientList: [
      { name: "Puree d'acai surgelee", quantity: 100, unit: "g", order: 0 },
      { name: "Banane", quantity: 1, unit: null, note: "surgelee", order: 1 },
      { name: "Fruits rouges", quantity: 50, unit: "g", note: "surgeles", order: 2 },
      { name: "Lait d'amande", quantity: 80, unit: "ml", order: 3 },
      { name: "Granola", quantity: 30, unit: "g", order: 4 },
      { name: "Graines de chia", quantity: 1, unit: "c.a.s", order: 5 },
      { name: "Myrtilles fraiches", quantity: 30, unit: "g", order: 6 },
      { name: "Miel", quantity: 1, unit: "c.a.c", note: "optionnel", order: 7 },
    ],
    stepList: [
      { content: "Mixer la puree d'acai, la banane surgelee, les fruits rouges et le lait d'amande jusqu'a obtenir une texture epaisse et lisse.", order: 0 },
      { content: "Verser dans un bol. La texture doit etre plus epaisse qu'un smoothie classique.", order: 1 },
      { content: "Disposer le granola, les myrtilles, les graines de chia et un filet de miel sur le dessus.", order: 2 },
    ],
  },
  {
    title: "Bruschetta Tomates Basilic",
    slug: "bruschetta-tomates-basilic",
    description: "Bruschetta croustillante aux tomates fraiches, basilic, ail et huile d'olive. L'entree italienne parfaite pour l'ete.",
    prepTime: 15,
    cookTime: 5,
    difficulty: "easy" as const,
    servings: 4,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80",
    categorySlug: "entree",
    tagSlugs: ["italien", "vegetarien", "rapide"],
    equipmentNames: ["Four", "Couteau de chef", "Planche a decouper"],
    macroData: { kcal: 180, protein: 5, carbs: 22, fat: 8 },
    ingredientList: [
      { name: "Pain ciabatta", quantity: 1, unit: null, order: 0 },
      { name: "Tomates", quantity: 4, unit: null, note: "bien mures", order: 1 },
      { name: "Basilic frais", quantity: 1, unit: "bouquet", order: 2 },
      { name: "Ail", quantity: 2, unit: "gousses", order: 3 },
      { name: "Huile d'olive extra vierge", quantity: 4, unit: "c.a.s", order: 4 },
      { name: "Vinaigre balsamique", quantity: 1, unit: "c.a.s", order: 5 },
      { name: "Sel de Maldon", quantity: null, unit: null, note: "a ajuster", order: 6 },
    ],
    stepList: [
      { content: "Couper les tomates en petits des. Melanger avec le basilic cisele, l'huile d'olive, le vinaigre et du sel.", order: 0 },
      { content: "Laisser mariner 10 min a temperature ambiante.", order: 1 },
      { content: "Trancher le pain ciabatta en biais. Griller au four 3-4 min a 200C.", order: 2 },
      { content: "Frotter les tranches chaudes avec une gousse d'ail coupee en deux.", order: 3 },
      { content: "Garnir genereusement de melange tomate-basilic. Servir immediatement.", order: 4 },
    ],
  },
  {
    title: "Banana Bread Proteine",
    slug: "banana-bread-proteine",
    description: "Un banana bread moelleux enrichi en proteines, sans sucre ajoute. Parfait en collation post-entrainement.",
    prepTime: 15,
    cookTime: 45,
    difficulty: "easy" as const,
    servings: 8,
    status: "published" as const,
    image: "https://images.unsplash.com/photo-1605090930601-29fa10ced7d5?w=800&q=80",
    categorySlug: "snack",
    tagSlugs: ["fitness", "healthy"],
    equipmentNames: ["Four", "Fouet"],
    macroData: { kcal: 195, protein: 14, carbs: 24, fat: 6 },
    ingredientList: [
      { name: "Bananes tres mures", quantity: 3, unit: null, order: 0 },
      { name: "Flocons d'avoine", quantity: 200, unit: "g", order: 1 },
      { name: "Whey proteine vanille", quantity: 30, unit: "g", order: 2 },
      { name: "Oeufs", quantity: 2, unit: null, order: 3 },
      { name: "Yaourt grec", quantity: 100, unit: "g", order: 4 },
      { name: "Levure chimique", quantity: 1, unit: "c.a.c", order: 5 },
      { name: "Cannelle", quantity: 1, unit: "c.a.c", order: 6 },
      { name: "Pepites de chocolat noir", quantity: 50, unit: "g", note: "optionnel", order: 7 },
    ],
    stepList: [
      { content: "Prechauffer le four a 180C. Chemiser un moule a cake de papier cuisson.", order: 0 },
      { content: "Ecraser les bananes a la fourchette. Melanger avec les oeufs et le yaourt grec.", order: 1 },
      { content: "Mixer les flocons d'avoine en farine grossiere. Ajouter la whey, la levure et la cannelle.", order: 2 },
      { content: "Combiner le melange sec et humide. Incorporer les pepites de chocolat.", order: 3 },
      { content: "Verser dans le moule. Enfourner 40-45 min. Verifier la cuisson avec un cure-dent.", order: 4 },
      { content: "Laisser refroidir 15 min avant de demouler.", order: 5 },
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
