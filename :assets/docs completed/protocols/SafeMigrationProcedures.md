# Safe Migration Procedures

## 🎯 **Purpose**

This document provides comprehensive procedures for safely migrating existing files to the JiGR Ecosystem PascalCase naming convention while preventing breaking changes and maintaining system integrity.

**Established**: August 15, 2025  
**Standard**: PascalCase Naming Convention  
**Reference**: `NamingConventionStandard.md`

---

## ⚠️ **CRITICAL SAFETY PROTOCOLS**

### **🚨 NEVER Rename Without These Steps:**
1. **Backup Current State** - Always commit current changes first
2. **Check All Dependencies** - Search for all file references
3. **Update Import Statements** - Modify all import/require statements
4. **Test Functionality** - Verify everything works after changes
5. **Use Git Commands** - Preserve version control history when possible

### **🛑 HIGH-RISK FILES (Approach with Extreme Caution):**
- **API routes** - `/pages/api/*` or `/app/api/*`
- **Next.js pages** - `/pages/*` or `/app/*` route files
- **Build configurations** - `next.config.js`, `tailwind.config.js`, etc.
- **Environment files** - `.env*` files
- **Database migrations** - `*.sql` files in active use
- **Public assets** - Files referenced by external systems

---

## 📋 **Migration Categories**

### **✅ SAFE TO MIGRATE (Low Risk)**
These files can typically be renamed with minimal impact:

#### **Documentation Files**
- `*.md` files (README, guides, documentation)
- Text files (`*.txt`)
- Configuration documentation
- Development notes and logs

**Example Migration:**
```bash
git mv user_guide.md UserGuide.md
git mv api_documentation.md ApiDocumentation.md
```

#### **Development Assets**
- Design files (`*.sketch`, `*.figma`)
- Documentation images (`*.png`, `*.jpg` in docs)
- Development templates
- Non-production configuration files

#### **TypeScript Type Definitions**
- `*.d.ts` files not directly imported
- Interface definition files
- Type utility files

### **⚠️ MEDIUM RISK (Requires Testing)**
These files need careful handling and testing:

#### **React Components**
- Component files (`*.tsx`, `*.jsx`)
- Custom hooks (`use*.ts`)
- Utility functions (`*Utils.ts`, `*Helper.ts`)
- Context providers

**Migration Process:**
```bash
# 1. Search for all references first
grep -r "ComponentName" . --include="*.ts" --include="*.tsx"

# 2. Rename the file
git mv componentName.tsx ComponentName.tsx

# 3. Update all import statements
# Update: import ComponentName from './componentName'
# To:     import ComponentName from './ComponentName'

# 4. Test the application
npm run build
npm run dev
```

#### **Styling Files**
- CSS modules (`*.module.css`)
- SCSS files (`*.scss`)
- Styled component files

### **🚨 HIGH RISK (Expert Migration Only)**
These files require expert handling and production considerations:

#### **API Routes**
- Next.js API files (`/api/*.ts`)
- Server actions
- Middleware files
- Edge functions

#### **Page Components**
- Next.js page files
- Layout components
- Error pages
- Loading components

#### **Build and Configuration**
- Build scripts
- Configuration files
- Environment setups
- Deployment configurations

---

## 🔧 **Step-by-Step Migration Process**

### **Phase 1: Pre-Migration Assessment**

#### **1. Create Migration Inventory**
```bash
# List all files that need migration
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" | grep -E "(snake_case|kebab-case)" > migration_inventory.txt
```

#### **2. Analyze Dependencies**
```bash
# For each file, find all references
for file in $(cat migration_inventory.txt); do
  echo "=== $file ==="
  grep -r "$(basename $file .tsx)" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
done
```

#### **3. Categorize by Risk Level**
- **Safe**: Documentation, assets, non-imported files
- **Medium**: Components with limited imports
- **High**: API routes, pages, widely imported utilities

### **Phase 2: Safe Migration Execution**

#### **1. Start with Documentation**
```bash
# Migrate all safe documentation files
git mv user_management_guide.md UserManagementGuide.md
git mv api_integration_docs.md ApiIntegrationDocs.md
git mv deployment_instructions.md DeploymentInstructions.md
```

