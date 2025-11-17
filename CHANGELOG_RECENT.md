# Recent Changes - November 4, 2025

## Rich Text Editor Enhancements

### Font Family Selector
- **Added**: Font family dropdown to rich text formatting toolbar
- **Fonts Available**: Arial, Times New Roman, Courier New, Georgia, Verdana, Helvetica, Comic Sans, Impact
- **UX Feature**: Each font option displays in its own typeface for preview
- **Implementation**: Uses `document.execCommand('fontName')` for cross-browser compatibility
- **File Modified**: `src/components/RichTextToolbar.jsx`

### Complete Rich Text Formatting Toolbar
The toolbar now includes all standard formatting options:
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Lists**: Bullet lists, Numbered lists
- **Colors**: Text color (8 colors), Highlight color (6 colors including "None")
- **Alignment**: Left, Center, Right, Justify
- **Typography**: Font size (4 sizes), Font family (8 fonts)

### Email Client Compatibility
- **Enhanced HTML Export**: Templates now wrapped in complete HTML5 document structure
- **Outlook/macOS Mail Support**: All formatting converted to inline styles
- **Implementation**: 
  - Complete DOCTYPE and HTML structure with meta tags
  - `makeOutlookFriendly()` function processes all styled elements
  - Converts CSS styles to inline attributes (font-weight, font-style, color, background-color, text-decoration)
  - Proper list styling for email clients
- **File Modified**: `src/App.jsx` (lines 1976-2257)

## User Experience Improvements

### Copy Button Feedback
- **Enhanced**: Individual "Copié!" feedback for each copy button
- **Buttons Affected**:
  - Copy Subject → Shows "Copié !" on subject button
  - Copy Body → Shows "Copié !" on body button  
  - Copy All → Shows "Copié !" on all button
  - Copy Link → Shows "Copié !" on link button
- **Implementation**: Changed `copySuccess` state from boolean to string tracking button type
- **File Modified**: `src/App.jsx` (line 717, lines 2303-2365)

### Category Selector Visual Hierarchy
- **Enhanced**: "All categories" option now displays larger (16px vs 14px)
- **Applied to**: Both dropdown menu and button when selected
- **Implementation**: Inline `fontSize` style to override SelectItem defaults
- **File Modified**: `src/App.jsx` (lines 2778, 2788, 2967, 2977)

### Search Improvements
- **Global Search**: Search now looks across ALL categories and languages
- **Smart Filtering**: 
  - With search query: Shows results from all categories
  - Without search query: Respects category and favorites filters
- **Favorites Priority**: Search results show favorites first
- **Implementation**: Added `sortWithFavoritesFirst()` helper, conditional filtering logic
- **File Modified**: `src/App.jsx` (lines 1656-1911)

## Interface Consistency

### Terminology Standardization
Replaced all user-facing "email"/"courriel" references with "template"/"modèle":
- French: "Éditez votre modèle" (was "Éditez votre courriel")
- English: "Edit your template" (was "Edit your email")
- "Composer avec Outlook" (was "Composer un courriel avec Outlook")
- "Envoyer" (was "Envoyer courriel")
- Tooltips and buttons updated throughout interface
- **File Modified**: `src/App.jsx` (lines 606, 618-619, 645, 657-658, 3227, 3306)

## Visual Styling

### List Styles in ContentEditable
- **Added**: Proper CSS styling for lists within the Lexical editor
- **Styles**: Margins, padding, nested list types (disc, circle, square for UL; decimal, lower-alpha, lower-roman for OL)
- **File Modified**: `src/App.css` (lines 371-407)

### Other UI Tweaks
- **Search Clear Button**: Repositioned to avoid overlap with search icon
- **Favorite Star Icon**: Changed unfilled state from dark navy to light gray for better visibility
- **Sparkles Icon**: Updated color to match theme (#2c3d50)
- **Files Modified**: `src/App.jsx`

## Technical Details

### State Management
- `copySuccess`: Now tracks specific button type ('subject', 'body', 'all', 'link', null)
- `fontFamily`: New state for tracking current font selection
- `showHighlightPicker`, `showColorPicker`: Toggle states for color pickers

### New Constants
- `HIGHLIGHT_COLORS`: 6 highlight color options
- `TEXT_COLORS`: 8 text color options  
- `FONT_FAMILIES`: 8 font family options with CSS fallbacks

### Browser Compatibility
- Uses `document.execCommand()` for formatting commands
- Enables `styleWithCSS` for inline style generation
- Fallback handling for browsers without certain API support
- Complete HTML document structure for email client compatibility

## Files Changed
1. `src/App.jsx` - Main application logic, search, copy buttons, email export
2. `src/App.css` - List styling for contentEditable areas
3. `src/components/RichTextToolbar.jsx` - Complete toolbar with all formatting options

## Testing Recommendations
- ✅ Test font selector with various fonts
- ✅ Test copy buttons show individual feedback
- ✅ Test search across all categories
- ✅ Test favorites appear first in search results
- ⏳ Test formatted text in Outlook (requires user access)
- ⏳ Test formatted text in macOS Mail app
- ✅ Verify "All categories" appears larger
- ✅ Verify consistent "template" terminology throughout
