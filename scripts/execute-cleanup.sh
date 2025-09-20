#!/bin/bash

# ===============================================================================
# DATABASE CLEANUP EXECUTION SCRIPT
# ===============================================================================
# Safely executes database cleanup with proper error handling
# ===============================================================================

set -e  # Exit on any error

echo "🗃️ JiGR Database Cleanup - Starting..."
echo "⚠️  WARNING: This will delete ALL test users and companies!"
echo ""

# Get database URL from environment
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please set it first:"
    echo "   export DATABASE_URL='your_supabase_db_url'"
    exit 1
fi

echo "📊 Current database status:"
psql "$DATABASE_URL" -c "
SELECT 
  'BEFORE CLEANUP' as status,
  (SELECT COUNT(*) FROM clients) as total_clients,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM client_users) as total_relationships,
  (SELECT COUNT(*) FROM invitations) as total_invitations;
"

echo ""
read -p "🤔 Do you want to proceed with cleanup? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled."
    exit 0
fi

echo ""
echo "📦 Step 1: Creating backup..."
psql "$DATABASE_URL" -f scripts/database-backup.sql

echo ""
echo "🧹 Step 2: Executing cleanup..."
psql "$DATABASE_URL" -f scripts/database-cleanup.sql

echo ""
echo "✅ Database cleanup completed!"
echo "📋 Summary:"
psql "$DATABASE_URL" -c "
SELECT 
  'AFTER CLEANUP' as status,
  (SELECT COUNT(*) FROM clients) as remaining_clients,
  (SELECT COUNT(*) FROM profiles) as remaining_profiles,
  (SELECT COUNT(*) FROM client_users) as remaining_relationships,
  (SELECT COUNT(*) FROM invitations) as remaining_invitations;
"

echo ""
echo "🎯 Next steps:"
echo "1. Clear Supabase Auth users via dashboard (Authentication > Users)"
echo "2. Clear storage buckets if needed (Storage > company-logos, document-uploads)"
echo "3. Test new account creation"
echo ""
echo "✅ Ready for fresh testing!"