# Standardized Typography System

## Overview
This document defines the standardized typography system for all projects, based on professional Google Fonts that provide consistent cross-platform rendering and excellent readability.

## Font Stack

### Primary Fonts

#### **Lora** (Serif)
- **Usage**: Headings, titles, lead paragraphs, article content
- **Weights**: 400 (Regular), 700 (Bold)
- **Characteristics**: Elegant, readable, professional serif
- **Fallbacks**: Georgia, Times New Roman, serif

#### **Source Sans Pro** (Sans-serif)
- **Usage**: Body text, UI elements, forms, buttons
- **Weights**: 400 (Regular), 600 (Semibold), 700 (Bold)
- **Characteristics**: Clean, modern, highly readable
- **Fallbacks**: Helvetica Neue, Arial, sans-serif

#### **Kirgina** (Company Brand)
- **Usage**: Company name, branding elements, logo text
- **Weight**: 400 (Regular)
- **Characteristics**: Distinctive brand font (custom TTF font)
- **Loading**: Self-hosted from `/public/Kirgina.ttf`
- **Fallbacks**: serif

## Implementation

### Tailwind CSS Classes

```css
/* Font Family Classes */
.font-lora        /* Lora serif font */
.font-source      /* Source Sans Pro */
.font-kirgina     /* Company branding font */

/* Semantic Typography Classes */
.typography-title      /* Lora Bold for headings */
.typography-lead       /* Lora Regular for lead paragraphs */
.typography-paragraph  /* Source Sans Pro for body text */
.typography-button     /* Source Sans Pro Semibold for buttons */
.typography-link       /* Source Sans Pro for links */
.typography-brand      /* Kirigina for company branding */
```

### Usage Examples

#### Headers & Titles
```jsx
<h1 className="text-4xl typography-title font-lora">Article Title</h1>
<h2 className="text-2xl typography-title font-lora">Section Header</h2>
```

#### Company Branding
```jsx
<h1 className="text-4xl typography-brand font-kirgina">Company Name</h1>
```

#### Body Content
```jsx
<p className="typography-lead font-lora">Lead paragraph with Lora for readability</p>
<p className="typography-paragraph font-source">Body text using Source Sans Pro</p>
```

#### UI Elements
```jsx
<button className="typography-button font-source">Click Here</button>
<a href="#" className="typography-link font-source">Learn More</a>
<label className="typography-paragraph font-source">Form Label</label>
```

## Technical Implementation

### Font Loading (Next.js)
```jsx
// In app/layout.tsx - Google Fonts
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link 
  href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Source+Sans+Pro:wght@400;600;700&display=swap" 
  rel="stylesheet" 
/>
```

```css
/* In app/globals.css - Custom Font */
@font-face {
  font-family: 'Kirgina';
  src: url('/Kirgina.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Safari 12 compatible */
}
```

### Tailwind Configuration
```javascript
// tailwind.config.js
fontFamily: {
  'lora': ['Lora', 'Georgia', 'Times New Roman', 'serif'],
  'source': ['Source Sans Pro', 'Helvetica Neue', 'Arial', 'sans-serif'],
  'kirgina': ['Kirigina', 'serif'],
}
```

## Typography Hierarchy

### Scale & Usage
- **6xl (60px)**: Hero titles, landing page headers
- **5xl (48px)**: Page titles, main headers
- **4xl (36px)**: Section headers, company name
- **3xl (30px)**: Subsection headers
- **2xl (24px)**: Card titles, component headers
- **xl (20px)**: Large body text, lead paragraphs
- **lg (18px)**: Standard body text
- **base (16px)**: Default text, forms
- **sm (14px)**: Captions, metadata
- **xs (12px)**: Fine print, footnotes

### Weight Guidelines
- **700 (Bold)**: Main headings, important titles
- **600 (Semibold)**: Buttons, emphasis, subheadings
- **400 (Regular)**: Body text, paragraphs, standard content

## Browser Compatibility

### Safari 12 Support
- ✅ Google Fonts load correctly
- ✅ Fallback fonts ensure consistent rendering
- ✅ Font-display: swap for performance
- ✅ Proper font-weight mapping

### Performance Optimizations
- Font preconnect for faster loading
- Limited weight variations (400, 600, 700)
- Efficient fallback stacks
- CSS font-display: swap

## Migration Guide

### From Legacy Fonts
```jsx
// OLD (Apple System Fonts)
className="font-sf-pro"       → className="typography-paragraph font-source"
className="font-new-york"     → className="typography-title font-lora"

// NEW (Standardized System)
className="font-source"       // Body text, UI elements
className="font-lora"         // Headings, titles
className="font-kirgina"      // Company branding
```

### Semantic Classes (Recommended)
Instead of individual font classes, use semantic typography classes:
```jsx
// GOOD - Semantic and maintainable
<h1 className="typography-title">Title</h1>
<p className="typography-paragraph">Body text</p>
<button className="typography-button">Action</button>

// OKAY - Direct font classes
<h1 className="font-lora font-bold">Title</h1>
<p className="font-source">Body text</p>
```

## Future Considerations

### Additional Weights
If needed, additional font weights can be added:
- Lora: 300 (Light), 500 (Medium)
- Source Sans Pro: 300 (Light), 500 (Medium)

### Icon Fonts
For projects requiring icons, consider:
- Heroicons (recommended for React/Next.js)
- Tabler Icons
- Avoid icon fonts in favor of SVG components

### RTL Support
Current fonts support RTL languages if needed in future projects.

---

**Last Updated**: August 2025  
**Version**: v2.8.5  
**Status**: Active - Use for all new projects