# Changelog - November 4, 2025

## Major Features and Improvements

### 1. Custom Font Selectors with Visual Previews

#### Font Family Selector
- **Component**: `src/components/ui/font-selector.jsx`
- **Description**: Custom dropdown component that displays each font in its actual typeface
- **Features**:
  - Real-time font preview for all 8 available fonts
  - Each option displays in its own font style
  - Smooth animations and hover effects
  - Click-outside-to-close functionality
  - Selected state highlighting
  - Fully accessible with keyboard navigation

#### Font Size Selector
- **Component**: `src/components/ui/font-size-selector.jsx`
- **Description**: Custom dropdown component that displays each size at its actual font size
- **Features**:
  - Visual size preview (Small, Normal, Large, X-Large)
  - Each option displays at its actual size (14px, 16px, 18px, 20px)
  - Consistent design with font family selector
  - Smooth animations and hover effects
  - Auto-close on outside click
  - Selected state highlighting

**Files Modified**:
- `src/components/RichTextToolbar.jsx` - Updated to use custom selectors instead of native `<select>` elements
- **Reason**: Native `<option>` elements don't support custom styling in most browsers

---

### 2. Enhanced Pill Selection for Formatting

#### Variable Pill Formatting Support
- **File**: `src/components/RichTextToolbar.jsx` (executeCommand function)
- **Description**: When selecting text that includes variable pills, formatting now applies to pill contents as well
- **Features**:
  - Detects pills within text selection using `range.intersectsNode()`
  - Applies formatting commands (bold, italic, highlight, colors, etc.) to pill contents
  - Maintains original selection after applying to pills
  - Works with all formatting operations (not just block-level commands)

**Example**: Selecting "Hello <<ClientName>> how are you?" and applying yellow highlight now highlights the entire selection including the pill content.

**Technical Implementation**:
- Added pill detection logic in `executeCommand()` function
- Iterates through all `.var-pill` elements in selection range
- Applies `document.execCommand()` to each pill's content
- Restores original selection after formatting

---

### 3. Toast Notification System

#### Non-Intrusive Notifications
- **Component**: `src/components/ui/toast.jsx`
- **Description**: Modern toast notification system replacing blocking alert dialogs
- **Features**:
  - Appears in bottom-right corner
  - Auto-dismisses after 4-5 seconds
  - Three types: success (green), error (red), info (blue)
  - Manually dismissible with X button
  - Multiple toasts stack vertically
  - Smooth slide-in animations
  - Icon support with emoji

**Integration**:
- `src/main.jsx` - Wrapped app with `ToastProvider`
- `src/App.jsx` - Added `useToast()` hook

**Usage Examples**:
```javascript
toast.success('Operation completed!', 5000)
toast.error('Something went wrong')
toast.info('Please note...')
```

---

### 4. Rich HTML Export Enhancements

#### EML Export with HTML Support
- **File**: `src/App.jsx` (exportAs function - 'eml' mode)
- **Description**: EML files now export with multipart/alternative MIME format
- **Features**:
  - Includes both plain text and HTML versions
  - Preserves all rich text formatting (highlights, colors, fonts, etc.)
  - Compatible with all major email clients
  - Uses proper RFC 822 message format

**Technical Details**:
```
Content-Type: multipart/alternative
  ├── text/plain (fallback)
  └── text/html (rich formatting)
```

#### Outlook Integration with HTML
- **File**: `src/App.jsx` (openInOutlook function)
- **Description**: Creates .eml files with full HTML formatting instead of plain text mailto:
- **Features**:
  - Downloads .eml file with rich HTML content
  - Toast notification with instructions
  - Bilingual support (FR/EN)
  - Preserves all formatting when opened in email client

**Reason for Change**: The `mailto:` protocol doesn't support HTML body content, so we create an .eml file instead.

#### Word Export Improvements
- **File**: `src/App.jsx` (exportAs function - 'word' mode)
- **Description**: Word exports now include toast notifications
- **Features**:
  - Downloads .doc file with rich HTML
  - Shows toast notification with filename and instructions
  - Bilingual messages (FR/EN)
  - Proper cleanup of blob URLs

