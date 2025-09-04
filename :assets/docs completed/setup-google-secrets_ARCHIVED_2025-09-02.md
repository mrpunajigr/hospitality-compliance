# Google Cloud Secrets Setup

## Missing Secrets Required
Based on the auth-test function, we need these secrets in Supabase:

```bash
# Add Google Cloud service account credentials (JSON file contents)
npx supabase secrets set GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@...iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# Add Document AI processor ID
npx supabase secrets set GOOGLE_DOCUMENT_AI_PROCESSOR_ID='projects/YOUR_PROJECT_ID/locations/us/processors/YOUR_PROCESSOR_ID'
```

## How to Get These Values

### 1. Google Cloud Service Account JSON
1. Go to Google Cloud Console
2. Navigate to IAM & Admin > Service Accounts
3. Find your service account (or create one with Document AI permissions)
4. Click "Keys" tab
5. Generate new JSON key
6. Copy the entire JSON contents

### 2. Document AI Processor ID
1. Go to Google Cloud Console
2. Navigate to Document AI
3. Find your processor
4. Copy the full processor path (format: `projects/PROJECT_ID/locations/LOCATION/processors/PROCESSOR_ID`)

## Test After Setup
```bash
# Deploy and test the auth-test function
npx supabase functions deploy auth-test
```

Then test via the AuthDatabaseTest component at `/upload`.