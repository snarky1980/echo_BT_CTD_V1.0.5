# Developer Guide - HighlightingEditor Component

## Overview

The `HighlightingEditor` is a sophisticated contentEditable-based component that provides:
- Real-time variable highlighting
- Template-based text editing
- Automatic variable substitution
- Plain text fallback

## Architecture

### Key Concepts

1. **ContentEditable with Overlays**: Uses a single contentEditable div with inline `<mark>` tags for highlighting
2. **Cursor Position Management**: Tracks cursor position in plain text offsets for reliability
3. **Debounced Updates**: 300ms debounce prevents highlighting from interrupting typing
4. **Template Deviation Detection**: Automatically switches to plain text when user edits away from template

### State Management

```javascript
const editableRef = useRef(null)                    // DOM reference
const lastValueRef = useRef(value)                  // Last known value
const isInternalUpdateRef = useRef(false)           // Prevent echo loops
const isUserTypingRef = useRef(false)               // Track active editing
const hasDeviatedFromTemplateRef = useRef(false)    // Track deviation
```

### Data Flow

```
User types → handleInput() → onChange() → parent updates value →
useEffect() detects change → debounce → buildHighlightedHTML() →
update innerHTML → restore cursor position
```

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | string | Yes | Current text content |
| `onChange` | function | Yes | Callback when text changes: `(e) => void` |
| `variables` | object | No | Variable name → value mapping |
| `placeholder` | string | No | Placeholder text when empty |
| `minHeight` | string | No | Minimum height (CSS value) |
| `templateOriginal` | string | No | Original template with `<<VarName>>` placeholders |
| `showHighlights` | boolean | No | (Currently unused - always highlights) |

## Key Functions

### saveCursorPosition()
Saves cursor position as plain text offset from start.

**Returns:** `number | null`

**Error Handling:** Returns `null` on error, logs warning

### restoreCursorPosition(offset)
Restores cursor to specified text offset.

**Parameters:**
- `offset: number` - Text offset from start

**Error Handling:** Silently fails on error (cursor stays where it was)

### buildHighlightedHTML(text)
Converts plain text to HTML with `<mark>` tags for variables.

**Strategy:**
1. Look for `<<VarName>>` patterns (unfilled templates)
2. If none found but have variables, try `highlightFilledVariables()`
3. Fallback to plain escaped text

**Returns:** HTML string with `<mark>` tags

### highlightFilledVariables(text, templateOriginal)
Tries to match filled text against template structure.

**Algorithm:**
1. Parse template into segments (literal text + variables)
2. Match current text against this structure
3. Highlight variable regions
4. Fallback to plain text if structure doesn't match

### checkTemplateDeviation(text, template)
Detects if user has edited away from template.

**Threshold:** 70% of template literal parts must still be present

**Returns:** `boolean` - true if deviated

### extractText(el)
Extracts plain text from contentEditable DOM.

**Handles:**
- Text nodes
- `<br>` tags → newlines
- `<mark>` tags → extract inner text
- `<div>` tags → newlines between blocks

**Returns:** Plain text string

## Debugging

### Console Logs

Enable detailed logging by opening browser console:

```javascript
// 🔧 Internal operations
console.log('🔧 Skipping effect - internal update in progress')

// 🔍 Highlighting logic
console.log('🔍 buildHighlightedHTML called:', {...})

// ✏️ User edits
console.log('✏️ User edit detected:', {...})

// 🔄 State restoration
console.log('🔄 Mouse up - highlights missing, restoring...')

// 📊 Analysis/metrics
console.log('📊 Template deviation check:', {...})
```

### Common Issues

#### Issue: Cursor jumps during typing
**Cause:** Highlighting effect running while user types
**Fix:** Verify `isUserTypingRef` is set correctly in `handleInput()`

#### Issue: Highlights disappear
**Cause:** Template deviation or missing variables
**Fix:** Check console for deviation messages, verify `variables` prop

#### Issue: Race condition errors
**Cause:** `isInternalUpdateRef` not reset properly
**Fix:** Verify 50ms timeout in `useEffect()` cleanup

## Performance Considerations

### Debouncing
- Typing: 300ms debounce before highlight update
- Internal updates: 50ms delay before resetting flags

### Optimization Tips
1. Keep `templateOriginal` stable (memoize in parent)
2. Don't update `variables` on every keystroke
3. Use `React.memo()` if re-rendering entire parent frequently

## Testing

