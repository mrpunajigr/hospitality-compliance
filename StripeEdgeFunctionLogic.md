# Stripe Webhook Edge Function Logic

## Function: `stripe-webhook`

### Purpose
Handle all Stripe webhook events to keep your database in sync with subscription status, payments, and customer data.

### Security & Validation
```typescript
import Stripe from 'stripe';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('stripe-signature')!;
    const body = await req.text();
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
    
    console.log(`Processing Stripe event: ${event.type}`);
    
    // Route to appropriate handler
    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(event);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(event);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
```

## Event Handlers

### 1. Customer Created
```typescript
async function handleCustomerCreated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  
  // Update client record with Stripe customer ID
  const { error } = await supabase
    .from('clients')
    .update({
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString()
    })
    .eq('business_email', customer.email);
    
  if (error) {
    console.error('Failed to update client with Stripe customer ID:', error);
    throw error;
  }
  
  console.log(`Customer created: ${customer.id} for ${customer.email}`);
}
```

### 2. Customer Updated
```typescript
async function handleCustomerUpdated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  
  // Sync customer data changes
  const { error } = await supabase
    .from('clients')
    .update({
      name: customer.name || undefined,
      business_email: customer.email || undefined,
      phone: customer.phone || undefined,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customer.id);
    
  if (error) {
    console.error('Failed to sync customer updates:', error);
    throw error;
  }
  
  console.log(`Customer updated: ${customer.id}`);
}
```

### 3. Subscription Created
```typescript
async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  
  // Get the price ID to determine plan tier
  const priceId = subscription.items.data[0].price.id;
  const planTier = getPlanTierFromPriceId(priceId);
  
  // Update client subscription status
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: subscription.status,
      subscription_tier: planTier,
      stripe_subscription_id: subscription.id,
      subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId);
    
  if (error) {
    console.error('Failed to create subscription record:', error);
    throw error;
  }
  
  // Reset document usage for new billing period
  await resetDocumentUsage(customerId);
  
  console.log(`Subscription created: ${subscription.id} for customer ${customerId}`);
}

function getPlanTierFromPriceId(priceId: string): string {
  // You'll map your actual Stripe price IDs here
  const priceToTierMap: Record<string, string> = {
    'price_basic_monthly': 'basic',
    'price_professional_monthly': 'professional', 
    'price_enterprise_monthly': 'enterprise'
  };
  
  return priceToTierMap[priceId] || 'basic';
}
```

### 4. Subscription Updated
```typescript
async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  
  // Handle plan changes, status updates, etc.
  const priceId = subscription.items.data[0].price.id;
  const planTier = getPlanTierFromPriceId(priceId);
  
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: subscription.status,
      subscription_tier: planTier,
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId);
    
  if (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }
  
  // If plan upgraded/downgraded, update document limits
  await updateDocumentLimits(customerId, planTier);
  
  console.log(`Subscription updated: ${subscription.id} status: ${subscription.status}`);
}
```

### 5. Subscription Deleted/Cancelled
```typescript
async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  
  // Deactivate client account
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'cancelled',
      subscription_tier: null,
      subscription_end_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId);
    
  if (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
  
  // Disable user access (but keep data for potential reactivation)
  await disableClientAccess(customerId);
  
  console.log(`Subscription cancelled: ${subscription.id}`);
}

async function disableClientAccess(customerId: string) {
  // Update all users for this client to inactive status
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (client) {
    await supabase
      .from('client_users')
      .update({ status: 'inactive' })
      .eq('client_id', client.id);
  }
}
```

### 6. Payment Succeeded
```typescript
async function handlePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;
  
  // Reactivate account if it was suspended
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'active',
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId);
    
  if (error) {
    console.error('Failed to update payment success:', error);
    throw error;
  }
  
  // Reactivate user access if it was disabled
  await reactivateClientAccess(customerId);
  
  // Reset document usage for new billing period
  await resetDocumentUsage(customerId);
  
  console.log(`Payment succeeded for customer: ${customerId}`);
}
```

### 7. Payment Failed
```typescript
async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;
  
  // Mark account as past due
  const { error } = await supabase
    .from('clients')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId);
    
  if (error) {
    console.error('Failed to update payment failure:', error);
    throw error;
  }
  
  // Send notification to client about failed payment
  await sendPaymentFailedNotification(customerId);
  
  console.log(`Payment failed for customer: ${customerId}`);
}
```

## Usage Tracking Functions

### Track Document Processing
```typescript
// Called from your process-delivery-docket function
export async function trackDocumentUsage(clientId: string) {
  // Report to Stripe meter
  const { data: client } = await supabase
    .from('clients')
    .select('stripe_customer_id')
    .eq('id', clientId)
    .single();
    
  if (client?.stripe_customer_id) {
    await stripe.billing.meters.createEvent({
      event_name: 'document_processed',
      payload: {
        stripe_customer_id: client.stripe_customer_id,
        value: '1'
      }
    });
  }
  
  // Also track locally for dashboard
  await supabase
    .from('document_usage')
    .insert({
      client_id: clientId,
      processed_at: new Date().toISOString(),
      billing_period: getCurrentBillingPeriod()
    });
}
```

### Reset Usage Counter
```typescript
async function resetDocumentUsage(customerId: string) {
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (client) {
    // Clear current billing period usage
    await supabase
      .from('document_usage')
      .delete()
      .eq('client_id', client.id)
      .eq('billing_period', getCurrentBillingPeriod());
  }
}
```

### Update Document Limits
```typescript
async function updateDocumentLimits(customerId: string, planTier: string) {
  const limits = {
    basic: 500,
    professional: 2000,
    enterprise: -1 // unlimited
  };
  
  const { error } = await supabase
    .from('clients')
    .update({
      document_limit: limits[planTier as keyof typeof limits],
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId);
    
  if (error) {
    console.error('Failed to update document limits:', error);
  }
}
```

## Utility Functions

### Get Current Billing Period
```typescript
function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
```

### Reactivate Client Access
```typescript
async function reactivateClientAccess(customerId: string) {
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
    
  if (client) {
    await supabase
      .from('client_users')
      .update({ status: 'active' })
      .eq('client_id', client.id)
      .eq('status', 'inactive');
  }
}
```

## Error Handling & Logging

### Webhook Processing Log
```typescript
async function logWebhookEvent(event: Stripe.Event, success: boolean, error?: string) {
  await supabase
    .from('webhook_logs')
    .insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
      success,
      error_message: error,
      stripe_customer_id: getCustomerIdFromEvent(event)
    });
}
```

---

This Edge Function becomes your **billing automation engine** - automatically managing subscriptions, tracking usage, and keeping your database perfectly synced with Stripe.