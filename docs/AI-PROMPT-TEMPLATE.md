# AI Prompt Template for CSV Content Generation

**Purpose:** Use this detailed prompt when asking AI assistants (ChatGPT, Claude, etc.) to generate, complete, or translate CSV data for the Email Assistant application.

**Last Updated:** November 4, 2025

---

## Quick Start

1. Copy the relevant prompt below (Variables or Templates)
2. Customize the bracketed sections `[like this]` with your specific requirements
3. **Attach your CSV file** to the AI conversation (recommended) OR paste CSV content in the prompt
4. Paste the customized prompt to your AI assistant
5. Review and validate the AI's output before importing

### How to Attach CSV Files

**Method 1: File Attachment (Recommended)**
- Click the attachment/paperclip icon in ChatGPT/Claude
- Select your CSV file (e.g., `my-variables.csv`)
- In the prompt, update the "MY CSV DATA" section to: `See attached file: filename.csv`
- **Advantages:** No formatting issues, works with large files, preserves encoding

**Method 2: Paste CSV Content**
- Open CSV in text editor (VS Code, Notepad++)
- Copy entire contents
- Paste where it says `[IF PROVIDING PARTIAL CSV - PASTE IT HERE]`
- **When to use:** Small files (< 50 rows), quick edits, showing samples only

---

## Prompt Template: Variables CSV

```
I need you to help me generate/complete a CSV file for email template variables. This file will be imported into a system that requires EXACT formatting.

### STRICT REQUIREMENTS:

**Output Format:**
- Return ONLY valid CSV content
- Use comma (,) as separator
- Header row MUST be exactly: name,description_fr,description_en,format,example
- UTF-8 encoding (include French accents: é, à, ç, etc.)
- No markdown code blocks, no explanations outside the CSV
- No extra blank lines between rows

**Column Specifications:**

1. **name** (required):
   - Variable name in PascalCase (e.g., ClientName, ProjectDeadline, QuoteAmount)
   - Only alphanumeric characters (A-Z, a-z, 0-9)
   - No spaces, no special characters, no underscores
   - Must be unique across all variables

2. **description_fr** (required):
   - French description of the variable (1-2 sentences)
   - Professional tone, clear and concise
   - Use proper French grammar and accents
   - If field contains commas, wrap entire field in double quotes

3. **description_en** (required):
   - English translation of description_fr
   - Maintain same meaning and tone
   - Professional business English
   - If field contains commas, wrap entire field in double quotes

4. **format** (required):
   - MUST be one of: text, number, date, time
   - Lowercase only
   - Use "text" for most fields including currency, names, addresses
   - Use "date" for calendar dates (YYYY-MM-DD format in examples)
   - Use "time" for time of day (HH:MM format in examples)
   - Use "number" only for pure numeric values

5. **example** (required):
   - Realistic example value that matches the format
   - For dates: use YYYY-MM-DD format (e.g., 2025-12-31)
   - For currency: include currency symbol (e.g., "50 000 $")
   - For names: use realistic French/Quebec names
   - If field contains commas or quotes, wrap in double quotes and escape quotes as ""

**Content Guidelines:**
- Variables should be reusable across multiple email templates
- Prioritize common business communication needs
- Consider bilingual context (French/English Canadian business environment)
- Examples should be realistic but not real personal data

[OPTIONAL - DELETE IF NOT APPLICABLE]
**Columns/Data to Preserve:**
- Do NOT modify the [COLUMN_NAME] column
- Keep existing values in [COLUMN_NAME] unchanged
- Only fill in empty/missing cells in [COLUMN_NAME]
- Use values from [COLUMN_NAME] as context/reference when generating content for other columns

[OPTIONAL - DELETE IF NOT APPLICABLE]
**Use Existing Data as Context:**
- Review the existing data in [COLUMN_NAME] before generating new content
- Base your generated content on the style, tone, and patterns found in [COLUMN_NAME]
- Ensure consistency with the existing [COLUMN_NAME] values
- Match the level of detail and formality present in [COLUMN_NAME]

[OPTIONAL - DELETE IF NOT APPLICABLE]
**Generation Requirements:**
- Generate [NUMBER] new variables
- Focus on [DOMAIN/TOPIC] (e.g., "project management", "client communications", "invoicing")
- Include variables for: [SPECIFIC ITEMS] (e.g., "dates, amounts, contact info")

### MY CSV DATA:

[IF ATTACHING FILE - Replace this section with: "See attached file: filename.csv"]
[IF PASTING CONTENT - Paste your CSV content below this line]
[IF GENERATING NEW - Delete this entire section]

### DELIVERABLE:

Return the complete CSV file with:
1. Exact header row: name,description_fr,description_en,format,example
2. All data rows properly formatted
3. No explanatory text before or after the CSV
4. Ready to save as .csv file with UTF-8 encoding

Please generate the CSV now.
```

