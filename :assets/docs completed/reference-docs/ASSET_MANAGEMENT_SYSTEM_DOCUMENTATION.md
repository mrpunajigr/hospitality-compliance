# Asset Management System - Technical Specification

## 🎯 System Overview

The Asset Management System is a comprehensive, multi-tenant solution for managing background images, logos, and other visual assets within the Hospitality Compliance SaaS platform. It provides dynamic asset selection, company-specific isolation, and seamless integration across the application.

## 🏗️ Architecture

### Database Schema

**Primary Table: `assets`**
```sql
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('background', 'logo', 'icon', 'image')),
    category TEXT CHECK (category IN ('kitchen', 'restaurant', 'hotel', 'office', 'neutral', 'brand')),
    file_url TEXT NOT NULL, -- Supabase Storage URL
    file_path TEXT NOT NULL, -- Storage bucket path
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- System default assets
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE, -- NULL for global assets
    uploaded_by UUID REFERENCES profiles(id),
    usage_count INTEGER DEFAULT 0,
    alt_text TEXT, -- Accessibility description
    tags JSONB DEFAULT '[]', -- Search tags ['modern', 'dark', 'industrial']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tracking Table: `asset_usage`**
```sql
CREATE TABLE asset_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    used_in TEXT NOT NULL, -- 'mood_board', 'dashboard', 'login_page', 'company_profile'
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Multi-Tenant Security

**Row Level Security (RLS) Policies:**
- **Global Assets**: `client_id IS NULL` - visible to all users
- **Company Assets**: Users can only access assets belonging to their company
- **Upload Permissions**: Admin/Manager/Owner roles can upload company assets
- **Usage Tracking**: Automatic logging of where and when assets are used

## 🧩 Component Architecture

### 1. BackgroundSelector Component
**File:** `/app/components/BackgroundSelector.tsx`

**Purpose:** Modal interface for browsing and selecting background images

**Key Features:**
- Category filtering (kitchen, restaurant, hotel, office, neutral)
- Difficulty indicators (easy/medium/hard contrast levels)
- Real-time preview with selection feedback
- Responsive grid layout
- Loading states and error handling
- Theme support (light/dark modes)

**Interface:**
```typescript
interface BackgroundSelectorProps {
  selectedBackground: string
  onBackgroundChange: (background: BackgroundAsset) => void
  onClose: () => void
  theme?: 'light' | 'dark'
}

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  alt_text: string | null
}
```

**Data Flow:**
1. Fetch assets via `/api/assets/upload?type=background`
2. Filter by category and company access
3. Display in responsive grid with previews
4. Handle selection and callback to parent

### 2. AssetUploadModal Component
**File:** `/app/components/AssetUploadModal.tsx`

**Purpose:** Drag-and-drop interface for uploading new assets

**Key Features:**
- Drag-and-drop file handling
- Multi-file upload support
- Progress tracking per file
- File validation (type, size limits)
- Preview generation
- Upload queue management
- Error handling and retry logic

**Interface:**
```typescript
interface AssetUploadModalProps {
  isOpen: boolean
  onClose: () => void
  uploadType: 'background' | 'logo'
  onUploadSuccess?: (asset: any) => void
  theme?: 'light' | 'dark'
}
```

**Upload Flow:**
1. File selection/drop → validation → preview generation
2. Metadata collection (name, category, alt text)
3. Upload to Supabase Storage
4. Database record creation
5. Success callback with asset data

## 🔌 API Integration

### Asset Management Endpoint
**File:** `/app/api/assets/upload/route.ts`

**GET `/api/assets/upload`**
- **Query Parameters:** 
  - `type` (background|logo|icon|image)
  - `category` (kitchen|restaurant|hotel|office|neutral|brand)
  - `clientId` (for company-specific assets)
- **Response:** Array of asset objects with metadata
- **Authentication:** Required, enforces RLS policies

