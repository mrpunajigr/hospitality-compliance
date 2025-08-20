# Figma Component Specifications - Capture Page

## 🎯 Overview
Complete CSS specifications and dimensions for recreating the Capture page components in Figma.

---

## 📦 Card Container Specifications

### **Base Card Container**
```css
/* Main card structure */
.card-container {
  position: relative;
  overflow: hidden;
  padding: 24px; /* p-6 */
  border-radius: 24px; /* rounded-3xl */
  background-image: url(/LiquidGlassAssets/Container.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Accent circle (top-right) */
.accent-circle {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px; /* w-20 */
  height: 80px; /* h-20 */
  border-radius: 50%;
  margin-right: -40px; /* -mr-10 */
  margin-top: -40px; /* -mt-10 */
}
```

### **Card Accent Colors**
- **Quick Capture**: `rgba(59, 130, 246, 0.1)` /* bg-blue-500/10 */
- **Bulk Upload**: `rgba(168, 85, 247, 0.1)` /* bg-purple-500/10 */
- **Ready Queue**: `rgba(34, 197, 94, 0.1)` /* bg-green-500/10 */
- **Results Card**: `rgba(34, 197, 94, 0.1)` /* bg-green-500/10 */
- **Tips Card**: `rgba(234, 179, 8, 0.1)` /* bg-yellow-500/10 */

---

## 🔘 Button Component Specifications

### **Button Container Structure**
```css
/* Button container (uses liquid glass background) */
.button-container {
  width: 100%;
  border-radius: 12px; /* rounded-xl */
  position: relative;
  overflow: hidden;
  background-image: url(/LiquidGlassAssets/button.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Actual button element */
.button-element {
  width: 100%;
  color: white;
  padding: 12px 16px; /* py-3 px-4 */
  font-size: 14px; /* text-sm */
  font-weight: 500; /* font-medium */
  background: transparent;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

/* Hover state */
.button-element:hover {
  background: rgba(255, 255, 255, 0.1); /* hover:bg-white/10 */
}

/* Disabled state */
.button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 🎨 Typography Specifications

### **Card Titles (H2)**
```css
.card-title {
  color: white;
  font-size: 14px; /* text-sm */
  font-weight: 700; /* font-bold */
  margin: 0;
}
```

### **Body Text Variations**
```css
/* Primary description text */
.description-text {
  font-size: 12px; /* text-xs */
  text-align: center;
  margin-top: 8px; /* mt-2 */
}

/* Color variations by card type */
.description-blue { color: rgba(147, 197, 253, 1); } /* text-blue-200 */
.description-purple { color: rgba(196, 181, 253, 1); } /* text-purple-200 */
.description-green { color: rgba(134, 239, 172, 1); } /* text-green-200 */

/* File specs text (muted) */
.specs-text {
  color: rgba(196, 181, 253, 0.7); /* text-purple-200/70 */
  font-size: 12px; /* text-xs */
  text-align: center;
}

/* Tips text (black) */
.tips-text {
  color: black;
  font-size: 14px; /* text-sm */
}

/* Tips bullets */
.tips-bullet {
  width: 8px; /* w-2 */
  height: 8px; /* h-2 */
  background: rgba(0, 0, 0, 0.6); /* bg-black/60 */
  border-radius: 50%;
  margin-top: 8px; /* mt-2 */
  flex-shrink: 0;
}
```

---

## 🖼️ Icon Specifications

### **JiGR Module Icons**
```css
.module-icon {
  width: 64px; /* w-16 */
  height: 64px; /* h-16 */
  object-fit: contain;
  margin: 0 auto 16px auto; /* mx-auto mb-4 */
}
```

### **Icon Sources**
- **Quick Capture**: `/icons/JiGRcamera.png`
- **Bulk Upload**: `/icons/JiGRbulk.png`
- **Ready Queue**: `/icons/JiGRqueue.png`

---

## 📐 Layout Grid Specifications

### **Main Grid System**
```css
.capture-grid {
  display: grid;
  grid-template-columns: 1fr; /* grid-cols-1 */
  gap: 24px; /* gap-6 */
}

/* Tablet breakpoint (768px+) */
@media (min-width: 768px) {
  .capture-grid {
    grid-template-columns: repeat(2, 1fr); /* md:grid-cols-2 */
  }
}

