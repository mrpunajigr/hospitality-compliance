# Emergency Recovery Protocol

## 🚨 When Things Break - Follow This Exact Process

### **Immediate Response (0-5 minutes)**

1. **DON'T PANIC** - We have backup strategies
2. **DON'T MAKE MORE CHANGES** - Stop digging the hole deeper
3. **ASSESS THE DAMAGE** - What exactly is broken?

### **Quick Diagnosis Checklist**

**Build Failures:**
```bash
# Check build locally first
npm run build

# Common issues:
# - TypeScript errors → Fix import paths
# - Missing environment variables → Add to Netlify
# - Module not found → Check file exists
```

**Deployment Failures:**
```bash
# Check Netlify build logs for:
# - "Module not found" → Import path issue
# - "supabaseUrl is required" → Missing env vars
# - Build timeout → Large files in commit
```

**Git Push Failures:**
```bash
# Secret scanning blocked:
# 1. Remove secrets from commit
# 2. Use GitHub web interface for small fixes
# 3. Force push clean commit

# Large file blocked:
# 1. Check: git log --stat --oneline -1
# 2. Reset and exclude large files
# 3. Use .gitignore to prevent future
```

### **Emergency Fixes (5-15 minutes)**

**Option 1: GitHub Web Interface Fix**
- Go to GitHub → Edit file directly
- Make minimal fix (comment out problematic import)
- Trigger new Netlify deploy
- ✅ Site back online in minutes

**Option 2: Rollback Strategy**
- Netlify: Deploy previous working build
- GitHub: Revert last commit
- Local: `git reset --hard HEAD~1`

**Option 3: Staging Deploy**
- Deploy to staging first
- Test thoroughly
- Then deploy to production

### **Recovery Workflows**

**For Build Failures:**
```bash
# 1. Fix locally
npm run build  # Must pass

# 2. Test with same env vars as production
export NEXT_PUBLIC_SUPABASE_URL="..."
export NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
export SUPABASE_SERVICE_ROLE_KEY="..."
npm run build

# 3. Deploy via GitHub web interface or clean git push
```

**For Import Errors:**
```bash
# Quick check - does the file exist?
ls -la lib/platform-context.tsx

# If missing, either:
# A) Comment out the import (quick fix)
# B) Create the missing file 
# C) Fix the import path
```

**For Environment Variable Issues:**
1. Go to Netlify → Site Settings → Environment variables
2. Add missing variables
3. Trigger new deploy
4. Should build successfully

### **Prevention After Recovery**

**Immediate (same day):**
- [ ] Enhanced .gitignore deployed
- [ ] Pre-commit hooks active
- [ ] Archive old development assets

**Short term (this week):**
- [ ] Feature branch workflow established
- [ ] Staging environment set up
- [ ] GitHub Actions build testing

**Long term (next week):**
- [ ] Monitoring and alerts active
- [ ] Health check pings
- [ ] Performance tracking

### **Emergency Contacts**

**When to Escalate:**
- Site down >30 minutes
- Database corruption
- Security breach
- Complete system failure

**Contact Information:**
- Steve (Primary): [Contact details]
- Backup developer: [If applicable]
- Hosting support: Netlify support

### **Lessons from This Crisis**

**What Went Wrong (Sept 8, 2025):**
- Platform-context import added without checking target environment
- Deploy-fresh vs main branch confusion
- Large development assets committed (50MB+)
- Secret files in git history blocking pushes
- No pre-deployment testing

**How We Fixed It:**
- Quick manual GitHub edit to comment out problematic import
- Set proper environment variables in Netlify
- Enhanced .gitignore to prevent future asset commits
- Created comprehensive prevention strategy

**Key Takeaways:**
- ✅ GitHub web interface is fastest for emergency fixes
- ✅ Environment variables are critical for main branch
- ✅ Test builds locally before deploying
- ✅ Development assets belong in Supabase, not git
- ✅ Prevention systems are worth the setup time

### **Testing Your Recovery Plan**

**Monthly Drill:**
1. Create test branch with intentional error
2. Practice emergency fix workflow  
3. Time how long it takes to recover
4. Update this document with improvements

**Success Metrics:**
- ⏱️ Site back online in <15 minutes
- 🔧 Fix applied without breaking other features  
- 📚 Team learns from incident
- 🛡️ Prevention measures strengthened

Remember: **Every crisis is a learning opportunity to make the system more resilient!**