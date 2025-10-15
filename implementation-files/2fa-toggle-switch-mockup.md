# 🔐 2FA Toggle Switch Design Mockup

## Current vs Proposed Design

### Current Implementation (Pill Style)
```
🔒 ON  |  🔓 OFF
```

### Proposed Toggle Switch Design

```jsx
// Visual Mockup Component
const TwoFactorToggle = ({ enabled, onChange }) => {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Two-Factor Authentication
        </h3>
        <p className="text-sm text-gray-600">
          Add an extra layer of security to your account
        </p>
      </div>
      
      {/* Toggle Switch */}
      <button
        onClick={onChange}
        className={`
          relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full 
          border-2 border-transparent transition-colors duration-200 ease-in-out 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          }
        `}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`
            pointer-events-none inline-block h-6 w-6 transform rounded-full 
            bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}
```

## Visual States

### ✅ Enabled State
```
Two-Factor Authentication                    ●——————○
Add an extra layer of security               (blue, right)
```

### ❌ Disabled State  
```
Two-Factor Authentication                    ○——————●
Add an extra layer of security               (gray, left)
```

## Design Benefits

1. **Intuitive**: Universal toggle pattern users expect
2. **Visual Feedback**: Clear on/off states with animation
3. **Accessible**: Proper ARIA labels and keyboard support
4. **Clean**: Matches modern UI patterns
5. **Space Efficient**: Takes up less visual space than pill

## Implementation Location

Replace the current pill indicator in:
- `app/admin/profile/page.tsx` 
- Around line 300-320 where the current 2FA status is displayed

## Color Scheme
- **Enabled**: Blue-600 background, white circle
- **Disabled**: Gray-200 background, white circle  
- **Hover**: Slight color darkening
- **Focus**: Blue ring for accessibility

## Animation
- Smooth 200ms transition when toggling
- Circle slides left/right with easing
- Background color fades between states

This would replace the current "🔒 ON / 🔓 OFF" pill with a more professional toggle switch interface.