**All Export Formats Now Support Rich HTML**:
- ✅ PDF - with `print-color-adjust: exact`
- ✅ Word (Open) - HTML-based .doc
- ✅ Word (Download) - MHTML format
- ✅ HTML - full rich HTML
- ✅ EML - multipart with HTML *(updated)*
- ✅ Outlook/Email - .eml with HTML *(updated)*
- ✅ Copy HTML - rich HTML to clipboard
- ✅ Copy Text - plain text (intentionally no formatting)

---

### 5. Export Menu Icon Fixes

#### Emoji Icon Restoration
- **File**: `src/App.jsx` (export menu buttons)
- **Issue**: Two emoji icons were corrupted and displaying as `�`
- **Fix**: Replaced corrupted characters with proper emojis
  - 📗 (Green book) for "Ouvrir dans Word"
  - 📘 (Blue book) for "Télécharger Word (.doc)"

**Complete Icon Set**:
```
📄 Exporter en PDF
📗 Ouvrir dans Word
📘 Télécharger Word (.doc)
─────────────
🌐 Exporter en HTML
✉️ Exporter en .eml
─────────────
📋 Copier en HTML
📝 Copier en texte
```

---

## Technical Improvements

### Component Architecture
- Created reusable dropdown components following consistent design patterns
- Implemented proper React context for toast notifications
- Enhanced executeCommand function to handle complex selections

### User Experience
- Replaced blocking alerts with non-intrusive toast notifications
- Added visual previews for font selection
- Improved formatting consistency across all export methods
- Better file download feedback with toast messages

### Browser Compatibility
- Custom dropdowns work around browser limitations with `<option>` styling
- Proper blob URL cleanup with delayed revocation
- Fallback handling for various browser behaviors

---

## Files Created

1. `src/components/ui/font-selector.jsx` - Custom font family dropdown
2. `src/components/ui/font-size-selector.jsx` - Custom font size dropdown
3. `src/components/ui/toast.jsx` - Toast notification system

---

## Files Modified

1. `src/App.jsx`
   - Added toast notification integration
   - Updated EML export to multipart/alternative with HTML
   - Updated openInOutlook to create .eml files with HTML
   - Updated Word export to show toast notifications
   - Fixed corrupted emoji icons in export menu

2. `src/components/RichTextToolbar.jsx`
   - Imported custom font selector components
   - Replaced native select elements with custom components
   - Enhanced executeCommand to handle pill selections
   - Added pill detection and formatting logic

3. `src/main.jsx`
   - Added ToastProvider wrapper around app

---

## Migration Notes

### For Developers
- Toast notifications are now available throughout the app via `useToast()` hook
- Custom dropdown components can be reused for other selection needs
- Pill formatting logic can be extended for additional commands

### For Users
- Font selection now shows visual previews
- File downloads show helpful toast notifications instead of alerts
- All export formats preserve formatting consistently
- Variable pills can be formatted along with surrounding text

---

## Browser Support
- Tested on: macOS (Chrome, Safari, Firefox)
- Custom components work on all modern browsers
- Toast notifications use standard CSS animations
- Export functions compatible with all major email clients and Word

---

## Known Limitations

1. **Auto-open files**: Due to browser security restrictions on macOS, downloaded files (.doc, .eml) cannot be automatically opened. Toast notifications guide users to open files from Downloads folder.

2. **Font preview**: Limited to fonts specified in FONT_FAMILIES constant. System fonts may render differently across platforms.

3. **EML format**: While fully compliant with RFC 822, some older email clients may only display the plain text version.

---

## Future Enhancements

- [ ] Add more font families
- [ ] Add custom font size inputs (not just presets)
- [ ] Toast notification positioning options
- [ ] Undo/redo for formatting operations
- [ ] Export format preferences persistence

---

## Version
- **Date**: November 4, 2025
- **Version**: 8.1.0
- **Build**: Production-ready
