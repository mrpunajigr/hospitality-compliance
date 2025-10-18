# Champion User Flow System - Database Migration Instructions

## What This Migration Does

This migration creates the complete Champion User Flow System that allows:
- Senior staff (Head Chef, etc.) to register as CHAMPION role
- Full evaluation and configuration capabilities for champions
- Owner invitation workflow with engagement tracking
- Success scoring and incentive systems
- Proper ownership transfer when owner approves

## Tables Created

1. **owner_invitations** - Tracks champion-to-owner invitation process
2. **evaluation_settings** - Stores champion's temporary configurations  
3. **evaluation_metrics** - ROI and progress tracking
4. **champion_handoff** - Manages ownership transfer process
5. **champion_success_scores** - Gamified progress tracking
6. **owner_engagement_events** - Email/click tracking analytics
7. **champion_notifications** - Real-time updates for champions

## Functions Created

- `create_evaluation_client()` - Creates evaluation mode client for champions
- `transfer_ownership_to_owner()` - Handles ownership transfer when approved
- `expire_old_invitations()` - Cleanup function for expired invitations

## To Apply This Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/sql
2. Copy the entire contents of `supabase/migrations/20250820000002_champion_owner_invitation.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute

### Option 2: Command Line (if you have database password)
```bash
npx supabase migration up --password [your-db-password]
```

## Verification

After running the migration, verify these tables exist:
- owner_invitations
- champion_success_scores  
- owner_engagement_events
- champion_notifications

You can check in Dashboard > Database > Tables

## What Happens Next

Once the migration is applied:
1. ✅ Champions can register and configure evaluation setups
2. ✅ Owner invitation system becomes functional
3. ✅ Email engagement tracking works
4. ✅ Success scoring and incentives activate
5. ✅ All Champion User Flow APIs will work properly

The system is designed to be backward compatible - existing users and data are unaffected.