# Visual Style Guide Prompt Protocol

## 🎨 AUTOMATED STYLE GUIDE GENERATION & MAINTENANCE

### **VISUAL STYLE GUIDE PHILOSOPHY**

The visual style guide serves as the **living documentation** of our design system implementation, automatically generating comprehensive style references from the centralized design tokens.

## **AUTO-GENERATED STYLE GUIDE COMPONENTS**

### **1. Design Token Showcase**
```typescript
// Auto-generate from /lib/design-system.ts
interface StyleGuideGeneration {
  colorPalette: {
    glass: Record<string, string>;     // All glass morphism variants
    text: Record<string, string>;      // Text color tokens
    status: Record<string, string>;    // Success, warning, error colors
  };
  
  typography: {
    headings: ComponentExample[];      // Live examples of all heading styles
    body: ComponentExample[];          // Body text variations
    special: ComponentExample[];       // Caption, version, meta text
  };
  
  components: {
    cards: ComponentExample[];         // All card variants with live preview
    forms: ComponentExample[];         // Form field examples
    buttons: ComponentExample[];       // Button style variations
    navigation: ComponentExample[];    // Nav pills, links, breadcrumbs
  };
  
  layouts: {
    grids: ComponentExample[];         // Grid patterns and spacing
    spacing: ComponentExample[];       // Margin/padding standards
    patterns: ComponentExample[];      // Common layout compositions
  };
}
```

### **2. Live Component Examples**
```typescript
// Auto-execute: Generate interactive examples
const generateLiveExamples = () => {
  return {
    // Card variants with actual content
    cardExamples: [
      {
        variant: 'primary',
        code: `<div className={getCardStyle('primary')}>Primary Card Content</div>`,
        preview: 'Live rendered card with design system styling',
        usage: 'Main content cards, feature highlights'
      },
      {
        variant: 'secondary', 
        code: `<div className={getCardStyle('secondary')}>Secondary Card</div>`,
        preview: 'Live rendered secondary card',
        usage: 'Supporting content, sidebar items'
      }
    ],
    
    // Typography with real examples
    typographyExamples: [
      {
        style: 'pageTitle',
        code: `<h1 className={getTextStyle('pageTitle')}>Page Title</h1>`,
        preview: 'Live rendered page title',
        usage: 'Main page headings, primary navigation'
      }
    ],
    
    // Form field demonstrations
    formExamples: [
      {
        type: 'input',
        code: `<input className={getFormFieldStyle()} placeholder="Enter text" />`,
        preview: 'Live rendered form input',
        usage: 'All text inputs, search fields'
      }
    ]
  };
};
```

## **AUTOMATED STYLE GUIDE WORKFLOW**

### **Trigger Conditions** ✅ Auto-Execute
- Design system updates detected
- New components added to design system
- User requests style guide refresh
- Visual inconsistencies found during development

### **Generation Process**
```markdown
## Auto-Execution Sequence:

1. **🔍 Scan Design System**
   - Read /lib/design-system.ts for latest tokens
   - Extract all utility functions and variants
   - Identify new or updated design patterns

2. **🎨 Generate Visual Examples**
   - Create live component previews
   - Generate code snippets for each variant
   - Document usage patterns and best practices

3. **📝 Update Documentation**
   - Refresh style guide page content
   - Update component examples
   - Validate all code snippets work correctly

4. **✅ Validate Consistency**
   - Ensure all examples use design system
   - Check for deprecated patterns
   - Verify visual consistency across examples
```

### **Auto-Update Response Pattern**
```markdown
🎨 Style guide generation triggered by [design system update/user request]

**📊 Generating components:**
- Color palette showcase (24 tokens)
- Typography examples (8 variants)  
- Card component library (4 variants)
- Form field demonstrations (3 types)
- Layout pattern examples (6 patterns)

**🔧 Updating style guide page:**
- Refreshing component previews...
- Updating code snippets...
- Validating design system integration...

✅ Style guide updated with latest design tokens
```

## **STYLE GUIDE CONTENT STRUCTURE**

