# Changes Made to Email Assistant v8

## 2025-11-04 – CSV import for variables, UI polish, and deployment fixes

### Variables CSV Import Feature
- **New import capability**: Added "Importer variables (CSV)" button in the Variables tab of admin console
- **CSV parser**: Supports columns `name`, `description_fr`, `description_en`, `format`, `example`
- **Smart merge**: Creates new variables or updates existing ones with imported metadata
- **Example files**: Created `imports/variables-library.csv` (12 sample variables) and `imports/template-example.csv` (4 sample templates)
- **Documentation**: Added comprehensive `imports/README.md` with import guide, CSV format specs, and troubleshooting tips
- **Flexible format**: Supports both comma and semicolon separators, recognizes alternative column names

### UI Polish
- **Template language selector**: Added subtle rounded corners (4px) to the "Langue du modèle" bar for refined appearance
- **Favorites star icon**: Changed unfavorited star color from light gray to dark blue (#2c3d50) to match app theme, with smooth color transition on hover
- **Improved visibility**: Dark blue star is more visible and professional while maintaining the gold color when favorited

### Bug Fixes & Deployment
- **ECHO logo 404 fix**: Properly imported `echo-logo.svg` asset for production builds (was hardcoded path causing 404)
- **Safari compatibility**: Removed `backdrop-filter` from help.html (unsupported in Safari 9+), replaced with solid background
- **CSS cleanup**: Moved inline styles in help.html to external CSS classes to eliminate linting warnings

### Import Workflow
The new two-file CSV import workflow:
1. Import `variables-library.csv` first (establishes all variable definitions with FR/EN metadata)
2. Import `template-example.csv` second (templates reference existing variables)
3. Export final JSON with complete bilingual data

---

## 2025-11-04 – Help Centre expansion, cleanup, and favicon refresh

### Help Centre improvements
- Added new bilingual sections: Variables & pills, Popout, Copying & Outlook, Favorites, Shortcuts, and Privacy
- Introduced a compact table of contents and a search filter that narrows results across sections, FAQ, and troubleshooting
- Removed the “Ressources utiles / Helpful resources” links and now hide the entire block automatically when no links are present
- Updated example email addresses to use FR: `prenom.nom@moncourriel.com` and EN: `firstname.lastname@myemail.com`
- Pruned troubleshooting by removing “Impossible de charger les modèles” (FR) / “Templates refuse to load” (EN)
- Simplified offline FAQ answers by removing the “export JSON” sentence in both FR and EN
- Removed the small "Email Assistant" title line from the Help window header to reduce visual clutter

### Favicon
- Refreshed the favicon to a navy square with a centered lowercase “e” in white for improved readability and consistency

---

## 2025-11-02 – ECHO branding refinement and banner layout optimization

### Banner Layout Adjustments
- **Logo positioning**: Enlarged ECHO logo to 540×270px (225% of original), positioned with -0.685in top margin and -100px left margin for optimal visual balance
- **Subtitle positioning**: Moved subtitle left by 90px and up by 29px to align with logo and create cohesive banner composition
- **Banner trimming**: Set banner maxHeight to 140px with overflow hidden to create compact header that ends just below subtitle
- **Spacing refinement**: Added 0.125in top padding to banner and 0.125in bottom margin to logo for balanced breathing room

### Visual Hierarchy
- Fine-tuned positioning ensures ECHO branding is prominent while maintaining clean, professional appearance
- Subtitle "Studio de modèles interactifs" / "Interactive Template Studio" positioned for optimal readability
- Compact banner design maximizes content area while preserving brand identity

---

## 2025-11-02 – ECHO branding, contact workflow, and editor polish

### Highlights
- Help button returned to the header (beneath the teal language selector) and made smaller; footer variant removed to keep the main banner height unchanged.
- Subject editor pills now auto-select on click (same behavior as body editor) for quick overwrite; caret no longer lands inside an empty pill.
- Rebranded the application header and document title to **ECHO**, with localized subtitles “Studio de modèles interactifs” (FR) and “Interactive Template Studio” (EN).
- Refined the help button styling so it remains visible on the teal language panel while staying compact and unobtrusive.
- Resolved the pill-editing limitation in both the subject (`SimplePillEditor`) and body (`RichTextPillEditor`) editors by only auto-selecting placeholders when they are empty, preserving user text while retaining the quick “type-to-replace” behaviour for fresh pills.
- Introduced an embedded contact form inside the help centre with four request types (support, glitch, improvement, template submission). Submissions post to FormSubmit by default and can be redirected via `VITE_SUPPORT_FORM_ENDPOINT`.
- Updated the help centre copy to reference ECHO, added context-specific form copy, and surfaced inline validation + success feedback.
- Added environment-driven support email resolution to keep outgoing notifications configurable without code changes.
- Replaced the favicon with the shared `lumen-logo.svg` asset for consistent branding across environments.

### Deployment/Config notes
- Ensure `.env` (or the deployment environment) provides `VITE_SUPPORT_EMAIL` for reply-to handling. Optional `VITE_SUPPORT_FORM_ENDPOINT` can point to an internal form handler; if omitted, the app falls back to FormSubmit using the support email.
- After pulling these changes, run `npm install` (if dependencies changed) and `npm exec vite build` before `npm run deploy` to publish to GitHub Pages.

---

## Overview
This document describes the modifications made to implement the text editing and synchronization features as specified in the requirements.

## Modified Files

### 1. src/App.jsx

#### Fixed syncFromText Function (lines 1354-1417)
**Problem:** The function was referencing non-existent `subject` and `body` variables.

**Solution:** Updated to use `finalSubject` and `finalBody` state variables, and properly access template text with language selection.

**Changes:**
- Line 1366: Changed from `selectedTemplate.subject` to `selectedTemplate.subject[templateLanguage] || ''`
- Line 1367: Changed from `selectedTemplate.body` to `selectedTemplate.body[templateLanguage] || ''`
- Lines 1370, 1380: Changed from `subject` and `body` to `finalSubject` and `finalBody`
- Line 1395: Added return value (true/false) to indicate success

#### Added BroadcastChannel Handler for Sync Requests (lines 684-699)
**Problem:** No handler to receive sync requests from the Variables popout.

**Solution:** Added message handler for 'syncFromText' type messages.

**Changes:**
- Lines 684-699: New message handler that receives 'syncFromText' message from popout, executes syncFromText() function, and sends back 'syncComplete' message with results

#### Improved extractValueFromText Function (lines 1419-1507)
**Problem:** Original extraction was fragile and line-based, failed with multi-line content or heavy edits.

**Solution:** Enhanced algorithm using text anchors and partial matching.

**Changes:**
- Lines 1432-1444: Smart anchor detection (finds text before/after variable, up to 50 chars or next variable)
- Lines 1455-1471: Improved before-anchor matching with fallback to partial match
- Lines 1473-1489: Improved after-anchor matching with fallback to partial match
- Lines 1491-1498: Better validation (don't return empty or placeholder values)
- Added extensive logging for debugging

### 2. src/VariablesPopout.jsx

#### Added Sync Functionality (lines 1-95)
**Problem:** No way to trigger sync from text in the popout window.

**Solution:** Added complete sync functionality with UI feedback.

**Changes:**
- Line 2: Added `RefreshCw` icon import
- Lines 19-20: Added `isSyncing` and `syncStatus` state variables
- Lines 36-47: Enhanced BroadcastChannel message handler to receive 'syncComplete' messages
- Lines 78-95: New `handleSyncFromText` function that sends 'syncFromText' request to main window, manages loading state, and handles success/error feedback

#### Added Sync Button to Header (lines 154-172)
**Problem:** No UI element to trigger sync.

**Solution:** Added prominent sync button in header with visual feedback.

**Changes:**
- Lines 154-172: New sync button with RefreshCw icon that spins during sync, dynamic text showing sync status, disabled state during sync operation, and visual feedback (success/error/no-changes)

#### Added Translations (lines 122-142)
**Problem:** No text labels for sync feature.

**Solution:** Added bilingual (FR/EN) labels for all sync-related UI.

**Changes:**
- Lines 127-131 (FR): syncFromText, syncing, syncSuccess, syncNoChanges, syncError
- Lines 137-141 (EN): Same labels in English

## Feature Implementation Status

All required features have been implemented:

- **Persistent Highlighting** - Already working, verified in HighlightingEditor component
- **Auto-sync: Variables Editor to Text Areas** - Already working via BroadcastChannel
- **Manual sync: Text Areas to Variables Editor** - NOW IMPLEMENTED with sync button, BroadcastChannel communication, improved extraction algorithm, and visual feedback
- **Direct Text Editing** - Already working, now properly syncs back

## How It Works

### User Flow 1: Edit in Variables Editor
1. User opens Variables popout
2. User changes a variable value
3. Change is immediately sent via BroadcastChannel
4. Main window receives update and updates variables state
5. React re-renders, finalSubject and finalBody are updated via replaceVariables()
6. HighlightingEditor shows updated text with highlighting

### User Flow 2: Edit in Text Areas
1. User edits text directly in subject or body areas
2. finalSubject or finalBody state is updated via onChange
3. User clicks "Sync from text" button in Variables popout
4. Popout sends 'syncFromText' message via BroadcastChannel
5. Main window receives message and calls syncFromText()
6. extractValueFromText() parses text using template structure as guide
7. Extracted values update variables state
8. Main window sends 'syncComplete' message back to popout
9. Popout updates its variables display and shows success feedback

## Technical Details

### Extraction Algorithm
The improved extractValueFromText function uses a smart anchor-based approach:

1. **Find Anchors**: Identifies literal text before and after each variable in the template (up to 50 chars or next variable)
2. **Locate in Text**: Searches for these anchors in the edited text
3. **Partial Matching**: Falls back to partial matches (last/first 20 chars) if full anchor not found
4. **Extract Value**: Gets text between the anchors
5. **Validate**: Ensures extracted value is not empty or the placeholder itself

This approach handles multi-line variable values, heavy text editing, missing or reordered content, and multiple variables in same text.

### BroadcastChannel Messages

**Main Window to Popout:**
- variablesUpdated: Variables changed in main window
- syncComplete: Sync operation finished (includes success flag and updated variables)

**Popout to Main Window:**
- variableChanged: Single variable changed in popout (includes all variables)
- syncFromText: Request to sync from text areas

## Code Quality

All code follows best practices:
- No minification - All code is readable and well-formatted
- Comprehensive comments explaining logic
- Consistent with existing code style
- Proper error handling with try-catch blocks
- Console logging for debugging
- Reversible - No breaking changes to existing functionality

## Testing Recommendations

1. Select a template and verify variables are highlighted
2. Edit variables in popout, verify text updates immediately
3. Edit text directly, click sync, verify variables update
4. Try edge cases: multi-line values, special characters, heavy editing
5. Test in both French and English interface languages
6. Test with multiple variables in same template
7. Verify highlighting persists through all operations
