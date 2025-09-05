// Hospitality Compliance SaaS - Stripe Webhook Edge Function
// This function handles Stripe webhook events for billing automation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('No signature provided', { status: 400 })
    }

    // Get the raw body
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log(`Processing Stripe event: ${event.type} (${event.id})`)

    // Log the webhook event
    await logWebhookEvent(event, true)

    // Route to appropriate handler
    try {
      switch (event.type) {
        case 'customer.created':
          await handleCustomerCreated(event)
          break
        case 'customer.updated':
          await handleCustomerUpdated(event)
          break
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event)
          break
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event)
          break
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event)
          break
        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event)
          break
        case 'invoice.payment_failed':
          await handlePaymentFailed(event)
          break
        case 'customer.subscription.trial_will_end':
          await handleTrialWillEnd(event)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })

    } catch (handlerError) {
      console.error(`Handler error for ${event.type}:`, handlerError)
      await logWebhookEvent(event, false, handlerError.message)
      
      return new Response(
        JSON.stringify({ error: 'Handler failed', details: handlerError.message }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

  } catch (error) {
    console.error('Webhook error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// =====================================================
// EVENT HANDLERS
// =====================================================

async function handleCustomerCreated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer

  console.log(`Customer created: ${customer.id} for ${customer.email}`)

  // Update client record with Stripe customer ID
  const { error } = await supabase
    .from('clients')
    .update({
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString()
    })
    .eq('business_email', customer.email)

  if (error) {
    console.error('Failed to update client with Stripe customer ID:', error)
    throw error
  }

  console.log(`Successfully linked customer ${customer.id} to client`)
}

async function handleCustomerUpdated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer

  console.log(`Customer updated: ${customer.id}`)

  // Sync customer data changes
  const { error } = await supabase
    .from('clients')
    .update({
      name: customer.name || undefined,
      business_email: customer.email || undefined,
      phone: customer.phone || undefined,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customer.id)

  if (error) {
    console.error('Failed to sync customer updates:', error)
    throw error
  }

  console.log(`Successfully synced customer ${customer.id} updates`)
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  console.log(`Subscription created: ${subscription.id} for customer ${customerId}`)

  // Get the price ID to determine plan tier
  const priceId = subscription.items.data[0].price.id
  const planTier = getPlanTierFromPriceId(priceId)

  // Update client subscription status
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: subscription.status,
      subscription_tier: planTier,
      stripe_subscription_id: subscription.id,
      subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      document_limit: getDocumentLimit(planTier),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to create subscription record:', error)
    throw error
  }

  // Reset document usage for new billing period
  await resetDocumentUsage(customerId)

  console.log(`Successfully created subscription ${subscription.id}`)
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  console.log(`Subscription updated: ${subscription.id} status: ${subscription.status}`)

  // Handle plan changes, status updates, etc.
  const priceId = subscription.items.data[0].price.id
  const planTier = getPlanTierFromPriceId(priceId)

  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: subscription.status,
      subscription_tier: planTier,
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      document_limit: getDocumentLimit(planTier),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to update subscription:', error)
    throw error
  }

  // If plan upgraded/downgraded, update document limits
  await updateDocumentLimits(customerId, planTier)

  // If subscription became active, reactivate client access
  if (subscription.status === 'active') {
    await reactivateClientAccess(customerId)
  }

  console.log(`Successfully updated subscription ${subscription.id}`)
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  console.log(`Subscription cancelled: ${subscription.id}`)

  // Deactivate client account
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'cancelled',
      subscription_tier: null,
      subscription_end_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to cancel subscription:', error)
    throw error
  }

  // Disable user access (but keep data for potential reactivation)
  await disableClientAccess(customerId)

  console.log(`Successfully cancelled subscription ${subscription.id}`)
}

async function handlePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  const customerId = invoice.customer as string

  console.log(`Payment succeeded for customer: ${customerId}`)

  // Reactivate account if it was suspended
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'active',
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to update payment success:', error)
    throw error
  }

  // Reactivate user access if it was disabled
  await reactivateClientAccess(customerId)

  // Reset document usage for new billing period if this is a subscription renewal
  if (invoice.billing_reason === 'subscription_cycle') {
    await resetDocumentUsage(customerId)
  }

  console.log(`Successfully processed payment for customer ${customerId}`)
}

async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  const customerId = invoice.customer as string

  console.log(`Payment failed for customer: ${customerId}`)

  // Mark account as past due
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to update payment failure:', error)
    throw error
  }

  // Send notification to client about failed payment (TODO: implement email notification)
  await sendPaymentFailedNotification(customerId)

  console.log(`Successfully marked customer ${customerId} as past due`)
}

