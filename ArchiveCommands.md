# Archive Management Commands

## 📁 Automated Archive System

The hospitality compliance project includes an automated archive system that manages development files with a 5-day lifecycle rule.

## 🚀 Available Commands

### **Scan for Eligible Files**
```bash
npm run archive scan
```
Shows all files eligible for archival (5+ days old) without making changes.

### **Preview Operations (Dry Run)**
```bash
npm run archive dry-run
```
Previews all archive operations without executing them. Safe to run anytime.

### **Upload and Cleanup**
```bash
npm run archive upload
```
⚠️ **CAUTION**: This uploads eligible files to Supabase Storage and removes them from local storage after verification.

### **Generate Archive Manifest**
```bash
npm run archive manifest
```
Creates an index of all archived files with timestamps and locations.

### **Manual File Upload**
```bash
npm run archive manual path/to/file.png
```
Force upload specific files immediately, bypassing the 5-day rule.

## 📂 Archive Categories

### **Screenshots**
- **Source**: `:assets/DevScreenshots/`, `:assets/Read/`
- **Destination**: `dev-archive/screenshots/YYYY-MM/`
- **Organization**: Grouped by month and feature

### **SQL Migrations**
- **Source**: `:assets/sql completed/`
- **Destination**: `dev-archive/SQLmigrations/YYYY-MM/`
- **Purpose**: Completed database migrations

### **Documentation**
- **Source**: `:assets/docs completed/`, `:assets/pages archived/`
- **Destination**: `dev-archive/documentation/YYYY-MM/`
- **Types**: Phase docs, implementation summaries, debug guides

### **Design Assets**
- **Source**: `:assets/design-assets/`
- **Destination**: `dev-archive/design-assets/YYYY-MM/`
- **Content**: UI components, mockups, brand assets

## 🔒 Safety Features

### **Upload Verification**
- Files are verified in Supabase Storage before local deletion
- Failed uploads prevent local file removal
- Audit trail logs all operations

### **Dry Run Mode**
- Preview all operations without execution
- See exactly what files will be processed
- Verify archive destinations before running

### **Rollback Capability**
- All archived files remain accessible in Supabase Storage
- Files can be downloaded back if needed
- Complete audit log for tracking

## 📊 Archive Statistics

### **Current Status** (as of implementation):
- **153 files eligible** for archival
- **256MB total size** ready for cleanup
- **Organized structure** with date-based folders
- **Automated lifecycle** management

## 🛡️ Best Practices

### **Before Running Archive Upload:**
1. Run `npm run archive scan` to see what will be processed
2. Run `npm run archive dry-run` to preview operations
3. Ensure Supabase Storage credentials are configured
4. Backup critical files if needed

### **Regular Maintenance:**
- Run `npm run archive scan` weekly to monitor file accumulation
- Use `npm run archive upload` monthly for cleanup
- Generate manifests quarterly for record keeping

### **Environment Variables Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Archive Logs

All archive operations are logged to:
```
:assets/archive-operations.log
```

Log includes:
- Timestamp of operations
- Files processed
- Upload verification results
- Any errors or warnings

## 🌐 Supabase Storage Structure

```
dev-archive/
├── screenshots/
│   ├── 2025-08/
│   │   ├── upload-module-development/
│   │   ├── navigation-enhancements/
│   │   └── styling-improvements/
│   └── 2025-07/
├── SQLmigrations/
│   └── 2025-08/
│       ├── phase2-rls-policies/
│       └── user-management/
├── documentation/
│   └── 2025-08/
│       ├── phase-docs/
│       ├── implementation-summaries/
│       └── debug-guides/
└── design-assets/
    └── 2025-08/
        ├── component-mockups/
        └── brand-assets/
```

## ⚡ Quick Start

For immediate cleanup of development files:

```bash
# 1. Check what's eligible
npm run archive scan

# 2. Preview the operations  
npm run archive dry-run

# 3. Execute the cleanup (when ready)
npm run archive upload
```

---

*This archive system helps maintain a clean development environment while preserving all important artifacts in organized cloud storage.*