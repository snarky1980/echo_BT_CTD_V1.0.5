# ECHO Email Template Assistant v1.0.0

> **Professional email template management with rich text editing, AI assistance, and variable management**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://echomt.jskennedy.net/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/snarky1980/echo_MT)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ✨ Features

### 📝 Rich Text Editor
- **Full formatting toolbar**: Bold, italic, underline, strikethrough
- **6 highlight colors**: Yellow, green, pink, orange, red, purple
- **8 text colors**: Professional color palette
- **Font selection**: 8 fonts with visual preview dropdown
- **Font sizing**: 4 sizes (14px-20px) with size preview
- **Alignment tools**: Left, center, right, justify
- **Lists**: Bulleted and numbered lists

### 🎨 Visual Enhancements (v1.0.0)
- **Custom Font Selector**: See each font in its actual typeface before selecting
- **Custom Size Selector**: Preview font sizes visually (Small, Normal, Large, X-Large)
- **Toast Notifications**: Non-intrusive notifications for exports and actions
- **Modern UI**: Smooth animations, hover effects, and responsive design

### 📤 Comprehensive Export Options
All exports preserve rich text formatting (highlights, colors, fonts, etc.):

- **📄 PDF Export**: Full formatting with color preservation
- **📗 Open in Word**: HTML-based .doc with all formatting
- **📘 Download Word**: MHTML format for offline editing
- **🌐 HTML Export**: Complete standalone HTML file
- **✉️ EML Export**: Multipart email (plain text + HTML)
- **📋 Copy HTML**: Rich text to clipboard
- **📝 Copy Text**: Plain text (no formatting)

### 🔧 Variable Management
- **Dynamic placeholders**: Insert variables like `<<ClientName>>`, `<<ProjectName>>`
- **Visual pills**: Variables appear as colored pills in the editor
- **Live editing**: Click pills to edit values in real-time
- **Popout editor**: Manage all variables in separate window
- **Format with text**: Apply formatting to variables and surrounding text simultaneously
- **Auto-sync**: Changes sync across all instances

### 📚 Template Library
- **Bilingual templates**: French and English versions
- **Category organization**: Group templates by type
- **Search & filter**: Find templates quickly with fuzzy search
- **Favorites**: Star important templates for quick access
- **Import/Export**: CSV and JSON formats supported

### 🤖 AI Assistance (Optional)
- **AI-powered suggestions**: Generate email content with OpenAI
- **Template completion**: Auto-generate bilingual templates
- **Variable generation**: Create complete variable libraries
- **CSV processing**: Use AI to fill/translate CSV files

### 🔒 Privacy & Security
- **100% client-side**: All data stored in browser localStorage
- **No server required**: Works completely offline
- **OpenAI API**: Optional, user provides their own key
- **Export your data**: Full JSON export anytime

---

## 🚀 Quick Start

