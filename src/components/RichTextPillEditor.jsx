import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { varKeysMatch } from '../utils/variables';
import RichTextToolbar from './RichTextToolbar.jsx';

const escapeHtml = (input = '') =>
  String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const BLOCK_ELEMENTS = new Set([
  'DIV', 'P', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'ASIDE', 'NAV',
  'UL', 'OL', 'LI', 'PRE', 'BLOCKQUOTE', 'TABLE', 'TBODY', 'THEAD', 
  'TFOOT', 'TR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR'
]);

const convertPlainTextToHtml = (text = '') =>
  escapeHtml(text)
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n/g, '<br data-line-break="true">');

const PILL_TEMPLATE_TOKEN = '__RT_PILL_VALUE__';

const escapeSelector = (value = '') => {
  if (typeof window !== 'undefined' && window.CSS?.escape) {
    return window.CSS.escape(value);
  }
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
};

const createFormattingTemplate = (pill) => {
  if (!pill) return null;

  const clone = pill.cloneNode(true);
  
  // CRITICAL: Inline all computed styles BEFORE creating the template
  // This ensures font-size, font-family, and all other CSS properties are preserved
  const inlineComputedStyles = (sourceNode, cloneNode) => {
    if (cloneNode.nodeType !== Node.ELEMENT_NODE) return;
    
    const computedStyle = window.getComputedStyle(sourceNode);
    let inlineStyle = '';
    
    // Capture ALL relevant style properties
    const propertiesToCapture = [
      'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
      'color', 'textDecoration',
      'textAlign', 'lineHeight', 'letterSpacing'
    ];
    
    propertiesToCapture.forEach(prop => {
      const value = computedStyle[prop];
      if (value && value !== 'normal' && value !== 'none') {
        // Convert camelCase to kebab-case for CSS
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        inlineStyle += `${cssProp}: ${value}; `;
      }
    });
    
    // Special handling for backgroundColor (highlighting)
    const bgColor = computedStyle.backgroundColor;
    const bgColorNormalized = bgColor?.replace(/\s/g, '');
    if (bgColor && 
        bgColorNormalized !== 'rgba(0,0,0,0)' && 
        bgColorNormalized !== 'transparent' &&
        bgColorNormalized !== 'rgb(255,255,255)' &&
        bgColorNormalized !== 'rgba(255,255,255,1)') {
      inlineStyle += `background-color: ${bgColor}; `;
    }
    
    if (inlineStyle) {
      cloneNode.setAttribute('style', inlineStyle.trim());
    }
    
    // Recursively process child elements
    for (let i = 0; i < sourceNode.childNodes.length; i++) {
      if (sourceNode.childNodes[i].nodeType === Node.ELEMENT_NODE &&
          cloneNode.childNodes[i]?.nodeType === Node.ELEMENT_NODE) {
        inlineComputedStyles(sourceNode.childNodes[i], cloneNode.childNodes[i]);
      }
    }
  };
  
  // Apply computed styles from original pill to clone
  inlineComputedStyles(pill, clone);
  
  let placeholderInserted = false;

  const walk = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!placeholderInserted) {
          child.textContent = PILL_TEMPLATE_TOKEN;
          placeholderInserted = true;
        } else {
          child.textContent = '';
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };

  walk(clone);

  if (!placeholderInserted) {
    return null;
  }

  return clone.innerHTML;
};

const storePillTemplate = (pill) => {
  if (!pill) return;
  const template = createFormattingTemplate(pill);
  if (template) {
    pill.dataset.template = template;
  } else {
    delete pill.dataset.template;
  }
};

const applyTemplateToPill = (pill, sanitizedHtml) => {
  if (!pill) return;

  const template = pill.dataset?.template;
  if (template && template.includes(PILL_TEMPLATE_TOKEN)) {
    const updated = template.replace(PILL_TEMPLATE_TOKEN, sanitizedHtml);
    pill.innerHTML = updated;
    storePillTemplate(pill);
    return;
  }

  const singleChild = pill.childNodes.length === 1 && pill.childNodes[0].nodeType === Node.ELEMENT_NODE;
  if (singleChild) {
    pill.childNodes[0].innerHTML = sanitizedHtml;
    storePillTemplate(pill);
    return;
  }

  pill.innerHTML = sanitizedHtml;
  storePillTemplate(pill);
};

