/* eslint-disable no-console, no-unused-vars */
import React, { useRef, useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import Pill from './Pill';

const HighlightingEditor = ({
  value,
  onChange,
  onFocus,
  onBlur,
  variables = {},
  placeholder = '',
  minHeight = '150px',
  templateOriginal = '',
  showHighlights = true,
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const toPlainText = (node) => {
    let text = '';
    if (!node) return text;
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.getAttribute('data-var')) {
          text += `<<${child.getAttribute('data-var')}>>`;
        } else if (child.tagName === 'BR') {
          text += '\n';
        } else if (child.tagName === 'DIV' && child.childNodes.length > 0) {
          text += toPlainText(child) + '\n';
        }
         else {
          text += toPlainText(child);
        }
      }
    });
    return text;
  };

  const handleInput = (e) => {
    const plainText = toPlainText(e.currentTarget);
    const syntheticEvent = {
      target: {
        value: plainText,
      },
    };
    onChange(syntheticEvent);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const renderContentWithPills = (text) => {
    if (!showHighlights || !text) {
      return text.replace(/\n/g, '<br>');
    }

    const parts = text.split(/<<([^>]+)>>/g);
    const content = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i]) {
          content.push(parts[i].replace(/\n/g, '<br>'));
        }
      } else {
        const varName = parts[i];
        const varValue = variables[varName] || '';
        const isFilled = varValue.trim().length > 0;
        const pill = <Pill name={varName} value={isFilled ? varValue : `<<${varName}>>`} isFilled={isFilled} />;
        content.push(ReactDOMServer.renderToStaticMarkup(pill));
      }
    }
    
    return content.join('');
  };

  useEffect(() => {
    if (editorRef.current) {
      const currentPlainText = toPlainText(editorRef.current);
      if (currentPlainText !== value) {
        editorRef.current.innerHTML = renderContentWithPills(value || '');
      }
    }
  }, [value, variables, showHighlights]);

  return (
    <div
      ref={editorRef}
      contentEditable={true}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-placeholder={placeholder}
      className={`
        relative z-10 w-full border-2 transition-all duration-200 rounded-[12px] px-4 py-4 
        text-[16px] leading-[1.7] tracking-[0.01em] resize-none overflow-auto
        ${isFocused 
          ? 'border-[#7bd1ca] outline-none ring-2 ring-[#7bd1ca]/30' 
          : 'border-[#bfe7e3]'
        }
        bg-white
      `}
      style={{ 
        minHeight,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}
      dangerouslySetInnerHTML={{ __html: renderContentWithPills(value || '') }}
    />
  );
};

export default HighlightingEditor;
