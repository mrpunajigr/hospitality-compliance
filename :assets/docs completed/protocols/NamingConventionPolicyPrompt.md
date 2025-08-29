# JiGR Ecosystem Naming Convention Policy - Implementation Prompt

## 🎯 STRATEGIC DECISION

We are establishing a **unified naming convention** for the entire JiGR ecosystem to ensure consistency across all current and future AddOn modules. This is a foundational decision that will scale across the platform.

## 📋 NAMING CONVENTION STANDARD

### **Official JiGR Ecosystem Standard: PascalCase**

**Format:** `ThisIsAnExample.md` (capitalize first letter of each word, no separators)

**Rationale:**
- ✅ **Highly readable** - clear word boundaries
- ✅ **Professional standard** - enterprise-level naming
- ✅ **Easy to type** - just capitalize first letters
- ✅ **Ecosystem scalable** - works across all file types and modules
- ✅ **IDE friendly** - better autocomplete and search
- ✅ **Consistent with React components** - already using this pattern

## 🔧 IMPLEMENTATION POLICY

### **File Naming Standards:**

#### **Components & TypeScript Files:**
```bash
# Current examples that follow standard:
DeliveryComplianceCard.tsx ✅
StaffTrainingModal.tsx ✅
EquipmentMaintenanceForm.tsx ✅

# New files should use:
ComplianceDashboard.tsx
UploadInterface.tsx
ReportGeneration.tsx
```

#### **Documentation Files:**
```bash
# Planning documents:
SystemArchitectureGuide.md
DatabaseDesignPatterns.md
UserInterfaceStandards.md
AddOnModuleFramework.md

# API documentation:
SupabaseIntegrationGuide.md
StripePaymentSetup.md
GoogleCloudConfiguration.md
```

#### **Asset Files:**
```bash
# Images:
KitchenWorkspaceBackground.jpg
RestaurantLogoAsset.png
ComplianceIconLibrary.svg

# Configuration:
SupabaseConnectionConfig.ts
StripePaymentSettings.ts
GoogleCloudCredentials.json
```

#### **Folder Structure:**
```bash
/DeliveryComplianceModule/
  /Components/
    /UploadInterface/
    /ComplianceDashboard/
    /ReportGeneration/
  /Documentation/
  /Assets/
    /BackgroundImages/
    /IconLibrary/
```

### **What Stays The Same:**

#### **Database Tables (SQL Convention):**
```sql
-- Keep snake_case for SQL
delivery_compliance_records
staff_training_sessions
equipment_maintenance_logs
```

#### **JavaScript Variables (camelCase):**
```typescript
// Keep camelCase for variables
const deliveryComplianceData = {...}
const userAuthenticationStatus = {...}
```

#### **CSS Classes (kebab-case if needed):**
```css
/* Keep existing CSS naming if already established */
.compliance-card { }
.upload-interface { }
```

## 🚨 CRITICAL SAFETY PROTOCOLS

### **⚠️ BREAKING CHANGE WARNING ⚠️**

**DO NOT rename existing files without explicit approval.** Renaming files can break:
- Import statements
- Component references
- API route handlers
- Asset links
- Documentation references
- Build processes

### **Safe Implementation Strategy:**

#### **Phase 1: NEW FILES ONLY (Immediate)**
```markdown
✅ SAFE: All new files use PascalCase naming
✅ SAFE: New components, new documentation, new assets
✅ SAFE: New folders and directory structures
❌ AVOID: Renaming existing working files
```

#### **Phase 2: GRADUAL MIGRATION (Careful)**
```markdown
✅ WHEN SAFE: Rename files only during natural refactoring
✅ WHEN SAFE: When touching a file for other reasons
✅ WHEN SAFE: After confirming all import/reference updates
❌ NEVER: Bulk renaming without testing
❌ NEVER: Renaming core system files without approval
```

#### **Phase 3: VERIFICATION REQUIRED**
```markdown
BEFORE renaming any existing file:
1. ✅ Identify ALL files that import/reference it
2. ✅ Update ALL import statements
3. ✅ Update ALL component references  
4. ✅ Test that functionality still works
5. ✅ Confirm no broken links or missing assets
6. ✅ Get explicit approval for the change
```

## 🎯 IMMEDIATE IMPLEMENTATION TASKS

### **1. Documentation Update**
Create a file: `NamingConventionStandard.md` that documents this policy for future reference.