**POST `/api/assets/upload`**
- **Body:** FormData with file and metadata
- **Validation:** File type, size (5MB max), permissions
- **Storage:** Supabase Storage with organized paths
- **Database:** Automatic metadata insertion
- **Response:** Created asset object

**Security Features:**
- User authentication verification
- Company permission checking
- File type validation (image/jpeg, image/png, image/webp, image/gif)
- Size limits and sanitization
- Storage cleanup on database failures

## 📱 Integration Points

### 1. Landing Page (`/app/page.tsx`)
**Implementation:**
- Floating settings button (top-right corner)
- Dynamic background state management
- BackgroundSelector modal integration
- Preserves existing design patterns

**Code Pattern:**
```typescript
const [currentBackground, setCurrentBackground] = useState<string>(defaultUrl)
const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)

const handleBackgroundChange = (asset: BackgroundAsset) => {
  setCurrentBackground(asset.file_url)
  setShowBackgroundSelector(false)
}
```

### 2. Console Layout (`/app/console/layout.tsx`)
**Implementation:**
- Header-integrated background selector button
- Layout-wide background application
- Maintains existing navigation patterns
- Dynamic background updates across all console pages

**Integration Benefits:**
- Consistent background across dashboard, upload, reports
- Non-intrusive UI integration
- Preserves existing header functionality

### 3. Admin Company Settings (`/app/admin/company-settings/page.tsx`)
**Implementation:**
- Complete asset management interface
- Asset grid with thumbnails
- Upload and selection capabilities
- Company-specific asset isolation

**Features:**
- Visual asset grid (2x4 preview layout)
- Upload button integration
- Asset selection with visual feedback
- Loading states and empty state handling
- Expandable "View all assets" functionality

## 🎨 User Experience Flow

### Asset Upload Journey
1. **Access:** Admin settings → Asset Management section
2. **Upload:** Click "Upload New" → AssetUploadModal opens
3. **Selection:** Drag files or click to select
4. **Metadata:** Add name, category, alt text
5. **Processing:** Upload progress indicators
6. **Completion:** Auto-refresh asset grid, close modal

### Background Selection Journey
1. **Trigger:** Click background selector button (any integrated page)
2. **Browse:** BackgroundSelector modal with categorized assets
3. **Filter:** Category dropdown (All, Kitchen, Restaurant, etc.)
4. **Preview:** Hover effects and selection indicators
5. **Apply:** Click asset → immediate background change
6. **Persistence:** Background preference maintained during session

### Asset Management Admin View
1. **Overview:** Asset grid shows first 4 company assets
2. **Selection:** Click thumbnails to set as active background
3. **Management:** Upload new assets, view full collection
4. **Organization:** Category-based organization and filtering

## 🔒 Security & Multi-Tenancy

### Row Level Security Implementation
```sql
-- Users can view global assets (client_id IS NULL) and their client's assets
CREATE POLICY "View assets policy" ON assets
    FOR SELECT
    USING (
        client_id IS NULL -- Global assets
        OR 
        client_id IN (
            SELECT client_id 
            FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Only admin/manager/owner roles can upload company assets
CREATE POLICY "Insert assets policy" ON assets
    FOR INSERT
    WITH CHECK (
        client_id IN (
            SELECT client_id 
            FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('admin', 'manager', 'owner')
        )
    );
```

### File Security
- **Upload Validation:** MIME type verification, file size limits
- **Storage Organization:** Structured paths with timestamps
- **Access Control:** Supabase Storage policies aligned with database RLS
- **Cleanup:** Automatic file removal on database failures

## 📊 Performance Considerations

### Database Optimization
- **Indexes:** Type, category, client_id, is_active for fast filtering
- **Composite Indexes:** Common query patterns optimized
- **Usage Tracking:** Automatic increment triggers for analytics

### Frontend Performance
- **Lazy Loading:** Asset grids load progressively
- **Image Optimization:** Automatic compression and sizing
- **Caching:** Browser cache headers for static assets
- **Error Boundaries:** Graceful failure handling

