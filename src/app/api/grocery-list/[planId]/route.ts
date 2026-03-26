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

    // Verify the plan belongs to the user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id: planId, userId: session.user.id },
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      )
    }

    const groceryItems = await prisma.groceryItem.findMany({
      where: { mealPlanId: planId },
      include: {
        ingredient: true,
      },
      orderBy: {
        ingredient: { category: "asc" },
      },
    })

    // Group items by ingredient category
    const grouped = groceryItems.reduce(
      (acc, item) => {
        const category = item.ingredient.category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      },
      {} as Record<string, typeof groceryItems>
    )

    return NextResponse.json({ grouped, items: groceryItems })
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

    // Verify the plan belongs to the user
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
