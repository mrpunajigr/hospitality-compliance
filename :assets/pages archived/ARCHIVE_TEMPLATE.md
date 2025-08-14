# [Component Name] - Archive Documentation Template

## Archive Details
- **Date Archived:** YYYY-MM-DD HH:MM
- **Archived By:** [Developer Name]
- **Reason:** [Specific reason for deletion]
- **Git Commit:** [Hash of commit that removed code]
- **Original Location:** [Full file path(s)]

## Component Description
- **Purpose:** [What the component did]
- **Key Features:** 
  - [Feature 1 - describe functionality]
  - [Feature 2 - describe functionality]
  - [Feature 3 - describe functionality]
- **Dependencies:** [Required imports, contexts, utilities]
- **Integration Points:** [Where it was used/referenced]

## Technical Details
- **Framework:** [React, Next.js, etc.]
- **Styling:** [Tailwind, CSS modules, styled-components, etc.]
- **State Management:** [Context, hooks, Redux, Zustand, etc.]
- **External Dependencies:** [Third-party packages required]
- **Environment:** [Dev-only, production-compatible, etc.]

## Deletion Context
- **Problem Solved:** [What issue deletion addressed]
- **Alternative Approach:** [What replaced this component]
- **Impact Assessment:** [What functionality was lost]
- **Future Considerations:** [When this might be needed again]

## Restoration Instructions
1. **Environment Setup**
   - [Check current codebase compatibility]
   - [Verify required dependencies]
   
2. **File Restoration**
   - Copy `original-code/[component].tsx` to `[destination path]`
   - Copy supporting files from `original-code/` as needed
   
3. **Dependency Installation**
   - Install packages listed in `dependencies.txt`
   - Update import paths for current codebase structure
   
4. **Integration Configuration**
   - [Add to routing if needed]
   - [Update navigation menus]
   - [Configure permissions/access controls]
   
5. **Testing Verification**
   - [Test core functionality]
   - [Verify responsive design]
   - [Check accessibility compliance]
   
6. **Production Compatibility**
   - [Remove dev-only code if needed]
   - [Configure environment variables]
   - [Update build processes]

## Testing Verification Checklist
- [ ] Component renders without errors
- [ ] All interactive features work correctly
- [ ] Responsive design functions on mobile/tablet
- [ ] Accessibility standards met
- [ ] Performance meets expectations
- [ ] Integration with existing systems verified
- [ ] No console errors or warnings

## Screenshots/Visuals
- `screenshots/overview.png` - [Component overview/main interface]
- `screenshots/feature-1.png` - [Specific feature demonstration]
- `screenshots/mobile-view.png` - [Mobile responsive view]
- `screenshots/interaction.png` - [User interaction examples]

## Code Structure
```
original-code/
├── [main-component].tsx     # Primary component file
├── components/              # Supporting components
│   ├── [sub-component-1].tsx
│   └── [sub-component-2].tsx
├── hooks/                   # Custom hooks
├── utils/                   # Utility functions
└── types/                   # TypeScript definitions
```

## Dependencies List
```
dependencies.txt contents:
- @package/name@version
- react-package@version
- utility-library@version
```

## Known Issues/Limitations
- [Issue 1: Description and potential solution]
- [Issue 2: Description and potential solution]
- [Limitation 1: What the component couldn't do]

## Additional Notes
- [Any other relevant information for future developers]
- [Performance considerations]
- [Security considerations]
- [Browser compatibility notes]
- [Future enhancement opportunities]

## Restoration History
- **Restoration Attempts:** [Number and dates if any]
- **Success Status:** [Not attempted / In progress / Successful / Failed]
- **Restoration Notes:** [Any modifications needed during restoration]

---

**Template Version:** 1.0  
**Last Updated:** 2025-08-14  
**Template Usage:** Copy this template for each new archive