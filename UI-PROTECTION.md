# UI Design Protection

## Canonical UI Specification

**Commit**: d208852
**Date**: Locked as of 2025-10-15

### Visual Elements (DO NOT CHANGE)

1. **Color Palette**
   - Primary: Emerald (#059669, #10b981, #047857)
   - Secondary: Teal (#0d9488, #14b8a6, #5eead4)
   - Accent: Sage/Lime (#65a30d, #84cc16, #d9f99d)
   - Backgrounds: Mint/cream gradients
   - **FORBIDDEN**: Blue, indigo, cyan (used in previous version)

2. **Layout Components**
   - Main banner: Gradient from emerald-600 via teal-600 to green-600
   - Language switcher: Pills with white background, emerald active state
   - Template cards: Emerald borders when selected, teal-50 background
   - Action buttons: Emerald/teal theme
   - Variables popup: Movable, resizable, emerald header

3. **Typography & Spacing**
   - Font: Inter, system fallbacks
   - Variable highlighting: Amber (#fef3c7 bg, #d97706 text)
   - Modern spacing with consistent padding

### Protected Files

- `src/App.jsx` - Main UI component (lines with className containing color classes)
- `src/index.css` - Global styles and CSS variables
- `index.html` - Entry point structure

### Change Protocol

1. **For bug fixes**: Safe to proceed if no visual/color changes
2. **For features**: Test in branch, preserve color scheme
3. **For UI tweaks**: Requires explicit approval and documentation

### Recovery Command

If UI is accidentally changed:
```bash
git reset --hard d208852
npm run build
npm run deploy
```

### Validation Checklist

Before deploying:
- [ ] Header is emerald/teal gradient (NOT blue)
- [ ] Pills are white with emerald active state
- [ ] "Ouvrir dans Outlook" button is visible
- [ ] Variables popup is movable/resizable
- [ ] No blue/indigo/cyan classes in main components
