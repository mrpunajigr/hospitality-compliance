# Initial Prompt for Cursor Claude - Planning Mode

## PROJECT OVERVIEW

I need you to help me build a **Hospitality Compliance SaaS Platform** for New Zealand businesses that automates delivery docket temperature tracking using AI document processing. This is a **multi-tenant subscription-based platform** with intelligent document processing, automated compliance monitoring, and comprehensive reporting.

## WHAT I'VE ALREADY CONFIGURED

✅ **Supabase:** Project setup, storage bucket with policies, all environment secrets configured  
✅ **Google Cloud:** Document AI processor created, credentials in Secret Manager  
✅ **Stripe:** Complete product catalog, webhook endpoint, usage meter configured  
✅ **GitHub:** Repository ready  
✅ **Planning:** Complete architecture documentation (see .md files)  

## ARCHITECTURE DOCUMENTS TO REVIEW

Please read and analyze these planning documents I've prepared:

1. **`process-delivery-docket-edge-function.md`** - Core Document AI processing logic
2. **`multi-tenant-auth-user-management.md`** - Authentication & user system architecture  
3. **`stripe-webhook-edge-function.md`** - Billing automation & webhook handling
4. **`customer-onboarding-flow.md`** - Complete signup & trial journey
5. **`phase-1-compliance-features.md`** - Essential compliance tools for MVP
6. **`phase-2-feature-roadmap.md`** - Future enhancement roadmap

## EXISTING TEMPLATE TO ANALYZE

I have a **`template/`** folder containing my proven SaaS foundation with:
- Next.js app structure with TypeScript
- Supabase integration (auth, database, storage)
- Tailwind CSS styling
- Component library and UI patterns
- Authentication flow
- Basic dashboard structure

**Please examine the template folder structure** and understand the existing patterns before suggesting modifications.

## YOUR TASK - PLANNING MODE

I need you to create a **comprehensive development plan** that:

### 1. TEMPLATE ANALYSIS & ADAPTATION
- Analyze the existing template structure
- Identify what needs to be modified/extended for the delivery docket app
- Plan how to integrate the new features with existing patterns
- Suggest file structure for the new functionality

### 2. DATABASE SCHEMA DESIGN
- Design complete multi-tenant database schema based on the planning documents
- Create all necessary tables with proper relationships
- Design Row Level Security (RLS) policies for client isolation
- Plan migration strategy and seed data

### 3. EDGE FUNCTIONS ARCHITECTURE
- Plan the Document AI processing function implementation
- Design the Stripe webhook handler structure
- Plan any additional Edge Functions needed
- Map out function dependencies and data flow

### 4. FRONTEND ARCHITECTURE
- Plan the UI/UX structure for multi-tenant dashboard
- Design component hierarchy for document upload and processing
- Plan the compliance reporting interface
- Design the onboarding flow UI

### 5. INTEGRATION PLANNING
- Map out Google Cloud Document AI integration points
- Plan Stripe billing integration with the existing auth system
- Design the notification system (emails, alerts)
- Plan the inspector portal functionality

### 6. DEVELOPMENT PHASES
- Break down the implementation into logical phases
- Identify dependencies between features
- Suggest testing strategies for each component
- Plan deployment and environment setup

## SUCCESS CRITERIA

The platform must:
- **Process delivery docket photos** automatically with AI
- **Extract temperature data** and validate compliance
- **Isolate client data** completely (multi-tenant)
- **Handle subscription billing** with usage tracking
- **Generate compliance reports** for health inspectors
- **Send real-time alerts** for violations
- **Provide audit trails** for regulatory compliance
- **Scale efficiently** for multiple clients

## TECHNICAL REQUIREMENTS

- **Next.js 14** with TypeScript
- **Supabase** for database, auth, storage, and Edge Functions
- **Google Cloud Document AI** for document processing
- **Stripe** for subscription billing and usage tracking
- **Tailwind CSS** for styling (following existing template patterns)
- **NZ compliance standards** (Food Act 2014, MPI guidelines)

## 🚨 CRITICAL COMPATIBILITY REQUIREMENT

**Target Device: iPad Air (2013) running Safari 12**

All frontend code MUST be compatible with this older hardware:
- **JavaScript:** ES5/ES6 only - NO modern syntax (optional chaining, nullish coalescing, etc.)
- **Polyfills required** for any newer JavaScript features
- **Memory optimization:** 1GB RAM constraint - lightweight components only
- **Camera/Upload:** Basic file input functionality (no advanced Camera API)
- **Image processing:** Client-side compression before upload to handle bandwidth/memory limits
- **CSS:** Limited Grid/Flexbox support - use simpler layout patterns
- **Performance:** A7 processor - optimize for slower JavaScript execution
- **No Service Workers** - affects PWA capabilities
- **Progressive enhancement** - core features must work without modern browser features

**Test all functionality on Safari 12 compatibility mode during development.**

## DEVELOPMENT APPROACH

1. **Preserve existing template functionality** - don't break what works
2. **Follow established patterns** - maintain consistency with template
3. **Build incrementally** - start with core features, add complexity gradually  
4. **Test thoroughly** - especially multi-tenant isolation and billing
5. **Document as you go** - maintain clear code organization

## IMMEDIATE NEXT STEPS

Please provide:

1. **Template Analysis Summary** - What you found and what needs changing
2. **Complete Database Schema** - All tables, relationships, RLS policies
3. **Development Roadmap** - Phase-by-phase implementation plan
4. **File Structure Plan** - How new code integrates with template
5. **Priority Order** - Which features to build first and why

## QUESTIONS TO CONSIDER

- How should the new multi-tenant features integrate with the existing auth system?
- What's the best way to structure the document processing workflow?
- How should we handle the transition from template to production-ready app?
- What testing approach will ensure multi-tenant isolation works correctly?
- How can we maintain the template's simplicity while adding complex features?

---

**Take your time to analyze everything thoroughly. I want a comprehensive plan before we start coding. This is a commercial SaaS platform that needs to be production-ready, scalable, and compliant with NZ regulations.**

**Ready when you are!** 🚀