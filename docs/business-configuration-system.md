# Business Configuration System

## Overview

The Business Configuration System allows business owners and managers to configure their organizational structure within the JiGR Hospitality Compliance platform. This system provides secure, role-based management of departments and job titles with comprehensive audit logging.

## Key Features

- **Department Management**: Configure business departments with security levels and visual customization
- **Job Title Management**: Define job titles with role mapping, hierarchy, and security clearance
- **Role-Based Access Control**: Permissions based on user roles (STAFF < SUPERVISOR < MANAGER < OWNER)
- **Security Controls**: Multi-level security clearances and access restrictions
- **Audit Logging**: Complete change tracking for compliance and security
- **Default Data**: Pre-configured departments and job titles for hospitality businesses

## System Architecture

### Database Schema

#### Tables

**`business_departments`**
- Stores department configuration for each client
- Includes security levels: public, internal, restricted, confidential
- Visual customization: colors, icons, descriptions
- Audit fields: created_by, updated_by, timestamps

**`business_job_titles`**
- Job title definitions with role mapping
- Hierarchy levels (1-4) for organizational structure
- Security clearance levels: basic, standard, elevated, admin
- Department associations and reporting relationships
- Permission templates for custom role permissions

**`business_config_audit`**
- Immutable audit trail for all configuration changes
- Risk assessment and approval workflows
- Security context: user, role, IP, user agent
- Change details: old/new values, changed fields

#### Security Features

- **Row Level Security (RLS)**: Multi-tenant data isolation
- **Role-based Policies**: Different permissions for each user role
- **Circular Reference Prevention**: Database constraints prevent invalid hierarchies
- **Usage Validation**: Prevents deletion of departments/titles in use

### API Architecture

#### Department Management (`/api/config/departments`)

**GET** - Fetch departments
- Returns departments filtered by user permissions
- Security levels hidden for STAFF/SUPERVISOR roles
- Includes user permission matrix

**POST** - Create department
- Validates security level permissions
- Only MANAGER/OWNER can create departments
- Automatic audit logging

**PUT** - Update department
- Permission validation based on security levels
- Only OWNER can set restricted/confidential levels
- Usage validation for critical changes

**DELETE** - Delete department
- Only OWNER can delete departments
- Prevents deletion if department has associated job titles
- Comprehensive usage checking

#### Job Title Management (`/api/config/job-titles`)

**GET** - Fetch job titles
- Includes department and reporting relationships
- Hierarchy-based ordering
- Security clearance filtering by user role

**POST** - Create job title
- Role hierarchy validation
- Only OWNER can create MANAGER/OWNER level positions
- Security clearance permission checking
- Circular reporting prevention

**PUT** - Update job title
- Existing title permission validation
- Role escalation controls
- Hierarchy consistency checking

**DELETE** - Delete job title
- Only OWNER can delete job titles
- Prevents deletion if other titles report to it
- Future: User assignment validation

### Component Architecture

#### ConfigCard Template

**Purpose**: Reusable template for configuration sections

**Features**:
- Security level badges and warnings
- Permission-based UI rendering
- Expandable content with loading states
- Error handling and retry mechanisms
- Confirmation dialogs for dangerous operations

**Security Components**:
- `SecurityBadge`: Visual security level indicators
- `PermissionGate`: Conditional rendering based on permissions
- `useConfigConfirmation`: Confirmation dialog hook for destructive actions

#### DepartmentConfigCard

**Features**:
- Visual department management with icons and colors
- Security level configuration
- Department activation/deactivation
- Create, edit, delete operations with proper permissions
- Default icon and color palettes

**Security Controls**:
- Only MANAGER/OWNER can create/edit departments
- Only OWNER can delete departments
- Security level restrictions (OWNER required for restricted/confidential)
- Cannot delete default system departments

#### JobTitleConfigCard

**Features**:
- Job title creation with role mapping
- Hierarchy level management (1-4)
- Security clearance assignment
- Department association
- Reporting relationship configuration

**Security Controls**:
- Role hierarchy enforcement
- Only OWNER can create MANAGER/OWNER level positions
- Security clearance restrictions based on user role
- Circular reporting prevention
- Hierarchy consistency validation

## User Permissions

### Permission Matrix

| Action | STAFF | SUPERVISOR | MANAGER | OWNER |
|--------|-------|------------|---------|-------|
| View Departments | ✓ | ✓ | ✓ | ✓ |
| Create Departments | ✗ | ✗ | ✓ | ✓ |
| Edit Departments | ✗ | ✗ | ✓ | ✓ |
| Delete Departments | ✗ | ✗ | ✗ | ✓ |
| View Job Titles | ✓ | ✓ | ✓ | ✓ |
| Create Job Titles | ✗ | ✗ | ✓ | ✓ |
| Edit Job Titles | ✗ | ✗ | ✓ | ✓ |
| Delete Job Titles | ✗ | ✗ | ✗ | ✓ |
| View Security Levels | ✗ | ✗ | ✓ | ✓ |
| Set High Security | ✗ | ✗ | ✗ | ✓ |

### Security Levels

#### Department Security Levels
- **Public**: Visible to all users
- **Internal**: Staff level and above
- **Restricted**: Supervisor level and above (OWNER only can set)
- **Confidential**: Manager level and above (OWNER only can set)

#### Job Title Security Clearance
- **Basic**: Limited system access
- **Standard**: Normal operational access
- **Elevated**: Enhanced permissions (OWNER only can set)
- **Admin**: Administrative access (OWNER only can set)

