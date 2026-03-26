import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  goal: z.enum(["WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE", "GENERAL_HEALTH"]).optional(),
  dietaryRestrictions: z.array(z.string()).optional().default([]),
  allergies: z.array(z.string()).optional().default([]),
  foodDislikes: z.array(z.string()).optional().default([]),
  servings: z.number().int().min(1).optional().default(1),
  cookDay: z.string().optional().default("sunday"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
        goal: data.goal,
        dietaryRestrictions: data.dietaryRestrictions,
        allergies: data.allergies,
        foodDislikes: data.foodDislikes,
        servings: data.servings,
        cookDay: data.cookDay,
      },
      select: {
        id: true,
        name: true,
        email: true,
        goal: true,
        dietaryRestrictions: true,
        allergies: true,
        foodDislikes: true,
        servings: true,
        cookDay: true,
        subscriptionTier: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