### Unit Test Ideas
```javascript
// Test cursor position save/restore
test('saves and restores cursor position', () => {
  const editor = mount(<HighlightingEditor value="Hello world" ... />)
  // Place cursor at position 5
  // Trigger update
  // Verify cursor at position 5
})

// Test template deviation
test('detects template deviation', () => {
  const template = "Hello <<Name>>, welcome to <<Company>>!"
  const deviated = "This is completely different text"
  expect(checkTemplateDeviation(deviated, template)).toBe(true)
})

// Test highlighting
test('highlights unfilled variables', () => {
  const html = buildHighlightedHTML("Hello <<Name>>", {})
  expect(html).toContain('<mark class="var-highlight empty"')
})
```

### Integration Test Ideas
```javascript
// Test typing flow
test('typing updates value without losing cursor', async () => {
  const onChange = jest.fn()
  const { container } = render(
    <HighlightingEditor value="" onChange={onChange} />
  )
  
  const editor = container.querySelector('[contenteditable]')
  // Simulate typing "Hello"
  // Verify onChange called 5 times
  // Verify cursor at end
})
```

## Best Practices

### Do's ✅
- Always memoize `templateOriginal` in parent
- Debounce `variables` updates from external inputs
- Use error boundaries around the component
- Test with long text (>2000 chars)

### Don'ts ❌
- Don't update props on every keystroke
- Don't call `onChange()` from parent during its own render
- Don't modify `editableRef.current.innerHTML` from outside
- Don't use without error boundary in production

## Advanced Usage

### Custom Variable Rendering
Modify `buildHighlightedHTML()` to add custom classes:

```javascript
html += `<mark 
  class="var-highlight ${filled ? 'filled' : 'empty'} ${customClass}" 
  data-var="${escapeHtml(varName)}"
  data-custom="${customData}"
>${escapeHtml(displayText)}</mark>`
```

### External Cursor Control
```javascript
// Focus and place cursor at end
const editor = editableRef.current
if (editor) {
  editor.focus()
  const range = document.createRange()
  range.selectNodeContents(editor)
  range.collapse(false) // false = end
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}
```

## Migration Guide

### From Textarea to HighlightingEditor

Before:
```jsx
<textarea 
  value={text}
  onChange={(e) => setText(e.target.value)}
/>
```

After:
```jsx
<HighlightingEditor
  value={text}
  onChange={(e) => setText(e.target.value)}
  variables={variables}
  templateOriginal={template}
  minHeight="150px"
/>
```

### Handling Edge Cases

```jsx
// Empty state
value={text || ''}  // Don't pass undefined

// Variables
variables={variables || {}}  // Don't pass null

// Template
templateOriginal={template || ''}  // Don't pass null
```

## Contributing

When modifying `HighlightingEditor.jsx`:

1. Test with different template structures
2. Verify cursor positioning with all browsers
3. Check performance with long text (>5000 chars)
4. Add console logs for new code paths
5. Update this guide with new features
6. Test mobile/touch interactions

## HelpCenter Component (Support overlay)

### Location
- **File:** `src/components/HelpCenter.jsx`
- **Rendered from:** `App.jsx` when `showHelpCenter` is true (header help button).

### Props
- `language` (`"fr" | "en"`) – controls which translation bundle is used.
- `onClose` (`() => void`) – invoked when the overlay background, close button, or `Escape` is triggered.
- `supportEmail` (`string`) – email target for the primary CTA (defaults to Translation Bureau address).
- `mailSubject` (`string`) – localized subject for the `mailto:` URL.

### Behaviour
- Locks background scrolling while open (`document.body.style.overflow = 'hidden'`).
- Focuses the close button on mount for accessibility, and restores the previous overflow value on unmount.
- Wraps content in a `ScrollArea` capped at 70vh so long FAQs stay scrollable without altering layout.
- Uses color tokens already present in the canonical palette (teal/mint/sage) and keeps borders subtle to respect the UI freeze constraints.

### Customising content
- All copy lives in the local `translations` object (`fr`, `en`). Each section (quickStart, faq, troubleshooting, resources, contact) can be updated independently.
- Resource links currently point to GitHub documents plus the offline `help.html`. Update labels/URLs to suit internal documentation if mirrors change.

### Support email override
- The app reads `import.meta.env.VITE_SUPPORT_EMAIL` once at boot. Provide a value (via `.env`, CI secret, or command line export) to change the address used by the contact button.
- If the variable is absent or blank, the helper falls back to `translationbureau@tpsgc-pwgsc.gc.ca`.

### Extensibility ideas
- To add analytics (e.g., log which section users open), wrap individual sections with callbacks and emit events before closing the overlay.
- For richer formatting (accordion, tabs), consider migrating the translations to structured data (e.g., `faq: [{question, answer, links}]`) which the renderer can map onto Radix accordions.

## Resources

- [MDN: contentEditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable)
- [MDN: Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
- [MDN: Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range)