---

## Prompt Template: Templates CSV

```
I need you to help me generate/complete a CSV file for bilingual email templates (French and English). This file will be imported into a system that requires EXACT formatting.

### STRICT REQUIREMENTS:

**Output Format:**
- Return ONLY valid CSV content
- Use comma (,) as separator
- Header row MUST be exactly: id,category,title_fr,title_en,description_fr,description_en,subject_fr,subject_en,body_fr,body_en,variables
- UTF-8 encoding (include French accents: é, à, ç, etc.)
- No markdown code blocks, no explanations outside the CSV
- No extra blank lines between rows

**Column Specifications:**

1. **id** (required):
   - Unique identifier in snake_case (e.g., devis_approbation, livraison_retard)
   - Only lowercase letters (a-z), numbers (0-9), and underscores (_)
   - No spaces, no special characters, no uppercase
   - Must be unique across all templates

2. **category** (required):
   - Template category in French
   - Examples: "Devis et approbations", "Délai et livraison", "Communications générales"
   - Use existing categories when possible: [LIST YOUR CATEGORIES IF KNOWN]

3. **title_fr** (required):
   - French title (3-8 words)
   - Professional, clear, descriptive
   - Use proper French grammar and accents

4. **title_en** (required):
   - English translation of title_fr
   - Maintain same meaning and tone
   - Professional business English

5. **description_fr** (required):
   - French description explaining when/why to use this template (1-2 sentences)
   - Professional tone, informative
   - Wrap in double quotes if contains commas

6. **description_en** (required):
   - English translation of description_fr
   - Maintain same meaning and tone
   - Wrap in double quotes if contains commas

7. **subject_fr** (required):
   - French email subject line
   - Concise (5-10 words typical)
   - May include variable placeholders: <<VariableName>>
   - Wrap in double quotes if contains commas

8. **subject_en** (required):
   - English email subject line
   - Translation of subject_fr
   - Use same variable placeholders as French version
   - Wrap in double quotes if contains commas

9. **body_fr** (required):
   - French email body content
   - Multiple paragraphs allowed (separate with blank lines)
   - Use variable placeholders: <<VariableName>>
   - Professional business tone, appropriate formality
   - MUST wrap entire field in double quotes (due to line breaks)
   - Use "" to escape any quotes within the text
   - Keep line breaks for readability

10. **body_en** (required):
    - English email body content
    - Translation of body_fr
    - Use same variable placeholders as French version
    - Match formality level of French version
    - MUST wrap entire field in double quotes (due to line breaks)
    - Use "" to escape any quotes within the text
    - Keep line breaks for readability

11. **variables** (optional):
    - Semicolon-separated list of variable names used in subject/body
    - Example: ClientName;ProjectName;DeadlineDate
    - Must match variable placeholders in subject_fr, subject_en, body_fr, body_en
    - Leave empty if template uses no variables

**Variable Placeholder Syntax:**
- ALWAYS use: <<VariableName>>
- Double angle brackets: << and >>
- PascalCase variable name
- Examples: <<ClientName>>, <<ProjectDeadline>>, <<Amount>>
- NEVER use: {VarName}, $VarName, [VarName], or <VarName>

**Content Quality Guidelines:**

*French Content:*
- Use proper French Canadian business tone
- Appropriate formality (vouvoiement when professional)
- Correct grammar, accents, and punctuation
- Natural, fluent French (not literal translation)

*English Content:*
- Professional Canadian business English
- Match formality level of French version
- Natural phrasing (not word-for-word translation)
- Culturally appropriate for Canadian context

*Email Structure:*
- Start with appropriate greeting (Bonjour/Hello)
- Clear, professional body paragraphs
- Include closing salutation (Cordialement/Best regards)
- Consider signature placeholders: <<YourName>>, <<YourTitle>>

[OPTIONAL - DELETE IF NOT APPLICABLE]
**Columns/Data to Preserve:**
- Do NOT modify: [COLUMN_NAMES]
- Keep existing values in: [COLUMN_NAMES]
- Only fill in empty/missing cells
- Use values from [COLUMN_NAMES] as context/reference when generating new content

[OPTIONAL - DELETE IF NOT APPLICABLE]
**Use Existing Data as Context:**
- Review the existing data in [COLUMN_NAME] before generating new content
- Base your generated content on the style, tone, and patterns found in [COLUMN_NAME]
- Ensure consistency with the existing [COLUMN_NAME] values
- Match the level of detail and formality present in [COLUMN_NAME]
- Example: If generating body_en, use body_fr as the source to translate/adapt

[OPTIONAL - DELETE IF NOT APPLICABLE]
**Generation Requirements:**
- Generate [NUMBER] new templates
- Focus on [DOMAIN/TOPIC] (e.g., "client communications", "project updates", "invoicing")
- Template types needed: [LIST] (e.g., "approval requests", "delay notifications", "follow-ups")
- Target audience: [DESCRIPTION] (e.g., "B2B clients", "internal team", "vendors")

[OPTIONAL - DELETE IF NOT APPLICABLE]
**Available Variables:**
You may use the following variables in your templates. When writing example content, you may reference these example values as realistic placeholders:

[LIST VARIABLE NAMES, DESCRIPTIONS, AND EXAMPLE VALUES]
Example format:
- ClientName: Full name of the client (example: Marie Dubois)
- ProjectName: Name of the project (example: Site web corporatif)
- DeadlineDate: Project deadline, format YYYY-MM-DD (example: 2025-12-31)
- QuoteAmount: Quote amount with currency (example: 50 000 $)
- YourName: Sender's full name (example: Jean Tremblay)
- YourTitle: Sender's job title (example: Chargé de projet)

### MY CSV DATA:

[IF ATTACHING FILE - Replace this section with: "See attached file: filename.csv"]
[IF PASTING CONTENT - Paste your CSV content below this line]
[IF GENERATING NEW - Delete this entire section]

### DELIVERABLE:

Return the complete CSV file with:
1. Exact header row
2. All data rows properly formatted
3. Multi-line body fields wrapped in quotes
4. Variables column with semicolon-separated lists
5. No explanatory text before or after the CSV
6. Ready to save as .csv file with UTF-8 encoding

Please generate the CSV now.
```

