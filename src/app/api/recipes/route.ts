import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import type { Prisma } from "../../../generated/prisma/client"

const querySchema = z.object({
  search: z.string().optional(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional(),
  tags: z.string().optional(),
  maxPrepTime: z.coerce.number().int().positive().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = querySchema.parse(Object.fromEntries(searchParams))

    const where: Prisma.RecipeWhereInput = {}

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ]
    }

    if (params.mealType) {
      where.mealType = params.mealType
    }

    if (params.tags) {
      const tagList = params.tags.split(",").map((t) => t.trim())
      where.tags = { hasSome: tagList }
    }

    if (params.maxPrepTime) {
      where.prepTime = { lte: params.maxPrepTime }
    }

    if (params.difficulty) {
      where.difficulty = params.difficulty
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          recipeIngredients: {
            include: {
              ingredient: true,
            },
          },
        },
        take: params.limit,
        skip: params.offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.recipe.count({ where }),
    ])

    return NextResponse.json({
      recipes,
      total,
      limit: params.limit,
      offset: params.offset,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Recipes list error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
