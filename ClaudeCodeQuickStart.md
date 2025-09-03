# JiGR Claude Code Quick Start Guide

## Project Overview
JiGR is a hospitality compliance SaaS platform that processes delivery dockets using Google Cloud Document AI for small hospitality businesses. The platform features multi-tenant architecture with Row Level Security, enabling restaurants, cafes, and food service providers to automate compliance documentation and temperature monitoring. Currently in production development phase focusing on document AI accuracy and storage system reliability.

## Critical Technical Constraints
- **Target Hardware**: iPad Air (2013) with Safari 12 compatibility - all UI must work on legacy mobile Safari
- **Naming Convention**: PascalCase for ALL files, components, and documentation (enforced project-wide)
- **Architecture**: Multi-tenant with strict client data isolation using Supabase Row Level Security
- **Performance**: Memory-optimized for 1GB RAM devices - no heavy libraries or excessive DOM elements
- **Technology Stack**: Next.js 14, Supabase (auth/database/storage), Google Cloud Document AI, Stripe payments

## Current Development Focus
- **Document AI Parser**: Enhanced Google Cloud Document AI extraction for SERVICE FOODS delivery dockets
- **Structured Data**: Extract 9 required fields (supplier, invoice #, date, item code, description, quantity, unit price, item total, grand total)
- **VEGF Product Parsing**: Target VEGF product codes from SERVICE FOODS format specifically
- **Storage Bucket Issues**: Resolve "Object not found" errors in Supabase storage uploads
- **Production Readiness**: Stability improvements for live deployment

## Development Rules
- **DO NOT change existing working code without explicit approval**
- **DO NOT modify authentication system - it's working correctly** 
- **DO NOT alter database schema without permission**
- **DO ask before making structural changes to components**
- **DO run lint/typecheck commands before committing changes**
- **DO maintain Safari 12 compatibility for all UI changes**

## Key Files and Structure
```
/app/
├── api/process-docket/route.ts     # Main processing endpoint
├── components/results/SimpleResultsCard.tsx # Line items display
├── upload/capture/page.tsx         # Main upload interface
└── upload/console/page.tsx         # Admin console view

/supabase/functions/
└── process-delivery-docket/index.ts # Google Cloud Document AI parser

/lib/
├── supabase.ts                     # Database and storage client
└── Database/DatabaseHelpers.ts     # Helper functions
```

## Current Technical State
- **Authentication**: Working correctly with test@jigr.app
- **Google Cloud Integration**: Fully configured with Document AI processor
- **Database**: Stable with delivery_records table and client isolation
- **UI Components**: Safari 12 compatible with Apple-style design system
- **Edge Functions**: Deployed and processing documents successfully

## Documentation References
- `CurrentSessionStatus.md` - Latest development state and immediate priorities
- `IMPLEMENTATION-PLAN-PHASE1.md` - Original project planning document
- Files in `:assets/docs completed/` - Archived planning and analysis documents
- `CURRENT-STATUS-UPDATE-FOR-BIG-CLAUDE.md` - Recent progress summary

## Test Data and Environment
- **Test User**: test@jigr.app (authenticated and linked to JIGR client)
- **Test Invoice**: test70_IMG_3250.jpg (SERVICE FOODS delivery docket with 8 VEGF products)
- **Expected Output**: 9 structured fields with individual VEGF product line items
- **Database Client**: b13e93dd-e981-4d43-97e6-26b7713fb90c (JIGR client ID)

## Common Commands
```bash
# Deploy edge function
DOCKER_HOST=unix://$HOME/.rd/docker.sock npx supabase functions deploy process-delivery-docket

# Check database records  
npx supabase db shell
SELECT * FROM delivery_records ORDER BY created_at DESC LIMIT 5;

# Clear stuck processing records
npx supabase db shell < clear-stuck-records.sql
```

## What's Working vs. What Needs Fixing
✅ **Working**: Authentication, database writes, Google Cloud AI integration, UI display
🔧 **Needs Fixing**: Storage bucket uploads ("Object not found" errors), structured line item parsing accuracy

**Last Updated**: 2025-09-03 - Enhanced Document AI parser with 9-field structured extraction deployed