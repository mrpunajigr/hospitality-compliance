# Background Component Refactor Example

## Current Approach (Repeated in 8 pages)
```tsx
return (
  <div className="min-h-screen relative overflow-hidden">
    {/* Cafe Window Background */}
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
        filter: 'brightness(0.48)'
      }}
    />
    
    {/* Overlay for better text readability */}
    <div className="absolute inset-0 bg-black/12" />

    {/* Main Content */}
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      {/* Page content here */}
    </div>
  </div>
)
```

## New Component Approach (Single change location)

### Component Usage
```tsx
import PublicPageBackground from '@/app/components/backgrounds/PublicPageBackground'

export default function CreateAccountPage() {
  // ... component logic

  return (
    <PublicPageBackground 
      overlayOpacity="light"
      className={`Platform${platformMode.charAt(0).toUpperCase()}${platformMode.slice(1)}`}
    >
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        {/* JiGR Logo */}
        <div className="mb-8">
          <div className="w-144 h-36">
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" 
              alt="JiGR Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Glass Morphism Card */}
        <div className={`${getCardStyle('primary')} max-w-md w-full mx-auto`}>
          {/* Form content */}
        </div>
      </div>
    </PublicPageBackground>
  )
}
```

### For Login Page (with gradient)
```tsx
import { PublicPageBackgroundWithGradient } from '@/app/components/backgrounds/PublicPageBackground'

export default function HomePage() {
  return (
    <PublicPageBackgroundWithGradient>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        {/* Login content */}
      </div>
    </PublicPageBackgroundWithGradient>
  )
}
```

## Benefits

### ✅ Single Point of Control
- Change overlay opacity in one place affects all pages
- Update background image globally
- Modify styling approach centrally

### ✅ Consistent Behavior
- All public pages use identical background logic
- No risk of one page having different styling
- Easier to maintain design system

### ✅ Easy Customization
```tsx
// Light overlay (current)
<PublicPageBackground overlayOpacity="light" />

// Medium overlay
<PublicPageBackground overlayOpacity="medium" />

// Dark overlay
<PublicPageBackground overlayOpacity="dark" />

// Custom background
<PublicPageBackground backgroundImage="CustomBackground.jpg" />
```

### ✅ Simplified Updates
Instead of editing 8 files, future overlay changes require only:
1. Update `PublicPageBackground.tsx` opacity values
2. All pages automatically inherit the change

## Implementation Plan

1. **Create component** ✅ Done
2. **Update one page as example** (optional)
3. **Refactor all public pages** to use component
4. **Remove duplicate background code** from individual pages
5. **Test all pages** maintain visual consistency

## Files to Refactor
- `app/page.tsx` (login)
- `app/create-account/page.tsx`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `app/account-created/page.tsx`
- `app/company-setup/page.tsx`
- `app/accept-invitation/page.tsx`
- `app/update-profile/page.tsx`