async function handleTrialWillEnd(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const customerId = subscription.customer as string

  console.log(`Trial ending soon for customer: ${customerId}`)

  // Send trial ending notification (TODO: implement email notification)
  await sendTrialEndingNotification(customerId)

  console.log(`Successfully sent trial ending notification to customer ${customerId}`)
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getPlanTierFromPriceId(priceId: string): string {
  // Map your actual Stripe price IDs here
  const priceToTierMap: Record<string, string> = {
    'price_hospitality_basic_monthly': 'basic',
    'price_hospitality_professional_monthly': 'professional',
    'price_hospitality_enterprise_monthly': 'enterprise',
    // Add your actual price IDs from Stripe
  }

  return priceToTierMap[priceId] || 'basic'
}

function getDocumentLimit(planTier: string): number {
  const limits = {
    basic: 500,
    professional: 2000,
    enterprise: -1 // unlimited
  }

  return limits[planTier] || 500
}

async function resetDocumentUsage(customerId: string) {
  try {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (client) {
      const billingPeriod = new Date().toISOString().substring(0, 7) // YYYY-MM format
      
      // Clear current billing period usage
      await supabase
        .from('document_usage')
        .delete()
        .eq('client_id', client.id)
        .eq('billing_period', billingPeriod)

      console.log(`Reset document usage for client ${client.id}`)
    }
  } catch (error) {
    console.error('Error resetting document usage:', error)
  }
}

async function updateDocumentLimits(customerId: string, planTier: string) {
  const limit = getDocumentLimit(planTier)

  const { error } = await supabase
    .from('clients')
    .update({
      document_limit: limit,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Failed to update document limits:', error)
  } else {
    console.log(`Updated document limit to ${limit} for plan ${planTier}`)
  }
}

async function disableClientAccess(customerId: string) {
  try {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (client) {
      await supabase
        .from('client_users')
        .update({ status: 'inactive' })
        .eq('client_id', client.id)

      console.log(`Disabled access for all users of client ${client.id}`)
    }
  } catch (error) {
    console.error('Error disabling client access:', error)
  }
}

async function reactivateClientAccess(customerId: string) {
  try {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (client) {
      await supabase
        .from('client_users')
        .update({ status: 'active' })
        .eq('client_id', client.id)
        .eq('status', 'inactive')

      console.log(`Reactivated access for all users of client ${client.id}`)
    }
  } catch (error) {
    console.error('Error reactivating client access:', error)
  }
}

async function sendPaymentFailedNotification(customerId: string) {
  // TODO: Implement email notification
  // This would typically integrate with your email service (Resend, SendGrid, etc.)
  console.log(`TODO: Send payment failed notification to customer ${customerId}`)
  
  // Create audit log for the notification
  try {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (client) {
      await supabase
        .from('audit_logs')
        .insert({
          client_id: client.id,
          action: 'notification.payment_failed',
          resource_type: 'billing',
          details: { stripe_customer_id: customerId }
        })
    }
  } catch (error) {
    console.error('Error logging payment failed notification:', error)
  }
}

async function sendTrialEndingNotification(customerId: string) {
  // TODO: Implement email notification
  console.log(`TODO: Send trial ending notification to customer ${customerId}`)
  
  // Create audit log for the notification
  try {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (client) {
      await supabase
        .from('audit_logs')
        .insert({
          client_id: client.id,
          action: 'notification.trial_ending',
          resource_type: 'billing',
          details: { stripe_customer_id: customerId }
        })
    }
  } catch (error) {
    console.error('Error logging trial ending notification:', error)
  }
}

// =====================================================
// LOGGING
// =====================================================

async function logWebhookEvent(event: Stripe.Event, success: boolean, errorMessage?: string) {
  try {
    const customerId = getCustomerIdFromEvent(event)
    
    await supabase
      .from('webhook_logs')
      .insert({
        event_id: event.id,
        event_type: event.type,
        stripe_customer_id: customerId,
        success,
        error_message: errorMessage,
        retry_count: 0
      })
  } catch (error) {
    console.error('Error logging webhook event:', error)
  }
}

function getCustomerIdFromEvent(event: Stripe.Event): string | null {
  const data = event.data.object as any
  
  // Try to extract customer ID from various event types
  if (data.customer) {
    return typeof data.customer === 'string' ? data.customer : data.customer.id
  }
  
  if (data.subscription && data.subscription.customer) {
    return data.subscription.customer
  }
  
  return null
}

// =====================================================
// USAGE TRACKING (for Stripe Meters)
// =====================================================

export async function trackDocumentUsage(clientId: string) {
  try {
    // Report to Stripe meter (if configured)
    const { data: client } = await supabase
      .from('clients')
      .select('stripe_customer_id')
      .eq('id', clientId)
      .single()

    if (client?.stripe_customer_id) {
      // TODO: Report to Stripe usage meter
      // await stripe.billing.meters.createEvent({
      //   event_name: 'document_processed',
      //   payload: {
      //     stripe_customer_id: client.stripe_customer_id,
      //     value: '1'
      //   }
      // });
      
      console.log(`Tracked document usage for customer ${client.stripe_customer_id}`)
    }

    // Also track locally for dashboard
    const billingPeriod = new Date().toISOString().substring(0, 7)
    
    await supabase
      .from('document_usage')
      .insert({
        client_id: clientId,
        billing_period: billingPeriod
      })

  } catch (error) {
    console.error('Error tracking document usage:', error)
  }
}