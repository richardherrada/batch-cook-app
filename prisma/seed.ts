import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helper: upsert an ingredient and return its record
// ---------------------------------------------------------------------------
async function upsertIngredient(
  name: string,
  unit: string,
  category:
    | "PRODUCE"
    | "PROTEIN"
    | "DAIRY"
    | "PANTRY"
    | "FROZEN"
    | "SPICES"
    | "OTHER"
) {
  return prisma.ingredient.upsert({
    where: { name },
    update: { unit, category },
    create: { name, unit, category },
  });
}

// ---------------------------------------------------------------------------
// Helper: upsert a recipe with its ingredient links
// ---------------------------------------------------------------------------
interface RecipeInput {
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  instructions: { step: number; instruction: string; timerMinutes?: number }[];
  macros: { protein: number; carbs: number; fat: number; calories: number };
  tags: string[];
  batchCookTips: string | null;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  ingredients: { name: string; quantity: number }[];
}

async function upsertRecipe(input: RecipeInput) {
  const recipe = await prisma.recipe.upsert({
    where: { name: input.name },
    update: {
      description: input.description,
      servings: input.servings,
      prepTime: input.prepTime,
      cookTime: input.cookTime,
      difficulty: input.difficulty,
      instructions: input.instructions,
      macros: input.macros,
      tags: input.tags,
      batchCookTips: input.batchCookTips,
      mealType: input.mealType,
    },
    create: {
      name: input.name,
      description: input.description,
      servings: input.servings,
      prepTime: input.prepTime,
      cookTime: input.cookTime,
      difficulty: input.difficulty,
      instructions: input.instructions,
      macros: input.macros,
      tags: input.tags,
      batchCookTips: input.batchCookTips,
      mealType: input.mealType,
    },
  });

  // Upsert RecipeIngredient links
  for (const ing of input.ingredients) {
    const ingredient = await prisma.ingredient.findUnique({
      where: { name: ing.name },
    });
    if (!ingredient) {
      throw new Error(`Ingredient "${ing.name}" not found — seed ingredients first.`);
    }
    await prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
        },
      },
      update: { quantity: ing.quantity },
      create: {
        recipeId: recipe.id,
        ingredientId: ingredient.id,
        quantity: ing.quantity,
      },
    });
  }

  return recipe;
}

