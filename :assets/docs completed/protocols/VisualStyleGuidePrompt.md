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