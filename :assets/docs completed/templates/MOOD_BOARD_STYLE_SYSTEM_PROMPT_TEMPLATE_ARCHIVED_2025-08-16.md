# Mood Board & Style System Enhancement - Claude Code Prompt

## 🎨 PROJECT OVERVIEW

I need you to enhance the existing Asset Management System to include a **Mood Board & Style Testing Component** for development use. This tool will help me visually test typography, color palettes, and component combinations against different background images.

## 📋 CURRENT SYSTEM CONTEXT

You have already built a comprehensive Asset Management System with:
- ✅ Multi-tenant asset storage and management
- ✅ BackgroundSelector component for choosing backgrounds
- ✅ AssetUploadModal for managing company assets
- ✅ Database schema with proper RLS policies
- ✅ Integration into landing page, console, and admin settings

**Reference the existing documentation:** `ASSET_MANAGEMENT_SYSTEM_DOCUMENTATION.md`

## 🎯 NEW REQUIREMENT: MOOD BOARD & STYLE SYSTEM

### **Purpose:**
Create a **development-only tool** that allows me to:
- Test typography combinations against background images
- Preview color palettes with different backgrounds
- See component styling in context
- Make informed design decisions before implementing in production
- Generate style guides based on successful combinations

### **CRITICAL: Development Environment Only**
```typescript
// This component must NEVER be accessible in production
if (process.env.NODE_ENV === 'production') {
  return null; // or redirect to 404
}
```

## 🔧 IMPLEMENTATION REQUIREMENTS

### **1. New Route: `/dev/mood-board`**
Create a development-only route that provides a comprehensive design testing environment.

**Security:**
- Environment gated (development only)
- No navigation links from main app
- Direct URL access only: `http://localhost:3000/dev/mood-board`

### **2. Mood Board Interface Layout**

#### **Main Layout Structure:**
```typescript
interface MoodBoardLayout {
  backgroundPreview: {
    fullScreenBackground: true,
    changeableViaAssetSystem: true,
    realTimeUpdates: true
  },
  
  controlPanel: {
    position: 'right-sidebar' | 'floating-panel',
    collapsible: true,
    sections: [
      'backgroundSelector',
      'typographyTester', 
      'colorPaletteTester',
      'componentPreviewer',
      'exportTools'
    ]
  },
  
  previewArea: {
    overlayComponents: true,
    interactiveElements: true,
    realTimeUpdates: true
  }
}
```

### **3. Background Integration**
**Extend existing BackgroundSelector:**
- Integrate with current asset management system
- Use existing API endpoints (`/api/assets/upload?type=background`)
- Maintain company asset isolation
- Add mood board specific metadata tracking

```typescript
// Enhanced background selection for mood board
interface MoodBoardBackgroundSelector extends BackgroundSelector {
  onBackgroundChange: (asset: BackgroundAsset) => void,
  showDifficultyIndicators: true,
  enableQuickSwitch: true,
  moodBoardMode: true
}
```

### **4. Typography Testing Panel**

#### **Typography Combinations to Test:**
```typescript
interface TypographyTester {
  fontCombinations: [
    {
      name: 'Current System',
      heading: 'Lora (serif)',
      body: 'Source Sans Pro (sans-serif)',
      accent: 'Inter (sans-serif)'
    },
    {
      name: 'Modern Clean',
      heading: 'Inter (sans-serif)',
      body: 'Inter (sans-serif)', 
      accent: 'JetBrains Mono (monospace)'
    },
    {
      name: 'Professional',
      heading: 'Playfair Display (serif)',
      body: 'Source Sans Pro (sans-serif)',
      accent: 'Inter (sans-serif)'
    },
    {
      name: 'Friendly',
      heading: 'Nunito Sans (sans-serif)',
      body: 'Nunito Sans (sans-serif)',
      accent: 'Space Mono (monospace)'
    }
  ],
  
  testContent: {
    h1: 'Compliance Dashboard',
    h2: 'Recent Deliveries',
    body: 'Your delivery compliance rate this week is 94%. Temperature violations detected in 3 deliveries from Metro Foods.',
    button: 'Upload New Docket',
    caption: 'Last updated 2 minutes ago'
  },
  
  overlayOptions: {
    backgroundOpacity: true,
    textShadows: true,
    backgroundBlur: true,
    contrastAdjustment: true
  }
}
```

### **5. Color Palette Testing**