/* Desktop breakpoint (1024px+) */
@media (min-width: 1024px) {
  .capture-grid {
    grid-template-columns: repeat(4, 1fr); /* lg:grid-cols-4 */
  }
}
```

### **Results Section Grid**
```css
.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px; /* gap-6 */
  margin-top: 32px; /* mt-8 */
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-card {
    grid-column: span 2; /* md:col-span-2 */
  }
}

@media (min-width: 1024px) {
  .results-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 🎭 Special Components

### **File Specifications Section**
```css
.file-specs {
  margin-top: 12px; /* mt-3 */
  padding-top: 12px; /* pt-3 */
  border-top: 1px solid rgba(255, 255, 255, 0.1); /* border-t border-white/10 */
}
```

### **Results Card Content**
```css
.results-content {
  display: flex;
  align-items: center;
  gap: 16px; /* space-x-4 */
}

.thumbnail-container {
  width: 64px; /* w-16 */
  height: 64px; /* h-16 */
  background: rgba(255, 255, 255, 0.1); /* bg-white/10 */
  border-radius: 8px; /* rounded-lg */
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.supplier-name {
  font-size: 18px; /* text-lg */
  font-weight: 700; /* font-bold */
  color: white;
  margin-bottom: 4px; /* mb-1 */
}

.upload-date {
  color: rgba(134, 239, 172, 1); /* text-green-200 */
  font-size: 14px; /* text-sm */
}
```

### **Queue Counter**
```css
.queue-counter {
  text-align: center;
  margin-bottom: 16px; /* mb-4 */
}

.counter-number {
  font-size: 24px; /* text-2xl */
  font-weight: 700; /* font-bold */
  color: white;
}

.counter-label {
  color: rgba(134, 239, 172, 1); /* text-green-200 */
  font-size: 12px; /* text-xs */
}
```

---

## 🎨 Color Palette Reference

### **Text Colors**
- **Primary White**: `#ffffff`
- **Blue Text**: `#93c5fd` (text-blue-200)
- **Purple Text**: `#c4b5fd` (text-purple-200)
- **Green Text**: `#86efac` (text-green-200)
- **Black Text**: `#000000`
- **Muted Text**: `rgba(color, 0.7)` (70% opacity)

### **Background Colors**
- **Blue Accent**: `rgba(59, 130, 246, 0.1)`
- **Purple Accent**: `rgba(168, 85, 247, 0.1)`
- **Green Accent**: `rgba(34, 197, 94, 0.1)`
- **Yellow Accent**: `rgba(234, 179, 8, 0.1)`
- **White Overlay**: `rgba(255, 255, 255, 0.1)`

---

## 📱 Responsive Breakpoints

### **Tailwind CSS Breakpoints**
- **Mobile**: `< 768px` (single column)
- **Tablet**: `768px - 1023px` (2 columns)
- **Desktop**: `≥ 1024px` (4 columns, use only 3)

### **Component Behavior**
- **Cards**: Stack vertically on mobile, 2-up on tablet, 3-up on desktop
- **Results**: Full width on mobile, 2-column span on larger screens
- **Tips**: Single column on all sizes

---

## 🔧 Implementation Notes

### **Asset Requirements**
1. **Container.png** - Liquid glass card background
2. **button.png** - Liquid glass button background
3. **JiGR Icons** - Camera, Bulk, Queue module icons

### **Key Measurements (Figma)**
- **Card Padding**: 24px all sides
- **Card Border Radius**: 24px
- **Button Border Radius**: 12px
- **Button Padding**: 12px vertical, 16px horizontal
- **Icon Size**: 64x64px
- **Grid Gap**: 24px
- **Accent Circle**: 80x80px, positioned -40px from top-right

### **Magic Number 3 Rule**
- Always use only 3 columns out of 4-column grid
- 4th column remains empty for visual balance
- Results card spans 2 columns, Tips card spans 1 column

---

## ✨ Design Principles

### **Liquid Glass Morphism**
- Semi-transparent backgrounds with blur effects
- Subtle accent circles for color coding
- Clean, minimal component hierarchy
- Consistent spacing and typography

### **Professional Color Scheme**
- White text for high contrast and readability
- Color-coded accents for functional distinction
- Muted secondary text for hierarchy
- Black text on light backgrounds for tips

This specification provides all measurements and styling needed to recreate the capture page components perfectly in Figma! 🎨✨