### Storage Efficiency
- **Path Organization:** `{type}s/{timestamp}-{sanitized-name}.{ext}`
- **Deduplication:** File hash checking (potential future enhancement)
- **Cleanup Jobs:** Orphaned file removal processes

## 🚀 Current Implementation Status

### ✅ Completed Features
- **Database Schema:** Complete with RLS policies
- **API Endpoints:** Full CRUD operations with security
- **UI Components:** BackgroundSelector and AssetUploadModal
- **Integration:** Landing page, console layout, admin settings
- **Multi-tenancy:** Company isolation and global assets
- **File Handling:** Upload, validation, storage integration

### 🔧 Integration Points Active
- **Landing Page:** Dynamic background selection
- **Console Layout:** Header-integrated background controls
- **Admin Settings:** Full asset management interface
- **Real-time Updates:** Immediate UI feedback on changes

### 🎯 Testing Requirements

**Critical Test Scenarios:**
1. **Upload Flow:** File validation, progress tracking, error handling
2. **Asset Isolation:** Company A cannot access Company B assets
3. **Background Selection:** Real-time preview across different pages
4. **Permission Enforcement:** Role-based upload restrictions
5. **Storage Integration:** File upload → storage → database consistency

**Edge Cases:**
1. Large file uploads (approaching 5MB limit)
2. Concurrent uploads from multiple users
3. Network interruption during upload
4. Invalid file types and malicious files
5. Storage quota exceeded scenarios

## 🎨 Design System Integration

### Theme Support
- **Light/Dark Modes:** Component theme props throughout
- **Design Tokens:** Consistent spacing, colors, typography
- **Glass Morphism:** Backdrop blur effects for modals
- **Responsive Design:** Mobile-first component architecture

### Accessibility Features
- **Alt Text:** Required for all uploaded images
- **Keyboard Navigation:** Modal and grid navigation
- **Screen Reader Support:** Semantic HTML structure
- **Color Contrast:** Difficulty indicators for background readability

## 🔮 Future Enhancement Opportunities

### Potential Improvements
1. **Asset Categories:** Brand assets, logos, icons beyond backgrounds
2. **Bulk Operations:** Multi-select upload, delete, organize
3. **Image Editing:** Basic crop, resize, filter capabilities
4. **Usage Analytics:** Detailed tracking of asset performance
5. **CDN Integration:** Global asset distribution for performance
6. **Asset Collections:** Curated sets for different business types
7. **Version Control:** Asset revision history and rollback
8. **Import/Export:** Bulk asset migration between companies

### Technical Optimizations
1. **Image Processing:** Automatic optimization and format conversion
2. **Progressive Loading:** Thumbnail generation and lazy loading
3. **Search Functionality:** Full-text search across asset metadata
4. **Asset Recommendations:** AI-powered suggestions based on business type
5. **Storage Optimization:** Automatic cleanup of unused assets

## 📋 Questions for Claude Consultation

### Architecture Review
1. **Component Structure:** Are there better patterns for modal management?
2. **State Management:** Should we implement global asset state (Redux/Zustand)?
3. **Performance:** What optimizations would improve large asset collections?

### User Experience
1. **Upload Flow:** How can we improve the drag-and-drop experience?
2. **Asset Organization:** Better categorization or tagging strategies?
3. **Mobile Experience:** Touch-friendly asset selection patterns?

### Technical Enhancements
1. **Error Handling:** More robust retry and recovery mechanisms?
2. **Real-time Updates:** WebSocket integration for multi-user scenarios?
3. **Security:** Additional validation or access control improvements?

### Business Logic
1. **Asset Lifecycle:** Automated cleanup and archival strategies?
2. **Usage Tracking:** More detailed analytics and insights?
3. **Company Branding:** Enhanced customization capabilities?

---

**System Version:** v1.8.13.007p  
**Documentation Date:** 2025-08-13  
**Status:** Integration Complete, Testing Required