### **2. New File Creation**
- All new files from now on use PascalCase
- Apply to components, documentation, assets, configurations

### **3. IDE/Editor Configuration**
- Update any file templates to use PascalCase
- Configure autocomplete/suggestions for new naming

### **4. Future Module Planning**
- Document how AddOn modules should structure their naming
- Create templates for new module creation with proper naming

## 📝 SPECIFIC EXAMPLES FOR CURRENT PROJECT

### **New Files That Should Use PascalCase:**

#### **If Creating New Components:**
```bash
ComplianceReportModal.tsx
DocumentUploadProgress.tsx
TemperatureViolationAlert.tsx
InspectorPortalDashboard.tsx
```

#### **If Creating New Documentation:**
```bash
AssetManagementSystemGuide.md
MoodBoardStylingInstructions.md
MultiTenantSecurityPolicies.md
VersionControlWorkflow.md
```

#### **If Creating New Assets:**
```bash
HospitalityKitchenBackground.jpg
ComplianceApprovedIcon.svg
RestaurantBrandingLogo.png
```

### **Existing Files - Assessment Needed:**

#### **Current Files That May Need Eventual Renaming:**
```bash
# Assess these during natural refactoring:
app-architecture-structure.md → AppArchitectureStructure.md
claude-code-autonomy-instructions.md → ClaudeCodeAutonomyInstructions.md
visual-style-guide-prompt.md → VisualStyleGuidePrompt.md

# But ONLY rename when:
1. You're already editing the file for other reasons
2. You've confirmed all references can be safely updated
3. You've tested that nothing breaks
```

## ⚡ EXECUTION GUIDELINES

### **What You Can Do Immediately:**
- ✅ Create all new files using PascalCase
- ✅ Document this standard in the project
- ✅ Use PascalCase for new folders and directories
- ✅ Apply to new assets, components, and documentation

### **What Requires Approval:**
- ⚠️ Renaming any existing file that other files import
- ⚠️ Changing file names that affect build processes
- ⚠️ Bulk renaming operations
- ⚠️ Modifying core system files

### **Red Flags - Stop and Ask:**
- 🚨 If renaming would affect more than 3 other files
- 🚨 If you're unsure about breaking changes
- 🚨 If the file is part of core functionality
- 🚨 If it's referenced in configuration files

## 🎯 SUCCESS CRITERIA

### **After Implementation:**
- ✅ All new files follow PascalCase convention
- ✅ Project maintains existing functionality
- ✅ Naming standard is documented and accessible
- ✅ Future modules have clear naming guidelines
- ✅ No broken imports or missing references
- ✅ Development workflow improved with consistent naming

### **Long-term Vision:**
```bash
JiGR Ecosystem Structure:
/DeliveryComplianceModule/
  Components/
    ComplianceDashboard.tsx
    DocumentUploadInterface.tsx
  Documentation/
    ModuleArchitectureGuide.md
  Assets/
    BackgroundImages/

/StaffTrainingModule/
  Components/
    TrainingProgressTracker.tsx
    CertificationManager.tsx
  Documentation/
    TrainingModuleGuide.md
  Assets/
    TrainingMaterials/

/EquipmentMaintenanceModule/
  Components/
    MaintenanceScheduler.tsx
    EquipmentStatusTracker.tsx
  Documentation/
    MaintenanceWorkflowGuide.md
  Assets/
    EquipmentImages/
```

## 📋 CHECKLIST FOR IMPLEMENTATION

### **Immediate Actions:**
- [ ] Document naming convention standard
- [ ] Start using PascalCase for all new files
- [ ] Configure development environment for new standard
- [ ] Update any file creation templates

### **Before Renaming Existing Files:**
- [ ] Identify all dependencies and references
- [ ] Plan import statement updates
- [ ] Test rename in isolated branch
- [ ] Confirm functionality preservation
- [ ] Get explicit approval for the change

### **Quality Assurance:**
- [ ] No broken imports after any renames
- [ ] All functionality works as expected
- [ ] Build process completes successfully
- [ ] No missing assets or broken links

---

## 💡 STRATEGIC VALUE

This naming convention establishes:
- **Professional consistency** across the entire JiGR ecosystem
- **Developer efficiency** through predictable file organization
- **Scalability** for unlimited AddOn modules
- **Brand coherence** in code structure and documentation
- **Reduced cognitive load** with clear, readable naming

**Implement this standard thoughtfully and safely - it's a foundational investment in the platform's future success.**