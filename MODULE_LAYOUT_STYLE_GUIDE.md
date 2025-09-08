# JiGR Module Layout Style Guide

## Overview
This document defines the standardized layout patterns for all modules in the JiGR Hospitality Compliance platform. Following these guidelines ensures visual consistency and professional user experience across all modules.

## Module Header Layout

### Standard Header Structure
All module pages must use this exact header structure:

```jsx
{/* Module Header */}
<div className="mb-16">
  <div className="grid grid-cols-4 gap-6 items-center">
    
    {/* Module Icon & Title - Spans 2 columns */}
    <div className="flex items-center space-x-4 col-span-2">
      <Image 
        src={getModuleAsset('icons/[MODULE_ICON]', { width: 96, height: 96 })} 
        alt="[MODULE_NAME] Module" 
        width={96} 
        height={96}
        className="object-contain"
      />
      <div>
        <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg text-4xl font-bold`}>
          [MODULE_NAME]
        </h1>
        <p className="text-white/80 drop-shadow-md italic text-xs">
          [Module description]
        </p>
        {userClient && (
          <p className="text-blue-300 text-sm mt-1">
            {userClient.name} • {userClient.role}
          </p>
        )}
      </div>
    </div>
    
    {/* Navigation Pills - Column 3 */}
    <div className="flex justify-center">
      <div className="flex space-x-1 bg-black/20 p-0.5 rounded-full backdrop-blur-md border border-white/20 scale-75">
        <a 
          href="/[module]/[page1]" 
          className="px-3 py-1.5 font-semibold text-black bg-white rounded-full transition-all duration-300 text-xs TouchTarget"
        >
          [Page1]
        </a>
        <a 
          href="/[module]/[page2]" 
          className="px-3 py-1.5 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-xs TouchTarget"
        >
          [Page2]
        </a>
        <a 
          href="/[module]/[page3]" 
          className="px-3 py-1.5 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-xs TouchTarget"
        >
          [Page3]
        </a>
      </div>
    </div>
    
    {/* Empty Column 4 */}
    <div></div>
  </div>
</div>
```

### Header Requirements

1. **Container**: Always use `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8`
2. **Grid**: `grid grid-cols-4 gap-6 items-center`
3. **Module Icon**: 96x96px, positioned left
4. **Navigation Pills**: 
   - Container: `scale-75` for 30% smaller size
   - Active: `font-semibold text-black bg-white`
   - Inactive: `font-medium text-white/90 hover:text-white hover:bg-white/20`
   - All links: `px-3 py-1.5 text-xs TouchTarget`

## Card Layout System

### Standard 3-Column Grid
All module content cards must use the standardized 3-column layout:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 AdaptiveLayout">
  {/* Card content */}
</div>
```

### Grid Breakpoints
- **Mobile** (`grid-cols-1`): Single column, stacked cards
- **Tablet** (`md:grid-cols-2`): 2 columns side by side  
- **Desktop** (`lg:grid-cols-3`): 3 equal-width columns

### Card Styling Standards

#### Standard Card Structure
```jsx
<div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-20 h-20 bg-[COLOR]-500/10 rounded-full -mr-10 -mt-10"></div>
  <div className="relative">
    {/* Card content */}
  </div>
</div>
```

#### Color Coding by Position
- **First Card**: `bg-blue-500/10` (Blue accent)
- **Second Card**: `bg-purple-500/10` (Purple accent)  
- **Third Card**: `bg-green-500/10` (Green accent)
- **Additional Cards**: Cycle through colors or use theme-appropriate colors

## Wide Content Layout

### 3-Column Spanning Pattern
When content needs to span the full width below the 3-column cards:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  <div className="lg:col-span-3">
    {/* Full-width content */}
  </div>
</div>
```

## Implementation Examples

### Upload Module (Reference Implementation)
- **Console**: 3 Statistics Cards → Results Card (3-col wide) → Today's Uploads → Dashboard
- **Capture**: 3 Action Cards (Quick Capture, Bulk Upload, Ready Queue)  
- **Reports**: 3 Report Cards (Controls, Templates, Recent Reports)

### Admin Module
- **Company Settings**: 3 Settings Cards → Configuration Panel (3-col wide)
- **Team Management**: 3 Team Cards → User List (3-col wide)
- **Display Config**: 3 Config Cards → Preview Panel (3-col wide)

## Design Tokens

### Glass Morphism Standards
- **Background**: `bg-white/15 backdrop-blur-lg`
- **Border**: `border border-white/20`
- **Rounded**: `rounded-3xl` for cards, `rounded-xl` for components
- **Padding**: `p-6` for cards, `p-4` for components

### Typography Classes
- **Page Title**: `${getTextStyle('pageTitle')} text-white drop-shadow-lg text-4xl font-bold`
- **Card Title**: `text-white text-lg font-semibold`
- **Card Description**: `text-white/80 text-xs`
- **Section Title**: `${getTextStyle('sectionTitle')} text-white mb-4`

### Interactive Elements
- **Buttons**: Include `TouchTarget` class for accessibility
- **Hover Effects**: `hover:bg-white/20 transition-all duration-300`
- **Active States**: `hover:scale-[1.02] active:scale-[0.98]`

## Quality Assurance

### Pre-Implementation Checklist
- [ ] Header uses exact 4-column grid structure
- [ ] Navigation pills are 30% smaller (`scale-75`)
- [ ] Cards use 3-column responsive grid
- [ ] Glass morphism styling applied consistently
- [ ] Color coding follows position standards
- [ ] TouchTarget classes added to interactive elements
- [ ] AdaptiveLayout class applied to grid containers

### Testing Requirements
- [ ] Test on mobile (single column)
- [ ] Test on tablet (2 columns)  
- [ ] Test on desktop (3 columns)
- [ ] Verify navigation pill highlighting
- [ ] Confirm card width equality
- [ ] Validate responsive behavior

## Module-Specific Customizations

### Allowed Variations
1. **Content within cards**: Module-specific icons, text, and functionality
2. **Color accents**: Theme-appropriate colors for different modules
3. **Wide content**: Module-specific panels spanning full width

### Prohibited Variations
1. **Grid structure**: Must always use `lg:grid-cols-3` for cards
2. **Header layout**: Must maintain 4-column header structure  
3. **Navigation pill sizing**: Must use `scale-75` for consistency
4. **Card dimensions**: Must allow equal width distribution

## Implementation Notes

### Version Control
- **Current Version**: v1.9.8.6 (September 2025)
- **Last Updated**: Phase 2B Module Restoration
- **Applied To**: Upload Module (Console, Capture, Reports)

### Future Modules
All new modules must implement this layout system:
- Compliance Module
- Analytics Module  
- Settings Module
- Reporting Module

### Migration Path
Existing modules should be updated to follow this guide during:
- Major version updates
- UI refresh cycles
- Bug fix deployments affecting layout

---

**Note**: This style guide ensures professional consistency across all JiGR modules. Deviations require approval from the UI/UX team and must be documented as exceptions.