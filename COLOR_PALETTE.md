# Color Palette Documentation

## Current Color Scheme (Updated November 3, 2025)

This document defines the official color palette for the Email Assistant application. All colors should reference these values to maintain consistency across the application.

---

## Primary Colors

### Dark Navy Blue - `#2c3d50`
**Primary brand color used throughout the interface**

- **Usage:**
  - Main text color in editing areas
  - All frame borders (editing panes, template selector, search fields)
  - Template language toggle buttons (FR/EN active state)
  - Help button text
  - Copy Body button text and icon
  - Variables button text and border
  - IA button text and border
  - Category dropdown text
  - + Export button text and border
  - Template cards (selected and hover borders)
  - Pill selection cue (focused state)
  - Popout banner background
  - Banner decorative elements (3 navy pills)

- **RGBA Variants:**
  - `rgba(44, 61, 80, 0.3)` - Focus box shadow
  - `rgba(44, 61, 80, 0.35)` - Button borders
  - `rgba(44, 61, 80, 0.4)` - Pill focused shadow
  - `rgba(44, 61, 80, 0.5)` - Help button border
  - `rgba(44, 61, 80, 0.6)` - Help button text (lighter)

---

## Secondary Colors

### Light Gold - `#b5af70`
**Secondary accent color for interactive elements**

- **Usage:**
  - Category selector button background
  - Sage color throughout application (--tb-sage, --tb-sage-light)
  
- **RGBA Variant:**
  - `rgba(181, 175, 112, 0.4)` - Variable background in popout
  - `rgba(181, 175, 112, 0.6)` - Variable border in popout

### Olive Gold - `#aca868`
**Tertiary accent color**

- **Usage:**
  - Banner decorative pills (3 gold pills with varying opacity)
  - Pane separator color
  - Teal color throughout application (--tb-teal, --tb-teal-light)

- **Opacity Variants in Banner:**
  - Top-left large pill: opacity 0.40
  - Middle pill: opacity 0.30
  - Bottom-right small pill: opacity 0.15

### Dark Gold - `#8a7530`
**Accent color for specific decorative elements**

- **Usage:**
  - Vertical line circle frame (border)
  - Filled variable pills background in editors
  
- **RGBA Variant:**
  - `rgba(138, 117, 48, 0.35)` - Button borders (Variables, IA)

---

## Functional Colors

### Light Blue - `#5a88b5`
**Action button color**

- **Usage:**
  - Copy All button background
  - Send Email button equivalent styling

### Lighter Blue - `#426388`
**Decorative element**

- **Usage:**
  - Large centered banner pill
  - Opacity: 0.30

---

## Background Colors

### Variable Pill Backgrounds

**Filled Pills:**
- Background: `#f5f3e8` (light gold)
- Text: `#8a7530` (dark gold)
- Border: `#aca868` (olive-gold)

**Empty Pills:**
- Background: `#fef9c3` (yellow-100)
- Text: `#713f12` (amber-900)
- Border: `#fde047` (yellow-400)

**Focused Pills:**
- Border: `#2c3d50` (dark navy)
- Box shadow: `rgba(44, 61, 80, 0.4)`
- Background: `#fefbe8` (very light gold)
- Text: `#2c3d50` (dark navy)

---

## Banner Decorative Pills (6 Total)

### Navy Pills (3)
- Color: `#2c3d50`
- **Left pill:** top: -48px, opacity: 0.82
- **Bottom right pill:** top: 85px, left: 1636px, 520px × 75px, opacity: 0.82

### Light Blue Pill (1)
- Color: `#426388`
- **Center large pill:** top: -83px, left: 1140px, 680px × 125px, opacity: 0.30

### Olive-Gold Pills (3)
- Color: `#aca868`
- Opacities: 0.40, 0.30, 0.15

---

## Border Specifications

### Editor Frames
- **Default:** `1px solid #2c3d50`
- **Focus:** `border-color: #2c3d50`, `box-shadow: 0 0 0 1px rgba(44, 61, 80, 0.3)`

### Template Cards
- **Default:** `border-[#e1eaf2]`
- **Hover:** `border-[#2c3d50]`
- **Selected:** `borderColor: #2c3d50`

### Category Button
- **Border:** `rounded-md` (6px radius)
- **Background:** `#b5af70`
- **Border color:** `#2c3d50`

### Search Field
- **Border:** `rounded-[14px]`
- **Border color:** `#2c3d50`

---

## Typography Colors

### Text Colors by Context

**Editing Areas:**
- Primary text: `#2c3d50` (dark navy)
- Placeholder: `#94a3b8` (slate-400)

**Buttons:**
- Copy All: White text on `#5a88b5` background
- Copy Body: `#2c3d50` text and icon
- Help: `#2c3d50` text
- Variables/IA: `#2c3d50` text with `rgba(44, 61, 80, 0.35)` borders
- + Export: `#2c3d50` text with thin border

**Category Dropdown:**
- Selector: White text on `#b5af70` background
- Menu items: `#2c3d50` text

**Template Language Toggle:**
- Active button: White text on `#2c3d50` background
- Inactive button: `#6b7280` (gray-500)

**Interface Language Toggle:**
- Active button: White text on `#2c3d50` background
- Inactive button: `#6b7280` (gray-500)

---

## CSS Variables

### Defined in App.jsx

```css
:root {
  --primary: #2c3d50;           /* Dark navy blue */
  --secondary: #aca868;         /* Olive-gold */
  --accent: #aca868;            /* Olive-gold */
  --border: #aca868;            /* Olive-gold */
  --tb-teal: #aca868;           /* Muted gold */
  --tb-teal-light: #aca868;     /* Muted gold - lighter */
  --tb-teal-dark: #a69235;      /* Dark muted gold */
  --tb-sage: #b5af70;           /* Light gold (updated) */
  --tb-sage-light: #b5af70;     /* Light gold - lighter (updated) */
  --tb-mint: #fefbe8;           /* Very light gold - background */
  --tb-cream: #fefefe;          /* Clean white */
}
```

---

## Design Principles

1. **Primary Color (Dark Navy `#2c3d50`)**: Used for all structural elements, text, and borders to provide a professional, cohesive look
2. **Gold Accents (`#b5af70`, `#aca868`, `#8a7530`)**: Provide warmth and visual interest without overwhelming
3. **Light Blue (`#5a88b5`)**: Reserved for primary action buttons to draw attention
4. **Consistent Borders**: All frames use 1px dark navy borders for uniformity
5. **Opacity Layering**: Banner pills use varied opacity to create depth without adding colors
6. **White Space**: Generous use of white backgrounds keeps the interface clean

---

## Migration Notes

**Previous Colors Replaced:**
- Old primary: `#1a3553` → `#2c3d50`
- Old teal borders: `#7bd1ca`, `#bfe7e3` → `#2c3d50`
- Old sage: `#aca868` → `#b5af70`
- Old category border: `#aca868` → `#2c3d50`

**Key Changes:**
- All borders unified to dark navy blue
- Category button lightened for better contrast
- Template language buttons changed from primary to dark navy
- Interface language buttons changed from gold to dark navy
- Pill backgrounds updated to light gold scheme
- Banner pills reduced from 7 to 6 for cleaner design

---

## Last Updated
November 3, 2025
