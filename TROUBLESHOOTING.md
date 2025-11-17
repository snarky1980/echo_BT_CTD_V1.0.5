# Troubleshooting: Missing Outlook Button & Variables Popup

## Current Status (Oct 15, 2025 - 07:16)

**Deployed**: Commit `2f67a9e` to gh-pages
**Source**: Main branch at commit `aeb29f1`  
**Features Expected**: 
1. "Ouvrir dans Outlook" / "Open in Outlook" button
2. Resizable Variables popup

## Where to Look

### 1. Outlook Button Location
**File**: `src/App.jsx` line 940-948  
**Code**:
```jsx
<Button 
  variant="ghost" 
  onClick={openInOutlook}
  className="text-gray-500 hover:text-emerald-600..."
  title={t.openInOutlookTitle}
>
  <Send className="h-4 w-4 mr-2" />
  {t.openInOutlook}
</Button>
```

**Where it renders**: Below the email editor, in the actions area, next to "Copy link" button  
**Conditional**: Only shows when `selectedTemplate` is truthy (line 868)

### 2. Variables Popup Button
**File**: `src/App.jsx` line 878-886  
**Code**:
```jsx
{selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
  <Button
    onClick={() => setShowVariablePopup(true)}
    className="bg-emerald-600 hover:bg-emerald-700..."
  >
    <Settings className="h-4 w-4 mr-2" />
    {t.variables}
  </Button>
)}
```

**Where it renders**: In the email editor header (top right with gear icon)  
**Conditional**: Only shows when template has variables

## Testing Steps

1. **Open the app**: https://snarky1980.github.io/email-assistant-v8-/
2. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. **Select a template**: Click ANY template from the left sidebar
4. **Look for**:
   - Actions area below the editor should have 2 buttons on the left: "Copier le lien" and "Ouvrir dans Outlook"
   - If the template has variables (most do), there should be a "Variables" button with gear icon in the editor header

## Debug Checks

### Check if JavaScript loaded:
Open browser console (F12) and run:
```javascript
document.querySelector('button')?.textContent
```

### Check for React errors:
Look in console for any red error messages

### Check if templates loaded:
Look for "Chargement des modèles..." or template names in the left sidebar

### Manual DOM check:
In console:
```javascript
// Check if Outlook button exists
Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Outlook'))

// Check all button texts
Array.from(document.querySelectorAll('button')).map(b => b.textContent)
```

## Local Testing

Preview the exact deployed build:
```bash
npm run build
npm run preview
# Open http://localhost:5175/email-assistant-v8-/
```

## Possible Issues

1. **CDN Cache**: GitHub Pages CDN can take 5-10 minutes to update
2. **Browser Cache**: Hard refresh or clear cache
3. **Template not selected**: Buttons only show when a template is selected
4. **JavaScript error**: Check browser console for errors
5. **Build issue**: Function names are minified but should still work

## Next Steps if Still Not Working

1. Take screenshot of what you see
2. Check browser console for errors
3. Try in incognito/private browsing mode
4. Try different browser
5. Check if you can see ANY buttons in the UI

---

# Module script MIME error (text/jsx)

If you see this in the browser console:

```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/jsx". Strict MIME type checking is enforced for module scripts per HTML spec.
```

Cause:
- You’re serving the project root `index.html` directly, which references `src/main.jsx` (meant for Vite dev). A plain static server serves `.jsx` as `text/jsx`, which browsers won’t execute as modules.

Fix options:
- Dev server: `npm run dev`
- Production preview: `npm run build && npm run preview`
- Plain static server: serve the built output, not the root

```bash
npm run build
npx http-server -p 5173 dist
# open http://localhost:5173
```

Notes:
- `index.html` is transformed by Vite during build; the script tag is rewritten to `/assets/main-<hash>.js` under `dist/`.
- Serving the repo root with a generic static server will load raw `.jsx` and trigger this MIME error.