---

## Usage Examples

### Example 1: Generate 5 New Variables for Project Management

**Customized Prompt:**
```
[Use Variables prompt template above]

**Generation Requirements:**
- Generate 5 new variables
- Focus on project management context
- Include variables for: project phases, milestones, team roles, deliverables

Please generate the CSV now.
```

### Example 2: Complete Missing English Descriptions

**Customized Prompt:**
```
[Use Variables prompt template above]

**Columns/Data to Preserve:**
- Do NOT modify the name, description_fr, format, or example columns
- Keep all existing values in those columns unchanged
- Only fill in the empty cells in the description_en column with accurate English translations

### MY CSV DATA:

name,description_fr,description_en,format,example
ClientName,Nom complet du client,,text,Marie Dubois
ProjectPhase,Phase actuelle du projet,,text,Conception
Budget,Budget alloué au projet,,text,"75 000 $"

Please generate the CSV now.
```

### Example 3: Translate French Templates to English

**Customized Prompt:**
```
[Use Templates prompt template above]

**Columns/Data to Preserve:**
- Do NOT modify: id, category, title_fr, description_fr, subject_fr, body_fr, variables
- Only fill in: title_en, description_en, subject_en, body_en
- Ensure English versions use the same variable placeholders as French versions

**Use Existing Data as Context:**
- Review the French content (title_fr, description_fr, subject_fr, body_fr) carefully
- Base your English translations on the exact meaning and tone of the French versions
- Maintain the same level of formality (vouvoiement → professional English)
- Preserve the same structure and paragraph breaks in body_en as in body_fr
- Match the conciseness of title_fr in title_en

### MY CSV DATA:

[Paste your partial CSV with only French content OR attach file]

Please generate the CSV now.
```

### Example 3b: Generate Content Based on Existing Patterns

**Customized Prompt:**
```
[Use Templates prompt template above]

**Columns/Data to Preserve:**
- Do NOT modify: id, category, variables
- Keep these columns exactly as provided

**Use Existing Data as Context:**
- I have provided 3 existing complete templates as examples (rows 1-3)
- Study the style, tone, and structure of these example templates carefully
- Use them as a model for generating the new templates (rows 4-10)
- Match the greeting style (e.g., "Bonjour <<ClientName>>," format)
- Follow the same paragraph structure and length
- Maintain consistent formality level across all templates
- Use similar closing phrases (e.g., "N'hésitez pas à..." pattern)

**Generation Requirements:**
- Generate 7 NEW templates (in addition to the 3 examples provided)
- Use the same category structure as the examples
- Follow the template naming pattern shown in the id column

### MY CSV DATA:

See attached file: templates-with-examples.csv
(First 3 rows are complete examples, rows 4-10 need content generated)

Please generate the CSV now.
```

