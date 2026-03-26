import Stripe from 'stripe'

function createStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover',
  })
}

let _stripe: Stripe | undefined

export function getStripe() {
  if (!_stripe) {
    _stripe = createStripeClient()
  }
  return _stripe
}
