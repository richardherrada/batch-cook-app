import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const updateGroceryItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      isChecked: z.boolean(),
    })
  ),
})

/**
 * Sync grocery items from the meal plan's recipes.
 * Consolidates duplicate ingredients across meals, preserves checked state.
 */
async function syncGroceryItems(planId: string) {
  // Get all recipe ingredients from the plan's slots
  const slots = await prisma.mealPlanSlot.findMany({
    where: { mealPlanId: planId },
    include: {
      recipe: {
        include: {
          recipeIngredients: {
            include: { ingredient: true },
          },
        },
      },
    },
  })

  // Consolidate ingredients: sum quantities per ingredient
  const consolidated = new Map<
    string,
    { ingredientId: string; totalQuantity: number; unit: string }
  >()

  for (const slot of slots) {
    for (const ri of slot.recipe.recipeIngredients) {
      const existing = consolidated.get(ri.ingredientId)
      if (existing) {
        existing.totalQuantity += ri.quantity
      } else {
        consolidated.set(ri.ingredientId, {
          ingredientId: ri.ingredientId,
          totalQuantity: ri.quantity,
          unit: ri.ingredient.unit,
        })
      }
    }
  }

  // Get existing grocery items to preserve checked state
  const existingItems = await prisma.groceryItem.findMany({
    where: { mealPlanId: planId },
  })
  const checkedMap = new Map(
    existingItems.map((item) => [item.ingredientId, item.isChecked])
  )

  // Delete old items and recreate (simplest way to handle removed recipes)
  await prisma.groceryItem.deleteMany({ where: { mealPlanId: planId } })

  if (consolidated.size === 0) return

  await prisma.groceryItem.createMany({
    data: Array.from(consolidated.values()).map((item) => ({
      mealPlanId: planId,
      ingredientId: item.ingredientId,
      totalQuantity: item.totalQuantity,
      unit: item.unit,
      isChecked: checkedMap.get(item.ingredientId) ?? false,
    })),
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId } = await params

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id: planId, userId: session.user.id },
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      )
    }

    // Sync grocery items from current plan recipes
    await syncGroceryItems(planId)

    const groceryItems = await prisma.groceryItem.findMany({
      where: { mealPlanId: planId },
      include: {
        ingredient: true,
      },
      orderBy: {
        ingredient: { category: "asc" },
      },
    })

    return NextResponse.json({ items: groceryItems })
  } catch (error) {
    console.error("Grocery list fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId } = await params

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id: planId, userId: session.user.id },
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = updateGroceryItemsSchema.parse(body)

    const updates = await prisma.$transaction(
      data.items.map((item) =>
        prisma.groceryItem.update({
          where: { id: item.id, mealPlanId: planId },
          data: { isChecked: item.isChecked },
        })
      )
    )

    return NextResponse.json(updates)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Grocery list update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