### Example 4: Generate New Client Communication Templates

**Customized Prompt:**
```
[Use Templates prompt template above]

**Generation Requirements:**
- Generate 8 new templates
- Focus on client communications for a consulting/professional services firm
- Template types needed: project kickoff, status update, deliverable submission, feedback request, invoice notification, project completion, contract renewal, service upgrade
- Target audience: B2B professional clients
- Tone: Professional, courteous, collaborative

**Available Variables:**
You may use the following variables in your templates. When writing example content, you may reference these example values as realistic placeholders:

- ClientName: Full name of the client (example: Marie Dubois)
- CompanyName: Name of the client's company (example: Innovations Boréales Inc.)
- ProjectName: Name of the project (example: Refonte du site web)
- ConsultantName: Name of the consultant/account manager (example: Jean Tremblay)
- DeliveryDate: Expected delivery date, format YYYY-MM-DD (example: 2025-12-15)
- InvoiceAmount: Invoice total amount with currency (example: 15 750 $)
- ContractEndDate: Contract expiration date, format YYYY-MM-DD (example: 2026-03-31)
- YourName: Sender's full name (example: Sophie Martin)
- YourTitle: Sender's job title (example: Directrice de projet)

Please generate the CSV now.
```

---

## Quality Control Checklist

After receiving AI-generated content, ALWAYS verify:

### Format Validation
- [ ] Valid CSV structure (no malformed rows)
- [ ] Header row matches exactly
- [ ] All required columns present
- [ ] No extra columns (unless intentional)
- [ ] Proper quote wrapping for multi-line fields
- [ ] Consistent use of commas as separators

### Content Quality
- [ ] Variable names use PascalCase (no spaces, underscores)
- [ ] Template IDs use snake_case (lowercase only)
- [ ] French content has proper accents (é, à, ç, etc.)
- [ ] English translations are accurate and natural
- [ ] Professional tone maintained throughout
- [ ] No placeholder text like "[INSERT NAME]" or "TODO"

### Variable Placeholders
- [ ] All placeholders use <<VariableName>> syntax
- [ ] Same variables used in both FR and EN versions
- [ ] Variables column lists all placeholders (semicolon-separated)
- [ ] Variable names match between templates and variables CSV

### Business Logic
- [ ] Categories make sense and are consistent
- [ ] Descriptions explain when to use each template
- [ ] Email bodies have proper structure (greeting, body, closing)
- [ ] Examples are realistic and appropriate
- [ ] Format types (text/number/date/time) are correct

### Technical Requirements
- [ ] No BOM (Byte Order Mark) at start of file
- [ ] UTF-8 encoding (test French accents)
- [ ] Unix (LF) or Windows (CRLF) line endings acceptable
- [ ] File size reasonable (< 1MB for typical imports)

---

## Common AI Mistakes and How to Fix Them

### Mistake 1: Using Wrong Quote Escaping

**AI Output (WRONG):**
```csv
body_en,"She said \"hello\" to the client"
```

**Corrected:**
```csv
body_en,"She said ""hello"" to the client"
```

**Fix:** Replace `\"` with `""` (double-double-quotes)

---

### Mistake 2: Inconsistent Variable Names

**AI Output (WRONG):**
```csv
subject_fr,Bienvenue <<ClientName>>
subject_en,Welcome <<Client_Name>>
variables,ClientName;Client_Name
```

**Corrected:**
```csv
subject_fr,Bienvenue <<ClientName>>
subject_en,Welcome <<ClientName>>
variables,ClientName
```

**Fix:** Ensure exact same variable name (case-sensitive) in all languages

---

### Mistake 3: Line Breaks Not Wrapped in Quotes

**AI Output (WRONG):**
```csv
body_fr,Bonjour,

Nous vous remercions.
```

**Corrected:**
```csv
body_fr,"Bonjour,

Nous vous remercions."
```

**Fix:** Wrap entire multi-line field in double quotes

---

### Mistake 4: Wrong Variable Placeholder Syntax

**AI Output (WRONG):**
```csv
subject_fr,Projet {ProjectName} - Mise à jour
subject_en,Project $ProjectName - Update
```

**Corrected:**
```csv
subject_fr,Projet <<ProjectName>> - Mise à jour
subject_en,Project <<ProjectName>> - Update
```

**Fix:** Use `<<VarName>>` syntax consistently

---