#### **Predefined Palettes to Test:**
```typescript
interface ColorPaletteTester {
  palettes: [
    {
      name: 'Current Compliance',
      primary: '#2563EB', // Blue
      success: '#10B981', // Green
      warning: '#F59E0B', // Orange
      error: '#EF4444',   // Red
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827'
    },
    {
      name: 'Warm Professional',
      primary: '#7C3AED', // Purple
      success: '#059669', // Emerald
      warning: '#D97706', // Amber
      error: '#DC2626',   // Red
      background: '#FEF7F0',
      surface: '#FFFFFF',
      text: '#1F2937'
    },
    {
      name: 'Cool Modern',
      primary: '#0891B2', // Cyan
      success: '#16A34A', // Green
      warning: '#CA8A04', // Yellow
      error: '#E11D48',   // Rose
      background: '#F1F5F9',
      surface: '#FFFFFF', 
      text: '#0F172A'
    },
    {
      name: 'Dark Mode',
      primary: '#60A5FA', // Light Blue
      success: '#34D399', // Light Green
      warning: '#FBBF24', // Light Orange
      error: '#F87171',   // Light Red
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB'
    }
  ],
  
  testComponents: [
    'primaryButton',
    'secondaryButton',
    'successBadge',
    'warningAlert',
    'errorMessage',
    'infoCard',
    'navigationActive',
    'formInput'
  ]
}
```

### **6. Component Previewer**

#### **Key Components to Test:**
```typescript
interface ComponentPreviewer {
  components: [
    {
      name: 'Compliance Card',
      variants: ['success', 'warning', 'error'],
      props: { title: 'Delivery Compliance', status: 'passed', temperature: '2°C' }
    },
    {
      name: 'Upload Button',
      variants: ['primary', 'secondary', 'loading'],
      props: { text: 'Upload Docket', icon: 'camera' }
    },
    {
      name: 'Navigation Menu',
      variants: ['bottomTab', 'sidebar'],
      props: { activeItem: 'dashboard' }
    },
    {
      name: 'Dashboard Stats',
      variants: ['card', 'inline'],
      props: { value: '94%', label: 'Compliance Rate', trend: 'up' }
    },
    {
      name: 'Alert Banner',
      variants: ['info', 'warning', 'error', 'success'],
      props: { message: 'Temperature violation detected', dismissible: true }
    }
  ],
  
  layoutOptions: {
    positioning: 'flexible',
    sizing: 'responsive',
    overlayMode: true,
    gridAlignment: true
  }
}
```

### **7. Real-Time Preview System**

#### **Live Updates:**
```typescript
interface RealTimePreview {
  backgroundChanges: 'immediate',
  typographyChanges: 'immediate',
  colorChanges: 'immediate',
  componentUpdates: 'immediate',
  
  previewModes: [
    'fullBackground', // Full screen background with overlays
    'componentFocus', // Focus on specific component combinations
    'pageLayout',     // Full page layout preview
    'mobileView'      // iPad Air specific preview
  ],
  
  overlayControls: {
    opacity: { min: 0, max: 1, step: 0.1 },
    blur: { min: 0, max: 10, step: 1 },
    contrast: { min: 0.5, max: 2, step: 0.1 },
    brightness: { min: 0.5, max: 2, step: 0.1 }
  }
}
```

### **8. Export & Documentation Tools**

#### **Style Guide Generation:**
```typescript
interface ExportTools {
  generateStyleGuide: {
    selectedCombination: 'background + typography + colors',
    outputFormat: 'markdown' | 'json' | 'css',
    includeComponents: boolean,
    includeUsageNotes: boolean
  },
  
  exportOptions: [
    'CSS Variables',
    'Tailwind Config',
    'Component Props',
    'Style Guide Markdown',
    'Design Tokens JSON'
  ],
  
  savePresets: {
    saveCombination: true,
    loadCombination: true,
    shareCombination: true
  }
}
```

## 🎨 USER INTERFACE DESIGN

### **Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Background Preview Area - Full Screen]                     │
│                                                             │
│  ┌─[Typography Sample]────────────────────────────────┐    │
│  │ Compliance Dashboard                              │    │
│  │ Recent Deliveries                                 │    │
│  │ Your compliance rate is 94%...                    │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─[Component Preview]──┐  ┌─[Color Swatches]─────────┐    │
│  │ [Upload Button]      │  │ ████ ████ ████ ████     │    │
│  │ [Compliance Card]    │  │ Primary Success Warning  │    │
│  │ [Alert Banner]       │  └─────────────────────────┘    │
│  └─────────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘
                                                        │
