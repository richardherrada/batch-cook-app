import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { getAnthropic } from "@/lib/anthropic"

const importSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
})

async function fetchPageContent(url: string): Promise<string> {
  // Use oEmbed endpoints for known platforms to get metadata
  let oembedUrl: string | null = null

  if (url.includes("instagram.com")) {
    oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`
  } else if (url.includes("tiktok.com")) {
    oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
  }

  const parts: string[] = []

  // Try oEmbed first
  if (oembedUrl) {
    try {
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) })
      if (res.ok) {
        const data = await res.json()
        if (data.title) parts.push(`Title: ${data.title}`)
        if (data.author_name) parts.push(`Author: ${data.author_name}`)
        if (data.html) {
          // Extract text from the HTML embed
          const textMatch = data.html.replace(/<[^>]+>/g, " ").trim()
          if (textMatch) parts.push(`Content: ${textMatch}`)
        }
      }
    } catch {
      // oEmbed failed, fall through
    }
  }

  // Also fetch the page itself for og: meta tags
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BatchCookBot/1.0; +http://localhost)",
      },
    })
    if (res.ok) {
      const html = await res.text()

      // Extract useful meta tags
      const ogTitle = html.match(
        /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
      )?.[1]
      const ogDesc = html.match(
        /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
      )?.[1]
      const metaDesc = html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
      )?.[1]
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]

      if (ogTitle) parts.push(`OG Title: ${ogTitle}`)
      if (ogDesc) parts.push(`OG Description: ${ogDesc}`)
      if (metaDesc && metaDesc !== ogDesc)
        parts.push(`Meta Description: ${metaDesc}`)
      if (title && title !== ogTitle) parts.push(`Page Title: ${title}`)

      // Try to extract any JSON-LD recipe data
      const jsonLdMatch = html.match(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      )
      if (jsonLdMatch) {
        for (const match of jsonLdMatch) {
          const jsonStr = match
            .replace(/<script[^>]*>/i, "")
            .replace(/<\/script>/i, "")
          try {
            const jsonData = JSON.parse(jsonStr)
            if (
              jsonData["@type"] === "Recipe" ||
              jsonData["@type"]?.includes?.("Recipe")
            ) {
              parts.push(`Structured Recipe Data: ${JSON.stringify(jsonData)}`)
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }
  } catch {
    // page fetch failed, we might still have oEmbed data
  }

  if (parts.length === 0) {
    throw new Error(
      "Could not extract any content from that link. Make sure it's a public Instagram or TikTok post."
    )
  }

  return parts.join("\n")
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = importSchema.parse(body)

    // 1. Fetch page content / metadata
    const pageContent = await fetchPageContent(url)

    // 2. Get all recipes from DB for matching
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        mealType: true,
      },
    })

    const recipeList = recipes
      .map((r) => `- ID: ${r.id} | Name: ${r.name} | Type: ${r.mealType} | Tags: ${r.tags.join(", ")} | Desc: ${r.description.slice(0, 80)}`)
      .join("\n")

    // 3. Use Claude to identify the dish and match to our recipes
    const anthropic = getAnthropic()
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a food/recipe matching assistant. A user pasted a social media link (Instagram or TikTok) about food. I've extracted the following content from the page:

---
${pageContent}
---

Here are the recipes available in our database:

${recipeList}

Your job:
1. Figure out what dish or food the social media post is about.
2. Find the BEST matching recipe from our database. Consider the dish name, ingredients, cooking style, and meal type.
3. If multiple recipes could match, pick the closest one.
4. If nothing is even remotely close, say so.

Respond in this exact JSON format (no markdown, no code fences):
{"matched": true, "recipeId": "the-id", "recipeName": "the-name", "confidence": "high|medium|low", "explanation": "brief explanation of why this matches"}

Or if no match:
{"matched": false, "detectedDish": "what you think the post is about", "explanation": "why nothing matches"}`,
        },
      ],
    })

    const aiText =
      message.content[0].type === "text" ? message.content[0].text : ""

    let aiResult: {
      matched: boolean
      recipeId?: string
      recipeName?: string
      confidence?: string
      explanation?: string
      detectedDish?: string
    }

    try {
      aiResult = JSON.parse(aiText.trim())
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: aiText },
        { status: 500 }
      )
    }

    if (!aiResult.matched) {
      return NextResponse.json({
        matched: false,
        detectedDish: aiResult.detectedDish,
        explanation: aiResult.explanation,
        suggestions: [],
      })
    }

    // 4. Fetch the full matched recipe
    const matchedRecipe = await prisma.recipe.findUnique({
      where: { id: aiResult.recipeId },
      include: {
        recipeIngredients: {
          include: { ingredient: true },
        },
      },
    })

    if (!matchedRecipe) {
      return NextResponse.json({
        matched: false,
        detectedDish: aiResult.recipeName,
        explanation: "Matched recipe not found in database",
        suggestions: [],
      })
    }

    return NextResponse.json({
      matched: true,
      recipe: matchedRecipe,
      confidence: aiResult.confidence,
      explanation: aiResult.explanation,
      sourceUrl: url,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid URL", issues: error.issues },
        { status: 400 }
      )
    }

    const message =
      error instanceof Error ? error.message : "Internal server error"
    console.error("Import recipe error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