const refreshAllPillTemplates = (editor) => {
  if (!editor) return;
  const pills = editor.querySelectorAll('.var-pill');
  pills.forEach(storePillTemplate);
};

const selectEntirePill = (pill) => {
  if (!pill) return;
  const selection = document.getSelection?.();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(pill);
  selection.removeAllRanges();
  selection.addRange(range);
};

const haveVariablesChanged = (prevVars = {}, nextVars = {}) => {
  const prevKeys = Object.keys(prevVars);
  const nextKeys = Object.keys(nextVars);

  if (prevKeys.length !== nextKeys.length) return true;

  for (const key of nextKeys) {
    if ((prevVars[key] ?? '') !== (nextVars[key] ?? '')) {
      return true;
    }
  }

  return false;
};

/**
 * RichTextPillEditor - SimplePillEditor with rich text formatting support
 * Uses IDENTICAL variable handling logic to SimplePillEditor
 */
const RichTextPillEditor = React.forwardRef(({
  value = '',
  onChange,
  onFocus,
  onBlur,
  onVariablesChange,
  variables = {},
  placeholder = '',
  className = '',
  style = {},
  focusedVarName = null,
  onFocusedVarChange,
  variant = 'default',
  disabled = false,
  minHeight = '120px',
  showRichTextToolbar = true,
  onRichTextCommand,
  templateLanguage = 'fr'
}, ref) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const lastSelectionVarRef = useRef(null);
  const prevValueRef = useRef(value);
  const prevVariablesRef = useRef(variables);
  const hasMountedRef = useRef(false);
  const autoSelectTrackerRef = useRef({ varName: null, timestamp: 0 });
  const autoSelectSuppressedUntilRef = useRef(0);
  const clickSelectTimerRef = useRef(null);

  // Resolve variable value by language preference
  const getVarValue = useCallback((name = '') => {
    const lang = (templateLanguage || 'fr').toLowerCase()
    const suffix = name.match(/_(fr|en)$/i)?.[1]?.toLowerCase()
    if (suffix) {
      return variables?.[name] ?? ''
    }
    if (lang === 'en') {
      return variables?.[`${name}_EN`] ?? variables?.[name] ?? ''
    }
    return variables?.[`${name}_FR`] ?? variables?.[name] ?? ''
  }, [variables, templateLanguage])

  // Render content with pills - IDENTICAL to SimplePillEditor
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

      // Add text before the variable
      if (match.index > lastIndex) {
        parts.push(convertPlainTextToHtml(text.substring(lastIndex, match.index)));
      }

      // Add the pill - IDENTICAL to SimplePillEditor
      const pillClass = `var-pill ${isFilled ? 'filled' : 'empty'}`;
      parts.push(
        `<span class="${pillClass}" data-var="${varName}" data-value="${escapeHtml(storedValue)}" data-display="${escapeHtml(displayAttr)}" contenteditable="true" spellcheck="false">${convertPlainTextToHtml(displayValue)}</span>`
      );

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(convertPlainTextToHtml(text.substring(lastIndex)));
    }

    return parts.join('');
  };

  // Focus management - IDENTICAL to SimplePillEditor
  const applyFocusedPill = useCallback((varName) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.querySelectorAll('.var-pill').forEach((pill) => {
      const pillVar = pill.getAttribute('data-var');
      const isMatch = varName ? varKeysMatch(pillVar, varName) : false;
      pill.classList.toggle('focused', !!isMatch);
    });
  }, []);

  const queueAutoSelectForPill = useCallback((pill, varName) => {
    if (!pill || !varName) return;
    if (!pill.classList.contains('empty')) return;
    const nowTs = Date.now();
    if (nowTs < (autoSelectSuppressedUntilRef.current || 0)) {
      return;
    }
    const selection = document.getSelection?.();
    if (!selection) return;
    if (!selection.isCollapsed && selection.toString()) return;

    const tracker = autoSelectTrackerRef.current;
    const now = Date.now();
    if (tracker.varName === varName && now - tracker.timestamp < 200) {
      return;
    }

    tracker.varName = varName;
    tracker.timestamp = now;

    requestAnimationFrame(() => {
      selectEntirePill(pill);
    });
  }, []);

  const emitFocusedVarChange = useCallback((varName) => {
    const normalized = varName || null;
    if (lastSelectionVarRef.current === normalized) return;
    lastSelectionVarRef.current = normalized;
    if (typeof onFocusedVarChange === 'function') {
      onFocusedVarChange(normalized);
    }
  }, [onFocusedVarChange]);

  // Extract text - IDENTICAL to SimplePillEditor
  const extractText = () => {
    if (!editorRef.current) return '';

    let result = '';

    const append = (text = '') => {
      if (!text) return;
      result += text;
    };

    const ensureTrailingNewline = () => {
      if (!result.endsWith('\n')) {
        result += '\n';
      }
    };

    const traverse = (node) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parentElement = child.parentElement;
          if (parentElement && parentElement.closest('.var-pill')) {
            return;
          }
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
            if (isBlock && result && !result.endsWith('\n')) {
              append('\n');
            }
            traverse(element);
            if (isBlock) {
              ensureTrailingNewline();
            }
          }
        }
      });
    };

    traverse(editorRef.current);

    const normalized = result.replace(/\u00a0/g, ' ');
    if (normalized.endsWith('\n') && !normalized.endsWith('\n\n')) {
      return normalized.slice(0, -1);
    }
    return normalized;
  };



  // Handle input - IDENTICAL to SimplePillEditor
  const handleInput = () => {
    const text = extractText();
    const html = editorRef.current?.innerHTML ?? '';

    const pillElements = editorRef.current?.querySelectorAll('.var-pill');
    const updates = {};
    let hasChanges = false;

    if (pillElements) {
      pillElements.forEach((pill) => {
        const varName = pill.getAttribute('data-var');
        if (!varName) return;

        const rawText = pill.textContent ?? '';
        const normalizedText = rawText
          .replace(/\u00a0/g, ' ')
          .replace(/[\r\n]+/g, ' ');
        const trimmed = normalizedText.trim();
        const placeholder = `<<${varName}>>`;
        let newValue = normalizedText;

        if (!trimmed || trimmed === placeholder) {
          newValue = '';
          if (rawText !== placeholder) {
            pill.textContent = placeholder;
          }
          pill.classList.remove('filled');
          pill.classList.add('empty');
        } else {
          pill.classList.add('filled');
          pill.classList.remove('empty');
        }

        pill.setAttribute('data-display', newValue);

        if ((variables?.[varName] || '') !== newValue) {
          hasChanges = true;
        }
        updates[varName] = newValue;
        storePillTemplate(pill);
      });
    }

    if (hasChanges && typeof onVariablesChange === 'function') {
      onVariablesChange(updates);
    }

    if (onChange) {
      onChange({ target: { value: text, htmlValue: html } });
    }
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.focus();
    },
    getHtml: () => editorRef.current?.innerHTML ?? '',
    getPlainText: () => extractText(),
    getEditorElement: () => editorRef.current
  }));

  // Handle focus - IDENTICAL to SimplePillEditor
  const handleFocus = (e) => {
    setIsFocused(true);
    // Defer to allow selection to settle
    requestAnimationFrame(() => {
      const selection = document.getSelection?.();
      const anchor = selection?.anchorNode || null;
      if (!editorRef.current || !anchor || !editorRef.current.contains(anchor)) return;
      const pillElement = anchor.nodeType === Node.ELEMENT_NODE
        ? anchor.closest?.('.var-pill')
        : anchor.parentElement?.closest?.('.var-pill');
      const varName = pillElement?.getAttribute('data-var') || null;
      if (varName) {
        applyFocusedPill(varName);
        emitFocusedVarChange(varName);
        if (Date.now() >= (autoSelectSuppressedUntilRef.current || 0)) {
          queueAutoSelectForPill(pillElement, varName);
        }
      }
    });
    onFocus?.(e);
  };

  // Handle blur - IDENTICAL to SimplePillEditor
  const handleBlur = (e) => {
    setIsFocused(false);
    handleInput(); // Ensure final value is captured

    if (typeof document !== 'undefined' ? document.hasFocus?.() !== false : true) {
      emitFocusedVarChange(null);
      applyFocusedPill(null);
    }

    autoSelectTrackerRef.current = { varName: null, timestamp: 0 };
    onBlur?.(e);
  };

  // Handle paste - IDENTICAL to SimplePillEditor
  const handlePaste = (event) => {
    if (!editorRef.current) return;

    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text/plain') ?? '';
    if (!pastedText) return;

    const sanitized = convertPlainTextToHtml(pastedText);
    const selection = document.getSelection?.();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const fragment = range.createContextualFragment(sanitized);
      range.insertNode(fragment);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current.insertAdjacentHTML('beforeend', sanitized);
    }

    // Defer input handling to ensure DOM updates settle
    requestAnimationFrame(() => {
      handleInput();
    });
  };

  // Handle key down - IDENTICAL to SimplePillEditor
  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    const selection = document.getSelection?.();
    if (!selection) {
      return;
    }

    const anchorNode = selection.anchorNode;
    if (!anchorNode) {
      return;
    }

    const pillElement = anchorNode.nodeType === Node.ELEMENT_NODE
      ? anchorNode.closest?.('.var-pill')
      : anchorNode.parentElement?.closest?.('.var-pill');

    if (pillElement) {
      event.preventDefault();
    }
  };

  // Auto-select pill content on mouse down to enable quick overwrite
  const handleMouseDown = (event) => {
    if (!editorRef.current) return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    const pillElement = target.closest?.('.var-pill');
    if (pillElement && editorRef.current.contains(pillElement)) {
      const clickCount = event.detail;
      const varName = pillElement.getAttribute('data-var') || null;
      // Single click: schedule select-all shortly. Double-click: cancel and allow native caret in pill.
      if (clickCount === 1) {
        if (clickSelectTimerRef.current) {
          clearTimeout(clickSelectTimerRef.current);
        }
        clickSelectTimerRef.current = setTimeout(() => {
          selectEntirePill(pillElement);
          clickSelectTimerRef.current = null;
        }, 220);
      } else if (clickCount >= 2) {
        if (clickSelectTimerRef.current) {
          clearTimeout(clickSelectTimerRef.current);
          clickSelectTimerRef.current = null;
        }
        autoSelectSuppressedUntilRef.current = Date.now() + 600;
      }
      emitFocusedVarChange(varName);
      applyFocusedPill(varName);
    }
  };

  const handleDoubleClick = (event) => {
    if (!editorRef.current) return;
    const target = event.target;
    if (!(target instanceof Element)) return;

    const pillElement = target.closest?.('.var-pill');
    if (!pillElement || !editorRef.current.contains(pillElement)) return;

    // Prevent native word selection and place a collapsed caret where clicked
    event.preventDefault();
    try {
      const selection = document.getSelection?.();
      if (!selection) return;

      let range = null;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(event.clientX, event.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }

      if (!range || !pillElement.contains(range.startContainer)) {
        range = document.createRange();
        range.selectNodeContents(pillElement);
        range.collapse(false);
      }

      selection.removeAllRanges();
      selection.addRange(range);
      autoSelectSuppressedUntilRef.current = Date.now() + 600;
    } catch {}
  };

  // Handle rich text commands
  const handleRichTextCommand = useCallback((command, value) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    // If the command came from a control that may have moved focus (like <select>),
    // ensure the editor regains focus and the previous selection is restored.
    if (document.activeElement !== editor) {
      editor.focus();
    }

    // Nothing to execute here; toolbar already applied the change. Just notify parent.
    onRichTextCommand?.(command, value);
    
    // Trigger input event to sync with React state
    setTimeout(() => {
      if (editor) {
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
      }
    }, 10);
  }, [onRichTextCommand]);

  // Update editor when value changes - IDENTICAL to SimplePillEditor
  useEffect(() => {
    const editor = editorRef.current;
    const firstRun = !hasMountedRef.current;

    if (!editor) {
      prevValueRef.current = value;
      prevVariablesRef.current = variables;
      return;
    }

    if (isFocused) {
      prevValueRef.current = value;
      prevVariablesRef.current = variables;
      hasMountedRef.current = true;
      return;
    }

    const prevValue = prevValueRef.current;
    const prevVars = prevVariablesRef.current;
    const textChanged = value !== prevValue;
    const varsChanged = haveVariablesChanged(prevVars || {}, variables || {});

    if (firstRun) {
      const rendered = renderContent(value);
      if (editor.innerHTML !== rendered) {
        editor.innerHTML = rendered;
      }
    } else if (textChanged) {
      const rendered = renderContent(value);
      if (editor.innerHTML !== rendered) {
        editor.innerHTML = rendered;
      }
    } else if (varsChanged) {
      const pills = editor.querySelectorAll('.var-pill');
      pills.forEach((pill) => {
        const varName = pill.getAttribute('data-var');
        if (!varName) return;

        const rawValue = variables?.[varName];
        const stringValue = rawValue == null ? '' : String(rawValue);
        const trimmed = stringValue.trim();
        const placeholder = `<<${varName}>>`;
        const displayValue = trimmed.length ? stringValue : placeholder;
        const newHtml = convertPlainTextToHtml(displayValue);

        applyTemplateToPill(pill, newHtml);
        pill.setAttribute('data-display', stringValue);
        pill.setAttribute('data-value', placeholder);

        if (trimmed.length) {
          pill.classList.add('filled');
          pill.classList.remove('empty');
        } else {
          pill.classList.add('empty');
          pill.classList.remove('filled');
        }
      });
    }

    hasMountedRef.current = true;
    prevValueRef.current = value;
    prevVariablesRef.current = variables;
    if (firstRun || textChanged) {
      refreshAllPillTemplates(editor);
    }
  }, [value, variables, isFocused, getVarValue, templateLanguage]);

  // Apply focused pill styling - IDENTICAL to SimplePillEditor
  useEffect(() => {
    applyFocusedPill(focusedVarName);
  }, [focusedVarName, variables, applyFocusedPill]);

  // Selection change handler - IDENTICAL to SimplePillEditor
  useEffect(() => {
    if (!isFocused || !editorRef.current) return;

    const handleSelectionChange = () => {
      const editor = editorRef.current;
      if (!editor) return;
      const docHasFocus = typeof document === 'undefined' || !document.hasFocus || document.hasFocus();
      if (!docHasFocus) {
        return;
      }
      const selection = document.getSelection?.();
      if (!selection) {
        emitFocusedVarChange(null);
        applyFocusedPill(null);
        autoSelectTrackerRef.current = { varName: null, timestamp: 0 };
        return;
      }

      const anchor = selection.anchorNode;
      if (!anchor || !editor.contains(anchor)) {
        emitFocusedVarChange(null);
        applyFocusedPill(null);
        autoSelectTrackerRef.current = { varName: null, timestamp: 0 };
        return;
      }

      const pillElement = anchor.nodeType === Node.ELEMENT_NODE
        ? anchor.closest?.('.var-pill')
        : anchor.parentElement?.closest?.('.var-pill');
      const varName = pillElement?.getAttribute('data-var') || null;
      emitFocusedVarChange(varName);
      applyFocusedPill(varName);

      if (varName && selection.isCollapsed) {
        if (Date.now() >= (autoSelectSuppressedUntilRef.current || 0)) {
          queueAutoSelectForPill(pillElement, varName);
        }
      }

      if (!varName) {
        autoSelectTrackerRef.current = { varName: null, timestamp: 0 };
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isFocused, emitFocusedVarChange, applyFocusedPill, queueAutoSelectForPill]);

  return (
    <div className="relative">
      {/* Rich Text Toolbar - Always visible when enabled */}
      {showRichTextToolbar && (
        <RichTextToolbar
          onCommand={handleRichTextCommand}
          disabled={disabled}
          className="mb-2"
        />
      )}
      
      {/* Content Editable - Uses IDENTICAL classes to SimplePillEditor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={`lexical-content-editable${variant === 'compact' ? ' lexical-content-editable--compact' : ''} ${className}`}
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
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{
          minHeight,
          ...style
        }}
      />
    </div>
  );
});

export default RichTextPillEditor;