// ---------------------------------------------------------------------------
// MAIN SEED
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding ingredients...");

  // ── Proteins ──────────────────────────────────────────────────────────
  await upsertIngredient("eggs", "large", "PROTEIN");
  await upsertIngredient("chicken breast", "g", "PROTEIN");
  await upsertIngredient("ground turkey", "g", "PROTEIN");
  await upsertIngredient("salmon fillet", "g", "PROTEIN");
  await upsertIngredient("beef sirloin", "g", "PROTEIN");
  await upsertIngredient("Italian sausage", "g", "PROTEIN");
  await upsertIngredient("turkey meatballs", "g", "PROTEIN");
  await upsertIngredient("whey protein powder", "scoop", "PROTEIN");
  await upsertIngredient("bacon", "slice", "PROTEIN");
  await upsertIngredient("black beans", "g", "PROTEIN");

  // ── Dairy ─────────────────────────────────────────────────────────────
  await upsertIngredient("Greek yoghurt", "g", "DAIRY");
  await upsertIngredient("milk", "ml", "DAIRY");
  await upsertIngredient("cheddar cheese", "g", "DAIRY");
  await upsertIngredient("feta cheese", "g", "DAIRY");
  await upsertIngredient("cream cheese", "g", "DAIRY");
  await upsertIngredient("parmesan cheese", "g", "DAIRY");
  await upsertIngredient("butter", "g", "DAIRY");

  // ── Produce ───────────────────────────────────────────────────────────
  await upsertIngredient("spinach", "g", "PRODUCE");
  await upsertIngredient("bell pepper", "whole", "PRODUCE");
  await upsertIngredient("broccoli", "g", "PRODUCE");
  await upsertIngredient("zucchini", "whole", "PRODUCE");
  await upsertIngredient("sweet potato", "g", "PRODUCE");
  await upsertIngredient("cherry tomatoes", "g", "PRODUCE");
  await upsertIngredient("onion", "whole", "PRODUCE");
  await upsertIngredient("garlic", "clove", "PRODUCE");
  await upsertIngredient("lemon", "whole", "PRODUCE");
  await upsertIngredient("banana", "whole", "PRODUCE");
  await upsertIngredient("blueberries", "g", "PRODUCE");
  await upsertIngredient("apple", "whole", "PRODUCE");
  await upsertIngredient("avocado", "whole", "PRODUCE");
  await upsertIngredient("lettuce", "head", "PRODUCE");
  await upsertIngredient("cucumber", "whole", "PRODUCE");
  await upsertIngredient("carrots", "g", "PRODUCE");
  await upsertIngredient("celery", "stalk", "PRODUCE");
  await upsertIngredient("ginger", "g", "PRODUCE");
  await upsertIngredient("mushrooms", "g", "PRODUCE");
  await upsertIngredient("green beans", "g", "PRODUCE");
  await upsertIngredient("snap peas", "g", "PRODUCE");
  await upsertIngredient("fresh herbs (parsley)", "g", "PRODUCE");
  await upsertIngredient("fresh basil", "g", "PRODUCE");

  // ── Pantry ────────────────────────────────────────────────────────────
  await upsertIngredient("oats", "g", "PANTRY");
  await upsertIngredient("chia seeds", "g", "PANTRY");
  await upsertIngredient("quinoa", "g", "PANTRY");
  await upsertIngredient("couscous", "g", "PANTRY");
  await upsertIngredient("brown rice", "g", "PANTRY");
  await upsertIngredient("flour", "g", "PANTRY");
  await upsertIngredient("olive oil", "ml", "PANTRY");
  await upsertIngredient("soy sauce", "ml", "PANTRY");
  await upsertIngredient("honey", "ml", "PANTRY");
  await upsertIngredient("maple syrup", "ml", "PANTRY");
  await upsertIngredient("peanut butter", "g", "PANTRY");
  await upsertIngredient("almond butter", "g", "PANTRY");
  await upsertIngredient("tortilla wraps", "whole", "PANTRY");
  await upsertIngredient("chicken broth", "ml", "PANTRY");
  await upsertIngredient("canned diced tomatoes", "g", "PANTRY");
  await upsertIngredient("coconut milk", "ml", "PANTRY");
  await upsertIngredient("hummus", "g", "PANTRY");
  await upsertIngredient("dark chocolate chips", "g", "PANTRY");
  await upsertIngredient("dried cranberries", "g", "PANTRY");
  await upsertIngredient("mixed nuts", "g", "PANTRY");
  await upsertIngredient("baking powder", "tsp", "PANTRY");
  await upsertIngredient("vanilla extract", "tsp", "PANTRY");
  await upsertIngredient("dates", "g", "PANTRY");
  await upsertIngredient("shredded coconut", "g", "PANTRY");
  await upsertIngredient("granola", "g", "PANTRY");
  await upsertIngredient("salsa", "g", "PANTRY");
  await upsertIngredient("marinara sauce", "ml", "PANTRY");
  await upsertIngredient("sesame oil", "ml", "PANTRY");
  await upsertIngredient("rice vinegar", "ml", "PANTRY");
  await upsertIngredient("trail mix", "g", "PANTRY");

  // ── Spices ────────────────────────────────────────────────────────────
  await upsertIngredient("salt", "tsp", "SPICES");
  await upsertIngredient("black pepper", "tsp", "SPICES");
  await upsertIngredient("cumin", "tsp", "SPICES");
  await upsertIngredient("paprika", "tsp", "SPICES");
  await upsertIngredient("oregano", "tsp", "SPICES");
  await upsertIngredient("chili flakes", "tsp", "SPICES");
  await upsertIngredient("cinnamon", "tsp", "SPICES");
  await upsertIngredient("turmeric", "tsp", "SPICES");
  await upsertIngredient("Italian seasoning", "tsp", "SPICES");
  await upsertIngredient("garlic powder", "tsp", "SPICES");

  // ── Frozen ────────────────────────────────────────────────────────────
  await upsertIngredient("frozen mixed berries", "g", "FROZEN");
  await upsertIngredient("frozen peas", "g", "FROZEN");

  console.log("Seeding recipes...");

  // =====================================================================
  // BREAKFASTS (5)
  // =====================================================================

  await upsertRecipe({
    name: "Egg Muffins with Spinach & Peppers",
    description:
      "Protein-packed egg muffins loaded with spinach and bell peppers. Make a dozen on Sunday and reheat all week.",
    servings: 4,
    prepTime: 10,
    cookTime: 20,
    difficulty: "EASY",
    mealType: "BREAKFAST",
    tags: ["high-protein", "meal-prep", "gluten-free", "low-carb"],
    batchCookTips:
      "Store in an airtight container in the fridge for up to 5 days. Reheat in the microwave for 45 seconds.",
    macros: { protein: 18, carbs: 4, fat: 12, calories: 196 },
    instructions: [
      { step: 1, instruction: "Preheat oven to 190°C (375°F). Grease a 12-cup muffin tin with olive oil." },
      { step: 2, instruction: "Dice bell peppers and roughly chop spinach." },
      { step: 3, instruction: "Whisk 8 eggs with salt, pepper, and a splash of milk." },
      { step: 4, instruction: "Divide spinach and peppers among the muffin cups." },
      { step: 5, instruction: "Pour egg mixture evenly into each cup, filling about 3/4 full." },
      { step: 6, instruction: "Top with shredded cheddar cheese." },
      { step: 7, instruction: "Bake for 18-20 minutes until set and lightly golden.", timerMinutes: 20 },
      { step: 8, instruction: "Cool in the tin for 5 minutes, then transfer to a wire rack.", timerMinutes: 5 },
    ],
    ingredients: [
      { name: "eggs", quantity: 8 },
      { name: "spinach", quantity: 60 },
      { name: "bell pepper", quantity: 2 },
      { name: "cheddar cheese", quantity: 40 },
      { name: "milk", quantity: 30 },
      { name: "olive oil", quantity: 5 },
      { name: "salt", quantity: 0.5 },
      { name: "black pepper", quantity: 0.25 },
    ],
  });

  await upsertRecipe({
    name: "Overnight Chia Pudding",
    description:
      "Creamy chia seed pudding layered with fresh blueberries. Prep in 5 minutes the night before.",
    servings: 4,
    prepTime: 5,
    cookTime: 0,
    difficulty: "EASY",
    mealType: "BREAKFAST",
    tags: ["vegan-option", "meal-prep", "no-cook", "high-fibre"],
    batchCookTips:
      "Prepare 4 jars at once. Keeps in the fridge for up to 4 days. Add toppings just before eating for best texture.",
    macros: { protein: 8, carbs: 28, fat: 10, calories: 230 },
    instructions: [
      { step: 1, instruction: "In each jar, combine 40 g chia seeds with 200 ml milk." },
      { step: 2, instruction: "Add 1 tsp honey and 0.5 tsp vanilla extract to each jar. Stir well." },
      { step: 3, instruction: "Seal jars and refrigerate overnight (at least 6 hours)." },
      { step: 4, instruction: "In the morning, stir the pudding and top with fresh blueberries." },
      { step: 5, instruction: "Optionally drizzle with extra honey and a sprinkle of granola." },
    ],
    ingredients: [
      { name: "chia seeds", quantity: 160 },
      { name: "milk", quantity: 800 },
      { name: "honey", quantity: 20 },
      { name: "vanilla extract", quantity: 2 },
      { name: "blueberries", quantity: 200 },
    ],
  });

  await upsertRecipe({
    name: "Greek Yoghurt Parfait",
    description:
      "Layers of thick Greek yoghurt, crunchy granola, and mixed berries. A balanced breakfast in a jar.",
    servings: 2,
    prepTime: 5,
    cookTime: 0,
    difficulty: "EASY",
    mealType: "BREAKFAST",
    tags: ["high-protein", "quick", "vegetarian"],
    batchCookTips:
      "Layer granola separately in a small bag so it stays crunchy. Assemble yoghurt and berries in jars up to 2 days ahead.",
    macros: { protein: 20, carbs: 35, fat: 8, calories: 290 },
    instructions: [
      { step: 1, instruction: "Spoon 100 g Greek yoghurt into the bottom of each jar or glass." },
      { step: 2, instruction: "Add a layer of granola (30 g per serving)." },
      { step: 3, instruction: "Add a layer of frozen mixed berries." },
      { step: 4, instruction: "Repeat layers: yoghurt, granola, berries." },
      { step: 5, instruction: "Drizzle the top with honey and serve immediately (or seal and refrigerate)." },
    ],
    ingredients: [
      { name: "Greek yoghurt", quantity: 200 },
      { name: "granola", quantity: 60 },
      { name: "frozen mixed berries", quantity: 120 },
      { name: "honey", quantity: 10 },
    ],
  });

  await upsertRecipe({
    name: "Overnight Oats with Banana & Peanut Butter",
    description:
      "Creamy overnight oats swirled with peanut butter and topped with sliced banana. No cooking required.",
    servings: 4,
    prepTime: 10,
    cookTime: 0,
    difficulty: "EASY",
    mealType: "BREAKFAST",
    tags: ["meal-prep", "no-cook", "vegetarian", "high-fibre"],
    batchCookTips:
      "Make 4 jars on Sunday evening. They keep perfectly for 4 days. Slice banana fresh each morning.",
    macros: { protein: 14, carbs: 45, fat: 12, calories: 340 },
    instructions: [
      { step: 1, instruction: "In each jar, combine 60 g oats, 150 ml milk, and 1 tbsp chia seeds." },
      { step: 2, instruction: "Add 1 tbsp peanut butter and 1 tsp maple syrup. Stir thoroughly." },
      { step: 3, instruction: "Seal and refrigerate overnight (minimum 6 hours)." },
      { step: 4, instruction: "In the morning, stir, then top with sliced banana." },
      { step: 5, instruction: "Optionally sprinkle with cinnamon." },
    ],
    ingredients: [
      { name: "oats", quantity: 240 },
      { name: "milk", quantity: 600 },
      { name: "chia seeds", quantity: 40 },
      { name: "peanut butter", quantity: 60 },
      { name: "maple syrup", quantity: 20 },
      { name: "banana", quantity: 4 },
      { name: "cinnamon", quantity: 1 },
    ],
  });

  await upsertRecipe({
    name: "Protein Pancakes",
    description:
      "Fluffy pancakes with a protein boost from whey powder and Greek yoghurt. Freezer-friendly for quick mornings.",
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    difficulty: "EASY",
    mealType: "BREAKFAST",
    tags: ["high-protein", "freezer-friendly", "batch-cook"],
    batchCookTips:
      "Cook a full batch and freeze in stacks with parchment between each pancake. Reheat from frozen in a toaster for 2 minutes.",
    macros: { protein: 26, carbs: 30, fat: 8, calories: 296 },
    instructions: [
      { step: 1, instruction: "Mash 2 bananas in a large bowl." },
      { step: 2, instruction: "Add eggs, Greek yoghurt, and whey protein powder. Whisk until smooth." },
      { step: 3, instruction: "Fold in oats, baking powder, and a pinch of cinnamon." },
      { step: 4, instruction: "Heat a non-stick pan over medium heat and lightly grease with butter." },
      { step: 5, instruction: "Pour ~60 ml batter per pancake. Cook until bubbles form on the surface (about 2 minutes).", timerMinutes: 2 },
      { step: 6, instruction: "Flip and cook the other side until golden (about 1-2 minutes).", timerMinutes: 2 },
      { step: 7, instruction: "Repeat with remaining batter. Serve with maple syrup and berries." },
    ],
    ingredients: [
      { name: "banana", quantity: 2 },
      { name: "eggs", quantity: 4 },
      { name: "Greek yoghurt", quantity: 120 },
      { name: "whey protein powder", quantity: 2 },
      { name: "oats", quantity: 120 },
      { name: "baking powder", quantity: 2 },
      { name: "cinnamon", quantity: 0.5 },
      { name: "butter", quantity: 10 },
      { name: "maple syrup", quantity: 20 },
    ],
  });

  // =====================================================================
  // LUNCHES (5)
  // =====================================================================

  await upsertRecipe({
    name: "Hearty Chicken & Vegetable Soup",
    description:
      "A nourishing chicken soup packed with vegetables. Makes a huge batch that freezes beautifully.",
    servings: 6,
    prepTime: 15,
    cookTime: 40,
    difficulty: "EASY",
    mealType: "LUNCH",
    tags: ["batch-cook", "freezer-friendly", "high-protein", "low-fat"],
    batchCookTips:
      "Freeze in individual portions. Defrost overnight in the fridge and reheat on the stove or in the microwave. Keeps frozen for up to 3 months.",
    macros: { protein: 30, carbs: 18, fat: 6, calories: 246 },
    instructions: [
      { step: 1, instruction: "Dice onion, carrots, and celery. Mince garlic." },
      { step: 2, instruction: "Heat olive oil in a large pot over medium heat. Sauté onion, carrots, and celery for 5 minutes.", timerMinutes: 5 },
      { step: 3, instruction: "Add garlic and cook for 1 minute until fragrant." },
      { step: 4, instruction: "Add diced chicken breast and cook until no longer pink, about 5 minutes.", timerMinutes: 5 },
      { step: 5, instruction: "Pour in chicken broth. Add salt, pepper, turmeric, and oregano." },
      { step: 6, instruction: "Bring to a boil, then reduce heat and simmer for 25 minutes.", timerMinutes: 25 },
      { step: 7, instruction: "Add frozen peas in the last 5 minutes of cooking.", timerMinutes: 5 },
      { step: 8, instruction: "Taste and adjust seasoning. Serve with fresh parsley." },
    ],
    ingredients: [
      { name: "chicken breast", quantity: 500 },
      { name: "onion", quantity: 1 },
      { name: "carrots", quantity: 150 },
      { name: "celery", quantity: 3 },
      { name: "garlic", quantity: 3 },
      { name: "chicken broth", quantity: 1500 },
      { name: "olive oil", quantity: 15 },
      { name: "frozen peas", quantity: 100 },
      { name: "salt", quantity: 1 },
      { name: "black pepper", quantity: 0.5 },
      { name: "turmeric", quantity: 0.5 },
      { name: "oregano", quantity: 1 },
      { name: "fresh herbs (parsley)", quantity: 10 },
    ],
  });

  await upsertRecipe({
    name: "Quinoa Power Bowl",
    description:
      "A colourful grain bowl with quinoa, roasted sweet potato, chickpeas-style black beans, avocado, and a lemon-tahini dressing.",
    servings: 4,
    prepTime: 15,
    cookTime: 25,
    difficulty: "MEDIUM",
    mealType: "LUNCH",
    tags: ["meal-prep", "vegetarian", "high-fibre", "balanced"],
    batchCookTips:
      "Cook quinoa and roast sweet potatoes in bulk. Store components separately and assemble each morning. Dressing keeps for 5 days.",
    macros: { protein: 16, carbs: 52, fat: 14, calories: 394 },
    instructions: [
      { step: 1, instruction: "Rinse quinoa and cook according to package directions (usually 15 min in 2:1 water ratio).", timerMinutes: 15 },
      { step: 2, instruction: "Preheat oven to 200°C (400°F). Cube sweet potatoes and toss with olive oil, salt, and paprika." },
      { step: 3, instruction: "Roast sweet potatoes for 25 minutes until tender and caramelised.", timerMinutes: 25 },
      { step: 4, instruction: "Drain and rinse black beans." },
      { step: 5, instruction: "Assemble bowls: quinoa base, topped with sweet potato, black beans, sliced avocado, and cherry tomatoes." },
      { step: 6, instruction: "Whisk together lemon juice, olive oil, salt, and pepper for the dressing." },
      { step: 7, instruction: "Drizzle dressing over each bowl and serve." },
    ],
    ingredients: [
      { name: "quinoa", quantity: 200 },
      { name: "sweet potato", quantity: 400 },
      { name: "black beans", quantity: 240 },
      { name: "avocado", quantity: 2 },
      { name: "cherry tomatoes", quantity: 150 },
      { name: "olive oil", quantity: 30 },
      { name: "lemon", quantity: 2 },
      { name: "salt", quantity: 1 },
      { name: "paprika", quantity: 1 },
    ],
  });

  await upsertRecipe({
    name: "Turkey Lettuce Wraps",
    description:
      "Light and flavourful ground turkey in crisp lettuce cups with an Asian-inspired sauce. Ready in 15 minutes.",
    servings: 4,
    prepTime: 10,
    cookTime: 10,
    difficulty: "EASY",
    mealType: "LUNCH",
    tags: ["low-carb", "high-protein", "quick", "gluten-free"],
    batchCookTips:
      "Cook the turkey filling in bulk and refrigerate for up to 4 days. Reheat and spoon into fresh lettuce leaves at meal time.",
    macros: { protein: 28, carbs: 8, fat: 10, calories: 234 },
    instructions: [
      { step: 1, instruction: "Heat sesame oil in a large pan over medium-high heat." },
      { step: 2, instruction: "Add ground turkey and cook, breaking it up, until browned (about 6 minutes).", timerMinutes: 6 },
      { step: 3, instruction: "Add minced garlic and grated ginger. Cook for 1 minute." },
      { step: 4, instruction: "Stir in soy sauce, rice vinegar, and a drizzle of honey." },
      { step: 5, instruction: "Cook for 2 more minutes until sauce thickens slightly.", timerMinutes: 2 },
      { step: 6, instruction: "Wash and separate lettuce leaves into cups." },
      { step: 7, instruction: "Spoon turkey mixture into lettuce cups. Top with sliced carrots and fresh herbs." },
    ],
    ingredients: [
      { name: "ground turkey", quantity: 500 },
      { name: "lettuce", quantity: 1 },
      { name: "garlic", quantity: 3 },
      { name: "ginger", quantity: 10 },
      { name: "soy sauce", quantity: 30 },
      { name: "rice vinegar", quantity: 15 },
      { name: "honey", quantity: 10 },
      { name: "sesame oil", quantity: 10 },
      { name: "carrots", quantity: 80 },
    ],
  });

  await upsertRecipe({
    name: "Black Bean Burrito Bowl",
    description:
      "A Tex-Mex-inspired bowl with seasoned black beans, brown rice, salsa, and all the fixings.",
    servings: 4,
    prepTime: 10,
    cookTime: 20,
    difficulty: "EASY",
    mealType: "LUNCH",
    tags: ["meal-prep", "vegetarian", "high-fibre", "budget-friendly"],
    batchCookTips:
      "Cook rice and season beans in bulk on Sunday. Store rice, beans, and toppings separately. Assemble fresh each day.",
    macros: { protein: 14, carbs: 55, fat: 8, calories: 348 },
    instructions: [
      { step: 1, instruction: "Cook brown rice according to package directions.", timerMinutes: 20 },
      { step: 2, instruction: "In a saucepan, heat black beans with cumin, paprika, garlic powder, and a pinch of salt." },
      { step: 3, instruction: "Simmer beans for 10 minutes until heated through and seasoning is absorbed.", timerMinutes: 10 },
      { step: 4, instruction: "Dice bell peppers and cherry tomatoes." },
      { step: 5, instruction: "Assemble bowls: rice base, seasoned beans, diced peppers, tomatoes, salsa, and avocado." },
      { step: 6, instruction: "Top with a squeeze of lemon juice and fresh herbs." },
    ],
    ingredients: [
      { name: "brown rice", quantity: 200 },
      { name: "black beans", quantity: 400 },
      { name: "bell pepper", quantity: 2 },
      { name: "cherry tomatoes", quantity: 150 },
      { name: "avocado", quantity: 1 },
      { name: "salsa", quantity: 120 },
      { name: "lemon", quantity: 1 },
      { name: "cumin", quantity: 1 },
      { name: "paprika", quantity: 0.5 },
      { name: "garlic powder", quantity: 0.5 },
      { name: "salt", quantity: 0.5 },
    ],
  });

  await upsertRecipe({
    name: "Mediterranean Couscous Salad",
    description:
      "A bright, herby couscous salad with cucumber, tomatoes, feta, and a lemon-olive oil dressing.",
    servings: 4,
    prepTime: 10,
    cookTime: 5,
    difficulty: "EASY",
    mealType: "LUNCH",
    tags: ["meal-prep", "vegetarian", "Mediterranean", "quick"],
    batchCookTips:
      "The salad actually improves in flavour after a day in the fridge. Keeps well for 4 days. Add feta on top just before serving to keep it from getting mushy.",
    macros: { protein: 12, carbs: 42, fat: 14, calories: 338 },
    instructions: [
      { step: 1, instruction: "Bring 300 ml water to a boil. Add couscous, cover, and remove from heat. Let sit 5 minutes.", timerMinutes: 5 },
      { step: 2, instruction: "Fluff couscous with a fork and let cool slightly." },
      { step: 3, instruction: "Dice cucumber, halve cherry tomatoes, and finely chop fresh herbs." },
      { step: 4, instruction: "Toss couscous with vegetables and herbs." },
      { step: 5, instruction: "Whisk together olive oil, lemon juice, salt, pepper, and oregano for the dressing." },
      { step: 6, instruction: "Pour dressing over the salad and toss to combine." },
      { step: 7, instruction: "Crumble feta cheese on top and serve." },
    ],
    ingredients: [
      { name: "couscous", quantity: 200 },
      { name: "cucumber", quantity: 1 },
      { name: "cherry tomatoes", quantity: 200 },
      { name: "feta cheese", quantity: 100 },
      { name: "olive oil", quantity: 30 },
      { name: "lemon", quantity: 1 },
      { name: "fresh herbs (parsley)", quantity: 15 },
      { name: "oregano", quantity: 0.5 },
      { name: "salt", quantity: 0.5 },
      { name: "black pepper", quantity: 0.25 },
    ],
  });

  // =====================================================================
  // DINNERS (5)
  // =====================================================================

  await upsertRecipe({
    name: "Lemon Herb Chicken with Roasted Vegetables",
    description:
      "Juicy lemon-herb marinated chicken thighs roasted alongside seasonal vegetables on a single sheet pan.",
    servings: 4,
    prepTime: 15,
    cookTime: 35,
    difficulty: "MEDIUM",
    mealType: "DINNER",
    tags: ["sheet-pan", "high-protein", "gluten-free", "batch-cook"],
    batchCookTips:
      "Marinate chicken the night before. Roast a double batch of vegetables. Leftovers reheat well for 3 days — slice chicken when cold for salads.",
    macros: { protein: 38, carbs: 20, fat: 14, calories: 358 },
    instructions: [
      { step: 1, instruction: "Preheat oven to 200°C (400°F)." },
      { step: 2, instruction: "Whisk together olive oil, lemon juice, minced garlic, oregano, salt, and pepper to make the marinade." },
      { step: 3, instruction: "Coat chicken breasts in the marinade. Refrigerate for at least 15 minutes (or overnight).", timerMinutes: 15 },
      { step: 4, instruction: "Cut broccoli into florets, halve cherry tomatoes, and dice zucchini." },
      { step: 5, instruction: "Spread vegetables on a sheet pan, drizzle with olive oil, and season." },
      { step: 6, instruction: "Place marinated chicken on the pan among the vegetables." },
      { step: 7, instruction: "Roast for 30-35 minutes until chicken reaches 75°C (165°F) internally.", timerMinutes: 35 },
      { step: 8, instruction: "Rest chicken for 5 minutes before slicing. Serve with the roasted veg.", timerMinutes: 5 },
    ],
    ingredients: [
      { name: "chicken breast", quantity: 600 },
      { name: "broccoli", quantity: 200 },
      { name: "cherry tomatoes", quantity: 150 },
      { name: "zucchini", quantity: 2 },
      { name: "lemon", quantity: 2 },
      { name: "garlic", quantity: 4 },
      { name: "olive oil", quantity: 30 },
      { name: "oregano", quantity: 1 },
      { name: "salt", quantity: 1 },
      { name: "black pepper", quantity: 0.5 },
    ],
  });

  await upsertRecipe({
    name: "Salmon with Roasted Sweet Potato & Green Beans",
    description:
      "Oven-baked salmon fillets served with caramelised sweet potatoes and crisp green beans. Omega-3 rich and delicious.",
    servings: 4,
    prepTime: 10,
    cookTime: 25,
    difficulty: "MEDIUM",
    mealType: "DINNER",
    tags: ["high-protein", "omega-3", "gluten-free", "sheet-pan"],
    batchCookTips:
      "Roast sweet potatoes in bulk (they keep 4 days). Cook salmon fresh or within 1 day for best texture. Green beans can be blanched ahead.",
    macros: { protein: 34, carbs: 30, fat: 16, calories: 400 },
    instructions: [
      { step: 1, instruction: "Preheat oven to 200°C (400°F)." },
      { step: 2, instruction: "Cube sweet potatoes. Toss with olive oil, salt, and paprika. Spread on a baking sheet." },
      { step: 3, instruction: "Roast sweet potatoes for 15 minutes.", timerMinutes: 15 },
      { step: 4, instruction: "Season salmon fillets with salt, pepper, lemon juice, and garlic." },
      { step: 5, instruction: "After 15 minutes, add salmon and green beans to the pan." },
      { step: 6, instruction: "Roast for another 12-15 minutes until salmon flakes easily.", timerMinutes: 12 },
      { step: 7, instruction: "Serve with lemon wedges and fresh herbs." },
    ],
    ingredients: [
      { name: "salmon fillet", quantity: 600 },
      { name: "sweet potato", quantity: 400 },
      { name: "green beans", quantity: 200 },
      { name: "olive oil", quantity: 20 },
      { name: "lemon", quantity: 1 },
      { name: "garlic", quantity: 2 },
      { name: "salt", quantity: 1 },
      { name: "black pepper", quantity: 0.5 },
      { name: "paprika", quantity: 0.5 },
    ],
  });

  await upsertRecipe({
    name: "Beef & Broccoli Stir-Fry",
    description:
      "A quick and flavourful beef stir-fry with broccoli, snap peas, and a savoury soy-ginger sauce served over rice.",
    servings: 4,
    prepTime: 15,
    cookTime: 12,
    difficulty: "MEDIUM",
    mealType: "DINNER",
    tags: ["high-protein", "quick", "Asian-inspired"],
    batchCookTips:
      "Slice beef and prep the sauce on Sunday. Store separately. Stir-frying takes only 10 minutes so cook fresh, but the prep is done. Rice can be batch-cooked.",
    macros: { protein: 32, carbs: 38, fat: 14, calories: 406 },
    instructions: [
      { step: 1, instruction: "Slice beef sirloin into thin strips against the grain." },
      { step: 2, instruction: "Whisk together soy sauce, rice vinegar, honey, sesame oil, and minced ginger for the sauce." },
      { step: 3, instruction: "Cook brown rice according to package directions.", timerMinutes: 20 },
      { step: 4, instruction: "Heat olive oil in a wok or large pan over high heat until smoking." },
      { step: 5, instruction: "Sear beef strips for 2 minutes, then remove and set aside.", timerMinutes: 2 },
      { step: 6, instruction: "Add broccoli and snap peas to the pan. Stir-fry for 3 minutes.", timerMinutes: 3 },
      { step: 7, instruction: "Return beef to the pan, pour in the sauce, and toss for 1-2 minutes until glazed.", timerMinutes: 2 },
      { step: 8, instruction: "Serve over rice and garnish with sesame seeds." },
    ],
    ingredients: [
      { name: "beef sirloin", quantity: 500 },
      { name: "broccoli", quantity: 250 },
      { name: "snap peas", quantity: 150 },
      { name: "brown rice", quantity: 200 },
      { name: "soy sauce", quantity: 40 },
      { name: "rice vinegar", quantity: 15 },
      { name: "honey", quantity: 15 },
      { name: "sesame oil", quantity: 10 },
      { name: "ginger", quantity: 15 },
      { name: "olive oil", quantity: 10 },
      { name: "garlic", quantity: 3 },
    ],
  });

  await upsertRecipe({
    name: "One-Pan Italian Sausage with Peppers & Onions",
    description:
      "Italian sausages roasted with colourful peppers, onions, and cherry tomatoes. One pan, minimal clean-up.",
    servings: 4,
    prepTime: 10,
    cookTime: 30,
    difficulty: "EASY",
    mealType: "DINNER",
    tags: ["one-pan", "batch-cook", "high-protein", "low-effort"],
    batchCookTips:
      "Double the batch and portion into containers. Slice sausages when cold for easier reheating. Pairs well with crusty bread or over pasta.",
    macros: { protein: 24, carbs: 16, fat: 22, calories: 358 },
    instructions: [
      { step: 1, instruction: "Preheat oven to 200°C (400°F)." },
      { step: 2, instruction: "Slice bell peppers into strips, quarter the onion, and halve cherry tomatoes." },
      { step: 3, instruction: "Spread vegetables on a large sheet pan. Drizzle with olive oil and Italian seasoning." },
      { step: 4, instruction: "Nestle Italian sausages among the vegetables." },
      { step: 5, instruction: "Roast for 25-30 minutes, turning sausages halfway, until cooked through and vegetables are caramelised.", timerMinutes: 30 },
      { step: 6, instruction: "Scatter fresh basil over the top and serve." },
    ],
    ingredients: [
      { name: "Italian sausage", quantity: 500 },
      { name: "bell pepper", quantity: 3 },
      { name: "onion", quantity: 2 },
      { name: "cherry tomatoes", quantity: 200 },
      { name: "olive oil", quantity: 20 },
      { name: "Italian seasoning", quantity: 2 },
      { name: "fresh basil", quantity: 10 },
      { name: "salt", quantity: 0.5 },
      { name: "black pepper", quantity: 0.25 },
    ],
  });

  await upsertRecipe({
    name: "Turkey Meatballs with Zucchini Noodles",
    description:
      "Lean turkey meatballs in marinara sauce served over spiralised zucchini noodles. A lighter take on spaghetti and meatballs.",
    servings: 4,
    prepTime: 20,
    cookTime: 25,
    difficulty: "MEDIUM",
    mealType: "DINNER",
    tags: ["high-protein", "low-carb", "gluten-free", "batch-cook"],
    batchCookTips:
      "Freeze uncooked meatballs on a tray, then transfer to a bag. Cook from frozen — just add 5 extra minutes. Spiralise zucchini fresh each time.",
    macros: { protein: 32, carbs: 14, fat: 12, calories: 292 },
    instructions: [
      { step: 1, instruction: "Preheat oven to 190°C (375°F). Line a baking sheet with parchment." },
      { step: 2, instruction: "In a bowl, combine ground turkey, minced garlic, oregano, salt, pepper, and parmesan. Mix gently." },
      { step: 3, instruction: "Roll mixture into 20 meatballs (about 30 g each)." },
      { step: 4, instruction: "Place meatballs on the baking sheet and bake for 20 minutes until golden and cooked through.", timerMinutes: 20 },
      { step: 5, instruction: "While meatballs bake, heat marinara sauce in a saucepan." },
      { step: 6, instruction: "Spiralise zucchini into noodles. Sauté zoodles in olive oil for 2-3 minutes until just tender.", timerMinutes: 3 },
      { step: 7, instruction: "Add baked meatballs to the marinara sauce and simmer for 5 minutes.", timerMinutes: 5 },
      { step: 8, instruction: "Serve meatballs and sauce over zucchini noodles. Top with parmesan." },
    ],
    ingredients: [
      { name: "ground turkey", quantity: 500 },
      { name: "zucchini", quantity: 4 },
      { name: "marinara sauce", quantity: 400 },
      { name: "parmesan cheese", quantity: 40 },
      { name: "garlic", quantity: 3 },
      { name: "olive oil", quantity: 15 },
      { name: "oregano", quantity: 1 },
      { name: "salt", quantity: 1 },
      { name: "black pepper", quantity: 0.5 },
    ],
  });

  // =====================================================================
  // SNACKS (5)
  // =====================================================================

  await upsertRecipe({
    name: "No-Bake Energy Balls",
    description:
      "Chewy, naturally sweet energy balls made with oats, peanut butter, dates, and dark chocolate chips. Perfect grab-and-go snack.",
    servings: 6,
    prepTime: 15,
    cookTime: 0,
    difficulty: "EASY",
    mealType: "SNACK",
    tags: ["no-cook", "meal-prep", "vegan-option", "energy-boost"],
    batchCookTips:
      "Roll 24 balls and store in the fridge for up to 7 days or freeze for up to 2 months. Great for lunchboxes.",
    macros: { protein: 8, carbs: 28, fat: 12, calories: 248 },
    instructions: [
      { step: 1, instruction: "Pit and roughly chop dates. Place in a food processor and pulse until a paste forms." },
      { step: 2, instruction: "Add oats, peanut butter, honey, and shredded coconut. Pulse until well combined." },
      { step: 3, instruction: "Fold in dark chocolate chips by hand." },
      { step: 4, instruction: "Roll mixture into 24 balls (about 1 tablespoon each)." },
      { step: 5, instruction: "Place on a parchment-lined tray and refrigerate for at least 30 minutes until firm.", timerMinutes: 30 },
      { step: 6, instruction: "Transfer to an airtight container and store in the fridge." },
    ],
    ingredients: [
      { name: "oats", quantity: 120 },
      { name: "peanut butter", quantity: 80 },
      { name: "dates", quantity: 100 },
      { name: "honey", quantity: 30 },
      { name: "dark chocolate chips", quantity: 50 },
      { name: "shredded coconut", quantity: 30 },
    ],
  });

  await upsertRecipe({
    name: "Hummus & Veggie Snack Box",
    description:
      "Crunchy raw vegetables paired with creamy hummus. A satisfying, nutrient-dense snack box.",
    servings: 4,
    prepTime: 10,
    cookTime: 0,
    difficulty: "EASY",
    mealType: "SNACK",
    tags: ["no-cook", "vegan", "meal-prep", "high-fibre"],
    batchCookTips:
      "Prep veggie sticks and portion hummus into small containers on Sunday. Keeps crisp for 4-5 days if stored in water.",
    macros: { protein: 6, carbs: 18, fat: 8, calories: 168 },
    instructions: [
      { step: 1, instruction: "Wash and peel carrots. Cut into sticks." },
      { step: 2, instruction: "Wash cucumber and cut into sticks." },
      { step: 3, instruction: "Wash celery and cut into sticks." },
      { step: 4, instruction: "Slice bell pepper into strips." },
      { step: 5, instruction: "Portion 50 g hummus into each of 4 small containers." },
      { step: 6, instruction: "Divide vegetable sticks among 4 snack containers alongside the hummus." },
    ],
    ingredients: [
      { name: "hummus", quantity: 200 },
      { name: "carrots", quantity: 150 },
      { name: "cucumber", quantity: 1 },
      { name: "celery", quantity: 4 },
      { name: "bell pepper", quantity: 1 },
    ],
  });

  await upsertRecipe({
    name: "Apple Peanut Butter Bites",
    description:
      "Crisp apple slices spread with peanut butter and topped with granola and dark chocolate chips. Simple and satisfying.",
    servings: 2,
    prepTime: 5,
    cookTime: 0,
    difficulty: "EASY",
    mealType: "SNACK",
    tags: ["no-cook", "quick", "vegetarian", "kid-friendly"],
    batchCookTips:
      "Pre-portion peanut butter into small cups. Slice apples fresh (or toss in lemon juice to prevent browning). Granola topping stays crunchy in a separate bag.",
    macros: { protein: 7, carbs: 30, fat: 14, calories: 270 },
    instructions: [
      { step: 1, instruction: "Core and slice 2 apples into rings or wedges." },
      { step: 2, instruction: "Spread peanut butter on each apple slice." },
      { step: 3, instruction: "Sprinkle with granola and dark chocolate chips." },
      { step: 4, instruction: "Arrange on a plate or pack into containers for snacking." },
    ],
    ingredients: [
      { name: "apple", quantity: 2 },
      { name: "peanut butter", quantity: 40 },
      { name: "granola", quantity: 30 },
      { name: "dark chocolate chips", quantity: 20 },
    ],
  });

  await upsertRecipe({
    name: "Trail Mix Bars",
    description:
      "Chewy, homemade trail mix bars packed with oats, mixed nuts, dried cranberries, and a honey binder. No baking required.",
    servings: 8,
    prepTime: 15,
    cookTime: 0,
    difficulty: "EASY",
    mealType: "SNACK",
    tags: ["no-bake", "meal-prep", "energy-boost", "portable"],
    batchCookTips:
      "Press firmly into the pan for bars that hold together. Store in the fridge for up to 10 days or freeze individually wrapped for up to 2 months.",
    macros: { protein: 6, carbs: 32, fat: 14, calories: 274 },
    instructions: [
      { step: 1, instruction: "Line a 20 cm square baking tin with parchment paper." },
      { step: 2, instruction: "In a saucepan, warm peanut butter, honey, and a pinch of salt until smooth and pourable." },
      { step: 3, instruction: "In a large bowl, combine oats, mixed nuts, dried cranberries, and dark chocolate chips." },
      { step: 4, instruction: "Pour the warm peanut butter mixture over the dry ingredients and stir until everything is coated." },
      { step: 5, instruction: "Press the mixture firmly and evenly into the lined tin." },
      { step: 6, instruction: "Refrigerate for at least 2 hours until firm.", timerMinutes: 120 },
      { step: 7, instruction: "Cut into 8 bars. Wrap individually for grab-and-go convenience." },
    ],
    ingredients: [
      { name: "oats", quantity: 150 },
      { name: "mixed nuts", quantity: 100 },
      { name: "dried cranberries", quantity: 60 },
      { name: "dark chocolate chips", quantity: 40 },
      { name: "peanut butter", quantity: 80 },
      { name: "honey", quantity: 60 },
      { name: "salt", quantity: 0.25 },
    ],
  });

  await upsertRecipe({
    name: "Greek Yoghurt Bark",
    description:
      "Frozen yoghurt bark studded with berries, granola, and a drizzle of honey. A refreshing, protein-rich snack.",
    servings: 6,
    prepTime: 10,
    cookTime: 0,
    difficulty: "EASY",
    mealType: "SNACK",
    tags: ["frozen", "meal-prep", "vegetarian", "high-protein"],
    batchCookTips:
      "Keeps in the freezer for up to 1 month. Break into pieces and store in a freezer bag. Let sit for 2 minutes before eating.",
    macros: { protein: 10, carbs: 22, fat: 4, calories: 164 },
    instructions: [
      { step: 1, instruction: "Line a baking sheet with parchment paper." },
      { step: 2, instruction: "Spread Greek yoghurt evenly on the parchment in a thin layer (about 1 cm thick)." },
      { step: 3, instruction: "Drizzle with honey." },
      { step: 4, instruction: "Scatter blueberries and frozen mixed berries over the top." },
      { step: 5, instruction: "Sprinkle with granola." },
      { step: 6, instruction: "Freeze for at least 3 hours until completely solid.", timerMinutes: 180 },
      { step: 7, instruction: "Break into irregular pieces. Store in a freezer bag." },
    ],
    ingredients: [
      { name: "Greek yoghurt", quantity: 400 },
      { name: "blueberries", quantity: 80 },
      { name: "frozen mixed berries", quantity: 80 },
      { name: "granola", quantity: 40 },
      { name: "honey", quantity: 20 },
    ],
  });

  console.log("Seed completed successfully — 20 recipes with ingredients.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
