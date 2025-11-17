# CSV Import Guide

This folder contains template CSV files for importing email templates and variables into the Email Assistant.

## Files

### 1. `variables-library.csv`
Contains variable definitions with French and English descriptions.

**Columns:**
- `name` - Variable name (e.g., ClientName, ProjectName)
- `description_fr` - French description
- `description_en` - English description
- `format` - Data format: `text`, `number`, `date`, or `time`
- `example` - Example value

### 2. `template-example.csv`
Contains email template definitions with bilingual content.

**Columns:**
- `id` - Unique template identifier (lowercase, alphanumeric + underscore)
- `category` - Template category
- `title_fr` / `title_en` - French and English titles
- `description_fr` / `description_en` - French and English descriptions
- `subject_fr` / `subject_en` - French and English email subjects
- `body_fr` / `body_en` - French and English email bodies
- `variables` - Semicolon-separated list of variables (e.g., `ClientName;ProjectName;DeadlineDate`)

## Import Process

### Recommended Order:

1. **Import Variables First** (establishes all variable definitions)
   - Open http://localhost:5173/admin.html
   - Click the **"Variables"** tab
   - Click **"Importer variables (CSV)"**
   - Select `variables-library.csv`
   - Review the confirmation message

2. **Import Templates Second** (references existing variables)
   - Stay in admin.html or click the **"Templates"** tab
   - Click **"Import (lot)"** button
   - Select `template-example.csv`
   - Review the confirmation message

3. **Export Final JSON**
   - Click **"Exporter JSON"** button
   - Save the generated `complete_email_templates.json`
   - Replace the file in your project root
   - Commit to version control

## CSV Format Tips

✅ **Line breaks in text**: Wrap fields containing line breaks in double quotes
✅ **Separators**: Use comma (`,`) or semicolon (`;`) - auto-detected
✅ **Variables list**: Use semicolon to separate multiple variables: `Var1;Var2;Var3`
✅ **Placeholders in templates**: Use `<<VariableName>>` syntax
✅ **Encoding**: Save as UTF-8 for special characters (é, à, ç, etc.)

## Example Variable CSV

```csv
name,description_fr,description_en,format,example
ClientName,Nom du client,Client name,text,Marie Dubois
ProjectDeadline,Date limite du projet,Project deadline,date,2025-12-31
Budget,Budget total,Total budget,text,"50 000 $"
```

## Example Template CSV

```csv
id,category,title_fr,title_en,subject_fr,subject_en,body_fr,body_en,variables
welcome,General,Bienvenue,Welcome,Bienvenue <<ClientName>>,Welcome <<ClientName>>,"Bonjour <<ClientName>>,

Nous sommes ravis...","Hello <<ClientName>>,

We are delighted...",ClientName
```

## Troubleshooting

**"Aucune variable détectée"**
- Verify header row matches: `name,description_fr,description_en,format,example`
- Check that file is saved as CSV (not Excel format)

**"Aucun template détecté"**
- Verify all required columns are present
- Check for proper CSV formatting (quotes, separators)

**Variables not showing in templates**
- Ensure variable names match exactly between the two files
- Check that `<<VariableName>>` syntax is used in template bodies
- Verify variables are listed in the `variables` column

**Encoding issues (accents display incorrectly)**
- Save CSV files as UTF-8 encoding
- Use a text editor that supports UTF-8 (VS Code, Sublime, etc.)

## Support

For more details, see:
- `README.md` - Main project documentation
- `docs/DEVELOPER-GUIDE.md` - Technical implementation details
- `help.html` - Offline help for the admin console
