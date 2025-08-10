# Visual Style Guide Reference Page - Prompt for Cursor Claude

## TASK OVERVIEW

I need you to create a **Visual Style Guide Reference Page** that shows all the design components, typography, and layout patterns used in our compliance app. This page is for my personal reference so I can give you precise design instructions when making changes.

## PAGE PURPOSE

- **Visual documentation** of every UI component in the project
- **Reference tool** for design modifications  
- **Clear labeling** of component names, CSS classes, fonts, and colors
- **Design communication** between me (visual learner) and you (developer)

## PAGE REQUIREMENTS

### **Create Route: `/style-guide`** (DEVELOPMENT ONLY - NEVER DEPLOYED)

**CRITICAL: This page must be completely hidden from production and customers:**

```typescript
// Only accessible in development environment
if (process.env.NODE_ENV !== 'development') {
  return <div>Page not found</div>; // or redirect to 404
}

// OR create in a separate /dev/ route group that's excluded from production builds
// File location: /app/dev/style-guide/page.tsx
```

**Security Requirements:**
- ❌ **Never accessible** in production environment
- ❌ **Not included** in production builds  
- ❌ **No navigation links** to this page from the main app
- ❌ **Not indexed** by search engines
- ✅ **Development environment only**
- ✅ **localhost access only**

**Implementation Options:**
1. **Environment check** - Hide completely unless NODE_ENV=development
2. **Separate route group** - `/app/dev/` folder excluded from production
3. **Development server only** - Only served by dev server, not built for production

**Access Method:**
- Direct URL navigation only: `http://localhost:3000/style-guide`
- No navigation links anywhere in the app
- Only you know it exists

### **Page Structure - Show Examples Of:**

#### **1. TYPOGRAPHY SHOWCASE**
Display all text styles used in the app with clear labels:

```
[H1 Header Example]
Component: PageHeader 
Class: text-3xl font-bold text-gray-900
Size: 30px | Weight: Bold | Color: #111827

[H2 Subheader Example]  
Component: SectionHeader
Class: text-xl font-semibold text-gray-800
Size: 20px | Weight: Semibold | Color: #1F2937

[Body Text Example]
Component: BodyText
Class: text-base text-gray-600
Size: 16px | Weight: Regular | Color: #4B5563

[Button Text Example]
Component: PrimaryButton
Class: text-sm font-medium text-white
Size: 14px | Weight: Medium | Color: #FFFFFF

[Caption Text Example]
Component: Caption
Class: text-xs text-gray-500  
Size: 12px | Weight: Regular | Color: #6B7280
```

#### **2. COLOR PALETTE SHOWCASE**
**First, analyze the existing project and document all colors currently in use:**

```
STEP 1: Scan all components in the project and extract every color class used
STEP 2: Group colors by purpose (primary, secondary, status, backgrounds, etc.)
STEP 3: Show both the existing palette AND the recommended compliance app palette
```

