// TestCodeRabbitRules.tsx - Designed to trigger Code Rabbit warnings

import React from 'react';

// ❌ Should trigger "compliance_data_exposure" rule
console.log("Temperature reading:", 4.2, "Supplier:", "Countdown Foods", "Delivery date:", new Date());

// ❌ Should trigger "ipad_air_compatibility" rule  
const checkDelivery = deliveryData?.items?.find?.(item => item?.temperature);

// ❌ Should trigger "stripe_key_exposure" rule
const testStripeKey = "sk_test_51234567890abcdefghijklmnopqrstuvwxyz123456";

// ❌ Should trigger "google_credentials_exposure" rule
const googleCreds = "google-cloud-document-ai-key-example";

// ❌ Should trigger "memory_intensive_operations" rule
const massiveArray = new Array(50000);

// ❌ Should trigger "rls_policy_bypass" rule  
const bypassClient = supabase.auth.admin;

// ❌ Should trigger "modern_js_features" rule
const nullishCoalescing = someValue ?? "default";

export default function TestCodeRabbitComponent() {
  return (
    <div>
      <h1>Code Rabbit Test Component</h1>
      <p>This component contains deliberate violations to test our configuration</p>
    </div>
  );
}