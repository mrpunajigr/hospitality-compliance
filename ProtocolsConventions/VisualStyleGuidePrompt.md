# Create Visual Style Guide Reference Page - Claude Code Prompt

## 🎯 PURPOSE: Development-Only Design Reference Tool

Create a comprehensive visual style guide page that serves as a live reference for all UI components, typography, colors, and patterns used in the JiGR Compliance Platform.

## 📋 REQUIREMENTS

### **DEVELOPMENT ONLY - SECURITY CRITICAL:**
- **Environment Check:** Only accessible in development mode
- **URL:** `/style-guide` (direct access only, no navigation links)
- **Production Protection:** Returns 404 or redirects in production
- **Build Exclusion:** Never deployed to production builds

### **COMPONENT DOCUMENTATION:**
Display every component with:
- **Component Name** clearly labeled
- **CSS Classes** used (with exact class names)
- **Props/Variations** shown with examples
- **Usage Instructions** for each component
- **Copy-paste ready** class names

### **TYPOGRAPHY ANALYSIS:**
- **Font Families** currently in use
- **Font Sizes** with class names (text-xs, text-sm, text-lg, etc.)
- **Font Weights** with examples (font-light, font-medium, font-bold)
- **Line Heights** and spacing
- **Color Combinations** with readability

### **COLOR PALETTE EXTRACTION:**
Analyze the existing project and document:
- **Primary Colors** with HEX values
- **Secondary Colors** used in components
- **Background Colors** (light/dark themes)
- **Text Colors** with contrast ratios
- **Accent Colors** for buttons, links, alerts
- **Status Colors** (success, warning, error, info)

## 🎨 VISUAL LAYOUT REQUIREMENTS

### **PAGE STRUCTURE:**
```
┌─────────────────────────────────────┐
│ DEVELOPMENT STYLE GUIDE             │
│ ─────────────────────────────────── │
│                                     │
│ 🎨 COLOR PALETTE                   │
│ [Color swatches with HEX codes]     │
│                                     │
│ 📝 TYPOGRAPHY                      │
│ [Font examples with class names]    │
│                                     │
│ 🧩 COMPONENTS                      │
│ [Live component examples]           │
│                                     │
│ 📐 LAYOUT PATTERNS                 │
│ [Grid, spacing, containers]         │
│                                     │
└─────────────────────────────────────┘
```

### **COMPONENT DISPLAY FORMAT:**
```
┌─────────────────────────────────────┐
│ Component: PrimaryButton            │
│ ─────────────────────────────────── │
│ [Live button example]               │
│                                     │
│ CSS Classes:                        │
│ • bg-blue-600 hover:bg-blue-700     │
│ • text-white font-medium            │
│ • px-4 py-2 rounded-lg              │
│                                     │
│ Usage:                              │
│ <button className="bg-blue-600..."> │
│                                     │
│ Variations:                         │
│ [Secondary, Outline, Ghost buttons] │
└─────────────────────────────────────┘
```

## 🔍 ANALYSIS REQUIREMENTS

### **EXISTING PROJECT SCAN:**
- **Scan all .tsx files** for component patterns
- **Extract CSS classes** currently in use
- **Identify color patterns** from Tailwind classes
- **Document font usage** across components
- **Note responsive patterns** (mobile, tablet, desktop)

### **CURRENT VS RECOMMENDED:**
- **Show what's currently used** in the project
- **Highlight inconsistencies** (if any)
- **Suggest improvements** for better consistency
- **Document missing patterns** that should be standardized

### **THEME ANALYSIS:**
- **Light theme** component examples
- **Dark theme** component examples (if implemented)
- **Background compatibility** testing
- **Accessibility considerations** (contrast, readability)

## 🧩 COMPONENT CATEGORIES TO DOCUMENT

### **BASIC ELEMENTS:**
- **Buttons** (Primary, Secondary, Outline, Ghost, Disabled)
- **Form Inputs** (Text, Email, Password, TextArea, Select)
- **Typography** (Headings H1-H6, Body Text, Captions, Labels)
- **Links** (Default, Hover, Active, Visited states)

