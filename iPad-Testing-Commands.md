# iPad Layout Testing Commands

## Start Development Server
```bash
npm run dev
```

## Testing Checklist

### **Platform Selector Testing**
1. Navigate to `/signin` 
2. Look for 🧪 Development Testing Mode section at bottom
3. Switch between "🌐 Web App Version" and "📱 iPad Optimized Version"
4. Verify platform CSS classes apply: `PlatformWeb` vs `PlatformIOS`

### **iPad Orientation Testing**
Open Chrome DevTools → Toggle Device Mode → Select iPad → Test orientations:

#### **Portrait Mode (768×1024)**
- Sidebar should start collapsed
- AdaptiveLayout grids should use 2 columns
- Touch targets should be minimum 44×44px
- Content margins should be 24px

#### **Landscape Mode (1024×768)** 
- Sidebar can expand on hover/touch
- AdaptiveLayout grids should use 3 columns
- Navigation should adapt to landscape space

### **Touch Target Verification**
In Chrome DevTools:
1. Elements tab → Computed styles
2. Select any button with `TouchTarget` class
3. Verify `min-width: 44px` and `min-height: 44px` applied in iOS mode

### **Module Testing**
- **UPLOAD Module**: `/upload/console`, `/upload/capture`, `/upload/reports`
- **ADMIN Module**: `/admin/company`, `/admin/company-settings`, `/admin/profile`
- Both should use same AppleSidebar with platform optimizations

### **Browser Testing**
- Chrome: iPad simulation mode
- Safari: Responsive design mode
- Firefox: Responsive design mode
- Safari 12 (if available): Real device testing

## Expected Results
- ✅ Platform selector only appears in development
- ✅ Both modules respond to platform mode changes
- ✅ Orientation changes trigger layout adaptations
- ✅ Touch targets meet 44×44px minimum in iOS mode
- ✅ No breaking changes to existing functionality