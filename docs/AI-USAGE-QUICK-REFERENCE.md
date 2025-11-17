# AI Assistant - Quick Reference Card

**Quick guide for using AI to generate/complete CSV files for Email Assistant**

---

## 🎯 Common Scenarios

### Scenario 1: Fill Missing English Translations

**You have:** Variables CSV with French content only  
**You need:** English descriptions added

**Steps:**
1. Open `docs/AI-PROMPT-TEMPLATE.md`
2. Copy the **Variables CSV** prompt
3. Customize:
   ```
   **Columns/Data to Preserve:**
   - Do NOT modify: name, description_fr, format, example
   - Only fill in: description_en
   ```
4. **Attach your CSV file** to ChatGPT/Claude
5. Update prompt: `### MY CSV DATA: See attached file: my-variables.csv`
6. Submit and review output

---

### Scenario 2: Generate New Templates with Existing Variables

**You have:** Complete variables-library.csv  
**You need:** 10 new email templates that use those variables

**Steps:**
1. Copy the **Templates CSV** prompt
2. Customize:
   ```
   **Generation Requirements:**
   - Generate 10 new templates
   - Focus on: client communications
   - Template types: project updates, deliverables, approvals
   
   **Available Variables:**
   [Paste your complete variables list with examples here]
   ```
3. **Attach variables-library.csv** as reference
4. Specify: `Please use ONLY the variables from the attached file`
5. Submit and review output

---

### Scenario 3: Translate Existing Templates

**You have:** Templates with French content only  
**You need:** English translations added

**Steps:**
1. Copy the **Templates CSV** prompt
2. Customize:
   ```
   **Columns/Data to Preserve:**
   - Do NOT modify: id, category, title_fr, description_fr, subject_fr, body_fr, variables
   - Only fill in: title_en, description_en, subject_en, body_en
   - Use same variable placeholders (<<VarName>>) in English versions
   ```
3. **Attach your templates CSV file**
4. Update prompt: `### MY CSV DATA: See attached file: templates-fr-only.csv`
5. Submit and review output

---

### Scenario 4: Create Both Variables and Templates from Scratch

**You have:** Project requirements  
**You need:** Complete variable library + templates

**Steps (2-step process):**

**Step 1 - Variables:**
1. Copy **Variables CSV** prompt
2. Customize generation requirements
3. Generate variables first
4. Review and save as `my-variables.csv`

**Step 2 - Templates:**
1. Copy **Templates CSV** prompt
2. **Attach `my-variables.csv`** from Step 1
3. Specify: `Use ONLY variables from attached file`
4. Generate templates
5. Review and save as `my-templates.csv`

---

## 📎 How to Attach Files

### ChatGPT
1. Click the **📎 paperclip icon** (bottom of input box)
2. Select your CSV file
3. In your prompt, reference: `See attached file: filename.csv`

### Claude
1. Click the **📎 attachment icon** (left of input box)
2. Select your CSV file
3. In your prompt, reference: `See attached file: filename.csv`

### File vs. Paste
| Method | When to Use | Advantages |
|--------|-------------|------------|
| **Attach File** | Any size file, preserves formatting | ✅ No copy/paste errors<br>✅ Handles large files<br>✅ Preserves UTF-8 encoding |
| **Paste Content** | Small files (< 50 rows), quick tests | ✅ Fast for small edits<br>✅ No file upload needed |

---

## 🔧 Quick Customization Guide

### In the Prompt Template, Replace These Brackets:

**Generation Requirements:**
- `[NUMBER]` → How many items to generate (e.g., "10", "25")
- `[DOMAIN/TOPIC]` → Your business area (e.g., "project management", "sales")
- `[LIST]` → Specific types needed (e.g., "welcome, follow-up, reminder")
- `[DESCRIPTION]` → Target audience (e.g., "B2B clients", "internal team")

**Preserve Columns:**
- `[COLUMN_NAME]` → Columns to keep unchanged (e.g., "name", "id")
- `[COLUMN_NAMES]` → Multiple columns (e.g., "id, category, title_fr")

**Categories (for templates):**
- `[LIST YOUR CATEGORIES IF KNOWN]` → Your existing categories
  - Example: "Devis et approbations, Délai et livraison, Documents et formats"

---

## ✅ Quality Check Before Importing

After AI generates your CSV:

