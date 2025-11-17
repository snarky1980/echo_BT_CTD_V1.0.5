import React, { useCallback, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { varKeysMatch } from '../utils/variables';

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
    const lang = (templateLanguage || 'fr').toLowerCase();
    const suffix = name.match(/_(fr|en)$/i)?.[1]?.toLowerCase();
    if (suffix) return variables?.[name] ?? '';
    if (lang === 'en') return variables?.[`${name}_EN`] ?? variables?.[name] ?? '';
    return variables?.[`${name}_FR`] ?? variables?.[name] ?? '';
  }, [variables, templateLanguage]);

  const renderContent = (text) => {
    if (!text) return '';
    const regex = /<<([^>]+)>>/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const varName = match[1];
      const varValue = getVarValue(varName);
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
    let hasChanges = false;
    if (pillElements) {
      pillElements.forEach((pill) => {
        const varName = pill.getAttribute('data-var');
        if (!varName) return;
        const rawText = pill.textContent ?? '';
        const normalizedText = rawText.replace(/\u00a0/g, ' ').replace(/[\r\n]+/g, ' ');
        const trimmed = normalizedText.trim();
        const placeholder = `<<${varName}>>`;
        let newValue = normalizedText;
        if (!trimmed || trimmed === placeholder) {
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
      });
    }
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