### Live Demo
Visit **[https://echomt.jskennedy.net/](https://echomt.jskennedy.net/)** to use the app immediately!

### Local Development

```bash
# Clone the repository
git clone https://github.com/snarky1980/echo_MT.git
cd echo_MT

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📖 Documentation

### User Guides
- **[Admin Console Guide](docs/ADMIN-CSV-IMPORT-GUIDE.md)**: Import/export templates and variables
	- **Unified Simple Admin (`admin-simple.html`)**: The sole admin interface. Provides quick JSON edit/import/export plus integrated Excel (.xlsx) import & export template generation. Use it to:
	  - Edit titles, descriptions, subjects, and body text in FR/EN
	  - Detect placeholders and sync template variables
	  - Add missing variables to the global catalog
	  - Import Excel to bulk add/update templates & variables
	  - Export current state to JSON or Excel (Templates + Variables + Metadata sheets)
	  All changes are stored locally as a draft (in `localStorage`) until you export the JSON.
- **[AI Usage Guide](docs/AI-USAGE-QUICK-REFERENCE.md)**: Use AI to generate content
- **[Help Center](help.html)**: In-app help and troubleshooting

### Developer Resources
- **[Developer Guide](docs/DEVELOPER-GUIDE.md)**: Architecture and development
- **[Changelog](CHANGELOG_2025-11-04.md)**: Version history and updates
- **[Implementation Report](IMPLEMENTATION_REPORT.md)**: Technical details

---

## 💡 Usage Examples

### Creating an Email Template

1. **Select a template** from the library or start blank
2. **Insert variables** using the `+ Variable` button
3. **Format the content** with the rich text toolbar
4. **Preview** in both French and English
5. **Export** to PDF, Word, Email, or HTML

### Managing Variables

1. **Open Variables Editor** (popout window)
2. **Add/edit** variable names and values
3. **Sync** automatically with email content
4. **Format variables** along with surrounding text
5. **Save** - changes persist in browser storage

### Importing Templates

1. **Open Admin Console** (admin.html)
2. **Go to Templates tab**
3. **Click "Import CSV"**
4. **Select your CSV file** (must match schema)
5. **Review** warnings and import

---

## 🏗️ Tech Stack

- **React 18.3**: Modern component-based UI
- **Vite 6.3**: Lightning-fast build tool
- **Tailwind CSS 4.1**: Utility-first styling
- **Lexical**: Robust rich text editor
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icons
- **Fuse.js**: Fuzzy search

---

## 🎯 Key Features Breakdown

### Toast Notification System
```javascript
// Success notification
toast.success('Template saved!', 5000)

// Error notification  
toast.error('Failed to export', 3000)

// Info notification
toast.info('Download from your Downloads folder', 5000)
```

- Appears in bottom-right corner
- Auto-dismisses after 4-5 seconds
- Three types: success ✅, error ❌, info ℹ️
- Non-blocking and stackable

### Custom Font Selectors

**Font Family Selector**
- Each option displays in its actual font
- 8 professional fonts available
- Click-outside-to-close behavior
- Smooth animations

**Font Size Selector**
- Visual size preview (14px, 16px, 18px, 20px)
- Each option shown at actual size
- Consistent design with font family selector

### Rich Text Export Formats

All exports use `makeOutlookFriendly()` function to:
- Convert computed styles to inline styles
- Preserve highlights and background colors
- Maintain fonts, sizes, and colors
- Support email clients and Word

**EML Format** (multipart/alternative):
```
Content-Type: multipart/alternative
├── text/plain (fallback)
└── text/html (rich formatting)
```

---

## 📦 File Structure

```
echo-v1.0.0/
├── src/
│   ├── App.jsx                    # Main application
│   ├── components/
│   │   ├── ui/
│   │   │   ├── toast.jsx          # Toast notification system
│   │   │   ├── font-selector.jsx  # Custom font dropdown
│   │   │   └── font-size-selector.jsx # Custom size dropdown
│   │   ├── HelpCenter.jsx
│   │   ├── HighlightingEditor.jsx
│   │   └── RichTextToolbar.jsx
│   └── utils/
│       ├── storage.js             # localStorage management
│       └── openai.js              # AI integration (optional)
├── assets/                        # Static assets
├── docs/                          # Documentation
├── imports/                       # Example CSV files
├── scripts/                       # Utility scripts
├── admin-simple.html              # Unified simple admin (Excel + JSON)
├── admin-simple-help.html         # Popout help for simple admin
├── admin.html                     # Legacy redirect to simple admin
├── admin-excel.html               # Legacy redirect to simple admin
├── help.html                      # Help center
└── index.html                     # Main entry point
```

---

## 🔄 Version History

### v1.0.0 (November 4, 2025)
- ✨ Custom font selectors with visual previews
- ✨ Custom font size selector with size preview
- ✨ Toast notification system
- ✨ Enhanced EML export (multipart/alternative with HTML)
- ✨ Enhanced Outlook integration (.eml files with HTML)
- ✨ Variable pill formatting when selected with text
- 🐛 Fixed corrupted emoji icons in export menu
- 📝 Comprehensive documentation and changelog

### v8.0.0 (Previous Version)
- Complete rich text editor
- Template library with bilingual support
- Variable management system
- Multiple export formats
- Admin console for CSV imports
- AI assistance integration

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/snarky1980/echo_MT/issues)
- **Documentation**: Check the `/docs` folder
- **Help Center**: Available in-app at `help.html`

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices:
- React team for the amazing framework
- Vite for blazing-fast builds
- Tailwind CSS for beautiful styling
- Lexical for robust text editing
- Open source community for inspiration

---

**Made with ❤️ for professional email communication**

**Live Demo**: [https://echomt.jskennedy.net/](https://echomt.jskennedy.net/)
