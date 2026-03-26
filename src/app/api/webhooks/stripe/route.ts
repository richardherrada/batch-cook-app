import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.customer || !session.subscription) {
          break
        }

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id

        // Retrieve the subscription to determine the price/tier
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const tier = getTierFromPriceId(priceId)

        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionTier: tier,
            stripeSubscriptionId: subscriptionId,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id
        const priceId = subscription.items.data[0]?.price.id
        const tier = getTierFromPriceId(priceId)

        if (subscription.status === "active") {
          await prisma.user.update({
            where: { stripeCustomerId: customerId },
            data: { subscriptionTier: tier },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id

        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionTier: "FREE",
            stripeSubscriptionId: null,
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

function getTierFromPriceId(priceId: string): "FREE" | "PRO" | "FAMILY" {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    return "PRO"
  }
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_FAMILY_PRICE_ID) {
    return "FAMILY"
  }
  return "FREE"
}