### **LAYOUT COMPONENTS:**
- **Cards** (Basic, with header, with actions)
- **Containers** (Page wrapper, content sections)
- **Navigation** (Pills, tabs, breadcrumbs)
- **Headers** (Page headers, section headers)

### **INTERACTIVE ELEMENTS:**
- **Modals** (Basic, confirmation, forms)
- **Alerts** (Success, Warning, Error, Info)
- **Loading States** (Spinners, skeletons, progress bars)
- **Form Validation** (Error states, success states)

### **SPECIALIZED COMPONENTS:**
- **Upload Areas** (Drag-and-drop, file selection)
- **Data Display** (Tables, lists, statistics)
- **Navigation Elements** (Sidebar, mobile menu)
- **Status Indicators** (Badges, pills, icons)

## 📱 RESPONSIVE DOCUMENTATION

### **DEVICE TESTING:**
- **Desktop** (1920px+) layout examples
- **Tablet** (768px-1024px) responsive behavior
- **Mobile** (320px-767px) mobile-first patterns
- **iPad Air** (2013) specific optimizations

### **BREAKPOINT DOCUMENTATION:**
```
Mobile First: Base styles (320px+)
Tablet: md: classes (768px+)  
Desktop: lg: classes (1024px+)
Large: xl: classes (1280px+)
```

## 🔧 TECHNICAL IMPLEMENTATION

### **FILE LOCATION:**
```
/pages/style-guide.tsx
or
/app/style-guide/page.tsx
```

### **SECURITY IMPLEMENTATION:**
```typescript
// Environment check
if (process.env.NODE_ENV === 'production') {
  return <div>404 - Page Not Found</div>;
  // or redirect to homepage
}

// Development warning header
<div className="bg-red-600 text-white p-2 text-center">
  🚨 DEVELOPMENT ONLY - This page is not accessible in production
</div>
```

### **COMPONENT EXTRACTION:**
```typescript
// Scan and display actual components
import { PrimaryButton } from '@/components/PrimaryButton';
import { ComplianceCard } from '@/components/ComplianceCard';
import { UploadInterface } from '@/components/UploadInterface';

// Show live examples with code
```

## 📊 UTILITY FEATURES

### **COPY-PASTE HELPERS:**
- **Class name buttons** (click to copy CSS classes)
- **Component snippets** (click to copy component usage)
- **Color codes** (click to copy HEX values)
- **Import statements** (click to copy import lines)

### **SEARCH FUNCTIONALITY:**
- **Component search** (find specific components)
- **Class name search** (find specific CSS classes)
- **Color search** (find specific colors)
- **Category filtering** (buttons, forms, layout, etc.)

### **DEVELOPMENT TOOLS:**
- **Component usage count** (how many times each component is used)
- **Orphaned classes** (CSS classes not used anywhere)
- **Missing documentation** (components without examples)
- **Accessibility scores** (contrast ratios, WCAG compliance)

## 🎯 SUCCESS CRITERIA

### **IMMEDIATE VALUE:**
- Clear visual reference for all components
- Copy-paste ready CSS classes
- Exact color codes with HEX values
- Typography samples with class names

### **DESIGN COMMUNICATION:**
- "Change the ComplianceCard background to bg-blue-50"
- "Make the PageHeader title use text-3xl instead of text-2xl"  
- "Update PrimaryButton hover state to hover:bg-green-700"
- "Use text-gray-600 for all secondary text"

### **CONSISTENCY CHECKING:**
- Identify design inconsistencies
- Standardize component variations
- Document missing states (hover, active, disabled)
- Ensure accessibility compliance

## 🚀 IMPLEMENTATION INSTRUCTIONS

### **STEP 1: Analysis Phase**
- Scan existing codebase for components
- Extract all CSS classes in use
- Identify color patterns and typography
- Document current component library

### **STEP 2: Documentation Phase**
- Create comprehensive component examples
- Generate color palette with exact codes
- Document typography scale with class names
- Add usage instructions for each element

### **STEP 3: Organization Phase**
- Group components by category
- Create logical navigation
- Add search and filter capabilities
- Implement copy-paste functionality

### **STEP 4: Security Phase**
- Add environment checks
- Ensure production exclusion
- Test access restrictions
- Document security measures

---
**This style guide will become your essential design reference tool for precise, professional component communication and development efficiency.**