## Default Configuration

### Pre-configured Departments

When a new client is created, the system automatically seeds these departments:

1. **Kitchen** (🍳) - Restricted security level
2. **Front of House** (🍽️) - Internal security level
3. **Bar** (🍺) - Internal security level
4. **Office** (💼) - Confidential security level
5. **Housekeeping** (🧹) - Internal security level
6. **Maintenance** (🔧) - Restricted security level

### Pre-configured Job Titles

Default job titles with proper hierarchy and role mapping:

1. **Owner** - OWNER role, Level 4, Admin clearance
2. **Manager** - MANAGER role, Level 3, Elevated clearance
3. **Supervisor** - SUPERVISOR role, Level 2, Standard clearance
4. **Head Chef** - MANAGER role, Level 3, Kitchen department
5. **Line Cook** - STAFF role, Level 1, Kitchen department
6. **Server** - STAFF role, Level 1, Front of House department
7. **Bartender** - STAFF role, Level 1, Bar department
8. **Host/Hostess** - STAFF role, Level 1, Basic clearance
9. **Cleaner** - STAFF role, Level 1, Basic clearance

## Usage Guide

### Accessing Configuration

1. Navigate to `/admin/configure`
2. Scroll to "Business Structure" section
3. Two configuration cards are available:
   - **Business Departments**
   - **Job Titles & Roles**

### Managing Departments

1. **View Departments**: All users can see departments (security levels filtered)
2. **Add Department**: Click "+ Add Department" (MANAGER/OWNER only)
3. **Edit Department**: Click "Edit" button on any department
4. **Delete Department**: Click "Delete" button (OWNER only, usage validated)
5. **Toggle Status**: Activate/deactivate departments

### Managing Job Titles

1. **View Job Titles**: Hierarchical list with role badges and reporting structure
2. **Add Job Title**: Click "+ Add Job Title" (MANAGER/OWNER only)
3. **Set Hierarchy**: Choose level 1-4 with proper reporting relationships
4. **Role Mapping**: Assign RBAC roles with security clearance
5. **Department Association**: Link to primary department (optional)

### Security Considerations

- **Role Limitations**: Users cannot create positions higher than their own role
- **Security Clearance**: Elevated/Admin clearances require OWNER privileges
- **Audit Trail**: All changes are logged with user context and risk assessment
- **Usage Validation**: System prevents deletion of items in use
- **Default Protection**: System default items have special protections

## Integration Points

### RBAC Integration

The business configuration system integrates with the existing RBAC system (`/lib/rbac-core.ts`):

- User permissions validated through `getUserClient()` and `hasPermission()`
- Role hierarchy enforced through `canRoleManageRole()`
- Security clearance mapped to system permissions

### Profile Integration

Job titles and departments can be associated with user profiles:

- User profiles can reference job titles for automatic role assignment
- Department associations help with workflow routing
- Security clearances affect system access levels

### Audit Integration

All configuration changes flow through the audit system:

- Change tracking in `business_config_audit` table
- Risk assessment based on change type and user role
- Security context capture for compliance

## Future Enhancements

### Planned Features

1. **Permission Templates**: Custom permission sets per job title
2. **Workflow Integration**: Department-based document routing
3. **Shift Management**: Time-based department assignments
4. **Bulk Operations**: Import/export department and job title configurations
5. **Advanced Hierarchies**: Matrix organizations and dual reporting
6. **Integration APIs**: External HR system synchronization

### Security Enhancements

1. **Approval Workflows**: High-risk changes require secondary approval
2. **Change Notifications**: Email alerts for security-relevant changes
3. **Compliance Reporting**: Automated audit reports for compliance teams
4. **Multi-factor Authentication**: Additional security for destructive operations

## Troubleshooting

### Common Issues

**Permission Denied Errors**
- Verify user role has appropriate permissions
- Check if trying to create higher-level positions
- Ensure security clearance permissions for elevated levels

**Cannot Delete Department/Job Title**
- Check for associated job titles (departments)
- Verify no users are assigned to the job title
- Confirm no other job titles report to the target title

**Hierarchy Validation Errors**
- Ensure reporting relationships follow hierarchy levels
- Check for circular reporting structures
- Validate hierarchy level assignments

**Database Constraints**
- Unique constraint: Department/job title names must be unique per client
- Foreign key constraints: Referenced departments/titles must exist
- Check constraints: Hierarchy levels must be 1-4

### Debug Information

Enable detailed logging by checking:
- Browser console for API response errors
- Server logs for database constraint violations
- Audit logs for permission validation failures
- Network tab for API request/response details

## API Reference

### Department Endpoints

```typescript
GET /api/config/departments
POST /api/config/departments
PUT /api/config/departments
DELETE /api/config/departments?id={departmentId}
```

### Job Title Endpoints

```typescript
GET /api/config/job-titles
POST /api/config/job-titles
PUT /api/config/job-titles
DELETE /api/config/job-titles?id={titleId}
```

### Response Format

```typescript
{
  success: boolean
  departments?: Department[]
  jobTitles?: JobTitle[]
  userPermissions: {
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canViewSecurity: boolean
  }
  error?: string
  message?: string
}
```

## Conclusion

The Business Configuration System provides a comprehensive, secure, and auditable way for hospitality businesses to configure their organizational structure within the JiGR platform. With proper role-based access controls, security clearances, and audit logging, it ensures that configuration changes are both secure and compliant with business requirements.