#### **2. Update Documentation References**
```bash
# Search and replace references in other markdown files
grep -r "user_management_guide.md" . --include="*.md"
# Update all found references manually
```

#### **3. Test Documentation Links**
- Verify all internal links still work
- Check relative path references
- Validate external documentation links

### **Phase 3: Component Migration**

#### **1. Single Component Migration**
```bash
# Example: Migrating a utility component
OLD_NAME="temperatureHelper.ts"
NEW_NAME="TemperatureHelper.ts"

# Find all references
echo "References to $OLD_NAME:"
grep -r "temperatureHelper" . --include="*.ts" --include="*.tsx"

# Rename the file
git mv $OLD_NAME $NEW_NAME

# Update import statements (manual process)
# Example updates needed:
# import { calculateTemp } from './temperatureHelper'
# TO: import { calculateTemp } from './TemperatureHelper'
```

#### **2. Batch Component Migration Script**
```bash
#!/bin/bash
# batch_migrate_components.sh

COMPONENTS=(
  "src/utils/dataProcessor.ts:src/utils/DataProcessor.ts"
  "src/hooks/useApiData.ts:src/hooks/UseApiData.ts"
  "src/components/alertModal.tsx:src/components/AlertModal.tsx"
)

for mapping in "${COMPONENTS[@]}"; do
  OLD_PATH="${mapping%%:*}"
  NEW_PATH="${mapping##*:}"
  
  echo "Migrating $OLD_PATH to $NEW_PATH"
  
  # Check if file exists
  if [ -f "$OLD_PATH" ]; then
    # Rename file
    git mv "$OLD_PATH" "$NEW_PATH"
    echo "✅ Renamed $OLD_PATH"
  else
    echo "❌ File not found: $OLD_PATH"
  fi
done
```

### **Phase 4: Reference Updates**

#### **1. Import Statement Updates**
```typescript
// Update patterns like these:

// OLD:
import { DataProcessor } from './utils/dataProcessor'
import AlertModal from './components/alertModal'
import { useApiData } from './hooks/useApiData'

// NEW:
import { DataProcessor } from './utils/DataProcessor'
import AlertModal from './components/AlertModal'
import { useApiData } from './hooks/UseApiData'
```

#### **2. Dynamic Imports**
```typescript
// Update dynamic imports:

// OLD:
const AlertModal = lazy(() => import('./components/alertModal'))

// NEW:
const AlertModal = lazy(() => import('./components/AlertModal'))
```

#### **3. Configuration References**
```javascript
// Update build configurations:

// OLD (next.config.js):
module.exports = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/data-processor': ['./utils/dataProcessor.ts']
    }
  }
}

// NEW:
module.exports = {
  experimental: {
    outputFileTracingIncludes: {
      '/api/data-processor': ['./utils/DataProcessor.ts']
    }
  }
}
```

---

## 🧪 **Testing and Validation**

### **Comprehensive Testing Checklist**

#### **Build Testing**
```bash
# 1. Clean build test
npm run clean  # if available
npm run build

# 2. Development server test
npm run dev

# 3. Type checking
npm run type-check  # if available
npx tsc --noEmit

# 4. Linting
npm run lint
```

#### **Functionality Testing**
- [ ] All pages load without errors
- [ ] Components render correctly
- [ ] API endpoints respond properly
- [ ] Authentication flows work
- [ ] Data persistence functions
- [ ] File uploads/downloads work
- [ ] External integrations function

#### **Browser Compatibility Testing**
- [ ] Safari 12+ (iPad Air 2013)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### **Rollback Procedures**

#### **Immediate Rollback (Git)**
```bash
# If issues found immediately after migration
git reset --hard HEAD~1  # Rollback last commit

# Or rollback specific files
git checkout HEAD~1 -- path/to/problematic/file
```

#### **Selective Rollback**
```bash
# Rollback specific changes while keeping others
git log --oneline  # Find commit hash
git revert <commit-hash>  # Create revert commit
```

---

## 📊 **Migration Tracking**