┌─[Control Panel - Right Sidebar]─────────────────────────────┤
│                                                             │
│ 🖼️ Background Selector                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                           │
│ │ img │ │ img │ │ img │ │ img │                           │
│ └─────┘ └─────┘ └─────┘ └─────┘                           │
│                                                             │
│ 📝 Typography                                              │
│ ○ Current System  ○ Modern Clean                          │
│ ○ Professional    ○ Friendly                              │
│                                                             │
│ 🎨 Color Palettes                                          │
│ ○ Current Compliance  ○ Warm Professional                 │
│ ○ Cool Modern        ○ Dark Mode                          │
│                                                             │
│ 🧩 Components                                              │
│ ☑️ Compliance Card  ☑️ Upload Button                      │
│ ☑️ Navigation       ☑️ Alert Banner                       │
│                                                             │
│ 🔧 Adjustments                                             │
│ Opacity: ████████░░ 80%                                   │
│ Blur:    ██████░░░░ 60%                                   │
│ Contrast:████████░░ 80%                                   │
│                                                             │
│ 📁 Export                                                  │
│ [Generate Style Guide] [Save Preset]                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 TECHNICAL IMPLEMENTATION

### **Integration with Existing Asset System:**
1. **Extend BackgroundSelector** - Add mood board mode
2. **Use existing API endpoints** - `/api/assets/upload?type=background`
3. **Maintain RLS policies** - Company asset isolation
4. **Track usage** - Add 'mood_board' to asset_usage.used_in

### **New API Endpoints:**
```typescript
// GET /api/dev/mood-board/presets
// POST /api/dev/mood-board/presets (save combinations)
// GET /api/dev/style-guide/export (generate style guides)
```

### **State Management:**
```typescript
interface MoodBoardState {
  selectedBackground: BackgroundAsset | null,
  selectedTypography: TypographyCombination,
  selectedColorPalette: ColorPalette,
  enabledComponents: ComponentType[],
  overlaySettings: OverlaySettings,
  previewMode: 'full' | 'component' | 'layout' | 'mobile'
}
```

## 🎯 SUCCESS CRITERIA

### **Functional Requirements:**
- ✅ Real-time background switching using existing asset system
- ✅ Typography combinations preview with actual content
- ✅ Color palette testing with component examples
- ✅ Component overlay positioning and styling
- ✅ Export capabilities for chosen combinations
- ✅ Mobile/iPad Air specific preview mode

### **Technical Requirements:**
- ✅ Development environment only (never in production)
- ✅ Integration with existing asset management system
- ✅ Maintains multi-tenant security (company asset isolation)
- ✅ Performance optimized for real-time updates
- ✅ Safari 12 compatible (iPad Air 2013)

### **User Experience Requirements:**
- ✅ Intuitive interface for quick testing
- ✅ Visual feedback for all changes
- ✅ Easy switching between combinations
- ✅ Clear export/documentation workflow

## 📋 IMMEDIATE TASKS

### **Phase 1: Core Implementation**
1. Create `/dev/mood-board` route with environment protection
2. Extend BackgroundSelector component for mood board use
3. Build typography testing panel with font combinations
4. Implement color palette switcher with live preview

### **Phase 2: Advanced Features**
1. Component overlay system with positioning controls
2. Real-time adjustment controls (opacity, blur, contrast)
3. Export functionality for style guides and CSS
4. Preset saving and loading system

### **Phase 3: Polish & Integration**
1. iPad Air specific optimizations
2. Performance optimization for real-time updates
3. Integration testing with existing asset system
4. Documentation and usage instructions

## 🎨 DESIGN CONSIDERATIONS

### **Visual Hierarchy:**
- **Background preview** dominates the screen
- **Control panel** accessible but not intrusive
- **Component overlays** clearly positioned and labeled
- **Typography samples** use real application content

### **Interaction Patterns:**
- **Click to select** backgrounds, typography, colors
- **Drag to position** component overlays
- **Slider controls** for opacity, blur, contrast adjustments
- **Toggle switches** for component visibility

### **Responsive Behavior:**
- **Full screen mode** for immersive preview
- **Collapsible panels** for maximum preview area
- **Touch-friendly controls** for iPad Air compatibility
- **Keyboard shortcuts** for rapid testing

---

## 💭 STRATEGIC VALUE

This Mood Board & Style System will:
- **Accelerate design decisions** by providing visual context
- **Ensure consistency** across different background choices
- **Support AddOn module styling** with established patterns
- **Improve client presentations** with professional style guides
- **Reduce design iteration time** by testing combinations upfront

**Build this as a powerful design tool that integrates seamlessly with your existing asset management system while providing the visual testing capabilities needed for professional design decisions.**