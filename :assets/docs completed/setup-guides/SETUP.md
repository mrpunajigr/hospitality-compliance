# Hospitality Compliance SaaS - Setup Guide

This guide will help you set up the complete development environment for the Hospitality Compliance SaaS platform.

## 📋 Prerequisites

- Node.js 18+ (for Safari 12 compatibility requirements)
- Supabase account with project created
- Google Cloud Platform account with Document AI enabled
- Stripe account with products configured
- Git for version control

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Cloud Document AI
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account","project_id":"your-project-id"...}
DOCUMENT_AI_PROCESSOR_ID=projects/your-project/locations/us/processors/your-processor-id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Supabase CLI
npm install -g supabase
```

### 3. Database Setup

```bash
# Start local Supabase instance
npm run supabase:start

# Apply database migrations
supabase db push

# Seed with sample data (optional)
supabase db seed
```

### 4. Configure Supabase

1. **Enable Row Level Security** on all tables
2. **Set up Storage Bucket**:
   - Create `delivery-dockets` bucket
   - Configure bucket policies for multi-tenant access
3. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy process-delivery-docket
   supabase functions deploy stripe-webhook
   ```

### 5. Google Cloud Setup

1. **Enable Document AI API** in Google Cloud Console
2. **Create a Document AI Processor**:
   - Type: Form Parser
   - Location: us (United States)
3. **Create Service Account**:
   - Grant Document AI User role
   - Download JSON key
   - Add to environment variables

### 6. Stripe Configuration

1. **Create Products** in Stripe Dashboard:
   - Basic Plan: $49 NZD/month (500 documents)
   - Professional Plan: $99 NZD/month (2000 documents)
   - Enterprise Plan: $199 NZD/month (unlimited)

2. **Configure Webhooks**:
   - Endpoint: `https://your-domain.com/api/stripe-webhook`
   - Events: `customer.*`, `invoice.*`, `subscription.*`

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🗄️ Database Schema Overview

The platform uses a complete multi-tenant architecture with 15 core tables:

### Core Tables
- **clients** - Business organizations
- **profiles** - User profiles (extends auth.users)
- **client_users** - User-client relationships with roles
- **invitations** - Team invitation system

### Compliance Tables
- **delivery_records** - Main delivery documents
- **temperature_readings** - Extracted temperature data
- **compliance_alerts** - Violation notifications
- **suppliers** - Supplier master list

### Reporting & Audit
- **compliance_reports** - Generated reports
- **inspector_access** - Health inspector portal
- **audit_logs** - Complete system audit trail
- **data_exports** - Export tracking

### Billing & Usage
- **document_usage** - Document processing tracking
- **webhook_logs** - Stripe webhook processing
- **compliance_settings** - Client-specific rules

## 🔧 Development Workflow

### Database Changes

1. Create migration file:
   ```bash
   supabase migration new your_migration_name
   ```

2. Apply migrations:
   ```bash
   supabase db push
   ```

3. Generate TypeScript types:
   ```bash
   npm run db:generate-types
   ```

### Edge Functions

1. Create new function:
   ```bash
   supabase functions new function-name
   ```

2. Deploy function:
   ```bash
   supabase functions deploy function-name
   ```

3. View logs:
   ```bash
   supabase functions logs function-name
   ```

## 🧪 Testing

### Multi-Tenant Isolation Testing

1. Create test clients with different users
2. Verify RLS policies prevent cross-client data access
3. Test file upload isolation in storage buckets
4. Validate Edge Function security

### Document Processing Testing

1. Upload sample delivery dockets
2. Verify AI extraction accuracy
3. Test compliance rule validation
4. Check alert generation

### Billing Integration Testing

1. Use Stripe test mode
2. Test subscription creation and updates
3. Verify webhook handling
4. Test usage tracking

## 🚀 Production Deployment

### Environment Variables

Set up production environment variables:

```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Production Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Production Google Cloud
GOOGLE_CLOUD_CREDENTIALS=your_production_service_account_json
DOCUMENT_AI_PROCESSOR_ID=your_production_processor_id
```

### Deployment Steps

1. **Deploy to Vercel/Netlify**:
   ```bash
   npm run build
   # Deploy to your hosting platform
   ```

2. **Configure Production Database**:
   - Apply migrations to production Supabase
   - Set up production storage policies
   - Deploy Edge Functions

3. **Set up Monitoring**:
   - Configure Supabase alerts
   - Set up error tracking (Sentry, LogRocket)
   - Monitor Stripe webhook events

## 📱 Safari 12 Compatibility

The platform is specifically optimized for iPad Air (2013) with Safari 12:

### Key Optimizations
- **JavaScript**: ES5 transpilation with Babel
- **CSS**: Flexbox-first layouts with fallbacks
- **Images**: Client-side compression before upload
- **Memory**: Optimized for 1GB RAM constraint
- **Performance**: A7 processor optimizations

### Testing Checklist
- [ ] Test on actual Safari 12 device
- [ ] Verify file upload works smoothly
- [ ] Check dashboard performance
- [ ] Validate touch target sizes (44px minimum)
- [ ] Test network resilience

## 🔒 Security Considerations

### Multi-Tenant Security
- RLS policies enforce data isolation
- Storage policies prevent cross-client access
- Edge Functions validate user permissions
- Audit logs track all sensitive actions

### Data Protection
- End-to-end encryption for sensitive data
- Secure file storage with access controls
- Regular security audits and penetration testing
- GDPR/privacy compliance measures

## 📞 Support

### Development Issues
- Check Supabase logs for database errors
- Review Edge Function logs for processing issues
- Monitor Stripe webhook events for billing problems
- Use browser dev tools for frontend debugging

### Production Monitoring
- Set up alerts for critical failures
- Monitor document processing success rates
- Track subscription and billing events
- Monitor compliance alert response times

---

## 🎯 Next Steps After Setup

1. **Create your first client** through the admin interface
2. **Upload a test delivery docket** to verify AI processing
3. **Set up compliance rules** for your business requirements
4. **Invite team members** to test the multi-user experience
5. **Generate a compliance report** to verify reporting functionality

The platform is now ready for development and testing! 🚀