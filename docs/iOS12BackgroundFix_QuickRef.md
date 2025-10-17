# iOS 12 Background Fix - Quick Reference

## 🎯 What Claude Code Needs to Do

### 1. Fix Three Background Components

Replace background rendering code in these files:

```bash
/app/components/backgrounds/AdminModuleBackground.tsx
/app/components/backgrounds/PublicPageBackground.tsx
/app/components/backgrounds/UploadModuleBackground.tsx
```

### 2. Add iOS 12 CSS to globals.css

Add iOS 12 optimizations at the end of:

```bash
/app/globals.css
```

---

## 🔧 Key Changes Summary

### What to REMOVE (Causes iOS 12 failures):
```tsx
❌ backgroundAttachment: 'fixed'
❌ filter: `brightness(...)`
❌ className="bg-cover bg-center bg-no-repeat"
```

### What to ADD (Fixes iOS 12):
```tsx
✅ backgroundSize: 'cover'
✅ backgroundPosition: 'center'
✅ backgroundRepeat: 'no-repeat'
✅ WebkitBackgroundSize: 'cover'
✅ opacity: brightness
✅ transform: 'translateZ(0)'
✅ WebkitTransform: 'translateZ(0)'
```

---

## 📝 Complete Implementation Prompt Location

Give Claude Code this file:

```bash
/docs/ClaudeCodePrompt_iOS12BackgroundFix.md
```

This contains:
- Step-by-step instructions for all changes
- Exact code to replace
- Safety rules and testing protocol
- Success criteria and verification checklist

---

## ⏱️ Expected Timeline

- **Implementation:** 20-30 minutes
- **Testing:** 10 minutes
- **Total:** 30-40 minutes

---

## ✅ Success = All These Work on iPad Air iOS 12.5.7

```bash
✅ Landing page shows background image
✅ Login page shows background image
✅ Admin dashboard shows background image
✅ Upload page shows background image
✅ No white/blank backgrounds
✅ Smooth performance (no lag)
✅ Works on modern browsers too
```

---

## 🚨 Critical Note

The main cause of failure is `background-attachment: fixed` which **iOS Safari 12 does NOT support**. This must be completely removed from all background components.
