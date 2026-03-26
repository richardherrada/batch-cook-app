import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const addSlotSchema = z.object({
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
  weekStartDate: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = addSlotSchema.parse(body)

    // Calculate current week's Monday if no weekStartDate provided
    let weekStartDate: Date
    if (data.weekStartDate) {
      weekStartDate = new Date(data.weekStartDate)
    } else {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      weekStartDate = new Date(now)
      weekStartDate.setDate(now.getDate() + mondayOffset)
      weekStartDate.setHours(0, 0, 0, 0)
    }

    // Find or create the meal plan for this week
    let mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate,
        },
      },
    })

    if (!mealPlan) {
      mealPlan = await prisma.mealPlan.create({
        data: {
          userId: session.user.id,
          weekStartDate,
        },
      })
    }

    // Upsert the slot (replace if already exists for this day+slot)
    const slot = await prisma.mealPlanSlot.upsert({
      where: {
        mealPlanId_day_slot: {
          mealPlanId: mealPlan.id,
          day: data.day,
          slot: data.slot,
        },
      },
      update: {
        recipeId: data.recipeId,
      },
      create: {
        mealPlanId: mealPlan.id,
        day: data.day,
        slot: data.slot,
        recipeId: data.recipeId,
      },
      include: {
        recipe: true,
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Add slot error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