### Quick Visual Check
- [ ] No markdown code blocks (```csv)
- [ ] No explanatory text (just pure CSV)
- [ ] French accents display correctly (é, à, ç)
- [ ] Multi-line fields wrapped in quotes

### Format Check
- [ ] Header row matches exactly
- [ ] Variable placeholders use `<<VarName>>` syntax
- [ ] Same variables in FR and EN versions
- [ ] Variable names in PascalCase (no underscores)
- [ ] Template IDs in snake_case (lowercase + underscores)

### Content Check
- [ ] Translations sound natural (not literal word-for-word)
- [ ] Professional tone maintained
- [ ] No placeholder text like "[INSERT NAME]"
- [ ] Examples are realistic

### Save and Test
1. Save AI output as `.csv` file with UTF-8 encoding
2. Import 1-2 rows first to test
3. Verify in admin console
4. Import full file if successful

---

## 🚀 Pro Tips

### Tip 1: Provide Variable Context
When generating templates, **always attach your variables-library.csv**:
```
**Available Variables:**
See attached variables-library.csv for the complete list with examples.
Please use ONLY these variables and reference their example values.
```

### Tip 2: Batch Processing
For 50+ templates, split into batches:
- Batch 1: Templates 1-20
- Batch 2: Templates 21-40
- Batch 3: Templates 41-60
Easier to review and fix errors!

### Tip 3: Iterative Refinement
Don't try to do everything at once:
1. **Pass 1:** Generate structure (IDs, categories, titles)
2. **Pass 2:** Add descriptions
3. **Pass 3:** Complete email bodies
4. **Pass 4:** Polish tone/translations

### Tip 4: Enforce Strictness
If AI keeps adding explanations, add this to your prompt:
```
CRITICAL: Return ONLY the CSV content. 
Start with the header row, end with the last data row.
No markdown, no code blocks, no explanations. Nothing else.
```

### Tip 5: Test Encoding
After saving AI output:
1. Open in text editor
2. Check encoding shows "UTF-8"
3. Verify French accents display correctly
4. Re-save as UTF-8 if needed

---

## 📚 Full Documentation

- **Detailed prompts:** `docs/AI-PROMPT-TEMPLATE.md`
- **Import guide:** `docs/ADMIN-CSV-IMPORT-GUIDE.md`
- **Example files:** `imports/variables-library.csv`, `imports/template-example.csv`
- **Import instructions:** `imports/README.md`

---

## 🎬 Complete Workflow Example

**Goal:** Create 15 client communication templates with variables

### Step 1: Define Variables (10 min)
```
Copy Variables prompt → Customize for "client communications" 
→ Generate 8-10 variables → Save as client-vars.csv
```

### Step 2: Import Variables (2 min)
```
Admin console → Variables tab → Import CSV → Review
```

### Step 3: Generate Templates (15 min)
```
Copy Templates prompt → Attach client-vars.csv 
→ Generate 15 templates → Save as client-templates.csv
```

### Step 4: Import Templates (5 min)
```
Admin console → Templates tab → Import CSV → Review warnings
```

### Step 5: Test & Export (5 min)
```
Main app → Test templates → Admin console → Export JSON → Commit
```

**Total time:** ~40 minutes for 15 professional bilingual templates!

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| AI adds markdown code blocks | Add "CRITICAL: Return ONLY CSV" to prompt |
| French accents show as � | Save file as UTF-8 encoding |
| Variables don't match FR/EN | Check variables column, ensure same names |
| AI changes preserved columns | Make "DO NOT MODIFY" more explicit |
| Multi-line bodies break CSV | Wrap in quotes, escape internal quotes as "" |

---

## 🎨 New Features (v8.1.0 - Nov 4, 2025)

### Custom Font Selectors
- **Font Family Selector:** Visual preview of each font in dropdown
- **Font Size Selector:** See actual size before selecting (14px-20px)
- Located in Rich Text Toolbar (top of email editor)

### Toast Notifications
- Non-intrusive notifications in bottom-right corner
- Auto-dismiss after 4-5 seconds
- Used for export confirmations (Word, Outlook, etc.)
- Three types: success ✅, error ❌, info ℹ️

### Enhanced Exports
- **All formats now preserve rich text formatting:**
  - Highlights (6 colors)
  - Text colors (8 colors)
  - Fonts (8 families)
  - Bold, italic, underline, strikethrough
- **EML exports** now include HTML (multipart/alternative)
- **Outlook integration** creates .eml files with full formatting
- **Toast guidance** for downloaded files (since browsers block auto-open)

### Variable Pill Formatting
- Select text + variables together
- Apply formatting (highlight, colors, etc.) to entire selection
- Pills and text formatted simultaneously

### Export Menu Icons
```
📄 PDF (with color preservation)
📗 Open in Word (with formatting)
📘 Download Word (.doc with formatting)
🌐 Export HTML (complete rich formatting)
✉️ Export EML (multipart with HTML)
📋 Copy HTML (rich text to clipboard)
📝 Copy Text (plain text only)
```

---

**Last Updated:** November 4, 2025  
**Version:** 1.1

````
