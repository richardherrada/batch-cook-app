import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const createMealPlanSchema = z.object({
  weekStartDate: z.string().datetime({ message: "Invalid date format" }),
  slots: z.array(
    z.object({
      day: z.enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ]),
      slot: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
      recipeId: z.string().min(1),
    })
  ),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekParam = searchParams.get("weekStartDate")

    let weekStartDate: Date
    if (weekParam) {
      weekStartDate = new Date(weekParam)
    } else {
      // Default to current week's Monday
      const now = new Date()
      const dayOfWeek = now.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      weekStartDate = new Date(now)
      weekStartDate.setDate(now.getDate() + mondayOffset)
      weekStartDate.setHours(0, 0, 0, 0)
    }

    const mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate,
        },
      },
      include: {
        mealPlanSlots: {
          include: {
            recipe: true,
          },
        },
      },
    })

    if (!mealPlan) {
      return NextResponse.json(null)
    }

    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error("Meal plan fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createMealPlanSchema.parse(body)

    const weekStartDate = new Date(data.weekStartDate)

    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: session.user.id,
        weekStartDate,
        mealPlanSlots: {
          create: data.slots.map((slot) => ({
            day: slot.day,
            slot: slot.slot,
            recipeId: slot.recipeId,
          })),
        },
      },
      include: {
        mealPlanSlots: {
          include: {
            recipe: true,
          },
        },
      },
    })

    return NextResponse.json(mealPlan, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      )
    }

    // Handle duplicate meal plan for the same week
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { error: "A meal plan already exists for this week" },
        { status: 409 }
      )
    }

    console.error("Meal plan creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