### **Migration Log Template**
```markdown
## Migration Session: [Date]

### Files Migrated:
- [ ] documentation_file.md → DocumentationFile.md
- [ ] utility_helper.ts → UtilityHelper.ts
- [ ] custom_component.tsx → CustomComponent.tsx

### References Updated:
- [ ] Import statements in ComponentA.tsx
- [ ] Configuration in next.config.js
- [ ] Documentation links in README.md

### Testing Results:
- [ ] Build successful
- [ ] Dev server starts
- [ ] All pages load
- [ ] No TypeScript errors
- [ ] No console errors

### Issues Found:
- Issue description and resolution

### Next Session Plan:
- Files to migrate next
- Specific concerns to address
```

### **Progress Tracking**
```bash
# Create migration progress file
echo "# Migration Progress

## Completed ($(date))
- Documentation files: 15/15 ✅
- Utility components: 8/12 🔄
- Main components: 0/25 ⏳
- API routes: 0/8 ⏳

## Next Priority
- Complete utility components
- Begin main component migration
- Update all import references
" > migration_progress.md
```

---

## 🔧 **Automation Tools**

### **Reference Finding Script**
```bash
#!/bin/bash
# find_references.sh

FILE_TO_SEARCH="$1"
BASE_NAME=$(basename "$FILE_TO_SEARCH" | sed 's/\.[^.]*$//')

echo "=== References to $BASE_NAME ==="

# Search in TypeScript/JavaScript files
echo "Code references:"
grep -r "$BASE_NAME" . \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=dist

echo -e "\nConfiguration references:"
grep -r "$BASE_NAME" . \
  --include="*.json" \
  --include="*.config.js" \
  --include="*.config.ts" \
  --exclude-dir=node_modules

echo -e "\nDocumentation references:"
grep -r "$FILE_TO_SEARCH" . \
  --include="*.md" \
  --include="*.mdx"
```

### **Import Update Helper**
```bash
#!/bin/bash
# update_imports.sh

OLD_FILE="$1"
NEW_FILE="$2"

OLD_NAME=$(basename "$OLD_FILE" | sed 's/\.[^.]*$//')
NEW_NAME=$(basename "$NEW_FILE" | sed 's/\.[^.]*$//')

echo "Updating imports from $OLD_NAME to $NEW_NAME"

# Find and update import statements
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs grep -l "from.*$OLD_NAME" | \
  while read file; do
    echo "Updating $file"
    sed -i.bak "s|from '\\(.*\\)/$OLD_NAME'|from '\\1/$NEW_NAME'|g" "$file"
    sed -i.bak "s|from \"\\(.*\\)/$OLD_NAME\"|from \"\\1/$NEW_NAME\"|g" "$file"
  done
```

---

## 📚 **Best Practices Summary**

### **DO:**
- ✅ Always commit current work before starting migration
- ✅ Start with low-risk files (documentation)
- ✅ Test after each migration session
- ✅ Use `git mv` to preserve file history
- ✅ Update all references systematically
- ✅ Document migration progress
- ✅ Have rollback plan ready

### **DON'T:**
- ❌ Migrate critical files without testing
- ❌ Rename API routes during active development
- ❌ Skip reference updates
- ❌ Migrate large batches without testing
- ❌ Ignore TypeScript errors
- ❌ Forget to update documentation links
- ❌ Rush the migration process

### **EMERGENCY PROCEDURES:**
If production issues arise from migration:
1. **Immediate**: Rollback using git reset/revert
2. **Notify**: Alert team of rollback
3. **Investigate**: Identify root cause offline
4. **Plan**: Create specific fix strategy
5. **Re-deploy**: Only after thorough testing

---

## 🎯 **Migration Success Metrics**

### **Completion Criteria:**
- [ ] All target files renamed to PascalCase
- [ ] All import references updated
- [ ] All documentation links working
- [ ] Build process successful
- [ ] All tests passing
- [ ] No production errors
- [ ] User functionality intact

### **Quality Assurance:**
- [ ] TypeScript strict mode compliance
- [ ] ESLint passing without warnings
- [ ] All console errors resolved
- [ ] Performance benchmarks maintained
- [ ] Accessibility standards preserved

---

**JiGR Ecosystem Safe Migration Foundation**  
**Protecting Production While Establishing Professional Standards**  
**Foundation for Fearless File Organization**

---

*These procedures ensure that the migration to PascalCase naming convention is executed safely, systematically, and with minimal risk to production systems.*