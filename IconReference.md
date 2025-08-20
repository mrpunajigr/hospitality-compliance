# JiGR Icon Reference Guide

## Available Icon Folders

### `/public/icons/` - General UI Icons
| Icon File | Current Usage | Description |
|-----------|---------------|-------------|
| `JiGRadmin.png` | Admin, Settings, Profile | Administrative functions |
| `JiGRcamera.png` | Reports | Document capture, visual reports |
| `JiGRdiaryWhite.png` | Dashboard | Dashboard, logging, daily operations |
| `JiGRmodules.png` | Module navigation | General module indicator |
| `JiGRstockWhite.png` | Analytics (fallback) | Data visualization |
| `JiGRtemp.png` | Temperature (fallback) | Temperature monitoring |
| `JiGRuploadWhite.png` | Upload | File uploads, document submission |

### `/public/ModuleIcons/` - Module-Specific Icons
| Icon File | Current Usage | Description |
|-----------|---------------|-------------|
| `JiGRadmin.png` | Admin module | Administrative module functions |
| `JiGRdiary.png` | Available | Diary/logging functionality |
| `JiGRstock.png` | Analytics Module | Reports, analytics, inventory tracking |
| `JiGRtemps.png` | Temperature Module | Temperature monitoring, compliance tracking |
| `JiGRupload.png` | Available | Upload functionality |

## Current Sidebar Mapping

### Quick Actions Section
- **Dashboard**: `/icons/JiGRdiaryWhite.png`
- **Upload**: `/icons/JiGRuploadWhite.png`
- **Reports**: `/icons/JiGRcamera.png`
- **Company**: `/icons/JiGRadmin.png`

### Modules Section
- **Temperature**: `/ModuleIcons/JiGRtemps.png` ✅ (updated to module-specific)
- **Analytics**: `/ModuleIcons/JiGRstock.png` ✅ (updated to module-specific)

### Settings Section
- **Settings**: `/icons/JiGRadmin.png`
- **Profile**: `/icons/JiGRadmin.png`

## Icon Organization Strategy
- **`/icons/`**: General UI elements (dashboard, upload, admin, etc.)
- **`/ModuleIcons/`**: Module-specific functionality (temperature, analytics, etc.)
- **Consistent sizing**: All icons work at both 24px (expanded) and 40px (collapsed) states
- **Context-aware**: Icons display based on Admin vs Console context

## Notes
- Icons are automatically sized: 40px in collapsed sidebar, 24px in expanded
- Perfect centering in 150px collapsed width
- Hover tooltips show names in collapsed state
- All paths already correctly mapped to public folders

---

**Status**: Icon paths updated ✅ - Ready for use