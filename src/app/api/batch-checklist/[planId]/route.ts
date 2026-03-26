import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const updateTasksSchema = z.object({
  tasks: z.array(
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

    const tasks = await prisma.batchCookTask.findMany({
      where: { mealPlanId: planId },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Batch checklist fetch error:", error)
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
    const data = updateTasksSchema.parse(body)

    const updates = await prisma.$transaction(
      data.tasks.map((task) =>
        prisma.batchCookTask.update({
          where: { id: task.id, mealPlanId: planId },
          data: { isChecked: task.isChecked },
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

    console.error("Batch checklist update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