**Current Project Colors** (analyze and document what's already being used):
```
[Analyze existing files and show actual colors found]
Example format:
[Color Swatch] Existing Primary
CSS: bg-blue-500 | HEX: #3B82F6 | Usage: Found in 12 components
Files: button.tsx, header.tsx, nav.tsx

[Color Swatch] Existing Background  
CSS: bg-gray-100 | HEX: #F3F4F6 | Usage: Found in 8 components
Files: layout.tsx, card.tsx, dashboard.tsx
```

**Recommended Compliance App Colors**:
```
[Color Swatch] Primary Blue
CSS: bg-blue-600 | HEX: #2563EB | Usage: Primary buttons, links
Replaces: [existing blue if different]

[Color Swatch] Success Green  
CSS: bg-green-500 | HEX: #10B981 | Usage: Success states, compliance indicators
Current usage: [scan for existing green colors]

[Color Swatch] Warning Orange
CSS: bg-orange-500 | HEX: #F59E0B | Usage: Warning alerts, pending states
Current usage: [scan for existing orange/yellow colors]

[Color Swatch] Error Red
CSS: bg-red-500 | HEX: #EF4444 | Usage: Violations, error states
Current usage: [scan for existing red colors]

[Color Swatch] Background Gray
CSS: bg-gray-50 | HEX: #F9FAFB | Usage: Page backgrounds
Current usage: [show what background colors are currently used]

[Color Swatch] Border Gray
CSS: border-gray-200 | HEX: #E5E7EB | Usage: Card borders, dividers
Current usage: [show current border colors]

[Color Swatch] Text Primary
CSS: text-gray-900 | HEX: #111827 | Usage: Main headings, important text
Current usage: [show current text colors]

[Color Swatch] Text Secondary  
CSS: text-gray-600 | HEX: #4B5563 | Usage: Body text, descriptions
Current usage: [show current secondary text colors]

[Color Swatch] Text Muted
CSS: text-gray-500 | HEX: #6B7280 | Usage: Captions, timestamps, metadata
Current usage: [show current muted text colors]
```

**Color Migration Notes**:
```
[If colors need updating, show:]
- What's currently used: bg-blue-400
- What should be used: bg-blue-600  
- Components affected: PrimaryButton, NavLink, etc.
- Reason for change: Better contrast for compliance app
```

#### **3. COMPONENT LIBRARY**
Show actual working examples with labels:

##### **Buttons**
```
[Primary Button Example] 
Component: PrimaryButton
Classes: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
Usage: Main actions, form submissions

[Secondary Button Example]
Component: SecondaryButton  
Classes: "bg-white hover:bg-gray-50 text-gray-900 font-medium py-2 px-4 rounded-md border border-gray-300"
Usage: Secondary actions, cancel buttons

[Danger Button Example]
Component: DangerButton
Classes: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
Usage: Delete actions, critical operations
```

##### **Cards & Containers**
```
[Basic Card Example]
Component: Card
Classes: "bg-white rounded-lg border border-gray-200 p-6"
Usage: Content containers, form sections

[Stats Card Example]  
Component: StatsCard
Classes: "bg-white rounded-lg border border-gray-200 p-4"
Usage: Dashboard metrics, number displays

[List Container Example]
Component: ListContainer
Classes: "bg-white rounded-lg border border-gray-200 divide-y divide-gray-200"
Usage: Tables, lists, repeated content
```

##### **Form Elements**
```
[Text Input Example]
Component: TextInput
Classes: "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
Usage: Text entry, email, phone fields

[Select Dropdown Example]
Component: SelectInput
Classes: "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
Usage: Option selection, filters

[File Upload Example]
Component: FileUpload  
Classes: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400"
Usage: Photo upload, document upload

[Image Uploader Component - NEW v1.8.8]
Component: ImageUploader
Classes: "border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer backdrop-blur-sm transition-all duration-200 hover:border-white/50"
Features: Drag & drop, preview, progress bar, validation
Usage: Avatar upload, company logo upload
Props: shape (circle/square), size, acceptedTypes, maxSizeMB
```

#### **4. LAYOUT PATTERNS**
Show page structure examples:

##### **Page Headers**
```
[Page Header Example]
Component: PageHeader
Structure: 
- Container: "flex items-center justify-between py-4 px-6 border-b border-gray-200"
- Title: "text-2xl font-bold text-gray-900"  
- Actions: "flex space-x-3"
Usage: Top of every page
```

##### **Navigation Patterns**
```
[Bottom Tab Bar Example]
Component: BottomTabBar
Structure:
- Container: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
- Tab Item: "flex-1 flex flex-col items-center py-2"
- Icon: "h-6 w-6 mb-1"
- Label: "text-xs"
Usage: Primary navigation on mobile/tablet

[Sidebar Navigation Example]  
Component: SidebarNav
Structure: 
- Container: "w-64 bg-white border-r border-gray-200 h-full"
- Nav Item: "flex items-center px-4 py-2 hover:bg-gray-50"
- Icon: "h-5 w-5 mr-3"
- Label: "text-sm font-medium"
Usage: Admin pages, desktop view
```

#### **5. STATUS INDICATORS**
Show all states with visual examples:

```
[Compliance Badge - Pass]
Component: ComplianceBadge
Classes: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
Usage: Compliant deliveries

[Compliance Badge - Fail]  
Component: ComplianceBadge
Classes: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
Usage: Violation alerts

[Loading Spinner]
Component: LoadingSpinner
Classes: "animate-spin h-5 w-5 text-blue-600"
Usage: Processing states
```

#### **6. RESPONSIVE BREAKPOINTS**
Document the responsive behavior:

```
Mobile (iPad): max-width: 768px
- Single column layouts
- Bottom tab navigation  
- Larger touch targets (44px minimum)
- Simplified spacing

Desktop: min-width: 769px  
- Sidebar navigation
- Multi-column layouts
- Hover states enabled

#### **7. BACKGROUND IMAGES - NEW v1.8.8**
Document the section-specific backgrounds:

```
[Admin Section Background]
Image: /chef-workspace.jpg (Clean modern kitchen with white surfaces)
CSS: backgroundImage: url('/chef-workspace.jpg')
Properties: 
- backgroundPosition: '50% 50%'
- backgroundAttachment: 'fixed' 
- filter: brightness(0.9)
Usage: All admin pages (/admin/*)

[Workspace Section Background]  
Image: /Home-Chef-Chicago-8.webp (Industrial commercial kitchen)
CSS: backgroundImage: url('/Home-Chef-Chicago-8.webp')
Properties:
- backgroundPosition: '50% 50%'
- backgroundAttachment: 'fixed'
- filter: brightness(0.7)
Usage: All workspace pages (/workspace/*)

[Header Branding - NEW v1.8.8]
User Avatar: 
- Size: w-12 h-12 (48px, increased 20% from v1.8.7)
- Shape: rounded-full
- Location: Top-right header
- Click: Links to /admin/profile

Company Logo:
- Size: w-14 h-14 (56px, increased 20% from v1.8.7) 
- Shape: rounded-full with bg-orange-500
- Location: Top-left header
- Click: Links to /admin/company/settings
```
```

## DISPLAY FORMAT

### **Layout the page as:**
1. **Header section** with page title "Design System Reference"
2. **Navigation menu** to jump between sections
3. **Each component section** with:
   - Section title
   - Live working examples
   - Code/class information below each example
   - Usage notes
4. **Color-coded borders** around each component for easy identification

### **Visual Hierarchy:**
- **Large section headers** (H2)
- **Component names** as subheaders (H3) 
- **Live examples** in bordered containers
- **Technical details** in smaller gray text below examples
- **Usage notes** in italics

### **Make it Interactive:**
- **Hover effects** on interactive elements
- **Copy-to-clipboard** buttons for CSS classes
- **Search functionality** to find specific components
- **Responsive preview** toggles

## WHY THIS IS IMPORTANT

This reference page will allow me to say things like:
- "Change the StatsCard background to use the Warning Orange color"
- "Make the PageHeader title use the H1 typography style"  
- "Update the PrimaryButton to use rounded-lg instead of rounded-md"
- "Change the ListContainer border to use the Success Green color"

**Clear component names + exact CSS classes = precise design communication**

## DEVELOPMENT NOTES

- **SECURITY: This page must NEVER be accessible in production**
- **Environment gated:** Only visible when NODE_ENV=development
- **No navigation links:** Direct URL access only during development
- **Build exclusion:** Not included in production deployments
- Use the same Tailwind classes as the rest of the app
- Show real, working components (not mockups)
- Include dark/light mode variations if applicable
- Make it print-friendly for offline reference

**Suggested Implementation:**
```typescript
// At the top of the style guide page component
if (process.env.NODE_ENV === 'production') {
  redirect('/404'); // or return null
}
```

---

**Build this as a comprehensive visual dictionary of our design system!**