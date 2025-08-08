# Component Library Reference

## Overview
This template includes a set of reusable components designed for consistency and Safari 12 compatibility.

## Core Components

### Footer Component
**Location**: `app/components/Footer.tsx`

#### Props
```typescript
interface FooterProps {
  version?: string      // Version number to display
  transparent?: boolean // Glass effect vs solid background
}
```

#### Usage
```jsx
import Footer from './components/Footer'

<Footer version="1.0.0" transparent={true} />
```

#### Features
- ✅ Liquid glass effect option
- ✅ Version number display
- ✅ Logo integration with prismatic glow
- ✅ Responsive design
- ✅ Navigation link (customizable)

---

### ErrorBoundary Component
**Location**: `app/components/ErrorBoundary.tsx`

#### Usage
```jsx
import ErrorBoundary from './components/ErrorBoundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Features
- ✅ Graceful error handling
- ✅ User-friendly error messages
- ✅ Production-safe error logging
- ✅ Fallback UI display

---

### Layout Component
**Location**: `app/layout.tsx`

#### Features
- ✅ HTML5 semantic structure
- ✅ iOS 12 meta tags
- ✅ Google Fonts integration
- ✅ Safari 12 polyfills
- ✅ Progressive enhancement

#### Customization Points
```tsx
// Update these placeholders:
<title>PROJECT_TITLE_PLACEHOLDER</title>
<meta name="description" content="PROJECT_DESCRIPTION_PLACEHOLDER" />
<meta name="apple-mobile-web-app-title" content="PROJECT_NAME_PLACEHOLDER" />
```

## Design Patterns

### Page Layout Structure
```jsx
export default function YourPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: 'url("/background.jpg")' }} />
      
      {/* Content */}
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8">
          {/* Your content here */}
        </main>
      </div>
      
      <Footer version="1.0.0" transparent={true} />
    </div>
  )
}
```

### Glass Card Pattern
```jsx
<div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
  <h2 className="typography-title font-lora text-white mb-4">
    Card Title
  </h2>
  <p className="typography-paragraph font-source text-white/80">
    Card content goes here
  </p>
</div>
```

### Button Patterns
```jsx
// Primary Action Button
<button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-lg typography-button font-source">
  Primary Action
</button>

// Secondary Glass Button
<button className="liquid-glass-logo liquid-glass-medium typography-button font-source text-white hover:bg-white/10 transition-all">
  Secondary
</button>
```

## Typography Components

### Heading Hierarchy
```jsx
// Page Title
<h1 className="typography-title font-lora text-white text-5xl md:text-7xl">
  Main Title
</h1>

// Section Heading
<h2 className="typography-title font-lora text-white text-3xl">
  Section Title
</h2>

// Subsection
<h3 className="typography-paragraph-bold font-source text-white text-xl">
  Subsection
</h3>
```

### Text Components
```jsx
// Lead Text
<p className="typography-lead font-lora text-white/90 text-xl">
  Important introductory text
</p>

// Body Text
<p className="typography-paragraph font-source text-white/80">
  Regular paragraph content
</p>

// Bold Text
<p className="typography-paragraph-bold font-source text-white">
  Emphasized content
</p>
```

## Form Components

### Input Pattern
```jsx
<input 
  type="text"
  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 typography-paragraph font-source"
  placeholder="Enter text here"
/>
```

### Select Pattern
```jsx
<select className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white typography-paragraph font-source">
  <option value="">Select option</option>
  <option value="1">Option 1</option>
</select>
```

## Responsive Patterns

### Container Widths
```jsx
// Full width with padding
<div className="w-full px-4">

// Centered with max width
<div className="max-w-4xl mx-auto px-4">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Text Sizing
```jsx
// Responsive headings
<h1 className="text-3xl md:text-5xl lg:text-7xl">

// Responsive body text
<p className="text-sm md:text-base lg:text-lg">
```

## Animation Patterns

### Hover Animations
```css
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
```

### Loading States
```jsx
<div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full">
```

## Accessibility Guidelines

### ARIA Labels
```jsx
<button aria-label="Close dialog">×</button>
<img src="/logo.png" alt="Company logo" />
```

### Focus Management
```css
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### Color Contrast
- Ensure text meets WCAG AA standards
- Test with color blindness simulators
- Provide alternative indicators beyond color

## Performance Best Practices

### Image Optimization
```jsx
<img 
  src="/image.jpg" 
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>
```

### Component Lazy Loading
```jsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>
})
```

### Memory Management
```jsx
useEffect(() => {
  // Setup
  const cleanup = setupSomething()
  
  // Cleanup
  return () => cleanup()
}, [])
```