### Mistake 5: Including Markdown Code Blocks

**AI Output (WRONG):**
````
Here's your CSV:

```csv
id,category,title_fr
test_template,Test,Template test
```

I hope this helps!
````

**Corrected:**
```csv
id,category,title_fr
test_template,Test,Template test
```

**Fix:** Extract only the CSV content, remove all markdown and explanations

---

## Advanced Tips

### Tip 1: Batch Processing

For large datasets, split into smaller chunks:
- Process 10-20 templates at a time
- Review each batch before merging
- Easier to spot and fix errors

### Tip 2: Iterative Refinement

Start with structure, then refine:
1. First pass: Generate IDs, categories, titles
2. Second pass: Add descriptions
3. Third pass: Complete email bodies
4. Final pass: Polish tone and translations

### Tip 3: Providing Context

Give the AI examples from your existing templates and variable definitions:
- Include 2-3 existing templates as reference
- Provide your complete variables list with examples (from variables-library.csv)
- Specify your preferred tone/style
- Mention your industry/domain

**Example of providing variable context:**
```
Here are the variables available in our system with their example values:

name,description_fr,description_en,format,example
ClientName,Nom complet du client,Full client name,text,Marie Dubois
ProjectName,Nom du projet,Project name,text,Refonte du site web
QuoteAmount,Montant du devis,Quote amount,text,"50 000 $"
DeadlineDate,Date limite,Deadline date,date,2025-12-31

Please use ONLY these variables in your generated templates, and reference the example values when creating realistic content.
```

### Tip 4: Translation Quality

For critical content:
- Use AI for first draft
- Review by native speakers
- Pay attention to cultural nuances
- Test both languages in actual emails

### Tip 5: Variable Library First

Always generate/complete variables CSV before templates:
- Gives AI clear list of available variables
- Ensures consistent variable naming
- Reduces errors in template generation

### Tip 6: Use Existing Content as Patterns

Provide 2-3 complete examples in your CSV for AI to follow:
- AI can learn your preferred style and tone
- Ensures consistency across all generated content
- Shows desired length and structure
- Demonstrates greeting/closing patterns

**Example approach:**
1. Manually create 2-3 high-quality templates
2. Include them in your CSV (rows 1-3)
3. Ask AI to generate 10 more templates (rows 4-13)
4. Specify: "Use rows 1-3 as style/tone examples"
5. Result: All 10 new templates match your quality standard

---

## Troubleshooting

### Problem: AI Keeps Adding Explanations

**Solution:** Add to prompt:
```
CRITICAL: Return ONLY the CSV content. No explanations, no markdown, no code blocks. 
Start with the header row and end with the last data row. Nothing else.
```

### Problem: French Accents Display as �

**Solution:**
1. Ensure prompt specifies UTF-8 encoding
2. When saving AI output, explicitly choose UTF-8
3. Test file in text editor that shows encoding

### Problem: AI Changes Columns I Asked to Preserve

**Solution:** Make preservation requirement more explicit:
```
ABSOLUTE REQUIREMENT - DO NOT MODIFY:
The following columns must remain EXACTLY as provided:
- [column1]: Keep every single value unchanged
- [column2]: Do not edit, translate, or improve these values

Only modify/fill: [column3], [column4]
```

### Problem: Inconsistent Formatting Across Rows

**Solution:** Request consistency in prompt:
```
**Consistency Requirements:**
- All templates must follow the same structure
- French and English versions must mirror each other
- Maintain consistent formality level across all templates
- Use the same greeting/closing patterns
```

### Problem: Variable Names Don't Match

**Solution:** Provide explicit variable list:
```
**Variable Naming Rules:**
- Use EXACTLY these variable names (case-sensitive):
  - ClientName (not Client_Name, not clientName)
  - ProjectDeadline (not ProjectDeadLine, not Deadline)
  - QuoteAmount (not QuoteValue, not Amount)
```

---

## Version History

- **v1.0** (2025-11-04): Initial template creation
  - Variables CSV prompt
  - Templates CSV prompt
  - Quality control checklist
  - Common mistakes guide

---

## Support

If you encounter issues with AI-generated content:

1. Review this document's quality control checklist
2. Check the main import guide: `docs/ADMIN-CSV-IMPORT-GUIDE.md`
3. Examine example files: `imports/variables-library.csv`, `imports/template-example.csv`
4. Test import with a single-row CSV to isolate problems
5. Consult main project README: `README.md`

---

**Remember:** AI is a powerful tool, but always review and validate its output before importing into production systems. The quality of your prompt directly impacts the quality of the results.