### **Visual Hierarchy**
```typescript
interface StyleGuideLayout {
  // Color system showcase
  colorSection: {
    glassCards: LiveExample[];        // Visual cards showing each glass variant
    textColors: LiveExample[];        // Text on different backgrounds
    statusColors: LiveExample[];      // Success, warning, error states
    usageGuidelines: string[];        // When to use each color
  };
  
  // Typography system
  typographySection: {
    hierarchy: LiveExample[];         // All heading levels in context
    bodyText: LiveExample[];          // Different body text variations
    specialText: LiveExample[];       // Captions, versions, metadata
    contrastExamples: LiveExample[];  // Text on different backgrounds
  };
  
  // Component library
  componentSection: {
    cards: ComponentShowcase[];       // All card variants with content
    forms: ComponentShowcase[];       // Complete form examples
    navigation: ComponentShowcase[];  // Nav patterns and states
    buttons: ComponentShowcase[];     // Button styles and states
  };
  
  // Layout patterns
  layoutSection: {
    grids: LayoutExample[];          // Common grid configurations
    spacing: LayoutExample[];        // Margin/padding standards
    compositions: LayoutExample[];   // Full page layout examples
  };
}
```

### **Code Example Integration**
```typescript
// Auto-generate copy-paste ready code
const generateCodeExamples = (component: string, variant: string) => {
  return {
    // Import statements
    imports: `import { getCardStyle, getTextStyle } from '@/lib/design-system'`,
    
    // Usage example
    usage: `<div className={getCardStyle('${variant}')}>
  <h2 className={getTextStyle('cardTitle')}>Card Title</h2>
  <p className={getTextStyle('body')}>Card content goes here</p>
</div>`,
    
    // Alternative patterns
    alternatives: [
      `// With custom styling
<div className={\`\${getCardStyle('${variant}')} custom-class\`}>`,
      `// With conditional styling  
<div className={getCardStyle(isActive ? '${variant}' : 'secondary')}>`,
    ],
    
    // Common mistakes to avoid
    antiPatterns: [
      `// ❌ Don't use hardcoded classes
<div className="bg-white/15 backdrop-blur-lg">`,
      `// ✅ Use design system utilities
<div className={getCardStyle('${variant}')}>`,
    ]
  };
};
```

## **VISUAL CONSISTENCY VALIDATION**

### **Automated Checks** ✅ Auto-Execute
```typescript
const validateStyleGuide = () => {
  const validationResults = {
    // Design system compliance
    designSystemUsage: checkAllExamplesUseDesignSystem(),
    
    // Visual consistency  
    colorConsistency: validateColorUsage(),
    typographyConsistency: validateTextStyles(),
    spacingConsistency: validateLayoutPatterns(),
    
    // Code quality
    codeExamples: validateAllCodeSnippets(),
    importStatements: verifyCorrectImports(),
    
    // Accessibility
    contrastRatios: checkColorContrast(),
    textReadability: validateTextSizes(),
  };
  
  return validationResults;
};
```

### **Auto-Fix Common Issues**
```typescript
const autoFixStyleGuide = (issues: ValidationResult[]) => {
  issues.forEach(issue => {
    switch (issue.type) {
      case 'hardcoded-styles':
        // Auto-migrate to design system utilities
        migrateToDesignSystem(issue.component);
        break;
        
      case 'outdated-examples':
        // Refresh with latest design tokens
        regenerateComponentExample(issue.component);
        break;
        
      case 'missing-imports':
        // Add required design system imports
        addDesignSystemImports(issue.file);
        break;
        
      case 'inconsistent-usage':
        // Standardize component usage patterns
        standardizeComponentUsage(issue.component);
        break;
    }
  });
};
```

## **INTEGRATION WITH DEVELOPMENT WORKFLOW**

### **Style Guide as Development Tool**
```typescript
// Auto-update during development
const developmentIntegration = {
  // Watch for design system changes
  watchDesignSystem: () => {
    if (designSystemUpdated) {
      regenerateStyleGuide();
      validateAllExamples();
      updateComponentPreviews();
    }
  },
  
  // Integrate with component development
  componentDevelopment: () => {
    if (newComponentCreated) {
      addToStyleGuide();
      generateUsageExamples();
      documentBestPractices();
    }
  },
  
  // Quality assurance checks
  qaIntegration: () => {
    if (beforeCommit) {
      validateStyleGuideExamples();
      checkDesignSystemCompliance();
      ensureVisualConsistency();
    }
  }
};
```

### **Developer Experience Features**
```typescript
interface DeveloperFeatures {
  // Copy-paste ready code
  codeSnippets: {
    oneClick: boolean;           // Copy entire component with one click
    formatted: boolean;          // Properly indented and formatted
    imports: boolean;            // Include necessary import statements
  };
  
