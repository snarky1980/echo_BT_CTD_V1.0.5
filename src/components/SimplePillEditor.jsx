import React, { useCallback, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { varKeysMatch, resolveVariableValue } from '../utils/variables';

const escapeHtml = (input = '') =>
  String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const BLOCK_ELEMENTS = new Set([
  'DIV',
  'P',
  'SECTION',
  'ARTICLE',
  'HEADER',
  'FOOTER',
  'ASIDE',
  'NAV',
  'UL',
  'OL',
  'LI',
  'PRE',
  'BLOCKQUOTE',
  'TABLE',
  'TBODY',
  'THEAD',
  'TFOOT',
  'TR',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR'
]);

const convertPlainTextToHtml = (text = '') =>
  escapeHtml(text)
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n/g, '<br data-line-break="true">');

const selectEntirePill = (pill) => {
  if (!pill) return;
  const selection = document.getSelection?.();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(pill);
  selection.removeAllRanges();
  selection.addRange(range);
};

const SimplePillEditor = React.forwardRef(({
  value,
  onChange,
  variables,
  placeholder,
  onVariablesChange,
  focusedVarName,
  onFocusedVarChange,
  variant = 'default',
  templateLanguage = 'fr'
}, ref) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const autoSelectTrackerRef = useRef({ varName: null, timestamp: 0 });
  const autoSelectSuppressedUntilRef = useRef(0);
  const clickSelectTimerRef = useRef(null);

  const getVarValue = useCallback((name = '') => {
    return resolveVariableValue(variables, name, templateLanguage);
  }, [variables, templateLanguage]);

  const clearActivePillPlaceholder = useCallback(() => {
    if (!editorRef.current) return false;
    const selection = document.getSelection?.();
    if (!selection?.anchorNode) return false;
    const anchor = selection.anchorNode;
    const pillElement = anchor.nodeType === Node.ELEMENT_NODE
      ? anchor.closest?.('.var-pill')
      : anchor.parentElement?.closest?.('.var-pill');
    if (!pillElement) return false;
    const varName = pillElement.getAttribute('data-var');
    if (!varName) return false;
    const placeholderToken = `<<${varName}>>`;
    const currentText = (pillElement.textContent || '').trim();
    if (currentText === placeholderToken) {
      pillElement.textContent = '';
      pillElement.setAttribute('data-display', '');
      pillElement.classList.add('empty');
      pillElement.classList.remove('filled');
      return true;
    }
    return false;
  }, []);

  const renderContent = (text) => {
    if (!text) return '';
    const regex = /<<([^>]+)>>/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const varName = match[1];
      const varValue = getVarValue(varName);
      
      // Skip deleted variables - don't render the pill at all
      if (varValue === '__DELETED__') {
        lastIndex = regex.lastIndex;
        continue;
      }
      
      const isFilled = varValue.trim().length > 0;
      const displayValue = isFilled ? varValue : `<<${varName}>>`;
      const storedValue = `<<${varName}>>`;
      const displayAttr = isFilled ? varValue : '';
      if (match.index > lastIndex) {
        parts.push(convertPlainTextToHtml(text.substring(lastIndex, match.index)));
      }
      const pillClass = `var-pill ${isFilled ? 'filled' : 'empty'}`;
      parts.push(`<span class="${pillClass}" data-var="${varName}" data-value="${escapeHtml(storedValue)}" data-display="${escapeHtml(displayAttr)}" contenteditable="true" spellcheck="false">${convertPlainTextToHtml(displayValue)}</span>`);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(convertPlainTextToHtml(text.substring(lastIndex)));
    }
    return parts.join('');
  };

  const applyFocusedPill = useCallback((varName) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll('.var-pill').forEach((pill) => {
      const pillVar = pill.getAttribute('data-var');
      const isMatch = varKeysMatch(pillVar, varName);
      pill.classList.toggle('focused', !!isMatch);
    });
  }, []);

  const queueAutoSelectForPill = useCallback((pill, varName) => {
    if (!pill || !varName) return;
    if (!pill.classList.contains('empty')) return;
    const nowTs = Date.now();
    if (nowTs < (autoSelectSuppressedUntilRef.current || 0)) return;
    const selection = document.getSelection?.();
    if (!selection) return;
    if (!selection.isCollapsed && selection.toString()) return;
    const tracker = autoSelectTrackerRef.current;
    const now = Date.now();
    if (tracker.varName === varName && now - tracker.timestamp < 200) return;
    tracker.varName = varName;
    tracker.timestamp = now;
    requestAnimationFrame(() => selectEntirePill(pill));
  }, []);

  const syncSiblingPills = useCallback((varName, newValue) => {
    if (!editorRef.current || !varName) return;

    const selection = document.getSelection?.();
    let activePill = null;
    if (selection?.anchorNode) {
      const anchor = selection.anchorNode;
      activePill = anchor.nodeType === Node.ELEMENT_NODE
        ? anchor.closest?.('.var-pill')
        : anchor.parentElement?.closest?.('.var-pill');
    }

    const normalizedValue = newValue ?? '';
    const trimmed = normalizedValue.trim();
    const displayValue = trimmed.length > 0 ? normalizedValue : `<<${varName}>>`;
    const displayHtml = convertPlainTextToHtml(displayValue);
    const isFilled = trimmed.length > 0;

    editorRef.current.querySelectorAll('.var-pill').forEach((pill) => {
      if (pill.getAttribute('data-var') !== varName) return;
      if (activePill && pill === activePill) return;

      if (pill.innerHTML !== displayHtml) {
        pill.innerHTML = displayHtml;
      }
      pill.classList.toggle('filled', isFilled);
      pill.classList.toggle('empty', !isFilled);
      pill.setAttribute('data-display', isFilled ? normalizedValue : '');
    });
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus(),
    getHtml: () => editorRef.current?.innerHTML ?? '',
    getPlainText: () => extractText(),
    getEditorElement: () => editorRef.current
  }));

  const extractText = () => {
    if (!editorRef.current) return '';
    let result = '';
    const append = (t = '') => { if (!t) return; result += t; };
    const ensureTrailingNewline = () => { if (!result.endsWith('\n')) result += '\n'; };
    const traverse = (node) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parentElement = child.parentElement;
          if (parentElement && parentElement.closest('.var-pill')) return;
          append(child.textContent ?? '');
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const element = child;
          if (element.classList.contains('var-pill')) {
            const varName = element.getAttribute('data-var');
            const placeholder = element.getAttribute('data-value') || (varName ? `<<${varName}>>` : '');
            append(placeholder);
          } else if (element.tagName === 'BR') {
            append('\n');
          } else {
            const isBlock = BLOCK_ELEMENTS.has(element.tagName);
            if (isBlock && result && !result.endsWith('\n')) append('\n');
            traverse(element);
            if (isBlock) ensureTrailingNewline();
          }
        }
      });
    };
    traverse(editorRef.current);
    const normalized = result.replace(/\u00a0/g, ' ');
    if (normalized.endsWith('\n') && !normalized.endsWith('\n\n')) return normalized.slice(0, -1);
    return normalized;
  };

  const handleInput = () => {
    const text = extractText();
    const pillElements = editorRef.current?.querySelectorAll('.var-pill');
    const updates = {};
    const seenVars = new Set();
    let hasChanges = false;
    
    // Get the currently active/focused pill to prioritize its value
    const selection = document.getSelection?.();
    let activePill = null;
    if (selection?.anchorNode) {
      const anchor = selection.anchorNode;
      activePill = anchor.nodeType === Node.ELEMENT_NODE
        ? anchor.closest?.('.var-pill')
        : anchor.parentElement?.closest?.('.var-pill');
    }
    
    // First pass: collect value from active pill
    if (activePill && pillElements) {
      const varName = activePill.getAttribute('data-var');
      if (varName) {
        const rawText = activePill.textContent ?? '';
        const normalizedText = rawText.replace(/\u00a0/g, ' ').replace(/[\r\n]+/g, ' ');
        const placeholder = `<<${varName}>>`;
        const withoutPlaceholder = normalizedText.split(placeholder).join('');
        const trimmedValue = withoutPlaceholder.trim();
        let newValue = trimmedValue;
        if (!trimmedValue) {
          newValue = '';
          if (rawText !== placeholder) activePill.textContent = placeholder;
          activePill.classList.remove('filled');
          activePill.classList.add('empty');
        } else {
          activePill.classList.add('filled');
          activePill.classList.remove('empty');
        }
        activePill.setAttribute('data-display', newValue);
        if ((variables?.[varName] || '') !== newValue) hasChanges = true;
        updates[varName] = newValue;
        seenVars.add(varName);
      }
    }
    
    // Second pass: collect values from other pills (but skip if varName already collected)
    if (pillElements) {
      pillElements.forEach((pill) => {
        const varName = pill.getAttribute('data-var');
        if (!varName || seenVars.has(varName)) return;
        
        const rawText = pill.textContent ?? '';
        const normalizedText = rawText.replace(/\u00a0/g, ' ').replace(/[\r\n]+/g, ' ');
        const placeholder = `<<${varName}>>`;
        const withoutPlaceholder = normalizedText.split(placeholder).join('');
        const trimmedValue = withoutPlaceholder.trim();
        let newValue = trimmedValue;
        if (!trimmedValue) {
          newValue = '';
          if (rawText !== placeholder) pill.textContent = placeholder;
          pill.classList.remove('filled');
          pill.classList.add('empty');
        } else {
          pill.classList.add('filled');
          pill.classList.remove('empty');
        }
        pill.setAttribute('data-display', newValue);
        if ((variables?.[varName] || '') !== newValue) hasChanges = true;
        updates[varName] = newValue;
        seenVars.add(varName);
      });
    }
    
    Object.entries(updates).forEach(([varName, newValue]) => {
      syncSiblingPills(varName, newValue);
    });

    if (hasChanges && typeof onVariablesChange === 'function') onVariablesChange(updates);
    onChange?.({ target: { value: text } });
  };

  const handleFocus = () => {
    setIsFocused(true);
    requestAnimationFrame(() => {
      const selection = document.getSelection?.();
      const anchor = selection?.anchorNode || null;
      if (!editorRef.current || !anchor || !editorRef.current.contains(anchor)) return;
      const pillElement = anchor.nodeType === Node.ELEMENT_NODE ? anchor.closest?.('.var-pill') : anchor.parentElement?.closest?.('.var-pill');
      const varName = pillElement?.getAttribute('data-var') || null;
      if (varName) {
        clearActivePillPlaceholder();
        applyFocusedPill(varName);
        if (Date.now() >= (autoSelectSuppressedUntilRef.current || 0)) queueAutoSelectForPill(pillElement, varName);
      }
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    handleInput();
    const docHasFocus = typeof document === 'undefined' || !document.hasFocus || document.hasFocus();
    if (docHasFocus) applyFocusedPill(null);
    autoSelectTrackerRef.current = { varName: null, timestamp: 0 };
  };

  const handleMouseDown = (event) => {
    if (!editorRef.current) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const pillElement = target.closest?.('.var-pill');
    if (pillElement && editorRef.current.contains(pillElement)) {
      const clickCount = event.detail;
      if (clickCount === 1) {
        if (clickSelectTimerRef.current) clearTimeout(clickSelectTimerRef.current);
        clickSelectTimerRef.current = setTimeout(() => { selectEntirePill(pillElement); clickSelectTimerRef.current = null; }, 220);
      } else if (clickCount >= 2) {
        if (clickSelectTimerRef.current) { clearTimeout(clickSelectTimerRef.current); clickSelectTimerRef.current = null; }
        autoSelectSuppressedUntilRef.current = Date.now() + 600;
      }
    }
  };

  const handleDoubleClick = (event) => {
    if (!editorRef.current) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const pillElement = target.closest?.('.var-pill');
    if (!pillElement || !editorRef.current.contains(pillElement)) return;
    event.preventDefault();
    try {
      const selection = document.getSelection?.();
      if (!selection) return;
      let range = null;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(event.clientX, event.clientY);
        if (pos) { range = document.createRange(); range.setStart(pos.offsetNode, pos.offset); range.collapse(true); }
      }
      if (!range || !pillElement.contains(range.startContainer)) { range = document.createRange(); range.selectNodeContents(pillElement); range.collapse(false); }
      selection.removeAllRanges(); selection.addRange(range);
      autoSelectSuppressedUntilRef.current = Date.now() + 600;
    } catch {}
  };

  useEffect(() => {
    if (!editorRef.current || isFocused) return;
    const rendered = renderContent(value);
    if (editorRef.current.innerHTML !== rendered) editorRef.current.innerHTML = rendered;
  }, [value, variables, isFocused, getVarValue, templateLanguage]);

  useEffect(() => { applyFocusedPill(focusedVarName); }, [focusedVarName, variables, applyFocusedPill]);

  // Update pill display values when variables change, even when focused
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Get currently active pill to avoid overwriting user input
    const selection = document.getSelection?.();
    let activePill = null;
    if (selection?.anchorNode) {
      const anchor = selection.anchorNode;
      activePill = anchor.nodeType === Node.ELEMENT_NODE
        ? anchor.closest?.('.var-pill')
        : anchor.parentElement?.closest?.('.var-pill');
    }
    
    const pills = editorRef.current.querySelectorAll('.var-pill');
    pills.forEach((pill) => {
      // Skip the pill user is currently editing
      if (activePill && pill === activePill) return;
      
      const varName = pill.getAttribute('data-var');
      if (!varName) return;
      const varValue = getVarValue(varName);
      const isFilled = varValue.trim().length > 0;
      const displayValue = isFilled ? varValue : `<<${varName}>>`;
      
      // Only update if the pill content doesn't match the expected display value
      const currentText = (pill.textContent || '').trim();
      const expectedText = displayValue.trim();
      if (currentText !== expectedText) {
        pill.textContent = displayValue;
        pill.classList.toggle('filled', isFilled);
        pill.classList.toggle('empty', !isFilled);
        pill.setAttribute('data-display', isFilled ? varValue : '');
      }
    });
  }, [variables, getVarValue]);

  useEffect(() => {
    if (!isFocused || !editorRef.current) return;
    const handleSelectionChange = () => {
      const editor = editorRef.current; if (!editor) return;
      const docHasFocus = typeof document === 'undefined' || !document.hasFocus || document.hasFocus(); if (!docHasFocus) return;
      const selection = document.getSelection?.(); if (!selection) { autoSelectTrackerRef.current = { varName: null, timestamp: 0 }; return; }
      const anchor = selection.anchorNode; if (!anchor || !editor.contains(anchor)) { autoSelectTrackerRef.current = { varName: null, timestamp: 0 }; return; }
      const pillElement = anchor.nodeType === Node.ELEMENT_NODE ? anchor.closest?.('.var-pill') : anchor.parentElement?.closest?.('.var-pill');
      const varName = pillElement?.getAttribute('data-var') || null;
      if (varName && selection.isCollapsed) { if (Date.now() >= (autoSelectSuppressedUntilRef.current || 0)) queueAutoSelectForPill(pillElement, varName); }
      if (!varName) { autoSelectTrackerRef.current = { varName: null, timestamp: 0 }; }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isFocused, queueAutoSelectForPill]);

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    const selection = document.getSelection?.(); if (!selection) return;
    const anchorNode = selection.anchorNode; if (!anchorNode) return;
    const pillElement = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode.closest?.('.var-pill') : anchorNode.parentElement?.closest?.('.var-pill');
    if (pillElement) event.preventDefault();
  };

  const handleBeforeInput = useCallback((event) => {
    const inputType = event?.inputType || '';
    if (!inputType || inputType.startsWith('insert') || inputType === 'deleteContentBackward') {
      clearActivePillPlaceholder();
    }
  }, [clearActivePillPlaceholder]);

  const handleCompositionStart = useCallback(() => {
    clearActivePillPlaceholder();
  }, [clearActivePillPlaceholder]);

  return (
    <div
      ref={editorRef}
      contentEditable
      role="textbox"
      aria-multiline="true"
      aria-autocomplete="none"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      inputMode="text"
      data-gramm="false"
      data-lpignore="true"
      data-1p-ignore="true"
      data-1password-blocklist="true"
      className={`lexical-content-editable${variant === 'compact' ? ' lexical-content-editable--compact' : ''}`}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onBeforeInput={handleBeforeInput}
      onCompositionStart={handleCompositionStart}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: renderContent(value) }}
    />
  );
});

export default SimplePillEditor;

