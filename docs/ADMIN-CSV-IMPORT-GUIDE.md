# Admin Guide: CSV Import for Email Assistant

**Version:** 8.0  
**Last Updated:** November 4, 2025  
**Audience:** System administrators, content managers

---

## Table of Contents

1. [Overview](#overview)
2. [Before You Begin](#before-you-begin)
3. [Import Process Overview](#import-process-overview)
4. [Step-by-Step: Variables Import](#step-by-step-variables-import)
5. [Step-by-Step: Templates Import](#step-by-step-templates-import)
6. [CSV Format Specifications](#csv-format-specifications)
7. [Validation and Troubleshooting](#validation-and-troubleshooting)
8. [Best Practices](#best-practices)
9. [AI-Assisted Content Generation](#ai-assisted-content-generation)

---

## Overview

The Email Assistant admin console supports importing email templates and variables via CSV files. This allows you to:

- Bulk-import multiple email templates at once
- Define variable libraries with French and English metadata
- Collaborate with teams using spreadsheet tools (Excel, Google Sheets)
- Use AI to generate or complete bilingual content

### What Can Be Imported

**Variables** (Variable Library)
- Variable names and definitions
- French and English descriptions
- Data format specifications (text, number, date, time)
- Example values per language (FR/EN supported)

**Templates** (Email Templates)
- Template metadata (ID, category, title, description)
- Email subjects and bodies
- Bilingual content (French and English)
- Associated variables

---

## Before You Begin

### Required Access

- Local or development server running Email Assistant
- Access to the admin console at `http://localhost:5173/admin.html`

### Required Files

You'll need CSV files with proper structure. Examples are provided in the `imports/` folder:
- `variables-library.csv` - Variable definitions
- `template-example.csv` - Email templates

### Tools Needed

- Text editor that supports UTF-8 encoding (VS Code, Sublime Text, Notepad++)
- OR Spreadsheet software (Excel, Google Sheets, LibreOffice Calc)

### Important Notes

⚠️ **Always import variables BEFORE templates** - Templates reference variables, so the variable library must exist first.

⚠️ **Use UTF-8 encoding** - Ensures French accents (é, à, ç) display correctly.

⚠️ **Back up existing data** - Export current JSON before importing to preserve a backup.

---

## Import Process Overview

### Recommended Workflow

```
1. Prepare CSV files
   ↓
2. Start admin console
   ↓
3. Export current data (backup)
   ↓
4. Import variables CSV
   ↓
5. Import templates CSV
   ↓
6. Review warnings
   ↓
7. Test templates in main app
   ↓
8. Export final JSON
   ↓
9. Commit to version control
```

### Time Estimates

- **Small import** (< 10 templates): 5-10 minutes
- **Medium import** (10-50 templates): 15-30 minutes
- **Large import** (50+ templates): 30-60 minutes

---

## Step-by-Step: Variables Import

### Step 1: Prepare Variables CSV

**Required columns:**
- `name` - Variable name (e.g., ClientName, ProjectDeadline)
- `description_fr` - French description
- `description_en` - English description
- `format` - One of: `text`, `number`, `date`, `time`
- `example` - Sample value

**Example:**

```csv
name,description_fr,description_en,format,example
ClientName,Nom complet du client,Full client name,text,Marie Dubois
ProjectDeadline,Date limite du projet,Project deadline,date,2025-12-31
Budget,Budget du projet,Project budget,text,"50 000 $"
```

### Step 2: Validate CSV File

Before importing:

✅ Check header row matches exactly (case-insensitive is OK)  
✅ Each row has a unique variable name  
✅ No empty rows (except at end of file)  
✅ Fields with commas or line breaks are wrapped in quotes  
✅ File is saved as UTF-8 encoding

### Step 3: Open Admin Console

1. Start your development server:
   ```bash
   npm run dev
   # or
   npm run serve:static
   ```

2. Open browser to: `http://localhost:5173/admin.html`

3. Wait for the console to load existing data

### Step 4: Create Backup (Optional but Recommended)

1. Click **"Exporter JSON"** button (top toolbar)
2. Save file as `backup-YYYY-MM-DD.json`
3. Store in a safe location

### Step 5: Import Variables

1. Click the **"Variables"** tab in the admin console
2. Click the **"Importer variables (CSV)"** button (purple/blue button)
3. In the file dialog, select your variables CSV file
4. Wait for the import to complete

### Step 6: Review Import Results

You should see a notification:
- ✅ **Success**: `X variable(s) importée(s)`
- ⚠️ **Warning**: `Aucune variable détectée dans le fichier` (check CSV format)
- ⚠️ **Warning**: `Aucune variable ajoutée` (all variables already existed)

### Step 7: Verify Variables

1. Scroll through the Variables tab
2. Check that imported variables appear with correct:
   - French descriptions
   - English descriptions
   - Format (text/number/date/time)
   - Example values
3. Edit any variables if needed (click in the fields directly)

### Step 8: Save Draft

The import automatically saves, but to be safe:
1. Switch to another tab (Templates or Metadata)
2. Switch back to Variables
3. Verify changes persist

---

## Step-by-Step: Templates Import

### Step 1: Prepare Templates CSV

**Required columns:**
- `id` - Unique identifier (lowercase, alphanumeric + underscore)
- `category` - Template category
- `title_fr` / `title_en` - French and English titles
- `description_fr` / `description_en` - French and English descriptions
- `subject_fr` / `subject_en` - Email subject lines
- `body_fr` / `body_en` - Email body content
- `variables` - Semicolon-separated list (e.g., `ClientName;ProjectName`)

**Example:**

```csv
id,category,title_fr,title_en,subject_fr,subject_en,body_fr,body_en,variables
welcome_client,Communications générales,Bienvenue client,Client welcome,Bienvenue <<ClientName>>,Welcome <<ClientName>>,"Bonjour <<ClientName>>,

Nous sommes ravis...","Hello <<ClientName>>,

We are delighted...",ClientName;ProjectName
```

### Step 2: Validate Templates CSV

Before importing:

✅ All required columns present  
✅ Each template has a unique ID  
✅ IDs use only letters, numbers, underscore (no spaces, no special chars)  
✅ Multi-line bodies are wrapped in quotes  
✅ Variables use `<<VarName>>` syntax in subject/body  
✅ Variables column lists all used variables (semicolon-separated)  
✅ File is saved as UTF-8 encoding

### Step 3: Import Templates

1. In admin console, click the **"Templates"** tab
2. Click **"Import (lot)"** button (near top of sidebar)
3. Select your templates CSV file
4. Wait for import to complete

### Step 4: Review Import Results

Notification will show:
- ✅ **Success**: `X modèle(s) importé(s)`
- ⚠️ **Warning**: `Aucun template détecté` (check CSV format)
- ⚠️ **Warning**: `Aucun modèle ajouté` (all IDs already existed)

### Step 5: Verify Templates

1. Check the templates list in the sidebar
2. Click each imported template to review:
   - Title and description (both languages)
   - Subject line (both languages)
   - Body content (both languages)
   - Variables detected (should match your variables list)
   - Category assignment

### Step 6: Check Warnings Panel

1. Look for the warnings panel (bottom of console)
2. Review any issues:
   - Duplicate IDs
   - Unknown categories
   - Missing variables
   - Unused placeholders

3. Fix any critical issues

### Step 7: Test in Main App

1. Open the main app: `http://localhost:5173/`
2. Search for your newly imported templates
3. Select a template and verify:
   - French/English content switches correctly
   - Variables are highlighted
   - Subject and body display properly

### Step 8: Export Final JSON

Once everything looks good:

1. Return to admin console
2. Click **"Exporter JSON"**
3. Save as `complete_email_templates.json`
4. Replace the file in your project root
5. Commit to version control:
   ```bash
   git add complete_email_templates.json
   git commit -m "Import: Add new email templates from CSV"
   git push
   ```

---

## CSV Format Specifications

### General Rules

| Aspect | Requirement |
|--------|-------------|
| **Encoding** | UTF-8 (to support French accents) |
| **Separators** | Comma `,` or semicolon `;` (auto-detected) |
| **Header row** | Required, case-insensitive |
| **Line breaks** | Unix `\n` or Windows `\r\n` both supported |
| **Quotes** | Use `"` to wrap fields containing commas or line breaks |
| **Escaped quotes** | Use `""` (double quotes) to include a quote in text |

### Variables CSV Schema

```csv
name,description_fr,description_en,format,example_fr,example_en
```

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `name` | Yes | Text | Variable name | `ClientName` |
| `description_fr` | Yes | Text | French description | `Nom du client` |
| `description_en` | Yes | Text | English description | `Client name` |
| `format` | Yes | Enum | `text`, `number`, `date`, or `time` | `text` |
| `example_fr` | Recommended | Text | French example value | `Marie Dubois` |
| `example_en` | Recommended | Text | English example value | `Mary Jones` |

Notes:
- The admin console and app now prefer per-language examples when present: FR uses `example_fr`, EN uses `example_en`.
- A legacy `example` column is still accepted as a fallback if per-language columns are not provided.

**Alternative column names accepted:**
- `name`: also `variable`, `var`, `key`
- `description_fr`: also `desc_fr`, `descriptionfr`
- `description_en`: also `desc_en`, `descriptionen`
- `example_fr`: also `exemple_fr`, `exemple`
- `example_en`: exact match only
- `example`: used as fallback when per-language examples are missing

### Templates CSV Schema

```csv
id,category,title_fr,title_en,description_fr,description_en,subject_fr,subject_en,body_fr,body_en,variables
```

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `id` | Yes | Text | Unique ID (a-z, 0-9, _) | `devis_approbation` |
| `category` | Yes | Text | Template category | `Devis et approbations` |
| `title_fr` | Yes | Text | French title | `Demande d'approbation` |
| `title_en` | Yes | Text | English title | `Approval request` |
| `description_fr` | Yes | Text | French description | `Demander l'approbation...` |
| `description_en` | Yes | Text | English description | `Request approval...` |
| `subject_fr` | Yes | Text | French subject | `Approbation - <<Project>>` |
| `subject_en` | Yes | Text | English subject | `Approval - <<Project>>` |
| `body_fr` | Yes | Text | French body (multi-line OK) | `Bonjour <<Name>>,...` |
| `body_en` | Yes | Text | English body (multi-line OK) | `Hello <<Name>>,...` |
| `variables` | Optional | Text | Semicolon-separated list | `Name;Project;Date` |

**Alternative column names accepted:**
- `id`: also `ID`, `slug`, `key`
- `category`: also `categorie`, `cat`
- `title_fr`: also `titre_fr`, `titleFR`, `titleFr`
- (Similar patterns for other localized fields)

### Variable Placeholders in Templates

Always use the format: `<<VariableName>>`

✅ **Correct:**
- `<<ClientName>>`
- `<<ProjectDeadline>>`
- `<<Budget>>`

❌ **Incorrect:**
- `<ClientName>` (single brackets)
- `{ClientName}` (curly braces)
- `$ClientName` (dollar sign)
- `[ClientName]` (square brackets)

---

## Validation and Troubleshooting

### Common Import Errors

#### "Aucune variable détectée dans le fichier"

**Cause:** CSV format not recognized or header row incorrect

**Solutions:**
1. Verify header row exactly matches: `name,description_fr,description_en,format,example`
2. Check file is actually CSV (not Excel .xlsx)
3. Ensure at least one data row exists
4. Try changing separator from `;` to `,` or vice versa

#### "Aucun template détecté dans le fichier"

**Cause:** CSV format not recognized or required columns missing

**Solutions:**
1. Verify all required columns present
2. Check for typos in header row
3. Ensure file encoding is UTF-8
4. Remove any empty rows at the beginning

#### "Format non reconnu ou contenu invalide"

**Cause:** CSV parsing failed due to malformed data

**Solutions:**
1. Check for unmatched quotes in fields
2. Look for special characters breaking the format
3. Ensure line breaks inside fields are wrapped in quotes
4. Try opening in text editor to inspect raw format

#### Variables show incorrectly or descriptions missing

**Cause:** Column mapping issue or encoding problem

**Solutions:**
1. Check encoding is UTF-8 (not ANSI or ISO-8859-1)
2. Verify column order matches header
3. Look for hidden characters or BOM (Byte Order Mark)
4. Re-save file explicitly as UTF-8 in your text editor

#### Templates imported but variables not auto-detected

**Cause:** Placeholder syntax incorrect or variables column malformed

**Solutions:**
1. Verify `<<VarName>>` syntax (double angle brackets)
2. Check variables column uses semicolons: `Var1;Var2;Var3`
3. Ensure variable names match exactly between files
4. Try manually listing variables in the `variables` column

---

## Best Practices

### File Organization

📁 **Folder structure:**
```
your-project/
├── imports/
│   ├── 2025-11-01-variables.csv
│   ├── 2025-11-01-templates.csv
│   ├── archive/
│   │   ├── 2025-10-15-variables.csv
│   │   └── 2025-10-15-templates.csv
│   └── README.md
├── backups/
│   ├── backup-2025-11-01.json
│   └── backup-2025-10-15.json
└── complete_email_templates.json
```

### Naming Conventions

**Variable names:**
- Use PascalCase: `ClientName`, `ProjectDeadline`
- Be descriptive: `DeliveryDate` better than `Date1`
- Consistent language: all English or bilingual markers

**Template IDs:**
- Use snake_case: `devis_approbation`, `livraison_retard`
- Include category hint: `general_welcome`, `quote_approval`
- Keep short but meaningful: `doc_format_request` not `d_f_r`

### Content Guidelines

**Descriptions:**
- Keep concise (1-2 sentences)
- Explain when to use the template
- Avoid redundancy with title

**Email bodies:**
- Use clear paragraphs (blank lines between)
- Include all necessary placeholders
- Maintain professional tone in both languages
- Match formality level FR ↔ EN

**Variable examples:**
- Provide realistic examples
- Use proper formatting (dates, currency, etc.)
- Match the format type specified
- Examples serve as default values when testing templates
- Can be referenced when generating template content with AI

**Using Variables in Templates:**
- Reference variable example values to create realistic template previews
- Example: If `ClientName` has example "Marie Dubois", a template body might naturally use that context
- Variables with date examples (2025-12-31) help maintain consistent date formatting
- Currency examples (50 000 $) show proper localization (space before $, French Canadian style)

### Version Control

**Always commit:**
1. Source CSV files (`imports/*.csv`)
2. Final exported JSON (`complete_email_templates.json`)
3. Backup files before major imports

**Git commit messages:**
```bash
git commit -m "Import: Add 15 new client communication templates"
git commit -m "Variables: Update descriptions for clarity (FR/EN)"
git commit -m "Fix: Correct formatting in delivery delay templates"
```

### Testing Checklist

Before finalizing import:

- [ ] All templates appear in sidebar
- [ ] French content displays correctly
- [ ] English content displays correctly
- [ ] Variables are highlighted in template preview
- [ ] Categories match intended groupings
- [ ] No warnings in warnings panel (or all understood/acceptable)
- [ ] Test search finds templates by keywords
- [ ] Export JSON and verify file size is reasonable
- [ ] Backup created and stored safely

---

## AI-Assisted Content Generation

When using AI (ChatGPT, Claude, etc.) to generate or complete CSV content, use the detailed prompt template provided in:

**`docs/AI-PROMPT-TEMPLATE.md`**

This template ensures the AI:
- Respects the exact CSV format
- Generates bilingual content (FR/EN)
- Uses correct variable placeholder syntax
- Preserves specified columns/data
- Maintains professional tone and quality

See the separate document for the full reusable prompt.

---

## Quick Reference

### Import Checklist

**Before import:**
- [ ] CSV files prepared and validated
- [ ] UTF-8 encoding confirmed
- [ ] Backup of current data created
- [ ] Admin console accessible

**During import:**
- [ ] Import variables first
- [ ] Then import templates
- [ ] Review notifications for errors
- [ ] Check warnings panel

**After import:**
- [ ] Verify imported content
- [ ] Test in main application
- [ ] Export final JSON
- [ ] Commit to version control
- [ ] Update documentation if needed

### Support Resources

- **Import examples:** `imports/` folder
- **Import guide:** `imports/README.md`
- **Developer guide:** `docs/DEVELOPER-GUIDE.md`
- **Offline help:** `help.html` (admin console features)
- **Main README:** `README.md` (project overview)

---

## Appendix: Example Workflows

### Workflow A: Small Update (1-5 Templates)

1. Edit existing `complete_email_templates.json` manually
2. Test in main app
3. Commit changes

**Time:** 5-15 minutes

### Workflow B: Medium Import (5-20 Templates)

1. Create templates CSV in Excel/Sheets
2. Export as CSV (UTF-8)
3. Import via admin console
4. Review and adjust
5. Export JSON and commit

**Time:** 20-40 minutes

### Workflow C: Large Import with AI (20+ Templates)

1. Prepare template structure in spreadsheet
2. Use AI prompt to generate bilingual content
3. Review and refine AI output
4. Import variables CSV
5. Import templates CSV
6. Thorough testing
7. Export and commit

**Time:** 1-2 hours

### Workflow D: Bilingual Content Translation

1. Prepare templates with FR content only
2. Use AI to generate EN translations
3. Review translations for accuracy
4. Import completed CSV
5. Verify both languages
6. Export and commit

**Time:** 30-60 minutes

---

**Document Version:** 1.0  
**Last Reviewed:** November 4, 2025  
**Next Review:** Quarterly or after major feature updates