  // Interactive examples
  livePreview: {
    realTime: boolean;          // See changes immediately
    responsive: boolean;        // Test different screen sizes
    themeToggle: boolean;       // Switch between variants
  };
  
  // Documentation integration
  usage: {
    bestPractices: string[];    // When to use each component
    commonMistakes: string[];   // What to avoid
    accessibility: string[];    // A11y considerations
  };
}
```

## **STYLE GUIDE SECTIONS**

### **1. Foundation** (Auto-Generated)
- **Color System**: All design tokens with usage guidelines
- **Typography Scale**: Complete hierarchy with examples
- **Spacing System**: Consistent padding/margin patterns
- **Effects**: Shadows, blurs, transitions, animations

### **2. Components** (Live Examples)
- **Cards**: All variants with real content
- **Forms**: Complete form examples with validation states
- **Navigation**: Pills, breadcrumbs, pagination
- **Buttons**: All states and variations

### **3. Patterns** (Composition Examples)
- **Page Layouts**: Complete page examples
- **Grid Systems**: Common grid configurations  
- **Content Patterns**: Article layouts, dashboard grids
- **Responsive Patterns**: Mobile-first design examples

### **4. Guidelines** (Best Practices)
- **Usage Patterns**: When to use each component
- **Accessibility**: WCAG compliance examples
- **Performance**: Optimization recommendations
- **Browser Support**: Safari 12+ compatibility notes

## **AUTOMATED MAINTENANCE**

### **Continuous Updates** ✅ Auto-Execute
```bash
# Triggered automatically on:
- Design system file changes
- New component additions
- Version updates
- User style guide requests

# Auto-execution sequence:
1. Detect changes in design system
2. Regenerate affected style guide sections
3. Validate all examples still work
4. Update documentation and code snippets
5. Refresh live previews
```

### **Quality Assurance**
```typescript
const styleGuideQA = {
  // Visual regression testing
  visualTesting: 'Ensure examples match design system',
  
  // Code validation
  codeValidation: 'All snippets compile and work correctly',
  
  // Design system compliance
  designCompliance: 'No hardcoded styles in examples',
  
  // Accessibility validation
  a11yValidation: 'All examples meet WCAG standards'
};
```

## **COMMUNICATION PROTOCOL**

### **Auto-Update Notifications**
```markdown
🎨 Style guide auto-update triggered

**📊 Changes detected:**
- Updated card styling in design system
- New typography variant added
- Form field styling standardized

**🔧 Regenerating:**
- Component examples (4 updated)
- Code snippets (12 refreshed)  
- Live previews (8 rebuilt)

✅ Style guide synchronized with design system v1.8.12.007a
🔗 Available at: /dev/style-guide
```

### **User Request Response**
```markdown
🎨 Generating comprehensive style guide...

**📚 Creating sections:**
- Foundation (colors, typography, spacing)
- Components (cards, forms, navigation, buttons)  
- Patterns (layouts, grids, compositions)
- Guidelines (usage, accessibility, best practices)

**🔧 Features included:**
- Live component previews
- Copy-paste ready code snippets
- Usage guidelines and best practices
- Design system integration examples

✅ Style guide generated with 47 live examples
```

## **BENEFITS OF THIS PROTOCOL**

### **🚀 Development Efficiency**
- **Living documentation** that updates automatically
- **Copy-paste ready code** for rapid development
- **Visual consistency** through standardized examples
- **Best practice guidance** integrated with examples

### **💡 Quality Assurance**
- **Design system enforcement** through validated examples
- **Visual regression prevention** with comprehensive showcases
- **Accessibility compliance** with built-in WCAG examples
- **Cross-browser compatibility** with Safari 12+ focus

### **⚡ Maintenance Automation**
- **Auto-sync with design system** changes
- **Continuous validation** of all examples
- **Automated quality checks** on updates
- **Self-updating documentation** reduces manual work

---

## 🎯 **PROTOCOL SUMMARY**

**Style Guide Auto-Generation:**
1. **Auto-detect** design system changes or user requests
2. **Auto-generate** live component examples and code snippets
3. **Auto-validate** all examples work with current design system
4. **Auto-update** documentation and best practices
5. **Auto-notify** when style guide is synchronized

**Focus: Living documentation that scales with the design system**

**Integration: Seamless with autonomy protocol and design system workflow**