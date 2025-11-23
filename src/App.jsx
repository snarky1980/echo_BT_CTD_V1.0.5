/* eslint-disable no-console, no-prototype-builtins, no-unreachable, no-undef, no-empty */
/* DEPLOY: 2025-10-15 07:40 - FIXED: Function hoisting error resolved */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  expandVariableAssignment,
  LANGUAGE_SUFFIXES,
  normalizeVarKey,
  resolveVariableValue
} from './utils/variables'
import canonicalTemplatesRaw from '../complete_email_templates.json'
import { createPortal } from 'react-dom'
import Fuse from 'fuse.js'
import { loadState, saveState, getDefaultState, clearState } from './utils/storage.js';
// Deploy marker: 2025-10-16T07:31Z
import { Search, FileText, Copy, RotateCcw, Languages, Filter, Globe, Sparkles, Mail, Edit3, Link, Settings, X, Move, Send, Star, ClipboardPaste, Eraser, Pin, PinOff, Minimize2, ExternalLink, Expand, Shrink, MoveRight, LifeBuoy } from 'lucide-react'
import echoLogo from './assets/echo-logo.svg'
import { Button } from './components/ui/button.jsx'
import { Input } from './components/ui/input.jsx'
import SimplePillEditor from './components/SimplePillEditor.jsx';
import RichTextPillEditor from './components/RichTextPillEditor.jsx';
import AISidebar from './components/AISidebar';
import HelpCenter from './components/HelpCenter.jsx'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card.jsx'
import { Badge } from './components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select.jsx'
import { ScrollArea } from './components/ui/scroll-area.jsx'
import { useToast } from './components/ui/toast.jsx'
import './App.css'

const NAVY_TEXT = '#1c2f4a'

const CATEGORY_BADGE_STYLES = {
  quotes_and_approvals: { bg: '#ede9fe', border: '#c4b5fd', text: NAVY_TEXT },
  follow_ups_and_cancellations: { bg: '#ffe4e6', border: '#fecdd3', text: NAVY_TEXT },
  documents_and_formatting: { bg: '#e0f2fe', border: '#bae6fd', text: NAVY_TEXT },
  deadlines_and_delivery: { bg: '#ffedd5', border: '#fdba74', text: NAVY_TEXT },
  clarifications_and_client_instructions: { bg: '#fef3c7', border: '#fde68a', text: NAVY_TEXT },
  security_and_copyright: { bg: '#fee2e2', border: '#fecaca', text: NAVY_TEXT },
  quality_assurance: { bg: '#dcfce7', border: '#bbf7d0', text: NAVY_TEXT },
  terminology_and_glossaries: { bg: '#cffafe', border: '#a5f3fc', text: NAVY_TEXT },
  revisions_and_feedback: { bg: '#fae8ff', border: '#f0abfc', text: NAVY_TEXT },
  team_coordination: { bg: '#e0e7ff', border: '#c7d2fe', text: NAVY_TEXT },
  technical_issues: { bg: '#ccfbf1', border: '#99f6e4', text: NAVY_TEXT },
  general_inquiries: { bg: '#f1f5f9', border: '#cbd5e1', text: NAVY_TEXT },
  default: { bg: '#e6f0ff', border: '#c7dbff', text: NAVY_TEXT }
}

const getCategoryBadgeStyle = (category = '', customColors = {}) => {
  // If custom color exists, generate dynamic style
  if (customColors[category]) {
    const baseColor = customColors[category]
    return {
      bg: baseColor + '20',  // 20% opacity for background
      border: baseColor + '80',  // 80% opacity for border
      text: baseColor
    }
  }
  // Fall back to predefined styles
  return CATEGORY_BADGE_STYLES[category] || CATEGORY_BADGE_STYLES.default
}

// Custom CSS for modern typography and variable highlighting with the EXACT original teal/sage styling
const customEditorStyles = `
  /* Translation Bureau Brand Colors - EXACT MATCH from original design */
  :root {
    /* ECHO brand additions */
    
    --tb-teal: #aca868;         /* Deeper muted gold */
    --tb-teal-light: #aca868;   /* Muted gold - lighter */
    --tb-teal-dark: #a69235;    /* Dark muted gold */
    --tb-sage: #b5af70;         /* Deeper muted gold */
    --tb-sage-light: #b5af70;   /* Muted gold - lighter */
    --tb-mint: #fefbe8;         /* Very light gold - background */
    --tb-cream: #fefefe;        /* Clean white */
  }

  /* Modern typography base */
  * {
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Enhanced variable highlighting styles */
  .variable-highlight {
    background-color: #fef3c7;
    color: #d97706;
    padding: 3px 6px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 15px;
    border: 1px solid #f59e0b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    letter-spacing: 0.005em;
  }

  /* Subtle, non-blocking underline cues for variable regions in the editor overlay */
  mark.var-highlight {
    background: transparent !important;
    color: transparent !important; /* keep caret/text from being doubled visually */
    border-bottom: 2px dotted rgba(0, 0, 0, 0.5); /* default cue color */
    padding: 0 0 0.05em 0; /* minimal padding for consistent underline */
  }
  mark.var-highlight.filled {
    border-bottom-color: rgba(44, 61, 80, 0.9); /* stronger navy when filled */
  }
  mark.var-highlight.empty {
    border-bottom-color: rgba(156, 163, 175, 0.8); /* gray when empty */
  }
  
  /* Persistent, elegant scrollbar for easy mouse dragging */
  [data-slot="scroll-area-scrollbar"] {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
    width: 20px !important;
    padding: 4px !important;
    background: linear-gradient(to right, rgba(255,255,255,0.4), rgba(241, 245, 249, 0.9)) !important;
    border-left: 1px solid rgba(203, 180, 74, 0.15) !important;
    pointer-events: auto !important;
    transition: background 0.2s ease !important;
  }
  
  [data-slot="scroll-area-scrollbar"]:hover {
    background: linear-gradient(to right, rgba(255,255,255,0.5), rgba(241, 245, 249, 1)) !important;
  }
  
  /* Smooth but responsive scrolling */
  [data-radix-scroll-area-viewport] {
    scroll-behavior: auto;
    overscroll-behavior: contain;
  }
  
  [data-slot="scroll-area-thumb"] {
    background: linear-gradient(135deg, #aca868 0%, #b5af70 50%, #cbb44a 100%) !important;
    opacity: 1 !important;
    border-radius: 10px !important;
    width: 12px !important;
    min-height: 50px !important;
    box-shadow: 0 2px 6px rgba(138, 133, 53, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    transition: all 0.15s ease-out !important;
    border: 1px solid rgba(138, 133, 53, 0.2) !important;
    will-change: transform, box-shadow !important;
  }
  
  [data-slot="scroll-area-thumb"]:active {
    background: linear-gradient(135deg, #8a8535 0%, #9a8f45 50%, #a69235 100%) !important;
    box-shadow: 0 1px 3px rgba(138, 133, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    transform: scaleX(1.05) !important;
    transition: all 0.05s ease-out !important;
  }
  
  [data-slot="scroll-area-scrollbar"]:hover [data-slot="scroll-area-thumb"] {
    background: linear-gradient(135deg, #b5af70 0%, #cbb44a 50%, #d4c05e 100%) !important;
    box-shadow: 0 3px 8px rgba(138, 133, 53, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
    transform: scaleX(1.12) !important;
    border-color: rgba(138, 133, 53, 0.3) !important;
  }
  
  /* Remove visual artifacts in inputs */
  input[type="text"], input[type="number"], input {
    list-style: none !important;
    list-style-type: none !important;
    background-image: none !important;
  }
  
  input::before, input::after {
    content: none !important;
    display: none !important;
  }
  
  /* Remove dots/bullets artifacts */
  input::-webkit-list-button {
    display: none !important;
  }
  
  input::-webkit-calendar-picker-indicator {
    display: none !important;
  }
  
  /* Modern editor typography */
  .editor-container {
    position: relative;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  }
  
  .editor-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    padding: 16px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.7;
    letter-spacing: 0.01em;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: hidden;
    color: transparent;
    z-index: 1;
  }
  
  /* Variable highlighting using <mark> tags in contentEditable */
  mark.var-highlight {
    display: inline;
    padding: 2px 6px;
    border-radius: 6px;
    font-weight: 600;
    background: rgba(203, 180, 74, 0.5); /* warm yellow/amber */
    color: #8a7530; /* navy text */
    border: 1px solid rgba(184, 162, 60, 0.5);
    font-style: normal;
  }
  mark.var-highlight.filled {
    background: rgba(203, 180, 74, 0.7);
    border-color: rgba(184, 162, 60, 0.8);
    font-weight: 700;
  }
  mark.var-highlight.empty {
    background: rgba(203, 180, 74, 0.35);
    border-color: rgba(184, 162, 60, 0.45);
    color: #8a7530;
    font-style: italic;
  }
  /* Focus assist: when a variable input is focused, outline matching marks */
  mark.var-highlight.focused {
    outline: 3px solid rgba(29, 78, 216, 0.9);
    border: 1px solid rgba(29, 78, 216, 0.8);
    box-shadow: 0 0 0 5px rgba(29, 78, 216, 0.25), 0 0 16px rgba(29, 78, 216, 0.35), inset 0 0 0 1px rgba(219, 234, 254, 0.8);
    background: rgba(219, 234, 254, 0.95);
    color: #1e3a8a;
    font-weight: 600;
    transition: outline-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease;
    animation: pulse-focus 1.5s ease-in-out infinite;
  }
  mark.var-highlight.hovered {
    outline: 2px solid rgba(96, 165, 250, 0.6);
    border: 1px solid rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(191, 219, 254, 0.4);
    background: rgba(219, 234, 254, 0.5);
    color: #1e40af;
    transition: outline-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease;
  }

  @keyframes pulse-focus {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.92;
    }
  }
  
  .editor-textarea {
    position: relative;
    z-index: 2;
    background: transparent !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 400;
    letter-spacing: 0.01em;
  }
  
  /* Input field typography improvements */
  input, textarea {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
    font-weight: 400;
    letter-spacing: 0.01em;
  }
  
  /* Resizable popup styles */
  .resizable-popup {
    resize: both;
    overflow: auto;
    position: relative;
  }
  
  .resizable-popup::-webkit-resizer {
    display: none; /* Hide default resizer completely */
  }
  
  /* Custom resize handle */
  .custom-resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nw-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s;
    pointer-events: none; /* Let browser handle resize */
  }
  
  .resizable-popup:hover .custom-resize-handle {
    opacity: 1;
  }

  /* Search hit highlight */
  mark.search-hit {
    background: #fff3bf;
    border-radius: 3px;
    padding: 0 2px;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);
  }
`

const normalizeForMatching = (value = '') => {
  if (!value) return { normalized: '', indexMap: [0] }
  const indexMap = []
  let normalized = ''
  let normalizedIndex = 0
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    if (char === '\r') continue
    indexMap[normalizedIndex] = i
    normalized += char
    normalizedIndex++
  }
  indexMap[normalizedIndex] = value.length
  return { normalized, indexMap }
}

// Helper function to strip rich text formatting while preserving variable pills
const stripRichTextForSync = (htmlText = '') => {
  if (!htmlText) return ''
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlText
  
  // Process nodes to extract plain text while preserving variable pills
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Handle variable pills - convert back to placeholder
      if (node.hasAttribute('data-var')) {
        const varName = node.getAttribute('data-var')
        return `<<${varName}>>`
      }
      
      // Handle line breaks
      if (node.tagName === 'BR') {
        return '\n'
      }
      
      // Handle block elements - add line breaks
      if (['DIV', 'P', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'ASIDE', 'NAV', 
           'UL', 'OL', 'LI', 'PRE', 'BLOCKQUOTE', 'TABLE', 'TBODY', 'THEAD', 
           'TFOOT', 'TR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR'].includes(node.tagName)) {
        let content = ''
        for (const child of node.childNodes) {
          content += processNode(child)
        }
        // Add line break after block elements (except if it's the last element)
        if (node.tagName !== 'DIV' || node.nextSibling) {
          content += '\n'
        }
        return content
      }
      
      // Handle inline elements - just extract text content
      let content = ''
      for (const child of node.childNodes) {
        content += processNode(child)
      }
      return content
    }
    
    return ''
  }
  
  let plainText = processNode(tempDiv)
  
  // Clean up extra line breaks
  plainText = plainText.replace(/\n\n+/g, '\n\n').replace(/^\n+|\n+$/g, '')
  
  return plainText
}

// Extract variable values directly from pill elements in HTML
const extractVariablesFromPills = (htmlText = '') => {
  if (!htmlText) return {}
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlText
  
  const variables = {}
  const pills = tempDiv.querySelectorAll('[data-var]')
  
  pills.forEach(pill => {
    const varName = pill.getAttribute('data-var')
    const varValue = pill.getAttribute('data-value') || pill.textContent || ''
    if (varName) {
      variables[varName] = varValue
    }
  })
  
  return variables
}

// Parse template structure into text and variable parts
const parseTemplateStructure = (tpl) => {
  if (!tpl) return []
  const parts = []
  const regex = /<<([^>]+)>>/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(tpl)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: tpl.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'var', name: match[1] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < tpl.length) {
    parts.push({ type: 'text', value: tpl.slice(lastIndex) })
  }
  return parts
}

// Compute variable ranges in text based on template structure
const computeVarRangesInText = (text, tpl) => {
  if (!tpl || typeof text !== 'string') return []
  const parts = parseTemplateStructure(tpl)
  if (!parts.length) return []
  let cursor = 0
  const ranges = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part.type === 'text') {
      if (!part.value) continue
      const idx = text.indexOf(part.value, cursor)
      if (idx === -1) return []
      cursor = idx + part.value.length
    } else if (part.type === 'var') {
      const nextText = (() => {
        for (let j = i + 1; j < parts.length; j++) {
          if (parts[j].type === 'text' && parts[j].value) return parts[j].value
        }
        return null
      })()
      const start = cursor
      let end
      if (nextText) {
        const nextIdx = text.indexOf(nextText, start)
        end = nextIdx === -1 ? text.length : nextIdx
      } else {
        end = text.length
      }
      if (end >= start) {
        ranges.push({ start, end, name: part.name })
        cursor = end
      }
    }
  }
  return ranges
}

const extractVariablesFromTemplate = (text = '', templateText = '', variableNames = []) => {
  if (!text || !templateText || !Array.isArray(variableNames) || !variableNames.length) return {}

  const { normalized: normalizedText, indexMap } = normalizeForMatching(text)
  const normalizedTemplate = templateText.replace(/\r/g, '')
  const ranges = computeVarRangesInText(normalizedText, normalizedTemplate)
  if (!ranges.length) return {}

  const validVariables = new Set(variableNames)
  const result = {}

  ranges.forEach(({ start, end, name }) => {
    if (!validVariables.has(name)) return
    const realStart = indexMap[start] ?? 0
    const realEnd = indexMap[end] ?? text.length
    const value = text.substring(realStart, realEnd).trim()
    if (value && value !== `<<${name}>>`) {
      result[name] = value
    }
  })

  return result
}

const extractVariableWithAnchors = (text = '', templateText = '', varName = '') => {
  if (!text || !templateText || !varName) return null
  const varPlaceholder = `<<${varName}>>`
  const varIndex = templateText.indexOf(varPlaceholder)
  if (varIndex === -1) return null

  const beforeSegments = templateText.substring(0, varIndex).split(/<<[^>]+>>/)
  const beforeAnchor = beforeSegments[beforeSegments.length - 1] || ''

  const afterStart = varIndex + varPlaceholder.length
  const afterSegments = templateText.substring(afterStart).split(/<<[^>]+>>/)
  const afterAnchor = afterSegments[0] || ''

  let startPos = 0
  let endPos = text.length

  if (beforeAnchor) {
    const beforeIndex = text.lastIndexOf(beforeAnchor)
    if (beforeIndex !== -1) {
      startPos = beforeIndex + beforeAnchor.length
    } else {
      const trimmed = beforeAnchor.trim()
      if (!trimmed) return null
      const approx = text.toLowerCase().lastIndexOf(trimmed.toLowerCase())
      if (approx === -1) return null
      startPos = approx + trimmed.length
    }
  }

  if (afterAnchor) {
    const afterIndex = text.indexOf(afterAnchor, startPos)
    if (afterIndex !== -1) {
      endPos = afterIndex
    } else {
      const trimmed = afterAnchor.trim()
      if (trimmed) {
        const approx = text.toLowerCase().indexOf(trimmed.toLowerCase(), startPos)
        if (approx !== -1) {
          endPos = approx
        }
      }
    }
  }

  const extracted = text.substring(startPos, endPos).trim()
  if (!extracted || extracted === varPlaceholder) return null
  return extracted
}

const resolveVariableInfo = (templatesData, name = '') => {
  if (!templatesData?.variables || !name) return null
  if (templatesData.variables[name]) return templatesData.variables[name]
  const base = name.replace(/_(FR|EN)$/i, '')
  return templatesData.variables[base] || null
}

const guessSampleValue = (templatesData, name = '') => {
  const info = resolveVariableInfo(templatesData, name)
  const suffixMatch = (name || '').match(/_(FR|EN)$/i)
  const suffix = suffixMatch ? suffixMatch[1].toUpperCase() : null

  // Prefer per-language examples when available.
  // Support legacy string example and new object shape { fr, en }.
  const rawExample = (() => {
    const exObj = info?.example && typeof info.example === 'object' && (info.example.fr || info.example.en) ? info.example : null
    const getFromExampleObject = (lang) => {
      if (!exObj) return null
      if (lang === 'EN') return exObj.en ?? exObj.fr ?? ''
      if (lang === 'FR') return exObj.fr ?? exObj.en ?? ''
      return exObj.fr ?? exObj.en ?? ''
    }
    if (suffix === 'EN') return info?.examples?.en ?? getFromExampleObject('EN') ?? (typeof info?.example === 'string' ? info.example : '') ?? ''
    if (suffix === 'FR') return info?.examples?.fr ?? getFromExampleObject('FR') ?? (typeof info?.example === 'string' ? info.example : '') ?? ''
    // Base (no suffix): prefer FR then EN
    return (info?.examples?.fr
      ?? info?.examples?.en
      ?? getFromExampleObject('FR')
      ?? (typeof info?.example === 'string' ? info.example : '')
      ?? '')
  })()
  const normalized = (name || '').toLowerCase()

  // Heuristic: determine intended kind
  const kind = (() => {
    if (info?.format) return info.format
    if (/date|jour|day/.test(normalized)) return 'date'
    if (/heure|time/.test(normalized)) return 'time'
    if (/(montant|total|amount|price|cost|refund|credit|deposit|payment)/.test(normalized)) return 'currency'
    if (/(nombre|count|num|quant)/.test(normalized)) return 'number'
    return 'text'
  })()

  // Map common FR placeholder to EN
  const mapFrPlaceholderToEn = (s = '') => {
    const trimmed = String(s).trim()
    if (!trimmed) return ''
    if (/^valeur\s+à\s+d[ée]finir$/i.test(trimmed)) return 'To be defined'
    return trimmed
  }

  // Build EN-friendly example if needed
  const toEnSample = (example, k) => {
    const val = String(example || '').trim()
    if (!val) {
      // Fallbacks by kind
      if (k === 'date') return '2025-07-15'
      if (k === 'time') return '09:00'
      if (k === 'currency') return '$1,250.00'
      if (k === 'number') return '0'
      return 'Example'
    }
    // URLs and emails are language-agnostic
    if (/^https?:\/\//i.test(val) || /@/.test(val)) return val
    // Common FR placeholder phrase
    const mapped = mapFrPlaceholderToEn(val)
    if (mapped !== val) return mapped
    if (k === 'currency') {
      // Convert FR-styled currency like "3 425,50 $" -> "$3,425.50"
      const m = val.match(/([0-9][0-9\s\u00A0.,]*)\s*\$/)
      if (m) {
        const digits = m[1]
          .replace(/\u00A0|\s/g, '') // remove thin/normal spaces
          .replace(/\.(?=\d{3})/g, '') // remove thousand dots if any
          .replace(/,(\d{2})$/, '.$1') // decimal comma -> dot
        // Insert commas for thousands
        const parts = digits.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return `$${parts.join('.')}`
      }
      // If it already looks EN-ish
      if (/^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/.test(val)) return val.startsWith('$') ? val : `$${val}`
      return '$1,250.00'
    }
    if (k === 'date') {
      return val
    }
    if (k === 'time') return '09:00'
    return val
  }

  // Build FR-friendly example fallback
  const toFrSample = (example, k) => {
    const val = String(example || '').trim()
    if (!val) {
      if (k === 'date') return new Date().toISOString().slice(0, 10)
      if (k === 'time') return '09:00'
      if (k === 'currency') return '2 890,00 $'
      if (k === 'number') return '0'
      return '…'
    }
    return val
  }

  if (suffix === 'EN') {
    return toEnSample(rawExample, kind)
  }
  if (suffix === 'FR') {
    return toFrSample(rawExample, kind)
  }

  // Base (no suffix): keep as dataset provides or generic by kind
  if (rawExample) return rawExample
  switch (kind) {
    case 'date':
      return new Date().toISOString().slice(0, 10)
    case 'time':
      return '09:00'
    case 'currency':
      return '2 890,00 $'
    case 'number':
      return '0'
    default:
      return '…'
  }
}

const hasText = (value) => typeof value === 'string' && value.trim().length > 0

const normalizeVariableEntry = (entry = {}) => {
  const textValue = (value) => (typeof value === 'string' ? value : '')
  const normalized = { ...entry }
  const desc = entry?.description || {}
  normalized.description = {
    fr: textValue(desc.fr),
    en: textValue(desc.en)
  }
  const example = entry?.example
  if (example && typeof example === 'object') {
    normalized.example = {
      fr: textValue(example.fr),
      en: textValue(example.en)
    }
  } else if (typeof example === 'string') {
    normalized.example = { fr: example, en: example }
  } else {
    normalized.example = { fr: '', en: '' }
  }
  normalized.format = entry?.format || 'text'
  if (entry?.examples) {
    normalized.examples = entry.examples
  }
  return normalized
}

const normalizeVariableLibrary = (library = {}) => {
  const normalized = {}
  Object.entries(library || {}).forEach(([key, value]) => {
    normalized[key] = normalizeVariableEntry(value || {})
  })
  return normalized
}

const mergeVariableLibraries = (primaryVars = {}, fallbackVars = {}) => {
  const merged = {}
  const keys = new Set([
    ...Object.keys(fallbackVars || {}),
    ...Object.keys(primaryVars || {})
  ])
  keys.forEach((key) => {
    const primaryEntry = primaryVars[key]
    const fallbackEntry = fallbackVars[key]
    if (!primaryEntry && !fallbackEntry) return
    const combined = {
      format: primaryEntry?.format || fallbackEntry?.format || 'text',
      description: {
        fr: hasText(primaryEntry?.description?.fr)
          ? primaryEntry.description.fr
          : (fallbackEntry?.description?.fr || ''),
        en: hasText(primaryEntry?.description?.en)
          ? primaryEntry.description.en
          : (fallbackEntry?.description?.en || '')
      },
      example: {
        fr: hasText(primaryEntry?.example?.fr)
          ? primaryEntry.example.fr
          : (fallbackEntry?.example?.fr || ''),
        en: hasText(primaryEntry?.example?.en)
          ? primaryEntry.example.en
          : (fallbackEntry?.example?.en || '')
      }
    }
    const examples = primaryEntry?.examples || fallbackEntry?.examples
    if (examples) combined.examples = examples
    merged[key] = combined
  })
  return merged
}

const mergeTemplateDatasets = (primary = {}, fallback = null) => {
  const normalizedPrimaryVars = normalizeVariableLibrary(primary?.variables || {})
  if (!fallback) {
    return {
      ...primary,
      variables: normalizedPrimaryVars
    }
  }
  const normalizedFallbackVars = normalizeVariableLibrary(fallback?.variables || {})
  const merged = {
    ...(fallback || {}),
    ...(primary || {})
  }
  merged.metadata = {
    ...(fallback?.metadata || {}),
    ...(primary?.metadata || {})
  }
  merged.templates = (Array.isArray(primary?.templates) && primary.templates.length)
    ? primary.templates
    : (fallback?.templates || [])
  merged.variables = mergeVariableLibraries(normalizedPrimaryVars, normalizedFallbackVars)
  return merged
}

const CANONICAL_TEMPLATES = mergeTemplateDatasets(canonicalTemplatesRaw, null)

const buildInitialVariables = (template, templatesData, langOverride) => {
  const seed = {}
  if (!template?.variables || !Array.isArray(template.variables)) return seed
  template.variables.forEach((baseName) => {
    const variants = new Set([baseName])
    LANGUAGE_SUFFIXES.forEach((suffix) => variants.add(`${baseName}_${suffix}`))
    variants.forEach((key) => {
      // For base (unsuffixed) variable prefer templateLanguage-specific default
      if (key === baseName) {
        const info = resolveVariableInfo(templatesData, baseName)
        if (info) {
          const lang = (langOverride || 'fr').toLowerCase()
          // Support object example { fr, en }
          if (info.example && typeof info.example === 'object') {
            seed[key] = info.example[lang] ?? info.example.fr ?? info.example.en ?? ''
            return
          }
          // Support examples map
          if (info.examples && info.examples[lang]) {
            seed[key] = info.examples[lang]
            return
          }
        }
      }
      seed[key] = guessSampleValue(templatesData, key)
    })
  })
  return seed
}

const applyAssignments = (prev = {}, assignments = {}) => {
  const keys = Object.keys(assignments || {})
  if (!keys.length) return prev
  let hasDiff = false
  const next = { ...prev }
  keys.forEach((key) => {
    const normalized = (assignments[key] ?? '').toString()
    if ((next[key] ?? '') !== normalized) {
      next[key] = normalized
      hasDiff = true
    }
  })
  return hasDiff ? next : prev
}

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const cleanupWhitespace = (text = '') => text
  .replace(/[ \t]{2,}/g, ' ')
  .replace(/\s+([,.;:!?])/g, '$1')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n[ \t]+/g, '\n')
  .replace(/\n{3,}/g, '\n\n')

const findTemplatePlaceholderForVar = (templateText = '', varName = '') => {
  if (!templateText || !varName) return null
  const normalizedTarget = normalizeVarKey(varName)
  if (!normalizedTarget) return null
  const regex = /<<([^>]+)>>/g
  let match
  while ((match = regex.exec(templateText)) !== null) {
    if (normalizeVarKey(match[1]) === normalizedTarget) {
      return match[0]
    }
  }
  return null
}

const removeVariablePlaceholderFromText = (text = '', varName = '') => {
  if (!text || !varName) return text
  const normalizedTarget = normalizeVarKey(varName)
  if (!normalizedTarget) return text

  const pattern = /(\s*)<<([^>]+)>>(\s*)/g
  const updated = text.replace(pattern, (fullMatch, leading = '', innerName = '', trailing = '') => {
    if (normalizeVarKey(innerName) !== normalizedTarget) return fullMatch

    const hasLeadingNewline = /\n/.test(leading)
    const hasTrailingNewline = /\n/.test(trailing)
    if (hasLeadingNewline && hasTrailingNewline) return '\n\n'
    if (hasLeadingNewline || hasTrailingNewline) return '\n'
    return ' '
  })

  return cleanupWhitespace(updated)
}

const ensurePlaceholderInText = (text = '', templateText = '', varName = '') => {
  if (!templateText || !varName) return text || ''
  const placeholder = findTemplatePlaceholderForVar(templateText, varName) || `<<${varName}>>`
  const source = text || ''
  if (source.includes(placeholder)) return source

  const varIndex = templateText.indexOf(placeholder)
  if (varIndex === -1) return source

  const beforeSegments = templateText.substring(0, varIndex).split(/<<[^>]+>>/)
  const beforeAnchor = beforeSegments[beforeSegments.length - 1] || ''
  const afterSegments = templateText.substring(varIndex + placeholder.length).split(/<<[^>]+>>/)
  const afterAnchor = afterSegments[0] || ''

  let insertPos = source.length

  if (afterAnchor) {
    const afterIdx = source.indexOf(afterAnchor)
    if (afterIdx !== -1) {
      insertPos = afterIdx
    }
  }

  if (insertPos === source.length && beforeAnchor) {
    const beforeIdx = source.lastIndexOf(beforeAnchor)
    if (beforeIdx !== -1) {
      insertPos = beforeIdx + beforeAnchor.length
    }
  }

  let working = source
  if (insertPos === working.length && !beforeAnchor && !afterAnchor && working.length > 0 && !/\n$/.test(working)) {
    working += '\n'
    insertPos = working.length
  }

  const charBefore = insertPos > 0 ? working[insertPos - 1] : ''
  const charAfter = insertPos < working.length ? working[insertPos] : ''
  const needsSpaceBefore = charBefore && !/[\s([\n]/.test(charBefore)
  const needsSpaceAfter = charAfter && !/[\s,.;:!?)/\]]/.test(charAfter)

  let insertion = placeholder
  if (needsSpaceBefore) insertion = ` ${insertion}`
  if (needsSpaceAfter) insertion = `${insertion} `

  const updated = working.slice(0, insertPos) + insertion + working.slice(insertPos)
  return cleanupWhitespace(updated)
}

// Lightweight bilingual synonyms for better recall in fuzzy search
const SYNONYMS = {
  // FR <-> EN common domain terms
  devis: ['devis', 'estimation', 'soumission', 'quote', 'estimate', 'quotation'],
  estimation: ['estimation', 'devis', 'quote', 'estimate'],
  soumission: ['soumission', 'devis', 'quote'],
  facture: ['facture', 'facturation', 'invoice', 'billing'],
  paiement: ['paiement', 'payment', 'payer', 'pay'],
  client: ['client', 'cliente', 'clients', 'customer', 'customers', 'user', 'utilisateur', 'usager'],
  projet: ['projet', 'projets', 'project', 'projects', 'gestion', 'management'],
  gestion: ['gestion', 'management', 'project management'],
  technique: ['technique', 'techniques', 'technical', 'tech', 'support'],
  probleme: ['problème', 'probleme', 'incident', 'bug', 'issue', 'problem', 'outage', 'panne'],
  urgent: ['urgent', 'urgence', 'priority', 'prioritaire', 'rush'],
  delai: ['délai', 'delai', 'delais', 'délai(s)', 'deadline', 'due date', 'turnaround'],
  tarif: ['tarif', 'tarifs', 'prix', 'price', 'pricing', 'rate', 'rates'],
  rabais: ['rabais', 'remise', 'escompte', 'discount'],
  traduction: ['traduction', 'translation', 'translate'],
  terminologie: ['terminologie', 'terminology', 'termes', 'glossary'],
  revision: ['révision', 'revision', 'review', 'proofreading'],
  service: ['service', 'services', 'offre', 'offer'],
}

const normalize = (s = '') => s
  .normalize('NFD')
  .replace(/\p{Diacritic}+/gu, '')
  .toLowerCase()

function expandQuery(q) {
  if (!q) return ''
  const tokens = normalize(q).split(/\s+/).filter(Boolean)
  const bag = new Set()
  for (const t of tokens) {
    bag.add(t)
    // try direct lookup
    if (SYNONYMS[t]) SYNONYMS[t].forEach(w => bag.add(normalize(w)))
    // try approximate key without accents
    const found = Object.keys(SYNONYMS).find(k => k === t)
    if (!found) {
      // fallback: add close matches by startsWith to avoid explosion
      for (const k of Object.keys(SYNONYMS)) {
        if (k.startsWith(t) || t.startsWith(k)) SYNONYMS[k].forEach(w => bag.add(normalize(w)))
      }
    }
  }
  return Array.from(bag).join(' ')
}

// Interface texts by language - moved outside component to avoid TDZ issues
const interfaceTexts = {
  fr: {
  title: 'echo',
    subtitle: 'Studio de modèles intelligents',
    selectTemplate: 'Sélectionnez un modèle',
    templatesCount: `modèles disponibles`,
  searchPlaceholder: 'Rechercher un modèle...',
    allCategories: 'Toutes les catégories',
    categories: {
      clarifications_and_client_instructions: 'Précisions et instructions client',
      deadlines_and_delivery: 'Délais et livraisons',
      documents_and_formatting: 'Documents et formats',
      follow_ups_and_cancellations: 'Suivi et annulations',
      quotes_and_approvals: 'Devis et approbations',
      security_and_copyright: 'Sécurité et droits d\'auteur'
    },
    templateLanguage: 'Langue du modèle',
    interfaceLanguage: 'Langue de l\'interface',
    variables: 'Variables',
    editEmail: 'Éditez votre modèle',
    subject: 'Objet',
    body: 'Corps du message',
    reset: 'Réinitialiser',
    copy: 'Copier',
    copySubject: 'Copier Objet',
    copyBody: 'Copier Corps', 
    copyAll: 'Copier Tout',
    copied: 'Copié !',
    copyLink: 'Copier le lien',
    copyLinkTitle: 'Copier le lien direct vers ce modèle',
  openInOutlookClassic: 'Ouvrir dans Outlook classique',
  openInOutlookClassicTitle: 'Composer avec Outlook classique',
  openInOutlookWeb: 'Ouvrir dans Outlook Web',
  openInOutlookWebTitle: 'Composer avec Outlook Web',
    sendEmail: 'Envoyer',
  favorites: 'Favoris',
  showFavoritesOnly: 'Afficher uniquement les favoris',
    noTemplate: 'Sélectionnez un modèle pour commencer',
    resetWarningTitle: 'Confirmer la réinitialisation',
    resetWarningMessage: 'Êtes-vous sûr de vouloir réinitialiser toutes les variables ? Cette action ne peut pas être annulée.',
    cancel: 'Annuler',
    confirm: 'Confirmer'
  },
  en: {
  title: 'echo',
    subtitle: 'Smart Template Studio',
    selectTemplate: 'Select a template',
    templatesCount: `templates available`,
  searchPlaceholder: 'Search for a template...',
    allCategories: 'All categories',
    categories: {
      clarifications_and_client_instructions: 'Clarifications and client instructions',
      deadlines_and_delivery: 'Deadlines and delivery',
      documents_and_formatting: 'Documents and formatting',
      follow_ups_and_cancellations: 'Follow-ups and cancellations',
      quotes_and_approvals: 'Quotes and approvals',
      security_and_copyright: 'Security and copyright'
    },
    templateLanguage: 'Template language',
    interfaceLanguage: 'Interface language',
    variables: 'Variables',
    editEmail: 'Edit your template',
    subject: 'Subject',
    body: 'Message body',
    reset: 'Reset',
    copy: 'Copy',
    copySubject: 'Copy Subject',
    copyBody: 'Copy Body',
    copyAll: 'Copy All',
    copied: 'Copied!',
    copyLink: 'Copy link',
    copyLinkTitle: 'Copy direct link to this template',
  openInOutlookClassic: 'Open in Outlook Classic',
  openInOutlookClassicTitle: 'Compose in Outlook Classic',
  openInOutlookWeb: 'Open in Outlook Web',
  openInOutlookWebTitle: 'Compose in Outlook Web',
    sendEmail: 'Send',
  favorites: 'Favorites',
  showFavoritesOnly: 'Show only favorites',
    noTemplate: 'Select a template to get started',
    resetWarningTitle: 'Confirm Reset',
    resetWarningMessage: 'Are you sure you want to reset all variables? This action cannot be undone.',
    cancel: 'Cancel',
    confirm: 'Confirm'
  }
}

function App() {
  // Toast notifications
  const toast = useToast()

  // Inject custom styles for variable highlighting
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = customEditorStyles
    document.head.appendChild(styleElement)
    return () => document.head.removeChild(styleElement)
  }, [])

  // Debug flag via ?debug=1
  const debug = useMemo(() => {
    try { return new URLSearchParams(window.location.search).has('debug') } catch { return false }
  }, [])

  // Load saved state
  const skipSavedState = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('reset') === '1'
    } catch {
      return false
    }
  }, [])

  const savedState = useMemo(() => (skipSavedState ? getDefaultState() : loadState()), [skipSavedState])

  useEffect(() => {
    if (!skipSavedState) return
    clearState()
    try {
      localStorage.removeItem('ea_last_template_id')
      localStorage.removeItem('ea_last_template_lang')
    } catch {}
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete('reset')
      window.history.replaceState(null, '', url.toString())
    } catch {}
  }, [skipSavedState])
  
  // State for template data
  const [templatesData, setTemplatesData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Separate interface language from template language
  const [interfaceLanguage, setInterfaceLanguage] = useState(savedState.interfaceLanguage || 'fr') // Interface language
  const [templateLanguage, setTemplateLanguage] = useState(savedState.templateLanguage || 'fr')   // Template language
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState(savedState.selectedTemplateId || null)
  const [searchQuery, setSearchQuery] = useState(savedState.searchQuery || '')
  const [selectedCategory, setSelectedCategory] = useState(savedState.selectedCategory || 'all')
  
  const [finalSubject, setFinalSubject] = useState('') // Final editable version
  const [finalBody, setFinalBody] = useState('') // Final editable version
  const [variables, setVariables] = useState(savedState.variables || {})
  // Preference: Strict Classic Outlook (avoid ms-outlook/mailto to reduce New Outlook/Web)
  const [strictClassic, setStrictClassic] = useState(() => {
    if (typeof savedState.strictClassic !== 'undefined') return !!savedState.strictClassic
    try { return localStorage.getItem('ea_strict_classic') === '1' } catch (e) { return false }
  })

  const variablesRef = useRef(variables)
  const finalSubjectRef = useRef(finalSubject)
  const finalBodyRef = useRef(finalBody)
  const bodyEditorRef = useRef(null)
  const subjectEditorRef = useRef(null)
  const selectedTemplateRef = useRef(selectedTemplate)
  const templateLanguageRef = useRef(templateLanguage)
  const syncFromTextRef = useRef(null)
  const focusFromPopoutRef = useRef(false)

  useEffect(() => { variablesRef.current = variables }, [variables])
  useEffect(() => { finalSubjectRef.current = finalSubject }, [finalSubject])
  useEffect(() => { finalBodyRef.current = finalBody }, [finalBody])

  // Persist Strict Classic preference
  useEffect(() => {
    try { localStorage.setItem('ea_strict_classic', strictClassic ? '1' : '0') } catch (e) {}
  }, [strictClassic])
  useEffect(() => { selectedTemplateRef.current = selectedTemplate }, [selectedTemplate])
  useEffect(() => { templateLanguageRef.current = templateLanguage }, [templateLanguage])
  const [favorites, setFavorites] = useState(savedState.favorites || [])
  const [favoritesOnly, setFavoritesOnly] = useState(savedState.favoritesOnly || false)
  const [copySuccess, setCopySuccess] = useState(null) // tracks which button was clicked: 'subject', 'body', 'all', or null
  const [showVariablePopup, setShowVariablePopup] = useState(false)
  const [showHelpCenter, setShowHelpCenter] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [preferPopout, setPreferPopout] = useState(() => {
    try { return localStorage.getItem('ea_prefer_popout') === 'true' } catch { return false }
  })
  const [showHighlights, setShowHighlights] = useState(() => {
    const saved = localStorage.getItem('ea_show_highlights')
    return saved === null ? true : saved === 'true'
  })
  const supportEmail = useMemo(() => {
    try {
      const envEmail = import.meta?.env?.VITE_SUPPORT_EMAIL
      if (typeof envEmail === 'string') {
        const trimmed = envEmail.trim()
        if (trimmed) return trimmed
      }
    } catch {}
    return 'jskennedy80@gmail.com'
  }, [])
  const supportFormEndpoint = useMemo(() => {
    try {
      const endpoint = import.meta?.env?.VITE_SUPPORT_FORM_ENDPOINT
      if (typeof endpoint === 'string' && endpoint.trim().length) {
        return endpoint.trim()
      }
    } catch {}
    return null
  }, [])
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = Number(localStorage.getItem('ea_left_width'))
    return Number.isFinite(saved) && saved >= 340 && saved <= 680 ? saved : 480
  })
  const isDragging = useRef(false)
  const [varPopupPos, setVarPopupPos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ea_var_popup_pos_v3') || 'null')
      if (saved && typeof saved.top === 'number' && typeof saved.left === 'number' && typeof saved.width === 'number' && typeof saved.height === 'number') return saved
    } catch {}
    // Default: compact single-column pane sized for four cards tall
    return { top: 80, left: 80, width: 470, height: 700 }
  })
  const varPopupRef = useRef(null)
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origTop: 0, origLeft: 0 })
  // Vars popup UX state
  const [varsFilter, setVarsFilter] = useState('')
  const [focusedVar, setFocusedVar] = useState(null)
  const varInputRefs = useRef({})
  const [varsPinned, setVarsPinned] = useState(true)
  const [varsMinimized, setVarsMinimized] = useState(false)
  const [pillPos, setPillPos] = useState({ right: 16, bottom: 16 })
  const [isFullscreen, setIsFullscreen] = useState(() => {
    try { return !!(document.fullscreenElement || document.webkitFullscreenElement) } catch { return false }
  })
  // Cross-window sync for variables (main <-> pop-out)
  const varsChannelRef = useRef(null)
  const varsSenderIdRef = useRef(Math.random().toString(36).slice(2))
  const popoutChannelRef = useRef(null)
  const popoutSenderIdRef = useRef(Math.random().toString(36).slice(2))
  const pendingPopoutSnapshotRef = useRef(null)
  const varsRemoteUpdateRef = useRef(false)
  const skipPopoutBroadcastRef = useRef({ pending: false, templateId: null, templateLanguage: null })
  const manualEditRef = useRef({ subject: false, body: false })
  const pendingTemplateIdRef = useRef(null)
  const canUseBC = typeof window !== 'undefined' && 'BroadcastChannel' in window

  const updateFocusHighlight = useCallback((varName) => {
    try {
      const normalized = normalizeVarKey(varName)
      const marks = document.querySelectorAll('mark.var-highlight')
      const pills = document.querySelectorAll('.var-pill')

      marks.forEach((node) => {
        const nodeKey = node.getAttribute('data-var')
        const isMatch = normalized && normalizeVarKey(nodeKey) === normalized
        node.classList.toggle('focused', !!isMatch)
      })

      pills.forEach((node) => {
        const nodeKey = node.getAttribute('data-var')
        const isMatch = normalized && normalizeVarKey(nodeKey) === normalized
        node.classList.toggle('focused', !!isMatch)
      })
    } catch (err) {
      console.warn('Failed to update focus highlight', err)
    }
  }, [])

  const scrollFocusIntoView = useCallback((varName) => {
    const normalized = normalizeVarKey(varName)
    if (!normalized) return
    requestAnimationFrame(() => {
      const pill = Array.from(document.querySelectorAll('.var-pill')).find((node) => normalizeVarKey(node.getAttribute('data-var')) === normalized)
      const mark = pill ? null : Array.from(document.querySelectorAll('mark.var-highlight')).find((node) => normalizeVarKey(node.getAttribute('data-var')) === normalized)
      const target = pill || mark
      if (!target) return
      try {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch {}
    })
  }, [])

  const updateHoverHighlight = useCallback((varName) => {
    try {
      const normalized = normalizeVarKey(varName)
      const marks = document.querySelectorAll('mark.var-highlight')
      const pills = document.querySelectorAll('.var-pill')

      marks.forEach((node) => {
        const nodeKey = node.getAttribute('data-var')
        const isMatch = normalized && normalizeVarKey(nodeKey) === normalized
        node.classList.toggle('hovered', !!isMatch)
      })

      pills.forEach((node) => {
        const nodeKey = node.getAttribute('data-var')
        const isMatch = normalized && normalizeVarKey(nodeKey) === normalized
        node.classList.toggle('hovered', !!isMatch)
      })
    } catch (err) {
      console.warn('Failed to update hover highlight', err)
    }
  }, [])

  // Keep highlight visible briefly after blur for better visual continuity
  const focusClearTimerRef = useRef(null)

  const flagSkipPopoutBroadcast = () => {
    skipPopoutBroadcastRef.current = {
      pending: true,
      templateId: selectedTemplateRef.current?.id || null,
      templateLanguage: templateLanguageRef.current || null
    }
  }
  // Focus → outline matching marks/pills; blur clears after a short delay
  useEffect(() => {
    if (focusClearTimerRef.current) { clearTimeout(focusClearTimerRef.current); focusClearTimerRef.current = null }
    if (focusedVar) {
      updateFocusHighlight(focusedVar)
    } else {
      focusClearTimerRef.current = setTimeout(() => updateFocusHighlight(null), 300)
    }
    return () => { if (focusClearTimerRef.current) { clearTimeout(focusClearTimerRef.current); focusClearTimerRef.current = null } }
  }, [focusedVar, updateFocusHighlight])

  // Listen for pill focus events dispatched from PillComponent
  useEffect(() => {
    const handler = (e) => {
      const { key } = e.detail || {}
      setFocusedVar(key || null)
    }
    window.addEventListener('ea-focus-variable', handler)
    return () => window.removeEventListener('ea-focus-variable', handler)
  }, [])

  // Track hover over pills and marks to sync with popout
  useEffect(() => {
    let currentHoveredVar = null

    const handleMouseOver = (e) => {
      const target = e.target
      if (!target) return

      // Check if hovering over a pill or mark
      const pill = target.closest('.var-pill')
      const mark = target.closest('mark.var-highlight')
      const element = pill || mark

      if (element) {
        const varName = element.getAttribute('data-var')
        if (varName && varName !== currentHoveredVar) {
          currentHoveredVar = varName
          updateHoverHighlight(varName)
          
          // Broadcast to popout
          if (popoutChannelRef.current) {
            try {
              popoutChannelRef.current.postMessage({
                type: 'variableHovered',
                varName,
                sender: popoutSenderIdRef.current
              })
            } catch (e) {
              console.error('Failed to send hover update:', e)
            }
          }
        }
      } else if (currentHoveredVar) {
        currentHoveredVar = null
        updateHoverHighlight(null)
        
        // Broadcast clear to popout
        if (popoutChannelRef.current) {
          try {
            popoutChannelRef.current.postMessage({
              type: 'variableHovered',
              varName: null,
              sender: popoutSenderIdRef.current
            })
          } catch (e) {
            console.error('Failed to send hover clear:', e)
          }
        }
      }
    }

    document.addEventListener('mouseover', handleMouseOver, true)
    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true)
      if (currentHoveredVar) {
        updateHoverHighlight(null)
      }
    }
  }, [updateHoverHighlight])

  const handleInlineVariableChange = useCallback((updates) => {
    if (!updates) return
    setVariables((prev) => {
      const assignments = {}
      const preferredLang = (templateLanguageRef.current || 'fr').toUpperCase()
      Object.entries(updates).forEach(([key, rawValue]) => {
        const normalized = (rawValue ?? '').toString()
        Object.assign(assignments, expandVariableAssignment(key, normalized, {
          preferredLanguage: preferredLang,
          variables: prev
        }))
      })
      const next = applyAssignments(prev, assignments)
      if (next !== prev) {
        variablesRef.current = next
      }
      return next
    })
  }, [])

  // Refresh outlines if content updates while focused
  useEffect(() => {
    if (!focusedVar) return
    requestAnimationFrame(() => updateFocusHighlight(focusedVar))
  }, [variables, showHighlights, focusedVar, updateFocusHighlight])

  // Clear any lingering highlight when switching template or language
  useEffect(() => {
    updateFocusHighlight(null)
  }, [selectedTemplateId, templateLanguage, updateFocusHighlight])
  // Export menu state (replaces <details> for reliability)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef(null)
  
  // References for keyboard shortcuts
  const searchRef = useRef(null) // Reference for focus on search (Ctrl+J)

  // Template list interaction states
  const [pressedCardId, setPressedCardId] = useState(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const itemRefs = useRef({})
  const [favLiveMsg, setFavLiveMsg] = useState('')
  // Virtualization and mobile
  const viewportRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportH, setViewportH] = useState(600)
  const [showMobileTemplates, setShowMobileTemplates] = useState(false)
  // Pop-out (child window) mode: render variables only when ?varsOnly=1
  const varsOnlyMode = useMemo(() => {
    try { return new URLSearchParams(window.location.search).get('varsOnly') === '1' } catch { return false }
  }, [])

  // Auto-open variables popup in vars-only mode
  useEffect(() => {
    if (varsOnlyMode) setShowVariablePopup(true)
  }, [varsOnlyMode])

  // In varsOnly mode, make the popup fill the window and follow resize
  useEffect(() => {
    if (!varsOnlyMode) return
    const setFull = () => setVarPopupPos(p => ({ ...p, top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }))
    setFull()
    const onResize = () => setFull()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [varsOnlyMode])

  // Track fullscreen state (pop-out only)
  useEffect(() => {
    const onFs = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement))
      // adjust size again when entering/exiting fullscreen
      if (varsOnlyMode) setVarPopupPos(p => ({ ...p, top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }))
    }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
    }
  }, [varsOnlyMode])

  const toggleFullscreen = () => {
    try {
      const el = document.documentElement
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement)
      if (!isFs) {
        if (el.requestFullscreen) el.requestFullscreen()
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
      } else {
        if (document.exitFullscreen) document.exitFullscreen()
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
      }
    } catch {}
  }

  // Automatically save important preferences with debouncing for variables
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveState({
        interfaceLanguage,
        templateLanguage,
        searchQuery,
        selectedCategory,
        selectedTemplateId,
        variables,
        favorites,
        favoritesOnly
      })
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [interfaceLanguage, templateLanguage, searchQuery, selectedCategory, selectedTemplateId, variables, favorites, favoritesOnly])

  // Persist pane sizes
  useEffect(() => {
    try {
      localStorage.setItem('ea_left_width', String(leftWidth))
    } catch {}
  }, [leftWidth])

  // Persist highlight visibility
  useEffect(() => {
    try {
      localStorage.setItem('ea_show_highlights', String(showHighlights))
    } catch {}
  }, [showHighlights])

  // Persist popup position/size
  useEffect(() => {
    try { localStorage.setItem('ea_var_popup_pos_v3', JSON.stringify(varPopupPos)) } catch {}
  }, [varPopupPos])

  // Persist popout preference
  useEffect(() => {
    try { localStorage.setItem('ea_prefer_popout', String(preferPopout)) } catch {}
  }, [preferPopout])

  // Persist last used template and language for robust popout fallback
  useEffect(() => {
    try {
      if (selectedTemplateId) localStorage.setItem('ea_last_template_id', selectedTemplateId)
      if (templateLanguage) localStorage.setItem('ea_last_template_lang', templateLanguage)
    } catch {}
  }, [selectedTemplateId, templateLanguage])

  // Smart function to open variables (popup or popout based on preference)
  const openVariables = useCallback(() => {
    if (preferPopout && selectedTemplate?.variables?.length > 0) {
      // Auto-open popout (single-column, approx 470x700)
      const url = new URL(window.location.href)
      url.searchParams.set('varsOnly', '1')
      if (selectedTemplate?.id) url.searchParams.set('id', selectedTemplate.id)
      if (templateLanguage) url.searchParams.set('lang', templateLanguage)
      // Calculate optimal size based on number of variables
      const varCount = selectedTemplate?.variables?.length || 0
      
      // Base dimensions - responsive width that allows 2 columns by default
      const cardHeight = 110 // estimated height per card
      const headerHeight = 60 // header bar height
      const padding = 40 // total padding
      
      // Start with a good width for 2 columns (responsive breakpoint)
      let w = 720
      
      // Calculate height based on 2-column layout
      const rows = Math.ceil(varCount / 2)
      let h = Math.max(400, Math.min(900, headerHeight + (rows * cardHeight) + padding))
      
      // Clamp to available screen space
      const availW = (window.screen?.availWidth || window.innerWidth) - 40
      const availH = (window.screen?.availHeight || window.innerHeight) - 80
      w = Math.min(w, availW)
      h = Math.min(h, availH)
      
      const left = Math.max(0, Math.floor(((window.screen?.availWidth || window.innerWidth) - w) / 2))
      const top = Math.max(0, Math.floor(((window.screen?.availHeight || window.innerHeight) - h) / 3))
      // Important: open a blank window with features so size is respected
      // Some environments ignore features when opening a URL directly
      // Note: alwaysRaised is a Firefox-specific feature that helps keep window on top
      const features = `popup=yes,width=${Math.round(w)},height=${Math.round(h)},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0,scrollbars=1,resizable=1,alwaysRaised=yes`
      const win = window.open('', '_blank', features)
      if (win) {
        try {
          // Minimal loading state to avoid white flash
          win.document.write('<!doctype html><title>Loading…</title><style>html,body{height:100%;margin:0;font:14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;display:grid;place-items:center;color:#6b7280;background:#fff}</style><div>Loading…</div>')
        } catch {}
        try { win.location.replace(url.toString()) } catch { try { win.location.href = url.toString() } catch {} }
        try { win.focus() } catch {}
      }
      
      // Auto-close the popup when popout opens successfully
      if (win) {
        setVarsMinimized(false)
        setVarsPinned(false)
        setShowVariablePopup(false)
        
        // Notify other components that popout opened
        if (canUseBC) {
          try {
            const channel = new BroadcastChannel('email-assistant-sync')
            channel.postMessage({ type: 'popoutOpened', timestamp: Date.now() })
            channel.close()
          } catch (e) {
            console.log('BroadcastChannel not available for popout sync')
          }
        }
        
        // Listen for when popout window closes
        const checkClosed = setInterval(() => {
          if (win.closed) {
            clearInterval(checkClosed)
            // Notify that popout closed
            if (canUseBC) {
              try {
                const channel = new BroadcastChannel('email-assistant-sync')
                channel.postMessage({ type: 'popoutClosed', timestamp: Date.now() })
                channel.close()
              } catch (e) {
                console.log('BroadcastChannel not available for popout close sync')
              }
            }
          }
        }, 1000)
      }
    } else {
      // Open popup
      setShowVariablePopup(true)
      
      // Notify that variables popup opened
      if (canUseBC) {
        try {
          const channel = new BroadcastChannel('email-assistant-sync')
          channel.postMessage({ type: 'variablesPopupOpened', timestamp: Date.now() })
          channel.close()
        } catch (e) {
          console.log('BroadcastChannel not available for popup sync')
        }
      }
    }
  }, [preferPopout, selectedTemplate, templateLanguage])

  // Setup BroadcastChannel for variables syncing
  useEffect(() => {
    if (!canUseBC) return
    try {
      const ch = new BroadcastChannel('ea_vars')
      varsChannelRef.current = ch

      ch.onmessage = (ev) => {
        const msg = ev?.data || {}
        if (!msg || msg.sender === varsSenderIdRef.current) return
        const applyTemplateMeta = (m) => {
          if (m?.templateLanguage && (m.templateLanguage === 'fr' || m.templateLanguage === 'en')) {
            setTemplateLanguage(m.templateLanguage)
          }
          if (m?.templateId) {
            if (templatesData?.templates?.length) {
              const found = templatesData.templates.find(t => t.id === m.templateId)
              if (found) setSelectedTemplate(found)
            } else {
              pendingTemplateIdRef.current = m.templateId
            }
          }
        }
        if (msg.type === 'update' && (msg.variables || msg.templateId || msg.templateLanguage || msg.hasOwnProperty('focusedVar'))) {
          if (msg.variables && typeof msg.variables === 'object') {
            varsRemoteUpdateRef.current = true
            setVariables(prev => {
              const next = { ...prev, ...msg.variables }
              variablesRef.current = next
              return next
            })
          }
          if (msg.hasOwnProperty('focusedVar')) {
            setFocusedVar(msg.focusedVar)
          }
          // Skip showHighlights sync via BroadcastChannel to prevent interference
          // showHighlights will be synced only via localStorage fallback
          applyTemplateMeta(msg)
        } else if (msg.type === 'request_state') {
          ch.postMessage({ type: 'state', variables, templateId: selectedTemplate?.id || null, templateLanguage, focusedVar, sender: varsSenderIdRef.current })
        } else if (msg.type === 'state') {
          if (msg.variables) {
            varsRemoteUpdateRef.current = true
            setVariables(prev => {
              const next = { ...prev, ...msg.variables }
              variablesRef.current = next
              return next
            })
          }
          if (msg.hasOwnProperty('focusedVar')) {
            setFocusedVar(msg.focusedVar)
          }
          // Skip showHighlights sync via BroadcastChannel to prevent interference
          // showHighlights will be synced only via localStorage fallback
          applyTemplateMeta(msg)
        }
      }
      if (varsOnlyMode) {
        setTimeout(() => {
          try { ch.postMessage({ type: 'request_state', sender: varsSenderIdRef.current }) } catch {}
        }, 50)
      }
      return () => { try { ch.close() } catch {} }
    } catch {}
  }, [])

  // Listen for variable updates from the new Variables popout window
  useEffect(() => {
    if (!canUseBC) return
    try {
      const channel = new BroadcastChannel('email-assistant-sync')
      popoutChannelRef.current = channel
      
      channel.onmessage = (event) => {
        const msg = event.data
        if (!msg || msg.sender === popoutSenderIdRef.current) return
        
        // Handle hover synchronization from popout
        if (msg.type === 'variableHovered') {
          updateHoverHighlight(msg.varName || null)
          return
        }
        
        // Handle variable changes from popout
        if (msg.type === 'variableChanged' && msg.allVariables) {
          varsRemoteUpdateRef.current = true
          flagSkipPopoutBroadcast()
          const next = { ...msg.allVariables }
          variablesRef.current = next
          setVariables(next)
          // Purge any pills whose variables are now marked deleted
          try {
            Object.entries(next).forEach(([k,v]) => {
              if (v === '__DELETED__') {
                const base = k.replace(/_(FR|EN)$/i,'')
                document.querySelectorAll('.var-pill').forEach(pill => {
                  const pv = pill.getAttribute('data-var') || ''
                  if (pv === k || pv.replace(/_(FR|EN)$/i,'') === base) {
                    pill.remove()
                  }
                })
              }
            })
          } catch {}
          return
        }

        if (msg.type === 'variableDeleted' && msg.varName) {
          const { varName } = msg
          varsRemoteUpdateRef.current = true
          flagSkipPopoutBroadcast()
          const next = msg.allVariables
            ? { ...msg.allVariables }
            : { ...variablesRef.current, [varName]: '__DELETED__' }
          variablesRef.current = next
          setVariables(next)

          if (varName) {
            setFinalSubject(prev => {
              const base = typeof prev === 'string' ? prev : finalSubjectRef.current || ''
              const updated = removeVariablePlaceholderFromText(base, varName)
              finalSubjectRef.current = updated
              return updated
            })
            setFinalBody(prev => {
              const base = typeof prev === 'string' ? prev : finalBodyRef.current || ''
              const updated = removeVariablePlaceholderFromText(base, varName)
              finalBodyRef.current = updated
              return updated
            })
            // Remove any existing pill DOM nodes for this variable (and language variants)
            try {
              const baseName = varName.replace(/_(FR|EN)$/i,'')
              document.querySelectorAll('.var-pill').forEach(pill => {
                const pv = pill.getAttribute('data-var') || ''
                if (pv === varName || pv.replace(/_(FR|EN)$/i,'') === baseName) {
                  pill.remove()
                }
              })
            } catch {}
          }
          return
        }

        if (msg.type === 'variableRestored' && msg.varName) {
          const { varName, value = '' } = msg
          varsRemoteUpdateRef.current = true
          flagSkipPopoutBroadcast()
          const next = msg.allVariables
            ? { ...msg.allVariables }
            : (() => {
                const assignments = expandVariableAssignment(varName, value, {
                  preferredLanguage: (templateLanguageRef.current || 'fr').toUpperCase(),
                  variables: variablesRef.current
                })
                return applyAssignments(variablesRef.current, assignments)
              })()
          variablesRef.current = next
          setVariables(next)

          const latestTemplate = selectedTemplateRef.current
          const latestLanguage = templateLanguageRef.current || templateLanguage
          const subjectTemplate = latestTemplate?.subject?.[latestLanguage] || ''
          const bodyTemplate = latestTemplate?.body?.[latestLanguage] || ''

          const subjectHasVar = !!findTemplatePlaceholderForVar(subjectTemplate, varName)
          if (subjectHasVar) {
            setFinalSubject(prev => {
              const base = typeof prev === 'string' ? prev : finalSubjectRef.current || ''
              const updated = ensurePlaceholderInText(base, subjectTemplate, varName)
              finalSubjectRef.current = updated
              return updated
            })
          }

          const bodyHasVar = !!findTemplatePlaceholderForVar(bodyTemplate, varName)
          if (bodyHasVar) {
            setFinalBody(prev => {
              const base = typeof prev === 'string' ? prev : finalBodyRef.current || ''
              const updated = ensurePlaceholderInText(base, bodyTemplate, varName)
              finalBodyRef.current = updated
              return updated
            })
          }

          return
        }

        if (msg.type === 'focusedVar') {
          focusFromPopoutRef.current = true
          const next = msg.varName ?? null
          setFocusedVar(next)
          updateFocusHighlight(next)
          scrollFocusIntoView(next)
          return
        }

        if (msg.type === 'popoutOpened' || msg.type === 'popoutReady') {
          console.log(`🔄 ${msg.type === 'popoutReady' ? 'Popout ready' : 'Popout opened'}, extracting current values from editors...`)

          setTimeout(() => {
            // ALWAYS extract from editors when popout opens to get latest values
            // This ensures any edits made in the main window pills are captured
            let latestVariables = null
            
            try {
              const runSync = syncFromTextRef.current
              const syncResult = typeof runSync === 'function' ? runSync() : null
              if (syncResult?.variables) {
                latestVariables = { ...syncResult.variables }
                console.log('🔄 Extracted variables from editors:', latestVariables)
              }
            } catch (syncError) {
              console.error('Failed to extract variables while preparing popout snapshot:', syncError)
            }

            // Fallback to snapshot or current variables if extraction failed
            if (!latestVariables && pendingPopoutSnapshotRef.current) {
              latestVariables = { ...pendingPopoutSnapshotRef.current }
              console.log('🔄 Using pending snapshot:', latestVariables)
            }

            if (!latestVariables) {
              latestVariables = { ...variablesRef.current }
              console.log('🔄 Using current variables ref:', latestVariables)
            }

            pendingPopoutSnapshotRef.current = null

            console.log('🔄 Sending variables to popout:', latestVariables)

            try {
              channel.postMessage({
                type: 'variablesUpdated',
                variables: latestVariables,
                templateId: selectedTemplateRef.current?.id || null,
                templateLanguage: templateLanguageRef.current || templateLanguage,
                sender: popoutSenderIdRef.current
              })
              console.log('🔄 Sent variables to popout successfully')
            } catch (e) {
              console.error('Failed to send variables snapshot to popout:', e)
            }
          }, 60)
          return
        }
        
        // Handle sync request from popout
        if (msg.type === 'syncFromText') {
          console.log('🔄 Received syncFromText request from popout')
          
          // Extract current values from editors
          setTimeout(() => {
            const runSync = syncFromTextRef.current
            const result = typeof runSync === 'function' ? runSync() : { success: false, updated: false, variables: { ...variablesRef.current } }
            
            console.log('🔄 Sync result:', result)
            
            // Send back the extracted variables
            try {
              console.log('🔄 Sending sync result back to popout:', result.variables)
              channel.postMessage({
                type: 'syncComplete',
                success: result.success,
                updated: result.updated,
                variables: result.variables,
                sender: popoutSenderIdRef.current
              })
            } catch (e) {
              console.error('Failed to send sync result:', e)
            }
          }, 50) // Small delay to ensure state consistency
          return
        }
      }
      
      return () => {
        try {
          channel.close()
        } catch (e) {
          console.error('Error closing BroadcastChannel:', e)
        }
        popoutChannelRef.current = null
      }
    } catch (e) {
      console.error('BroadcastChannel not available:', e)
    }
  }, [])

  // Emit updates when local variables change (avoid echo loops) with debouncing
  useEffect(() => {
    if (!canUseBC) return
    if (varsRemoteUpdateRef.current) { varsRemoteUpdateRef.current = false; return }
    
    const snapshot = { ...variables }
    const timeoutId = setTimeout(() => {
      const ch = varsChannelRef.current
      if (!ch) return
      try { ch.postMessage({ type: 'update', variables: snapshot, sender: varsSenderIdRef.current }) } catch {}
    }, 90) // slightly faster to improve perceived latency
    
    return () => clearTimeout(timeoutId)
  }, [variables])

  // Emit selected template and language so pop-out stays in sync
  useEffect(() => {
    if (!canUseBC) return
    const activeTemplateId = selectedTemplateRef.current?.id || selectedTemplateId || null
    const ch = varsChannelRef.current
    if (!ch) return
    const payload = { type: 'update', templateId: activeTemplateId, templateLanguage, sender: varsSenderIdRef.current }
    try { ch.postMessage(payload) } catch {}
    // Also notify popout channel directly for immediate template-language sync
    const popCh = popoutChannelRef.current
    if (popCh) {
      try { popCh.postMessage({ type: 'variablesUpdated', variables: { ...variablesRef.current }, templateId: activeTemplateId, templateLanguage, sender: popoutSenderIdRef.current }) } catch {}
    }
  }, [selectedTemplateId, templateLanguage])

  useEffect(() => {
    if (!canUseBC) return
    const channel = popoutChannelRef.current
    if (!channel) return

    const activeTemplateId = selectedTemplateRef.current?.id || selectedTemplateId || null
    const skipMeta = skipPopoutBroadcastRef.current
    if (skipMeta?.pending && skipMeta.templateId === activeTemplateId && skipMeta.templateLanguage === (templateLanguage || null)) {
      skipPopoutBroadcastRef.current = { pending: false, templateId: null, templateLanguage: null }
      return
    }
    skipPopoutBroadcastRef.current = { pending: false, templateId: null, templateLanguage: null }

    try {
      channel.postMessage({
        type: 'variablesUpdated',
        variables: { ...variables }, // send fresh shallow copy to avoid mutation references
        templateId: activeTemplateId,
        templateLanguage,
        sender: popoutSenderIdRef.current
      })
    } catch (e) {
      console.error('Failed to broadcast variables to popout:', e)
    }
  }, [variables, selectedTemplateId, templateLanguage])

  // Emit focused variable changes immediately for real-time visual feedback
  useEffect(() => {
    // Primary: BroadcastChannel for immediate sync
    if (focusFromPopoutRef.current) {
      focusFromPopoutRef.current = false
    } else if (canUseBC) {
      const ch = varsChannelRef.current
      if (ch) {
        try {
          ch.postMessage({ type: 'update', focusedVar, sender: varsSenderIdRef.current })
        } catch {}
      }

      const popoutChannel = popoutChannelRef.current
      if (popoutChannel) {
        try {
          popoutChannel.postMessage({
            type: 'focusedVar',
            varName: focusedVar ?? null,
            normalizedVar: normalizeVarKey(focusedVar) || null,
            sender: popoutSenderIdRef.current
          })
        } catch {}
      }
    }
    
    // Fallback: localStorage with minimal delay
    const timeoutId = setTimeout(() => {
      if (focusFromPopoutRef.current) return
      try {
        localStorage.setItem('ea_focused_var', JSON.stringify({ 
          focusedVar, 
          normalizedVar: normalizeVarKey(focusedVar) || null,
          timestamp: Date.now(),
          sender: varsSenderIdRef.current 
        }))
      } catch {}
    }, 50) // Small delay to let BroadcastChannel work first
    
    return () => clearTimeout(timeoutId)
  }, [focusedVar])

  // Emit showHighlights changes for cross-window sync
  useEffect(() => {
    // Primary: BroadcastChannel for immediate sync
    if (canUseBC) {
      const ch = varsChannelRef.current
      if (ch) {
        // showHighlights sync disabled via BroadcastChannel - using localStorage only
      }
    }
    
    // Fallback: localStorage with minimal delay
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('ea_show_highlights_sync', JSON.stringify({ 
          showHighlights, 
          timestamp: Date.now(),
          sender: varsSenderIdRef.current 
        }))
      } catch {}
    }, 50) // Small delay to let BroadcastChannel work first
    
    return () => clearTimeout(timeoutId)
  }, [showHighlights])

  // Listen for localStorage changes (fallback for cross-window sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ea_focused_var' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          // Only update if it's from a different sender and recent
          if (data.sender !== varsSenderIdRef.current && (Date.now() - data.timestamp) < 5000) {
            setFocusedVar(data.focusedVar)
          }
        } catch {}
      } else if (e.key === 'ea_show_highlights_sync' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          // Only update if it's from a different sender and recent
          if (data.sender !== varsSenderIdRef.current && (Date.now() - data.timestamp) < 5000) {
            setShowHighlights(data.showHighlights)
          }
        } catch {}
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Apply pending remote template once templates load
  useEffect(() => {
    const pid = pendingTemplateIdRef.current
    if (!pid || !templatesData?.templates?.length) return
    const found = templatesData.templates.find(t => t.id === pid)
    if (found) setSelectedTemplate(found)
    pendingTemplateIdRef.current = null
  }, [templatesData])

  // Autofocus first empty variable when popup opens
  useEffect(() => {
    if (!showVariablePopup || varsMinimized) return
    const t = setTimeout(() => {
      try {
        if (!selectedTemplate || !selectedTemplate.variables || selectedTemplate.variables.length === 0) return
        // find first empty variable by template order
        const firstEmpty = selectedTemplate.variables.find(vn => !(variables[vn] || '').trim()) || selectedTemplate.variables[0]
        const el = varInputRefs.current[firstEmpty]
        if (el && typeof el.focus === 'function') { el.focus(); el.select?.() }
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [showVariablePopup, varsMinimized])

  // Outside click to auto-minimize when not pinned
  useEffect(() => {
    if (!showVariablePopup || varsPinned || varsMinimized) return
    const onDown = (e) => {
      if (!varPopupRef.current) return
      if (!varPopupRef.current.contains(e.target)) {
        setVarsMinimized(true)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showVariablePopup, varsPinned, varsMinimized])

  // Smart paste-to-fill: parse lines like "var: value" or "var = value" and map to known variables (case/diacritic-insensitive)
  const handleVarsSmartPaste = (text) => {
    if (!text || !selectedTemplate) return
    const lines = String(text).split(/\r?\n/)
    const map = {}
    const norm = (s='') => s.normalize('NFD').replace(/\p{Diacritic}+/gu,'').toLowerCase().trim()
    const known = selectedTemplate.variables
    const byDesc = {}
    for (const vn of known) {
      const info = templatesData?.variables?.[vn]
      const keys = [vn]
      if (info?.description) {
        const dfr = info.description.fr || ''
        const den = info.description.en || ''
        keys.push(dfr, den)
      }
      byDesc[vn] = keys.map(norm).filter(Boolean)
    }
    for (const line of lines) {
      const m = line.match(/^\s*([^:=]+?)\s*[:=-]\s*(.+)\s*$/)
      if (!m) continue
      const keyN = norm(m[1])
      const val = m[2]
      // find best variable with key match by name or description words
      let target = null
      for (const vn of known) {
        if (byDesc[vn].some(k => keyN.includes(k) || k.includes(keyN))) { target = vn; break }
      }
      if (!target) {
        // fallback: exact variable name within
        target = known.find(vn => norm(vn) === keyN)
      }
      if (target) map[target] = val
    }
    if (Object.keys(map).length) {
      setVariables(prev => {
        const assignments = {}
        const preferredLang = (templateLanguageRef.current || 'fr').toUpperCase()
        Object.entries(map).forEach(([varName, value]) => {
          Object.assign(assignments, expandVariableAssignment(varName, value, {
            preferredLanguage: preferredLang,
            variables: prev
          }))
        })
        const next = applyAssignments(prev, assignments)
        if (next !== prev) {
          variablesRef.current = next
        }
        return next
      })
      // focus first mapped field
      const first = Object.keys(map)[0]
      const el = varInputRefs.current[first]
      if (el) el.focus()
    }
  }

  // Close export menu on outside click or ESC
  useEffect(() => {
    if (!showExportMenu) return
    const onDocClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false)
      }
    }
    const onEsc = (e) => { if (e.key === 'Escape') setShowExportMenu(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [showExportMenu])

  const t = interfaceTexts[interfaceLanguage]

  // Get interface-specific placeholder text
  const getPlaceholderText = () => {
    return interfaceLanguage === 'fr' ? 'Sélectionnez un modèle' : 'Select a template'
  }

  // Set initial empty editors so contentEditable placeholder shows
  useEffect(() => {
    if (!selectedTemplate) {
      finalSubjectRef.current = ''
      finalBodyRef.current = ''
      setFinalSubject('')
      setFinalBody('')
    }
  }, [interfaceLanguage]) // Update when interface language changes

  // Load template data on startup
  useEffect(() => {
    const tryLoadAdminDataset = () => {
      try {
        const adminLocal = localStorage.getItem('ea_admin_templates_data')
        if (adminLocal) {
          const parsed = JSON.parse(adminLocal)
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.templates) && parsed.templates.length) {
            if (debug) console.log('[EA][Debug] Using locally published admin templates dataset')
            return parsed
          }
        }
      } catch (e) {
        if (debug) console.warn('[EA][Debug] local admin dataset parse failed', e)
      }
      return null
    }

    const fetchTemplatesFromSources = async () => {
      if (debug) console.log('[EA][Debug] Fetching templates (prefer raw main data)...')
      const REPO_RAW_URL = (import.meta?.env?.VITE_TEMPLATES_URL) || 'https://raw.githubusercontent.com/snarky1980/echo-bt-ctd/main/complete_email_templates.json'
      const LOCAL_URL = './complete_email_templates.json'
      const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/'
      const ABSOLUTE_URL = (BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/') + 'complete_email_templates.json'
      const ts = Date.now()
      const withBust = (u) => u + (u.includes('?') ? '&' : '?') + 'cb=' + ts
      const candidates = [withBust(REPO_RAW_URL), withBust(ABSOLUTE_URL), withBust(LOCAL_URL)]

      let loaded = null
      let lastErr = null
      for (const url of candidates) {
        try {
          if (debug) console.log('[EA][Debug] Try fetch', url)
          const resp = await fetch(url, { cache: 'no-cache' })
          if (!resp.ok) throw new Error('HTTP ' + resp.status)
          const j = await resp.json()
          loaded = j
          break
        } catch (e) {
          lastErr = e
          if (debug) console.warn('[EA][Debug] fetch candidate failed', url, e?.message || e)
        }
      }
      if (!loaded) throw lastErr || new Error('No template source reachable')
      return loaded
    }

    const loadTemplatesData = async () => {
      const canonicalDataset = CANONICAL_TEMPLATES
      const adminDataset = tryLoadAdminDataset()
      if (adminDataset) {
        setTemplatesData(mergeTemplateDatasets(adminDataset, canonicalDataset))
        setLoading(false)
        try {
          const fallbackDataset = await fetchTemplatesFromSources()
          if (fallbackDataset) {
            setTemplatesData((prev) => mergeTemplateDatasets(prev || canonicalDataset, fallbackDataset))
            if (debug) console.log('[EA][Debug] Admin dataset merged with fallback metadata')
          }
        } catch (fallbackError) {
          if (debug) console.warn('[EA][Debug] Fallback template fetch failed', fallbackError)
        }
        return
      }

      setTemplatesData(canonicalDataset)
      try {
        const remoteData = await fetchTemplatesFromSources()
        if (remoteData) {
          setTemplatesData(mergeTemplateDatasets(remoteData, canonicalDataset))
          if (debug) console.log('[EA][Debug] Templates loaded:', remoteData?.templates?.length)
        }
      } catch (error) {
        console.error('Error loading templates data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplatesData()
  }, [debug])

  // Auto-select first template after load to avoid "no template" UX if user hasn't picked one
  useEffect(() => {
    if (!loading || selectedTemplate || !templatesData?.templates?.length) return
    if (!selectedTemplateId) {
      if (debug) console.log('[EA][Debug] Template load complete without saved selection; awaiting user pick')
      return
    }
    const templateToSelect = templatesData.templates.find(t => t.id === selectedTemplateId)
    if (!templateToSelect) {
      if (debug) console.warn('[EA][Debug] Saved template id not found in catalog:', selectedTemplateId)
      return
    }
    setSelectedTemplate(templateToSelect)
    if (debug) console.log('[EA][Debug] Auto-selected restored template:', templateToSelect.id)
  }, [loading, templatesData, selectedTemplate, selectedTemplateId, debug])

  /**
   * URL PARAMETER SUPPORT FOR DEEP LINK SHARING
   */
  useEffect(() => {
    if (!templatesData) return
    
    // Read current URL parameters
    const params = new URLSearchParams(window.location.search)
    const templateId = params.get('id')
    const langParam = params.get('lang')
    
    // Apply language from URL if specified and valid
    if (langParam && ['fr', 'en'].includes(langParam)) {
      setTemplateLanguage(langParam)
      setInterfaceLanguage(langParam)
    }
    
    // Pre-select template from URL
    if (templateId) {
      const template = templatesData.templates.find(t => t.id === templateId)
      if (template) {
        setSelectedTemplate(template)
      }
    }
  }, [templatesData]) // Triggers when templates are loaded

  /**
   * REBUILD VARIABLES WHEN TEMPLATE CHANGES
   * Ensures popout receives correct variables for the selected template
   */
  const lastRebuiltTemplateId = useRef(null)
  useEffect(() => {
    if (!selectedTemplate || !templatesData) return
    
    // Only rebuild if template actually changed (avoid rebuilding on every re-render)
    if (lastRebuiltTemplateId.current === selectedTemplate.id) return
    lastRebuiltTemplateId.current = selectedTemplate.id
    
    // Rebuild variables with the new template's variable list
    const newVariables = buildInitialVariables(selectedTemplate, templatesData, templateLanguage)
    variablesRef.current = newVariables
    setVariables(newVariables)
    
    if (debug) console.log('[EA][Debug] Rebuilt variables for template:', selectedTemplate.id, 'vars:', Object.keys(newVariables).slice(0, 5))
  }, [selectedTemplate, templatesData, templateLanguage, debug])

  /**
   * KEYBOARD SHORTCUTS FOR PROFESSIONAL UX
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter: Copy all (main quick action)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        if (selectedTemplate) {
          copyToClipboard('all')
        }
        return
      }
      
      // Ctrl/Cmd + J: Copy subject only
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault()
        if (selectedTemplate) {
          copyToClipboard('subject')
        }
      }
      
      // Ctrl/Cmd + Shift + Enter: Open plain-text compose draft
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        if (selectedTemplate) {
          composePlainTextEmailDraft()
        }
      }
  // (Removed stray conditional referencing undefined variables from earlier experimental code)
      // Ctrl/Cmd + /: Focus on search (search shortcut)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        if (searchRef.current) {
          searchRef.current.focus()
        }
      }
      
      // Variables popup keyboard shortcuts (only when popup is open)
      if (showVariablePopup && selectedTemplate) {
        // Escape: Minimize variables popup
        if (e.key === 'Escape') {
          e.preventDefault()
          setVarsMinimized(true)
        }
        
        // Ctrl/Cmd + Enter: Close and apply variables
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          setShowVariablePopup(false)
        }
        
        // Ctrl/Cmd + R: Reset all fields to examples
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
          e.preventDefault()
          if (templatesData) {
            const initialVars = buildInitialVariables(selectedTemplate, templatesData, templateLanguage)
            setVariables(prev => {
              const next = applyAssignments(prev, initialVars)
              if (next !== prev) {
                variablesRef.current = next
              }
              return next
            })
          }
        }
        
        // Ctrl/Cmd + Shift + V: Smart paste
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'v') {
          e.preventDefault()
          const clip = (navigator.clipboard && navigator.clipboard.readText) ? navigator.clipboard.readText() : Promise.resolve('')
          clip.then(text => handleVarsSmartPaste(text || ''))
        }
      }
    }

    // Attach keyboard events globally
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedTemplate, showVariablePopup, templatesData, variables, handleVarsSmartPaste]) // Re-bind when template changes
  


  // Filter templates based on search and category
  // Advanced search with exact-first + conservative fuzzy, bilingual fields, synonyms, AND/OR, quoted phrases and match highlighting
  const { filteredTemplates, searchMatchMap } = useMemo(() => {
    const empty = { filteredTemplates: [], searchMatchMap: {} }
    if (!templatesData) return empty
    let dataset = templatesData.templates

    const qRaw = (searchQuery || '').trim()
    const hasSearchQuery = qRaw.length > 0

    // If there's a search query, search across ALL categories and languages
    // Otherwise, apply category and favorites filters
    if (!hasSearchQuery) {
      if (selectedCategory !== 'all') dataset = dataset.filter(t => t.category === selectedCategory)
      if (favoritesOnly) {
        const favSet = new Set(favorites)
        dataset = dataset.filter(t => favSet.has(t.id))
      }
    }

    if (!qRaw) return { filteredTemplates: dataset, searchMatchMap: {} }

    // Tokenize query supporting quotes and AND/OR (EN/FR)
    const tokenize = (s) => {
      const out = []
      let buf = ''
      let inQ = false
      for (let i = 0; i < s.length; i++) {
        const ch = s[i]
        if (ch === '"') { inQ = !inQ; if (!inQ && buf) { out.push(buf); buf = '' } continue }
        if (!inQ && /\s/.test(ch)) { if (buf) { out.push(buf); buf = '' } continue }
        buf += ch
      }
      if (buf) out.push(buf)
      // Normalize operators
      return out.map(tok => {
        const t = tok.trim()
        const upper = t.toUpperCase()
        if (upper === 'AND' || upper === 'ET' || upper === '&&') return 'AND'
        if (upper === 'OR' || upper === 'OU' || upper === '||' || upper === '|') return 'OR'
        return t
      })
    }

  const tokens = tokenize(qRaw)
    const hasOps = tokens.some(t => t === 'AND' || t === 'OR') || /"/.test(qRaw)
    // Build clauses (OR of AND groups)
    const clauses = []
    let current = []
    const pushCurrent = () => { if (current.length) { clauses.push(current); current = [] } }
    for (const t of tokens) {
      if (t === 'OR') { pushCurrent() } else if (t === 'AND') { /* implicit */ } else { current.push(t) }
    }
    pushCurrent()

    // Helper: sort favorites first when searching
    const sortWithFavoritesFirst = (templateList) => {
      if (!hasSearchQuery) return templateList
      const favSet = new Set(favorites)
      const favs = templateList.filter(t => favSet.has(t.id))
      const nonFavs = templateList.filter(t => !favSet.has(t.id))
      return [...favs, ...nonFavs]
    }

    const itemText = (it) => normalize([
      it.title?.fr || '', it.title?.en || '', it.description?.fr || '', it.description?.en || '', it.category || ''
    ].join(' '))

    const itemMatchesClause = (it, clause) => {
      const text = itemText(it)
      return clause.every(term => {
        const exp = expandQuery(term).split(/\s+/).filter(Boolean)
        if (!exp.length) return true
        return exp.some(w => text.includes(w))
      })
    }

    let gated = dataset
    if (hasOps && clauses.length) {
      gated = dataset.filter(it => clauses.some(cl => itemMatchesClause(it, cl)))
    }
    if (!gated.length) return { filteredTemplates: [], searchMatchMap: {} }

    // Helper: find diacritic-insensitive ranges in original text for highlighting
    const findRangesInsensitive = (text = '', needle = '') => {
      const ranges = []
      if (!needle) return ranges
      const nNeedle = normalize(needle)
      const win = nNeedle.length
      if (!win) return ranges
      for (let i = 0; i + win <= text.length; i++) {
        const seg = text.substr(i, win)
        if (normalize(seg) === nNeedle) {
          ranges.push([i, i + win - 1])
        }
      }
      return ranges
    }

    // Helper: collect exact matches across bilingual fields and build highlight map
    const collectExact = (items, termsList) => {
      const out = []
      const map = {}
      const FIELDS = [
        ['title.fr', (it) => it.title?.fr || ''],
        ['title.en', (it) => it.title?.en || ''],
        ['description.fr', (it) => it.description?.fr || ''],
        ['description.en', (it) => it.description?.en || ''],
        ['category', (it) => it.category || ''],
      ]
      for (const it of items) {
        const matches = {}
        let totalHits = 0
        for (const [key, getter] of FIELDS) {
          const txt = String(getter(it))
          const keyRanges = []
          for (const term of termsList) {
            const r = findRangesInsensitive(txt, term)
            if (r.length) {
              keyRanges.push(...r)
            }
          }
          if (keyRanges.length) {
            // Merge overlapping/adjacent ranges for cleanliness
            keyRanges.sort((a, b) => a[0] - b[0])
            const merged = []
            for (const rng of keyRanges) {
              const last = merged[merged.length - 1]
              if (!last || rng[0] > last[1] + 1) merged.push(rng)
              else last[1] = Math.max(last[1], rng[1])
            }
            matches[key] = merged
            totalHits += merged.length
          }
        }
        if (totalHits > 0) {
          out.push({ item: it, hits: totalHits })
          map[it.id] = matches
        }
      }
      // Sort exact by number of hits desc, stable by original order otherwise
      out.sort((a, b) => b.hits - a.hits)
      return { items: out.map(o => o.item), matchMap: map }
    }

    // Stage 1: exact match on RAW tokens (no synonyms) — reduces noisy synonym-only results
    const rawTerms = tokens.filter(t => t !== 'AND' && t !== 'OR').map(s => s.trim()).filter(Boolean)
    if (rawTerms.length) {
      const { items: exactItems, matchMap: exactMap } = collectExact(gated, rawTerms)
      if (exactItems.length) {
        return { filteredTemplates: sortWithFavoritesFirst(exactItems), searchMatchMap: exactMap }
      }
    }

    // Stage 2: exact match on expanded synonyms if raw terms produced nothing
    const expanded = expandQuery(qRaw)
    const expandedTerms = Array.from(new Set(expanded.split(/\s+/).filter(Boolean)))
    if (expandedTerms.length) {
      const { items: exactItems2, matchMap: exactMap2 } = collectExact(gated, expandedTerms)
      if (exactItems2.length) {
        return { filteredTemplates: sortWithFavoritesFirst(exactItems2), searchMatchMap: exactMap2 }
      }
    }

    // Stage 3: conservative fuzzy using ONLY raw tokens and dynamic threshold based on shortest token
    const shortest = (rawTerms.length ? Math.min(...rawTerms.map(t => t.length)) : qRaw.length) || 1
    let dynThreshold = 0.32
    if (shortest <= 2) dynThreshold = 0.1
    else if (shortest === 3) dynThreshold = 0.18
    else if (shortest === 4) dynThreshold = 0.22
    else if (shortest === 5) dynThreshold = 0.28
    else dynThreshold = 0.32

    const fuse = new Fuse(gated, {
      includeScore: true,
      includeMatches: true,
      shouldSort: false,
      threshold: dynThreshold,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: 'title.fr', weight: 0.45 },
        { name: 'title.en', weight: 0.45 },
        { name: 'description.fr', weight: 0.30 },
        { name: 'description.en', weight: 0.30 },
        { name: 'category', weight: 0.20 },
      ]
    })

    const fuzzTerms = rawTerms.length ? rawTerms : expandedTerms
    if (fuzzTerms.length === 0) {
      return { filteredTemplates: gated, searchMatchMap: {} }
    }

    const acc = new Map() // id -> { item, score, matches }
    const mergeMatches = (dst, srcMatches) => {
      if (!Array.isArray(srcMatches)) return
      for (const m of srcMatches) {
        if (!m?.key || !Array.isArray(m?.indices)) continue
        const key = m.key
        if (!dst[key]) dst[key] = []
        dst[key].push(...m.indices)
      }
    }

    for (const term of fuzzTerms) {
      const res = fuse.search(term)
      for (const r of res) {
        const id = r.item.id
        const prev = acc.get(id)
        if (!prev) {
          acc.set(id, { item: r.item, score: r.score ?? 0.0, matches: {} })
          mergeMatches(acc.get(id).matches, r.matches)
        } else {
          prev.score = Math.min(prev.score, r.score ?? prev.score)
          mergeMatches(prev.matches, r.matches)
        }
      }
    }

    // If Fuse found nothing, do a simple normalized substring contains over bilingual fields (raw query)
    if (acc.size === 0) {
      const needle = normalize(qRaw)
      const simple = []
      const sMatchMap = {}
      for (const it of gated) {
        const fields = [
          ['title.fr', it.title?.fr || ''],
          ['title.en', it.title?.en || ''],
          ['description.fr', it.description?.fr || ''],
          ['description.en', it.description?.en || ''],
          ['category', it.category || ''],
        ]
        let matched = false
        const keyMap = {}
        for (const [key, val] of fields) {
          if (normalize(val).includes(needle)) {
            matched = true
            keyMap[key] = findRangesInsensitive(String(val), qRaw)
          }
        }
        if (matched) {
          simple.push({ item: it, score: 1.0 })
          sMatchMap[it.id] = keyMap
        }
      }
      if (simple.length === 0) return { filteredTemplates: [], searchMatchMap: {} }
      return { filteredTemplates: sortWithFavoritesFirst(simple.map(s => s.item)), searchMatchMap: sMatchMap }
    }

    // Sort by best (lowest) score, stable by original order
    const results = Array.from(acc.values()).sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    const items = results.map(r => r.item)
    const matchMap = {}
    for (const r of results) {
      const id = r.item.id
      matchMap[id] = r.matches
    }

    return { filteredTemplates: sortWithFavoritesFirst(items), searchMatchMap: matchMap }
  }, [templatesData, searchQuery, selectedCategory, favoritesOnly, favorites])

  // Helpers for rendering highlighted text
  const getMatchRanges = (id, key) => (searchMatchMap && searchMatchMap[id] && searchMatchMap[id][key]) || null
  const renderHighlighted = (text = '', ranges) => {
    if (!ranges || !ranges.length) return text
    const parts = []
    let last = 0
    for (const [start, end] of ranges) {
      if (start > last) parts.push(text.slice(last, start))
      parts.push(<mark key={`${start}-${end}`} className="search-hit">{text.slice(start, end + 1)}</mark>)
      last = end + 1
    }
    if (last < text.length) parts.push(text.slice(last))
    return <>{parts}</>
  }

  const categoryLabels = useMemo(() => {
    if (!templatesData) return {}
    const labels = { ...(templatesData.metadata?.categoryLabels || {}) }
    ;(templatesData.templates || []).forEach(t => {
      const key = t?.category
      if (!key) return
      if (!labels[key]) labels[key] = { fr: '', en: '' }
      if (t.category_fr && !labels[key].fr) labels[key].fr = t.category_fr
      if (t.category_en && !labels[key].en) labels[key].en = t.category_en
    })
    return labels
  }, [templatesData])

  // Get categories from metadata first, fallback to deriving from templates
  const categories = useMemo(() => {
    if (!templatesData) return []
    const metaCats = templatesData?.metadata?.categories
    return Array.isArray(metaCats) && metaCats.length
      ? metaCats
      : [...new Set((templatesData.templates || []).map(t => t.category).filter(Boolean))]
  }, [templatesData])

  const getCategoryLabel = useCallback((categoryKey) => {
    if (!categoryKey) {
      return interfaceLanguage === 'fr' ? 'Autre' : 'Other'
    }
    const labels = categoryLabels[categoryKey]
    if (labels) {
      const primary = interfaceLanguage === 'fr' ? labels.fr : labels.en
      if (primary && primary.trim().length > 0) return primary
      const fallback = interfaceLanguage === 'fr' ? labels.en : labels.fr
      if (fallback && fallback.trim().length > 0) return fallback
    }
    // Fallback to slug-based key or the key itself
    const fallbackText = (interfaceTexts?.[interfaceLanguage]?.categories?.[categoryKey]) || categoryKey
    if (debug && !labels) {
      console.log(`Category label not found for: ${categoryKey}, using fallback: ${fallbackText}`)
    }
    return fallbackText
  }, [categoryLabels, interfaceLanguage, debug])

  const isFav = (id) => favorites.includes(id)
  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const orderedCategories = useMemo(() => {
    if (!categories || !categories.length) return []
    return [...categories].sort((a, b) => {
      const labelA = getCategoryLabel(a) || a
      const labelB = getCategoryLabel(b) || b
      return labelA.localeCompare(labelB, interfaceLanguage === 'fr' ? 'fr' : 'en', { sensitivity: 'base' })
    })
  }, [categories, getCategoryLabel, interfaceLanguage])

  const replaceVariablesWithValues = useCallback((text, overrideValues) => {
    if (!text) return ''
    const sourceValues = overrideValues || variablesRef.current || {}
    const language = (templateLanguageRef.current || templateLanguage || 'fr')
    return String(text ?? '').replace(/<<([^>]+)>>/g, (match, varName) => {
      const resolved = resolveVariableValue(sourceValues, varName, language)
      // If variable is deleted, remove the placeholder entirely
      if (resolved === '__DELETED__') {
        return ''
      }
      if (resolved && resolved.trim().length) {
        return resolved
      }
      const direct = sourceValues[varName]
      if (direct !== undefined && direct !== null) {
        const asString = String(direct)
        if (asString === '__DELETED__') {
          return ''
        }
        if (asString.trim().length) return asString
      }
      return match
    })
  }, [templateLanguage])

  // Enhanced function to handle rich text HTML content
  const replaceVariablesInHTML = (htmlText, values, fallbackPlainText = '') => {
    if (!htmlText) {
      return { html: '', text: fallbackPlainText || '' }
    }

    const ensureHtmlString = (input = '') => {
      const raw = String(input ?? '')
      if (!raw.trim()) return ''
      if (/[<>&]/.test(raw) && /<\/?[a-z]/i.test(raw)) {
        return raw
      }
      return String(raw)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\r\n|\r/g, '\n')
        .replace(/\n/g, '<br>')
    }

    const wrapper = document.createElement('div')
    wrapper.innerHTML = ensureHtmlString(htmlText)

    // Convert styling to email-client-friendly format
    const makeOutlookFriendly = (element) => {
      // Process ALL elements (not just those with style attribute)
      // because computed styles may come from CSS classes or parent elements
      element.querySelectorAll('*').forEach((el) => {
        // Skip if it's a structural element we don't want to style
        if (['BR', 'HR'].includes(el.tagName)) return
        
        const computedStyle = window.getComputedStyle(el)
        let newStyle = ''
        
        // Font size
        const fontSize = computedStyle.fontSize
        if (fontSize && fontSize !== '16px' && fontSize !== '14px') {
          newStyle += `font-size: ${fontSize}; `
        }
        
        // Text color
        const color = computedStyle.color
        const colorRgb = color.replace(/\s/g, '')
        if (color && colorRgb !== 'rgb(0,0,0)' && colorRgb !== 'rgba(0,0,0,1)') {
          newStyle += `color: ${color}; `
        }
        
        // Background color (highlighting) - CRITICAL for highlights
        const bgColor = computedStyle.backgroundColor
        const bgColorRgb = bgColor.replace(/\s/g, '')
        if (bgColor && 
            bgColorRgb !== 'rgba(0,0,0,0)' && 
            bgColorRgb !== 'transparent' && 
            bgColorRgb !== 'rgb(255,255,255)' &&
            bgColorRgb !== 'rgba(255,255,255,1)') {
          newStyle += `background-color: ${bgColor}; `
        }
        
        // Font weight (bold)
        const fontWeight = computedStyle.fontWeight
        if (fontWeight && (fontWeight === 'bold' || parseInt(fontWeight) >= 700)) {
          newStyle += `font-weight: bold; `
        }
        
        // Font style (italic)
        const fontStyle = computedStyle.fontStyle
        if (fontStyle === 'italic') {
          newStyle += `font-style: italic; `
        }
        
        // Text decoration (underline, strikethrough)
        const textDecoration = computedStyle.textDecoration
        if (textDecoration && !textDecoration.includes('none')) {
          newStyle += `text-decoration: ${textDecoration}; `
        }
        
        // Font family
        const fontFamily = computedStyle.fontFamily
        if (fontFamily && fontFamily !== 'Arial' && !fontFamily.startsWith('-apple-system')) {
          newStyle += `font-family: ${fontFamily}; `
        }
        
        if (newStyle) {
          el.setAttribute('style', newStyle.trim())
        }
      })

      // Ensure lists have proper inline styles
      element.querySelectorAll('ul, ol').forEach((list) => {
        const currentStyle = list.getAttribute('style') || ''
        list.setAttribute('style', currentStyle + ' margin: 0; padding-left: 40px;')
      })

      element.querySelectorAll('li').forEach((li) => {
        const currentStyle = li.getAttribute('style') || ''
        li.setAttribute('style', currentStyle + ' margin: 0; padding: 0;')
      })
    }

    makeOutlookFriendly(wrapper)

    // Remove technical attributes we don't need in exported HTML
    wrapper.querySelectorAll('br[data-line-break]').forEach((node) => {
      node.removeAttribute('data-line-break')
    })

    const cssEscape = (value = '') => {
      try {
        if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
          return CSS.escape(value)
        }
      } catch {}
      return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&')
    }

    const convertValueToHtml = (value = '') => {
      const raw = String(value ?? '')
      if (/<[a-z][\s\S]*>/i.test(raw)) {
        return raw.replace(/\r\n|\r/g, '\n').replace(/\n/g, '<br>')
      }
      return raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\r\n|\r/g, '\n')
        .replace(/\n/g, '<br>')
    }

    const stripPillMetadata = (element) => {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) return
      element.classList?.remove('var-pill', 'filled', 'empty', 'focused')
      if (element.classList && element.classList.length === 0) {
        element.removeAttribute('class')
      }
      const attrsToRemove = ['data-var', 'data-value', 'data-display', 'data-template', 'contenteditable', 'spellcheck']
      attrsToRemove.forEach(attr => element.removeAttribute(attr))
      Array.from(element.children || []).forEach(stripPillMetadata)
    }

    const setCloneContent = (target, htmlString = '') => {
      target.innerHTML = ''
      if (!htmlString) return
      const frag = document.createRange().createContextualFragment(htmlString)
      target.appendChild(frag)
    }

    // Replace variable nodes with either formatted HTML (if a pill template exists)
    // or with plain text. This preserves rich formatting that may be stored
    // in the pill's `data-template` attribute (generated by RichTextPillEditor).
    const PILL_TEMPLATE_TOKEN = '__RT_PILL_VALUE__'
    Object.entries(values || {}).forEach(([varName, value]) => {
      const nodes = wrapper.querySelectorAll(`[data-var="${cssEscape(varName)}"]`)
      nodes.forEach((node) => {
        const replacementValue = value !== undefined && value !== null && String(value).length
          ? String(value)
          : `<<${varName}>>`

        const placeholder = `<<${varName}>>`
        const pillClone = node.cloneNode(false)

        const injectAndReplace = (htmlString) => {
          setCloneContent(pillClone, htmlString)
          stripPillMetadata(pillClone)
          node.replaceWith(pillClone)
        }

        // If the pill carries a formatting template, apply it so bold/italic/highlights are preserved
        const template = node.getAttribute('data-template') || node.dataset?.template
        if (template && replacementValue !== placeholder) {
          const sanitized = convertValueToHtml(replacementValue)
          const applied = template.replace(PILL_TEMPLATE_TOKEN, sanitized)
          injectAndReplace(applied)
        } else if (node.innerHTML && replacementValue !== placeholder) {
          // Fallback: reuse the pill's visible HTML (already contains inline formatting)
          injectAndReplace(node.innerHTML)
        } else {
          // Default text-only replacement for empty/placeholder variables
          pillClone.textContent = replacementValue
          stripPillMetadata(pillClone)
          node.replaceWith(pillClone)
        }
      })
    })

    // Run Outlook-friendly style conversion again to pick up inline styles on injected fragments
    makeOutlookFriendly(wrapper)

    const htmlResult = wrapper.innerHTML

    if (fallbackPlainText) {
      return { html: htmlResult, text: fallbackPlainText }
    }

    const plainText = wrapper.innerText.replace(/\r\n/g, '\n')

    return { html: htmlResult, text: plainText }
  }

  // Replace variables in text using current state
  const replaceVariables = (text) => replaceVariablesWithValues(text)

  // Sync from text: Extract variable values from text areas back to Variables Editor
  const syncFromText = useCallback(() => {
    console.log('🔄 Sync from text: Starting reverse synchronization...')
    console.log('🔄 Current state:', {
      selectedTemplate: selectedTemplate?.id,
      templateLanguage,
      finalSubject: finalSubject?.substring(0, 100) + '...',
      finalBody: finalBody?.substring(0, 100) + '...',
      currentVariables: variables
    })
    
    if (!selectedTemplate || !templatesData) {
      console.log('🔄 No template selected or templates data unavailable')
      return { success: false, updated: false, variables: { ...variables } }
    }

  const extracted = {}

  // Extract values directly from pill elements (most reliable method)
  const pillValuesFromSubject = extractVariablesFromPills(finalSubject)
  const pillValuesFromBody = extractVariablesFromPills(finalBody)
  
  console.log('🔄 Values extracted from pills:', {
    subject: pillValuesFromSubject,
    body: pillValuesFromBody
  })
  
  // Merge pill values (subject takes priority)
  Object.assign(extracted, pillValuesFromBody, pillValuesFromSubject)

  const subjectTemplate = selectedTemplate.subject[templateLanguage] || ''
  const bodyTemplate = selectedTemplate.body[templateLanguage] || ''

    console.log('🔄 Templates:', {
      subjectTemplate: subjectTemplate?.substring(0, 100) + '...',
      bodyTemplate: bodyTemplate?.substring(0, 100) + '...'
    })

    // For any variables not found in pills, try template-based extraction using actual placeholders
    const collectPlaceholders = (tpl = '') => {
      if (!tpl) return []
      return Array.from(tpl.matchAll(/<<([^>]+)>>/g), (match) => match[1])
    }

    const templatePlaceholders = new Set([
      ...collectPlaceholders(subjectTemplate),
      ...collectPlaceholders(bodyTemplate)
    ])

    if (templatePlaceholders.size > 0) {
      const missingPlaceholders = Array.from(templatePlaceholders).filter((name) => !extracted.hasOwnProperty(name))

      if (missingPlaceholders.length > 0 && subjectTemplate && finalSubject) {
        const subjectValues = extractVariablesFromTemplate(finalSubject, subjectTemplate, missingPlaceholders)
        Object.assign(extracted, subjectValues)
      }

      if (missingPlaceholders.length > 0 && bodyTemplate && finalBody) {
        const bodyTargets = missingPlaceholders.filter((name) => !extracted.hasOwnProperty(name))
        if (bodyTargets.length) {
          const bodyValues = extractVariablesFromTemplate(finalBody, bodyTemplate, bodyTargets)
          Object.assign(extracted, bodyValues)
        }
      }
    }

    console.log('🔄 Final extracted values:', extracted)
    
    // Normalize extracted values using assignment helper to ensure suffix/base parity
    const normalizedExtracted = {}
    const preferredLang = (templateLanguage || templateLanguageRef.current || 'fr').toUpperCase()
    Object.entries(extracted).forEach(([name, value]) => {
      Object.assign(normalizedExtracted, expandVariableAssignment(name, value, {
        preferredLanguage: preferredLang,
        variables
      }))
    })

    // Update variables state and return merged result
    const nextVariables = applyAssignments(variables, normalizedExtracted)
    const hasUpdates = nextVariables !== variables

    if (hasUpdates) {
      console.log('🔄 Variables updated successfully, returning:', nextVariables)
      variablesRef.current = nextVariables
      setVariables(nextVariables)
    } else {
      console.log('🔄 No new values extracted; sending current variables snapshot')
      variablesRef.current = nextVariables
    }

    return { success: true, updated: hasUpdates, variables: nextVariables }
  }, [selectedTemplate, templatesData, templateLanguage, finalSubject, finalBody, variables])

    useEffect(() => {
      syncFromTextRef.current = syncFromText
    }, [syncFromText])
  
  // Load a selected template
  useEffect(() => {
    if (selectedTemplate) {
      const initialVars = buildInitialVariables(selectedTemplate, templatesData, templateLanguage)

      console.log('🔄 Template loaded, initializing variables (with samples if empty):', initialVars)

      const subjectTemplate = selectedTemplate.subject[templateLanguage] || ''
      const bodyTemplate = selectedTemplate.body[templateLanguage] || ''

      variablesRef.current = initialVars
      setVariables(initialVars)
      finalSubjectRef.current = subjectTemplate
      finalBodyRef.current = bodyTemplate
      setFinalSubject(subjectTemplate)
      setFinalBody(bodyTemplate)
      manualEditRef.current = { subject: false, body: false }
      console.log('🔄 Variables state and ref updated with initial/sample values')
    } else {
      variablesRef.current = {}
      finalSubjectRef.current = ''
      finalBodyRef.current = ''
      setVariables({})
      setFinalSubject('')
      setFinalBody('')
      manualEditRef.current = { subject: false, body: false }
    }
  }, [selectedTemplate, templateLanguage, interfaceLanguage, templatesData])

  // Seed language-specific variables (_FR/_EN) from base on load/switch
  useEffect(() => {
    if (!selectedTemplate) return
    const list = Array.isArray(selectedTemplate.variables) ? selectedTemplate.variables : []
    if (!list.length) return
    setVariables((prev) => {
      if (!prev) return prev
      let next = prev
      let changed = false
      for (const baseName of list) {
        const baseVal = (prev[baseName] || '').trim()
        if (!baseVal) continue
        const enKey = `${baseName}_EN`
        const frKey = `${baseName}_FR`
        const enVal = (prev[enKey] || '').trim()
        const frVal = (prev[frKey] || '').trim()
        if (!enVal) {
          if (next === prev) next = { ...prev }
          next[enKey] = baseVal
          changed = true
        }
        if (!frVal) {
          if (next === prev) next = { ...prev }
          next[frKey] = baseVal
          changed = true
        }
      }
      if (!changed) return prev
      variablesRef.current = next
      return next
    })
  }, [selectedTemplate, templateLanguage])


  // When the user manually edits the subject/body, automatically try to reverse sync the values back into variables
  useEffect(() => {
    if (!selectedTemplate) return
    if (!manualEditRef.current.subject && !manualEditRef.current.body) return

    const debounce = setTimeout(() => {
      console.log('🔄 Detected manual text edits, attempting automatic reverse sync...')
      const result = syncFromText()

      if (result.success && result.updated) {
        console.log('🔄 Auto reverse sync extracted new values; manual edit flags reset')
      } else if (result.success) {
        console.log('🔄 Auto reverse sync completed without new values; manual edit flags reset')
      } else {
        console.log('🔄 Auto reverse sync skipped (template unavailable); manual edit flags reset')
      }

      manualEditRef.current = { subject: false, body: false }
    }, 220)

    return () => clearTimeout(debounce)
  }, [selectedTemplate, templateLanguage, finalSubject, finalBody, syncFromText])

  /**
   * ENHANCED COPY FUNCTION - Supports both HTML and plain text
   */
  const copyToClipboard = async (type = 'all') => {
    let htmlContent = ''
    let textContent = ''
    
    const toSimpleHtml = (plain = '') => String(plain ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\r\n|\r/g, '\n')
      .replace(/\n/g, '<br>')

    const latestVariables = variablesRef.current || variables || {}
    const subjectSource = finalSubjectRef.current ?? finalSubject
    const bodySource = finalBodyRef.current ?? finalBody

    // Content selection based on requested type
    const resolvedSubject = replaceVariablesWithValues(subjectSource, latestVariables)
    const resolvedBodyText = replaceVariablesWithValues(bodySource, latestVariables)
    const bodyHtmlSource = bodyEditorRef.current?.getHtml?.() ?? bodySource
    const subjectHtmlSource = subjectEditorRef.current?.getHtml?.() ?? toSimpleHtml(resolvedSubject)
    const bodyResult = replaceVariablesInHTML(bodyHtmlSource, latestVariables, resolvedBodyText)

    // Also compute subject HTML result to preserve inline pill formatting for subject copies
    const subjectResult = replaceVariablesInHTML(subjectHtmlSource, latestVariables, resolvedSubject)

    switch (type) {
      case 'subject':
        htmlContent = subjectResult.html || toSimpleHtml(resolvedSubject)
        textContent = resolvedSubject
        break
      case 'body':
        // Wrap body in complete HTML document structure for email clients
        htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0;">
<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000000;">
${bodyResult.html}
</div>
</body>
</html>`
        textContent = bodyResult.text
        break
      case 'all':
      default:
        htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0;">
<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000000;">
<div><strong>Subject:</strong> ${subjectResult.html || toSimpleHtml(resolvedSubject)}</div>
<br>
<div>${bodyResult.html}</div>
</div>
</body>
</html>`
        textContent = `${resolvedSubject}\n\n${bodyResult.text}`
        break
    }
    
    try {
      // Modern clipboard API with both HTML and plain text
      if (navigator.clipboard && window.isSecureContext) {
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([textContent], { type: 'text/plain' })
        })
        await navigator.clipboard.write([clipboardItem])
      } else {
        // Fallback - create a temporary div with both HTML and text
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        tempDiv.style.position = 'fixed'
        tempDiv.style.left = '-999999px'
        tempDiv.style.top = '-999999px'
        document.body.appendChild(tempDiv)
        
        // Select the content
        const range = document.createRange()
        range.selectNodeContents(tempDiv)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
        
        // Copy and cleanup
        document.execCommand('copy')
        selection.removeAllRanges()
        document.body.removeChild(tempDiv)
      }
      
      // Visual success feedback (2 seconds)
      setCopySuccess(type) // Set to 'subject', 'body', or 'all'
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      // Fallback to plain text only
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textContent)
        } else {
          const textArea = document.createElement('textarea')
          textArea.value = textContent
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          textArea.remove()
        }
        setCopySuccess(type) // Set to 'subject', 'body', or 'all'
        setTimeout(() => setCopySuccess(null), 2000)
      } catch (fallbackError) {
        console.error('Fallback copy error:', fallbackError)
        alert('Copy error. Please select the text manually and use Ctrl+C.')
      }
    }
  }

  /**
   * DIRECT LINK COPY FUNCTION
   */
  const copyTemplateLink = async () => {
    if (!selectedTemplate) return
    
    // Build full URL with parameters
    const currentUrl = window.location.origin + window.location.pathname
    const templateUrl = `${currentUrl}?id=${selectedTemplate.id}&lang=${templateLanguage}`
    
    try {
      // Copy URL to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(templateUrl)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = templateUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      
      // Temporary visual feedback
      setCopySuccess('link')
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error('Link copy error:', error)
      alert('Link copy error. Please copy the URL manually from the address bar.')
    }
  }

  // Export helpers for .eml, HTML, and copy HTML
  const exportAs = async (mode) => {
    const toSimpleHtml = (plain = '') => String(plain ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\r\n|\r/g, '\n')
      .replace(/\n/g, '<br>')

    const latestVariables = variablesRef.current || variables || {}
    const subjectSource = finalSubjectRef.current ?? finalSubject
    const bodySource = finalBodyRef.current ?? finalBody
    
    // Get rich HTML from editor (same as copy function)
    const resolvedSubject = replaceVariablesWithValues(subjectSource, latestVariables)
    const resolvedBodyText = replaceVariablesWithValues(bodySource, latestVariables)
    const bodyHtmlSource = bodyEditorRef.current?.getHtml?.() ?? bodySource
    const subjectHtmlSource = subjectEditorRef.current?.getHtml?.() ?? toSimpleHtml(resolvedSubject)
    const bodyResult = replaceVariablesInHTML(bodyHtmlSource, latestVariables, resolvedBodyText)
    const subjectResult = replaceVariablesInHTML(subjectHtmlSource, latestVariables, resolvedSubject)

    if (mode === 'eml') {
      // Build a proper multipart .eml with both plain text and HTML (rich formatting)
      const boundary = '----=_NextPart_000_0000_01DA1234.56789ABC'
      const cleanBodyHtml = bodyResult.html || ''
      
      const eml = [
        `Subject: ${resolvedSubject}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        bodyResult.text || '',
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        `<!DOCTYPE html>`,
        `<html>`,
        `<head>`,
        `<meta charset="UTF-8">`,
        `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
        `</head>`,
        `<body style="margin: 0; padding: 0;">`,
        cleanBodyHtml,
        `</body>`,
        `</html>`,
        '',
        `--${boundary}--`
      ].join('\r\n')
      
      const blob = new Blob([eml], { type: 'message/rfc822' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(resolvedSubject || 'email').replace(/[^a-z0-9]/gi, '_')}.eml`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    if (mode === 'html') {
      const htmlDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${resolvedSubject || 'Document'}</title>
<style>
body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 2em auto;
  padding: 2em;
  line-height: 1.6;
}
h1 {
  color: #2c3d50;
  border-bottom: 2px solid #2c3d50;
  padding-bottom: 0.5em;
}
</style>
</head>
<body>
<h1>${subjectResult.html || resolvedSubject || 'Untitled'}</h1>
${bodyResult.html}
</body>
</html>`
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resolvedSubject || 'email'}.html`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    if (mode === 'copy-html') {
      try {
        if (navigator.clipboard && navigator.clipboard.write) {
          const type = 'text/html'
          const blob = new Blob([bodyResult.html], { type })
          const item = new ClipboardItem({ [type]: blob })
          await navigator.clipboard.write([item])
        } else {
          // Fallback: copy as plain text
          await navigator.clipboard.writeText(bodyResult.html)
        }
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 1500)
      } catch (e) {
        console.error('Copy HTML failed', e)
        alert('Copy HTML failed. Please try again or use the HTML export option.')
      }
      return
    }

    if (mode === 'word') {
      // Create a Word-compatible HTML document with rich formatting
      // Get clean HTML with inline styles
      const cleanBodyHtml = bodyResult.html || ''
      
      const wordHtml = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${resolvedSubject || 'Document'}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
body {
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  margin: 1in;
}
h1 {
  font-size: 16pt;
  font-weight: bold;
  margin-bottom: 12pt;
  color: #2c3d50;
  border-bottom: 2px solid #2c3d50;
  padding-bottom: 8pt;
}
p {
  margin: 0 0 10pt 0;
}
/* Preserve all rich text formatting */
strong, b { font-weight: bold !important; }
em, i { font-style: italic !important; }
u { text-decoration: underline !important; }
s, strike { text-decoration: line-through !important; }
ul, ol { margin: 10pt 0; padding-left: 40pt; }
li { margin: 5pt 0; }
/* Ensure inline styles are preserved */
[style*="background-color"] { background-color: inherit !important; }
[style*="color"] { color: inherit !important; }
[style*="font-weight"] { font-weight: inherit !important; }
[style*="font-style"] { font-style: inherit !important; }
[style*="text-decoration"] { text-decoration: inherit !important; }
[style*="font-size"] { font-size: inherit !important; }
</style>
</head>
<body>
<h1>${resolvedSubject || 'Untitled'}</h1>
${cleanBodyHtml}
</body>
</html>`.trim()

      const blob = new Blob([wordHtml], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const filename = `${(resolvedSubject || 'document').replace(/[^a-z0-9]/gi, '_')}.doc`
      
      // Create download link
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Show toast notification
      setTimeout(() => {
        if (templateLanguage === 'fr') {
          toast.success(`📄 Fichier téléchargé: ${filename}\n\nOuvrez le fichier depuis vos Téléchargements pour l'ouvrir dans Word.`, 5000)
        } else {
          toast.success(`📄 File downloaded: ${filename}\n\nOpen the file from your Downloads folder to launch it in Word.`, 5000)
        }
        URL.revokeObjectURL(url)
      }, 500)
      return
    }

    if (mode === 'docx') {
      // Create MHTML format (Web Archive) which Word opens reliably with full formatting
      const cleanBodyHtml = bodyResult.html || ''
      
      const mhtmlDoc = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="----=_NextPart_000_0000"

------=_NextPart_000_0000
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable
Content-Location: file:///C:/document.html

<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset='utf-8'>
<title>${(resolvedSubject || 'Document').replace(/"/g, '&quot;')}</title>
<style>
body {
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  margin: 1in;
}
h1 {
  font-size: 16pt;
  font-weight: bold;
  margin-bottom: 12pt;
  color: #2c3d50;
  border-bottom: 2px solid #2c3d50;
  padding-bottom: 8pt;
}
p {
  margin: 0 0 10pt 0;
}
/* Ensure inline styles are preserved */
[style*="background-color"] { background-color: inherit !important; }
[style*="color"] { color: inherit !important; }
[style*="font-weight"] { font-weight: inherit !important; }
[style*="font-style"] { font-style: inherit !important; }
[style*="text-decoration"] { text-decoration: inherit !important; }
[style*="font-size"] { font-size: inherit !important; }
</style>
</head>
<body>
<h1>${resolvedSubject || 'Untitled'}</h1>
${cleanBodyHtml}
</body>
</html>

------=_NextPart_000_0000--`

      const blob = new Blob([mhtmlDoc], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(resolvedSubject || 'document').replace(/[^a-z0-9]/gi, '_')}.doc`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    if (mode === 'pdf') {
      // Create a print-friendly HTML and trigger browser print dialog
      // Users can then save as PDF from the print dialog
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow pop-ups to export as PDF')
        return
      }

      const cleanBodyHtml = bodyResult.html || ''

      const printHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'>
<title>${resolvedSubject || 'Document'}</title>
<style>
@media print {
  @page {
    margin: 1in;
    size: letter;
  }
  body {
    margin: 0;
    padding: 0;
  }
}
body {
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  color: #000;
  max-width: 8.5in;
  margin: 0 auto;
  padding: 1in;
}
h1 {
  font-size: 18pt;
  font-weight: bold;
  margin-bottom: 16pt;
  color: #2c3d50;
  border-bottom: 2px solid #2c3d50;
  padding-bottom: 8pt;
}
p {
  margin: 0 0 12pt 0;
}
/* Preserve ALL rich text formatting including highlights */
strong, b { font-weight: bold !important; }
em, i { font-style: italic !important; }
u { text-decoration: underline !important; }
s, strike { text-decoration: line-through !important; }
ul, ol { margin: 10pt 0; padding-left: 40pt; }
li { margin: 5pt 0; }
/* Critical: Ensure inline styles (colors, highlights) are preserved in print */
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}
/* Ensure all inline background colors print */
[style*="background-color"],
[style*="background"],
span[style],
mark[style] {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
</style>
</head>
<body>
<h1>${resolvedSubject || 'Untitled Document'}</h1>
${cleanBodyHtml}
<script>
  window.onload = function() {
    window.print();
    // Close window after printing (or canceling)
    setTimeout(function() {
      window.close();
    }, 100);
  };
</script>
</body>
</html>`.trim()

      printWindow.document.write(printHtml)
      printWindow.document.close()
      return
    }

    if (mode === 'copy-text') {
      // Copy as plain text (strip all formatting)
      try {
        const plainText = `${resolvedSubject ? resolvedSubject + '\n\n' : ''}${bodyResult.text}`
        await navigator.clipboard.writeText(plainText)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 1500)
      } catch (e) {
        console.error('Copy text failed', e)
        alert('Copy failed. Please try again.')
      }
      return
    }
  }

  // Persist variables popup: no ESC-to-close
  // (Intentionally disabled per design: close only via the X button)

  // Disable automatic size persistence to avoid auto-resizing on open

  // Drag handlers
  const startDrag = (e) => {
    if (!varPopupRef.current) return
    e.preventDefault()
    const { clientX, clientY } = e
    dragState.current = { dragging: true, startX: clientX, startY: clientY, origTop: varPopupPos.top, origLeft: varPopupPos.left }
    const onMove = (ev) => {
      if (!dragState.current.dragging) return
      const dx = ev.clientX - dragState.current.startX
      const dy = ev.clientY - dragState.current.startY
      let nextTop = dragState.current.origTop + dy
      let nextLeft = dragState.current.origLeft + dx

      // Grid snapping (12px)
      const grid = 12
      const snap = (val) => Math.round(val / grid) * grid
      nextTop = snap(nextTop)
      nextLeft = snap(nextLeft)

      // Edge snapping with threshold (magnetic)
      const thresh = 16
      const maxLeft = window.innerWidth - (varPopupPos.width || 600)
      const maxTop = window.innerHeight - (varPopupPos.height || 400)
      if (Math.abs(nextLeft - 0) <= thresh) nextLeft = 0
      if (Math.abs(nextTop - 0) <= thresh) nextTop = 0
      if (Math.abs(nextLeft - maxLeft) <= thresh) nextLeft = Math.max(0, maxLeft)
      if (Math.abs(nextTop - maxTop) <= thresh) nextTop = Math.max(0, maxTop)

      // Clamp inside viewport with small margin
      nextTop = Math.max(0, Math.min(maxTop, nextTop))
      nextLeft = Math.max(0, Math.min(maxLeft, nextLeft))

      setVarPopupPos(p => ({ ...p, top: nextTop, left: nextLeft }))
    }
    const onUp = () => {
      dragState.current.dragging = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Reset form with confirmation
  const [showResetWarning, setShowResetWarning] = useState(false)
  
  const handleResetClick = () => {
    setShowResetWarning(true)
  }

  const confirmReset = () => {
    if (!selectedTemplate || !templatesData?.variables) {
      setShowResetWarning(false)
      return
    }

    const initialVars = buildInitialVariables(selectedTemplate, templatesData, templateLanguage)

    variablesRef.current = initialVars
    setVariables(initialVars)

    const subjectTemplate = selectedTemplate.subject?.[templateLanguage] || ''
    const bodyTemplate = selectedTemplate.body?.[templateLanguage] || ''

    finalSubjectRef.current = subjectTemplate
    finalBodyRef.current = bodyTemplate
    setFinalSubject(subjectTemplate)
    setFinalBody(bodyTemplate)

    manualEditRef.current = { subject: false, body: false }
    setFocusedVar(null)
    setShowResetWarning(false)
  }

  // Compose helper: plain-text mailto fallback
  const composePlainTextEmailDraft = () => {
    // Use mailto so we at least open a draft with plain text content
    const latestVariables = variablesRef.current || variables || {}
    const subjectSource = finalSubjectRef.current ?? finalSubject
    const bodySource = finalBodyRef.current ?? finalBody
    const resolvedSubject = replaceVariablesWithValues(subjectSource, latestVariables) || ''
    const bodyHtmlSource = bodyEditorRef.current?.getHtml?.() ?? bodySource
    const resolvedBodyText = replaceVariablesWithValues(bodySource, latestVariables) || ''
    const bodyResult = replaceVariablesInHTML(bodyHtmlSource, latestVariables, resolvedBodyText)

    const plainBody = (bodyResult.text || resolvedBodyText || '')
      .replace(/\r?\n/g, '\r\n')

    const subjectParam = encodeURIComponent(resolvedSubject)
    const bodyParam = encodeURIComponent(plainBody)
    const mailtoUrl = `mailto:?subject=${subjectParam}&body=${bodyParam}`

    try {
      window.location.href = mailtoUrl
    } catch (error) {
      window.open(mailtoUrl, '_self')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f8fafc, #fefbe8, #e0f2fe)' }}>
      {debug && (
        <div style={{ position: 'fixed', bottom: 8, left: 8, background: '#1e293b', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          <div style={{ fontWeight: 600 }}>Debug</div>
          <div>loading: {String(loading)}</div>
          <div>templates: {templatesData?.templates?.length || 0}</div>
          <div>selected: {selectedTemplate?.id || 'none'}</div>
          <div>vars: {Object.keys(variables || {}).length}</div>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'rgba(44, 61, 80, 0.9)' }}></div>
            <p className="text-gray-600">Chargement des modèles...</p>
          </div>
        </div>
      ) : (
        !varsOnlyMode && <>
      {/* Exact banner from attached design */}
  <header className="w-full mx-auto max-w-none page-wrap relative z-50 sticky top-0 border-b" style={{ backgroundColor: '#ffffff', borderColor: 'var(--tb-sage)', maxHeight: '120px', overflow: 'hidden', paddingTop: '0.125in', paddingBottom: '0px' }}>
        {/* Decorative pills and lines - EXACT positions from design */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Top row of pills - bigger shapes, clear around logo */}
          <div className="banner-pill" style={{ top: '-48px', left: '-220px', width: '420px', height: '140px', background: '#2c3d50', opacity: 0.82, borderRadius: '160px' }}></div>
          <div className="banner-pill" style={{ top: '-23px', left: '720px', width: '340px', height: '115px', background: '#aca868', opacity: 0.40, borderRadius: '150px' }}></div>
          <div className="banner-pill" style={{ top: '-83px', left: '1140px', width: '680px', height: '125px', background: '#426388', opacity: 0.30, borderRadius: '160px' }}></div>
          
          {/* Bottom row of pills - bigger shapes */}
          <div className="banner-pill" style={{ top: '58px', left: '-200px', width: '380px', height: '110px', background: '#aca868', opacity: 0.30, borderRadius: '140px' }}></div>
          <div className="banner-pill" style={{ top: '65px', left: '780px', width: '720px', height: '185px', background: '#aca868', opacity: 0.15, borderRadius: '200px' }}></div>
          <div className="banner-pill" style={{ top: '85px', left: '1636px', width: '520px', height: '75px', background: '#2c3d50', opacity: 0.82, borderRadius: '130px' }}></div>
          
          {/* Horizontal line with dot - longer and bolder, extended left by 1 inch */}
          <div className="hpill-line" style={{ left: '472px', top: '40px', height: '3px', width: '528px', background: '#2c3d50', opacity: 0.70 }}>
            <span className="hpill-dot" style={{ top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: '18px', height: '18px', background: '#ffffff', borderRadius: '9999px', boxShadow: '0 0 0 4px #aca868', position: 'absolute' }}></span>
          </div>
          
          {/* Vertical line with dot */}
          <div className="hpill-line" style={{ left: '1530px', top: '-54px', height: '176px', width: '2px', background: '#2c3d50', opacity: 0.5 }}>
            <span className="hpill-dot" style={{ top: '52%', left: '50%', transform: 'translate(-50%, -50%)', width: '36px', height: '36px', background: '#ffffff', borderRadius: '9999px', boxShadow: '0 0 0 4px #8a7530', position: 'absolute' }}></span>
          </div>
        </div>
        
        {/* Main content */}
  <div className="flex items-start justify-between relative">
          {/* Left side: Logo + Subtitle with 2in margin */}
          <div className="flex items-center space-x-6" style={{ marginLeft: '3in' }}>
                {/* ECHO logo SVG - 225% larger (540×270), moved up ~0.65 inch */}
                <div className="relative" style={{ width: '270px', height: '135px', marginTop: '-0.185in', marginBottom: '2px', marginLeft: '-100px' }}>
                  <img src={echoLogo} alt="ECHO" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

            {/* Subtitle only */}
            <div className="flex flex-col justify-center" style={{ marginLeft: '-60px', marginTop: '19px' }}>
              <p className="font-semibold" style={{ color: 'rgba(44, 61, 80, 0.9)', fontSize: '100%', maxWidth: '22rem' }}>
                {t.subtitle}
              </p>
            </div>
          </div>
          
          {/* Right side: Column with teal selector and subtle help below */}
          <div className="flex flex-col items-end" style={{ marginTop: '8px' }}>
            <div
              className="flex w-full max-w-sm flex-col gap-3 px-4 py-4 shadow-xl"
              style={{ backgroundColor: 'var(--primary)', borderRadius: 'calc(var(--radius) + 8px)' }}
            >
            <div className="flex items-center justify-between gap-0.5">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-white" />
                <span className="font-bold text-base text-white mr-[5px]">{t.interfaceLanguage}</span>
              </div>
              <div className="flex bg-white p-1 shadow-lg" style={{ borderRadius: '14px' }}>
                <button
                  onClick={() => setInterfaceLanguage('fr')}
                  className={`px-3 py-1.5 text-sm font-bold transition-all duration-300 transform ${
                    interfaceLanguage === 'fr' ? 'shadow-xl scale-105' : ''
                  }`}
                  style={
                    interfaceLanguage === 'fr'
                      ? { backgroundColor: '#2c3d50', color: 'white', borderRadius: 'calc(var(--radius) + 4px)' }
                      : { backgroundColor: 'transparent', borderRadius: 'calc(var(--radius) + 4px)', color: '#6b7280' }
                  }
                >
                  FR
                </button>
                <button
                  onClick={() => setInterfaceLanguage('en')}
                  className={`px-3 py-1.5 text-sm font-bold transition-all duration-300 transform ${
                    interfaceLanguage === 'en' ? 'shadow-xl scale-105' : 'hover:scale-105'
                  }`}
                  style={
                    interfaceLanguage === 'en'
                      ? { backgroundColor: '#2c3d50', color: 'white', borderRadius: 'calc(var(--radius) + 4px)' }
                      : { backgroundColor: 'transparent', borderRadius: 'calc(var(--radius) + 4px)', color: '#6b7280' }
                  }
                >
                  EN
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </header>

  {/* Template submission button */}
  <Button
    onClick={() => {
      try {
        const url = new URL(window.location.href)
        url.searchParams.set('helpOnly', '1')
        url.searchParams.set('lang', interfaceLanguage)
        url.searchParams.set('category', 'template')
        const w = Math.min(900, (window.screen?.availWidth || window.innerWidth) - 80)
        const h = Math.min(700, (window.screen?.availHeight || window.innerHeight) - 120)
        const left = Math.max(0, Math.floor(((window.screen?.availWidth || window.innerWidth) - w) / 2))
        const top = Math.max(0, Math.floor(((window.screen?.availHeight || window.innerHeight) - h) / 3))
        const features = `popup=yes,width=${Math.round(w)},height=${Math.round(h)},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0,scrollbars=1,resizable=1,noopener=1`
        const win = window.open(url.toString(), '_blank', features)
        if (win && win.focus) win.focus()
      } catch {}
    }}
    variant="outline"
    className="fixed bottom-4 right-[120px] z-40 inline-flex items-center gap-2 rounded-lg border-2 bg-white px-4 py-3 text-sm font-semibold tracking-wide shadow-lg transition-all"
    style={{ borderColor: 'rgba(44, 61, 80, 0.5)', color: '#2c3d50' }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(44, 61, 80, 0.9)';
      e.currentTarget.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'white';
      e.currentTarget.style.color = '#2c3d50';
    }}
    title={interfaceLanguage === 'fr' ? 'Soumettre un modèle' : 'Submit a template'}
  >
    <FileText className="h-5 w-5" />
    <span>{interfaceLanguage === 'fr' ? 'Soumettre un modèle' : 'Submit a template'}</span>
  </Button>

  {/* Fixed Help button - bottom-right corner */}
  <Button
    onClick={() => {
      try {
        const url = new URL(window.location.href)
        url.searchParams.set('helpOnly', '1')
        url.searchParams.set('lang', interfaceLanguage)
        // Minimal compact help popout dimensions
        const preferredW = 560
        const preferredH = 620
        const availW = (window.screen?.availWidth || window.innerWidth) - 40
        const availH = (window.screen?.availHeight || window.innerHeight) - 40
        const w = Math.min(preferredW, availW)
        const h = Math.min(preferredH, availH)
        const left = Math.max(0, Math.floor(((window.screen?.availWidth || window.innerWidth) - w) / 2))
        const top = Math.max(0, Math.floor(((window.screen?.availHeight || window.innerHeight) - h) / 3))
        const features = `popup=yes,width=${Math.round(w)},height=${Math.round(h)},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0,scrollbars=1,resizable=1,noopener=1`
        const win = window.open(url.toString(), '_blank', features)
        if (win && win.focus) win.focus()
      } catch {}
    }}
    variant="outline"
    className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-lg border-2 bg-white px-4 py-3 text-sm font-semibold tracking-wide shadow-lg transition-all"
    style={{ borderColor: 'rgba(44, 61, 80, 0.5)', color: '#2c3d50' }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(44, 61, 80, 0.9)';
      e.currentTarget.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'white';
      e.currentTarget.style.color = '#2c3d50';
    }}
    title={interfaceLanguage === 'fr' ? "Ouvrir le centre d'aide" : 'Open help centre'}
  >
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" fontSize="12" fill="currentColor" stroke="none" textAnchor="middle" fontWeight="bold">?</text>
    </svg>
    <span>{interfaceLanguage === 'fr' ? 'Aide' : 'Help'}</span>
  </Button>

  {/* Main content with resizable panes - full width */}
  <main className="w-full max-w-none px-3 sm:px-4 lg:px-6 py-5 pb-24">
  {/* Data integrity banner: show when templates failed to load */}
  {!loading && (!templatesData || !Array.isArray(templatesData.templates) || templatesData.templates.length === 0) && (
    <div className="mb-6 p-4 rounded-lg border-2 border-amber-300 bg-amber-50 text-amber-900 shadow-sm">
      <div className="font-semibold mb-1">{interfaceLanguage === 'fr' ? 'Aucun modèle chargé' : 'No templates loaded'}</div>
      <div className="text-sm">
        {interfaceLanguage === 'fr'
          ? "Le fichier complete_email_templates.json n'a pas été trouvé ou n'a pas pu être chargé. Le bouton d'envoi s'affiche uniquement quand un modèle est sélectionné."
          : 'The complete_email_templates.json file was not found or could not be loaded. The Send button only shows when a template is selected.'}
        <div className="mt-2">
          <a className="underline text-amber-800" href="./complete_email_templates.json" target="_blank" rel="noreferrer">complete_email_templates.json</a>
        </div>
        <div className="mt-1 text-xs text-amber-800/80">
          {interfaceLanguage === 'fr'
            ? 'Astuce: ajoutez ?debug=1 à l’URL pour voir les compteurs. Vérifiez la console réseau (F12) pour les erreurs 404/CORS.'
            : 'Tip: add ?debug=1 to the URL to see counters. Check the Network console (F12) for 404/CORS errors.'}
        </div>
      </div>
    </div>
  )}
  <div className="flex gap-4 items-stretch w-full">
    {/* Mobile open button */}
    <div className="md:hidden mb-3 w-full flex justify-start">
      <Button
        variant="outline"
        className="font-semibold border-2"
        style={{ borderColor: '#2c3d50', borderRadius: 12 }}
        onClick={() => { setShowMobileTemplates(true); setTimeout(() => searchRef.current?.focus(), 0) }}
      >
        <FileText className="h-4 w-4 mr-2 text-[#2c3d50]" />
        Templates
      </Button>
    </div>
    {/* Left panel - Template list (resizable) */}
    <div className="hidden md:block shrink-0" style={{ width: leftWidth }}>
      <Card className="h-fit card-soft border-0 overflow-hidden rounded-[14px]" style={{ background: '#ffffff', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CardContent className="p-0 flex flex-col h-full" style={{ padding: 0 }}>
          {/* Fixed header section */}
          <div className="flex-shrink-0 px-0 pt-0 pb-2 bg-white">
              {/* Teal header bar - match CardHeader style, extend to edges */}
              <div className="w-full px-4 flex items-center justify-center mb-3" style={{ background: 'var(--primary)', paddingTop: 10, paddingBottom: 10, minHeight: 48, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <div className="text-2xl font-bold text-white inline-flex items-center gap-2 leading-none whitespace-nowrap">
                  <FileText className="h-6 w-6 text-white" aria-hidden="true" />
                  <span className="truncate">{interfaceLanguage === 'fr' ? 'Modèles' : 'Templates'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4">
                <p className="text-sm text-gray-600">{filteredTemplates.length} {t.templatesCount}</p>
                <button
                  onClick={() => {
                    setFavoritesOnly(v => {
                      const next = !v
                      setFavLiveMsg(next ? `${t.favorites} (${favorites.length || 0})` : t.favorites)
                      return next
                    })
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-200 border ${favoritesOnly ? 'bg-[#aca868]/20 text-[#2c3d50] border-[#aca868]' : 'bg-white text-[#2c3d50] border-[#2c3d50]'} flex items-center gap-2`}
                  title={t.showFavoritesOnly}
                  aria-pressed={favoritesOnly}
                  aria-live="polite"
                >
                  <span className={`text-xl transition-all duration-150 ${favoritesOnly ? 'text-[#8a8535] scale-110' : 'text-gray-200 scale-100'}`}>★</span>
                  {favoritesOnly ? `${t.favorites} (${favorites.length || 0})` : t.favorites}
                  <span style={{position:'absolute',left:'-9999px',height:0,width:0,overflow:'hidden'}} aria-live="polite">{favLiveMsg}</span>
                </button>
              </div>
              {/* Category filter */}
              <div className="mt-2 px-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger
                    className={`w-full h-12 border rounded-md !bg-[#b5af70] !border-[#2c3d50] text-white font-semibold tracking-wide shadow-sm`}
                    style={{ color: 'white', fontSize: selectedCategory === 'all' ? '1rem' : '0.875rem' }}
                  >
                    <Filter className="h-4 w-4 mr-2 text-white" />
                    <span>{selectedCategory === 'all' ? t.allCategories : getCategoryLabel(selectedCategory)}</span>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#2c3d50] rounded-[14px] shadow-xl text-[#2c3d50]">
                    <SelectItem value="all" className="font-semibold" style={{ fontSize: '1rem' }}>{t.allCategories}</SelectItem>
                    {orderedCategories
                      .filter(category => typeof category === 'string' && category.trim().length > 0)
                      .map(category => (
                        <SelectItem key={category} value={category}>
                          {getCategoryLabel(category)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Search */}
              <div className="relative group mt-2 px-4">
                <Search className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" style={{ left: 34 }} />
                <Input
                  ref={searchRef}
                  id="template-search-main"
                  name="template-search-main"
                  type="text"
                  autoComplete="off"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-[14px] bg-white px-3 py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 pl-12 pr-12 border"
                  style={{ borderColor: '#2c3d50', backgroundColor: '#ffffff' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                    style={{ right: '31px' }}
                    title="Clear search"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            {/* Template language switcher - match CardHeader style */}
            <div className="w-full mt-3 px-4 flex items-center justify-between gap-0.5" style={{ background: 'var(--primary)', paddingTop: 10, paddingBottom: 10, minHeight: 48, borderRadius: '4px' }}>
              <div className="text-base font-bold text-white inline-flex items-center gap-2 leading-none whitespace-nowrap">
                <Languages className="h-5 w-5 text-white" />
                <span className="truncate mr-[5px]">{t.templateLanguage}</span>
              </div>
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setTemplateLanguage('fr')}
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-300 button-ripple teal-focus ${templateLanguage === 'fr' ? 'text-white' : 'text-gray-600'}`}
                  style={templateLanguage === 'fr' ? { background: '#2c3d50' } : {} }
                >
                  FR
                </button>
                <button
                  onClick={() => setTemplateLanguage('en')}
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-300 button-ripple teal-focus ${templateLanguage === 'en' ? 'text-white' : 'text-gray-600'}`}
                  style={templateLanguage === 'en' ? { background: '#2c3d50' } : {} }
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable template cards */}
          <ScrollArea
            className="flex-1 rounded-b-[14px] overflow-y-auto bg-white"
            style={{ '--scrollbar-width': '20px', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
            viewportRef={viewportRef}
            onViewportScroll={() => {
              const vp = viewportRef.current
              if (!vp) return
              // Throttle scroll updates for smoother performance
              if (vp._scrollTimeout) return
              vp._scrollTimeout = setTimeout(() => {
                setScrollTop(vp.scrollTop)
                setViewportH(vp.clientHeight)
                vp._scrollTimeout = null
              }, 16) // ~60fps
            }}
          >
            {/* Virtualized list */}
            {(() => {
              const ITEM_H = 104
              const count = filteredTemplates.length
              const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - 3)
              const visible = Math.ceil((viewportH || 600) / ITEM_H) + 6
              const end = Math.min(count, start + visible)
              const topPad = start * ITEM_H
              const bottomPad = (count - end) * ITEM_H
              return (
                <div className="p-3 bg-white" style={{ minHeight: (count + 1) * ITEM_H }}>
                  <div style={{ height: topPad }} />
                  <div className="space-y-3">
                    {filteredTemplates.slice(start, end).map((template) => {
                      const badgeStyle = getCategoryBadgeStyle(template.category, templatesData?.metadata?.categoryColors || {})
                      const badgeLabel = getCategoryLabel(template.category)
                      return (
                        <div
                          key={template.id}
                          ref={(el) => { if (el) itemRefs.current[template.id] = el }}
                          onClick={() => {
                            setSelectedTemplate(template)
                            setSelectedTemplateId(template.id)
                          }}
                          onMouseDown={() => setPressedCardId(template.id)}
                          onMouseUp={() => setPressedCardId(null)}
                          onMouseLeave={() => setPressedCardId(null)}
                          className={`w-full p-4 border cursor-pointer transition-all duration-150 ${
                            selectedTemplate?.id === template.id
                              ? 'shadow-lg transform scale-[1.02]'
                              : 'border-[#e1eaf2] bg-white hover:border-[#2c3d50] hover:shadow-md hover:-translate-y-[1px]'
                          }`}
                          style={
                            selectedTemplate?.id === template.id
                              ? {
                                  borderColor: '#2c3d50',
                                  background: '#e6f0ff',
                                  borderRadius: '14px',
                                  scrollMarginTop: 220,
                                }
                              : { borderRadius: '14px', transform: pressedCardId === template.id ? 'scale(0.995)' : undefined, boxShadow: pressedCardId === template.id ? 'inset 0 0 0 1px rgba(0,0,0,0.05)' : undefined, scrollMarginTop: 220 }
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-[13px]" title={template.title[templateLanguage]}>
                                  {renderHighlighted(
                                    template.title[templateLanguage],
                                    getMatchRanges(template.id, `title.${templateLanguage}`)
                                  )}
                                </h3>
                              </div>
                              <p className="text-[12px] text-gray-600 mb-2 leading-relaxed line-clamp-2" title={template.description[templateLanguage]}>
                                {renderHighlighted(
                                  template.description[templateLanguage],
                                  getMatchRanges(template.id, `description.${templateLanguage}`)
                                )}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-[11px] font-semibold px-3 py-1 border rounded-full shadow-sm"
                                style={{ background: badgeStyle.bg, color: badgeStyle.text, borderColor: badgeStyle.border }}
                              >

                                {badgeLabel}
                              </Badge>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFav(template.id); }}
                              className={`ml-3 text-xl transition-colors ${isFav(template.id) ? 'text-[#8a8535]' : 'text-gray-200 hover:text-[#8a8535]'}`}
                              title={isFav(template.id) ? 'Unfavorite' : 'Favorite'}
                              aria-label="Toggle favorite"
                            >★</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ height: bottomPad }} />
                </div>
              );
            })()}

            {/* Keyboard nav capture */}
            <div
              className="sr-only"
              tabIndex={0}
              onKeyDown={(e) => {
                if (!filteredTemplates.length) return;
                if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); return; }
                if (e.key === 'Escape') { if (searchQuery) setSearchQuery(''); return; }
                const max = filteredTemplates.length - 1;
                let idx = focusedIndex;
                if (idx < 0) idx = selectedTemplate ? Math.max(0, filteredTemplates.findIndex(t => t.id === selectedTemplate.id)) : 0;
                if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(max, idx + 1); setFocusedIndex(idx); itemRefs.current[filteredTemplates[idx].id]?.scrollIntoView({ block: 'nearest' }); return; }
                if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); setFocusedIndex(idx); itemRefs.current[filteredTemplates[idx].id]?.scrollIntoView({ block: 'nearest' }); return; }
                if (e.key.toLowerCase() === 'f') { e.preventDefault(); const id = filteredTemplates[idx]?.id; if (id) toggleFav(id); return; }
                if (e.key === 'Enter') { e.preventDefault(); const tSel = filteredTemplates[idx]; if (tSel) setSelectedTemplate(tSel); return; }
              }}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>

    {/* Mobile overlay for templates */}
    {showMobileTemplates && (
      <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileTemplates(false)} />
        <div className="absolute left-0 top-0 h-full w-[88vw] bg-white shadow-2xl border-r border-gray-200 p-2">
          <div className="flex justify-between items-center mb-2 px-2">
            <div className="font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-5 w-5"/>Templates</div>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowMobileTemplates(false)}>✕</button>
          </div>
          {/* Reuse same card content in a simple scroll container */}
          <div className="h-[80vh] overflow-y-auto pr-1">
            {/* Simple reuse by rendering the desktop card again would duplicate logic; keep minimal: instruct to use desktop pane on mobile for now. */}
            {/* For simplicity, render the same ScrollArea block */}
            <div className="pr-2">
              {/* We re-mount the desktop block content by calling setShowMobileTemplates; for brevity, we mirror the header-only quick access and basic list without virtualization */}
              <div className="h-[48px] w-full rounded-[14px] px-4 flex items-center justify-center mb-2" style={{ background: 'var(--primary)' }}>
                <div className="text-base font-bold text-white inline-flex items-center gap-2 leading-none whitespace-nowrap">
                  <FileText className="h-5 w-5 text-white" aria-hidden="true" />
                  <span className="truncate">{interfaceLanguage === 'fr' ? 'Modèles' : 'Templates'}</span>
                </div>
              </div>
              <div className="mt-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className={`w-full h-12 border transition-all duration-200 rounded-md ${selectedCategory === 'all' ? 'font-semibold' : ''}`} style={{ background: '#b5af70', borderColor: '#b5af70', color: 'white', fontSize: selectedCategory === 'all' ? '1rem' : '0.875rem' }}>
                    <Filter className="h-4 w-4 mr-2 text-white" />
                    <span>{selectedCategory === 'all' ? t.allCategories : getCategoryLabel(selectedCategory)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-semibold" style={{ fontSize: '1rem' }}>{t.allCategories}</SelectItem>
                    {orderedCategories
                      .filter(category => typeof category === 'string' && category.trim().length > 0)
                      .map(category => (
                        <SelectItem key={category} value={category}>
                          {getCategoryLabel(category)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative group mt-2">
                <Search className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" style={{ left: 14 }} />
                <Input
                  ref={searchRef}
                  id="template-search-mobile"
                  name="template-search-mobile"
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-[14px] bg-transparent px-3 py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 pl-12 pr-10 border"
                  style={{ borderColor: '#aca868' }}
                />
              </div>
              <div className="mt-3 space-y-3">
                {filteredTemplates.slice(0, 80).map((template) => {
                  const badgeStyle = getCategoryBadgeStyle(template.category, templatesData?.metadata?.categoryColors || {})
                  const badgeLabel = getCategoryLabel(template.category)
                  return (
                    <div key={template.id} onClick={() => { setSelectedTemplate(template); setShowMobileTemplates(false) }} className="w-full p-4 border border-[#e1eaf2] bg-white rounded-[14px]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-[13px] mb-1" title={template.title[templateLanguage]}>
                            {renderHighlighted(
                              template.title[templateLanguage],
                              getMatchRanges(template.id, `title.${templateLanguage}`)
                            )}
                          </h3>
                          <p className="text-[12px] text-gray-600 mb-2 leading-relaxed line-clamp-2" title={template.description[templateLanguage]}>
                            {renderHighlighted(
                              template.description[templateLanguage],
                              getMatchRanges(template.id, `description.${templateLanguage}`)
                            )}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[11px] font-semibold px-3 py-1 border rounded-full shadow-sm"
                            style={{ background: badgeStyle.bg, color: badgeStyle.text, borderColor: badgeStyle.border }}
                          >
                            {badgeLabel}
                          </Badge>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleFav(template.id) }} className={`ml-3 text-xl ${isFav(template.id) ? 'text-[#8a8535]' : 'text-gray-200 hover:text-[#8a8535]'}`} title={isFav(template.id) ? 'Unfavorite' : 'Favorite'} aria-label="Toggle favorite">★</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

          {/* Main editing panel (flexible) */}
          <div className="flex-1 min-w-[600px] space-y-5">
            {selectedTemplate ? (
              <>
                {/* Editable version - MAIN AREA */}
                <Card className="card-soft border-0 overflow-hidden rounded-[14px]" style={{ background: '#ffffff' }}>
                  <CardHeader style={{ background: 'var(--primary)', paddingTop: 10, paddingBottom: 10, minHeight: 48, boxShadow: 'none', borderBottom: 'none', borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                    <CardTitle className="text-2xl font-bold text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-6 w-6 mr-3 text-white" />
	                      {t.editEmail}
	                    </div>
	                    <div className="flex items-center space-x-3">
	                      {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                          <>
                            <Button
                              onClick={() => {
                                let preparedSnapshot = null
                                try {
                                  const runSync = syncFromTextRef.current
                                  if (typeof runSync === 'function') {
                                    const result = runSync()
                                    if (result?.variables) {
                                      preparedSnapshot = { ...result.variables }
                                    }
                                  }
                                } catch (syncError) {
                                  console.error('Failed to extract variables before opening popout:', syncError)
                                }

                                if (!preparedSnapshot) {
                                  preparedSnapshot = { ...variablesRef.current }
                                }

                                pendingPopoutSnapshotRef.current = preparedSnapshot

                                try {
                                  localStorage.setItem('ea_pending_popout_snapshot', JSON.stringify({
                                    variables: preparedSnapshot,
                                    templateId: selectedTemplate?.id || null,
                                    templateLanguage,
                                    timestamp: Date.now()
                                  }))
                                } catch (storageError) {
                                  console.warn('Unable to persist pending popout snapshot:', storageError)
                                }

                                // Open variables in new popout window
                                const url = new URL(window.location.href)
                                url.searchParams.set('varsOnly', '1')
                                if (selectedTemplate?.id) url.searchParams.set('id', selectedTemplate.id)
                                if (templateLanguage) url.searchParams.set('lang', templateLanguage)
                                
                                // Calculate window size based on number of variables
                                const count = selectedTemplate?.variables?.length || 0
                                const columns = Math.max(1, Math.min(3, count >= 3 ? 3 : count))
                                const cardW = 360
                                const gap = 8
                                const headerH = 80
                                const rowH = 120 // approx per row
                                const rows = Math.max(1, Math.ceil(count / columns))
                                let w = columns * cardW + (columns - 1) * gap + 48
                                let h = Math.min(700, headerH + rows * rowH + 48)
                                const availW = (window.screen?.availWidth || window.innerWidth) - 40
                                const availH = (window.screen?.availHeight || window.innerHeight) - 80
                                w = Math.min(w, availW)
                                h = Math.min(h, availH)
                                const left = Math.max(0, Math.floor(((window.screen?.availWidth || window.innerWidth) - w) / 2))
                                const top = Math.max(0, Math.floor(((window.screen?.availHeight || window.innerHeight) - h) / 3))
                                const features = `popup=yes,width=${Math.round(w)},height=${Math.round(h)},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0,scrollbars=1,resizable=1,noopener=1`
                                
                                const win = window.open(url.toString(), '_blank', features)
                                if (win && win.focus) win.focus()
                                
                                // Auto-close the popup when popout opens successfully
                                if (win) {
                                  setVarsMinimized(false)
                                  setVarsPinned(false)
                                  setShowVariablePopup(false)
                                }
                              }}
                              size="sm"
                              className="shadow-soft"
                              variant="outline"
                              style={{ background: '#fff', color: '#2c3d50', borderColor: 'rgba(44, 61, 80, 0.35)' }}
                            >
	                          <Settings className="h-4 w-4 mr-2" />
	                          {t.variables}
	                        </Button>
                            
                          </>
	                      )}
                        {/* Copilot trigger: opens hidden AI panel - Sage accent */}
                        <Button
                          onClick={() => setShowAIPanel(true)}
                          size="sm"
                          variant="outline"
                          className="shadow-soft"
                          style={{ background: '#fff', color: '#2c3d50', borderColor: 'rgba(44, 61, 80, 0.35)' }}
                          title="Ouvrir l'assistant Copilot"
                        >
                          <Sparkles className="h-4 w-4 mr-1.5" />
                          Copilot
                        </Button>
                        {/* Outlook button moved below editor */}
	                    </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5 mt-1" style={{ background: '#f6fbfb', borderRadius: 14 }}>

                    {/* Editable subject with preview highlighting */}
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#2c3d50]"></span>
                        <span>{t.subject}</span>
                      </div>
                      <SimplePillEditor
                        key={`subject-${selectedTemplate?.id || 'none'}-${templateLanguage}`}
                        ref={subjectEditorRef}
                        value={finalSubject}
                        onChange={(e) => {
                          const nextValue = e.target.value
                          finalSubjectRef.current = nextValue
                          setFinalSubject(nextValue)
                          manualEditRef.current.subject = true
                        }}
                        variables={variables}
                        templateLanguage={templateLanguage}
                        placeholder={getPlaceholderText()}
                        onVariablesChange={handleInlineVariableChange}
                        focusedVarName={focusedVar}
                        onFocusedVarChange={(varName) => {
                          // Local pill focus change
                          setFocusedVar(varName || null)
                          updateFocusHighlight(varName || null)
                          // Broadcast to popout so corresponding card highlights
                          if (popoutChannelRef.current) {
                            try {
                              popoutChannelRef.current.postMessage({
                                type: 'focusedVar',
                                varName: varName || null,
                                normalizedVar: normalizeVarKey(varName) || null,
                                sender: popoutSenderIdRef.current
                              })
                            } catch (e) {
                              console.warn('Focus broadcast failed:', e)
                            }
                          }
                        }}
                        variant="compact"
                      />

                    </div>

                    {/* Editable body with preview highlighting */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#2c3d50]"></span>
                        <span>{t.body}</span>
                      </div>
                      <RichTextPillEditor
                        key={`body-${selectedTemplate?.id || 'none'}-${templateLanguage}`}
                        value={finalBody}
                        onChange={(e) => {
                          const nextValue = e.target.value
                          finalBodyRef.current = nextValue
                          setFinalBody(nextValue)
                          manualEditRef.current.body = true
                        }}
                        ref={bodyEditorRef}
                        variables={variables}
                        templateLanguage={templateLanguage}
                        placeholder={getPlaceholderText()}
                        onVariablesChange={handleInlineVariableChange}
                        focusedVarName={focusedVar}
                        onFocusedVarChange={(varName) => {
                          setFocusedVar(varName || null)
                          updateFocusHighlight(varName || null)
                          if (popoutChannelRef.current) {
                            try {
                              popoutChannelRef.current.postMessage({
                                type: 'focusedVar',
                                varName: varName || null,
                                normalizedVar: normalizeVarKey(varName) || null,
                                sender: popoutSenderIdRef.current
                              })
                            } catch (e) {
                              console.warn('Focus broadcast failed:', e)
                            }
                          }
                        }}
                        minHeight="150px"
                        showRichTextToolbar={true}
                      />

                    </div>
                  </CardContent>
                </Card>

                {/* Actions with modern style */}
                <div className="flex justify-between items-center actions-row">
                  {/* Left-side tools: Export (+) then Copy link */}
                  <div className="flex items-center gap-2 relative" ref={exportMenuRef}>
                    <Button size="sm" variant="outline" className="font-medium border text-[#2c3d50]" style={{ borderRadius: 12, borderColor: '#2c3d50' }} onClick={() => setShowExportMenu(v => !v)} aria-expanded={showExportMenu} aria-haspopup="menu">
                      +
                    </Button>
                    {showExportMenu && (
                      <div className="absolute left-0 z-20 mt-2 w-52 bg-white border border-[#e6eef5] rounded-[12px] shadow-soft py-1" role="menu">
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('pdf'); setShowExportMenu(false) }}>📄 Exporter en PDF</button>
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('word'); setShowExportMenu(false) }}>📗 Ouvrir dans Word</button>
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('docx'); setShowExportMenu(false) }}>📘 Télécharger Word (.doc)</button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('html'); setShowExportMenu(false) }}>🌐 Exporter en HTML</button>
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('eml'); setShowExportMenu(false) }}>✉️ Exporter en .eml</button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('copy-html'); setShowExportMenu(false) }}>📋 Copier en HTML</button>
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('copy-text'); setShowExportMenu(false) }}>📝 Copier en texte</button>
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      onClick={() => copyTemplateLink()}
                      className="text-gray-500 hover:text-[#aca868] hover:bg-[#fefbe8] transition-all duration-300 font-medium text-sm"
                      title={t.copyLinkTitle}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      {copySuccess === 'link' ? t.copied : t.copyLink}
                    </Button>

                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleResetClick}
                      size="sm"
                      variant="outline"
                      className="font-semibold shadow-soft hover:shadow-md border-2 text-black hover:bg-[#fee2e2]"
                      style={{ borderColor: '#7f1d1d', borderRadius: 12 }}
                      title={t.resetWarningTitle}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t.reset}
                    </Button>
                  
                  {/* 
                    GRANULAR COPY BUTTONS - ENHANCED UX
                  */}
                  <div className="flex space-x-2">
                    {/* Subject Copy Button - Teal theme */}
                    <Button 
                      onClick={() => copyToClipboard('subject')} 
                      variant="outline"
                      size="sm"
                      className="font-medium border-2 transition-all duration-300 group shadow-soft"
                      style={{ 
                        borderColor: '#2c3d50',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(44, 61, 80, 0.08)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2c3d50';
                        e.currentTarget.style.backgroundColor = 'rgba(44, 61, 80, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2c3d50';
                        e.currentTarget.style.backgroundColor = 'rgba(44, 61, 80, 0.08)';
                      }}
                      title="Copy subject only (Ctrl+J)"
                    >
                      <Mail className="h-4 w-4 mr-2 text-[#2c3d50]" />
                      <span className="text-[#2c3d50]">{copySuccess === 'subject' ? t.copied : (t.copySubject || 'Subject')}</span>
                    </Button>
                    
                    {/* Body Copy Button - Sage accent (slightly darker) */}
                    <Button 
                      onClick={() => copyToClipboard('body')} 
                      variant="outline"
                      size="sm"
                      className="font-medium border-2 transition-all duration-300 group shadow-soft"
                      style={{ 
                        borderColor: '#aca868',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(172, 168, 104, 0.12)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#aca868';
                        e.currentTarget.style.backgroundColor = 'rgba(172, 168, 104, 0.22)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#aca868';
                        e.currentTarget.style.backgroundColor = 'rgba(172, 168, 104, 0.12)';
                      }}
                      title="Copy body only (Ctrl+B)"
                    >
                      <Edit3 className="h-4 w-4 mr-2 text-[#2c3d50]" />
                      <span className="text-[#2c3d50]">{copySuccess === 'body' ? t.copied : (t.copyBody || 'Body')}</span>
                    </Button>
                    
                    {/* Complete Copy Button - Gradient (main action) */}
                    <Button 
                      onClick={() => copyToClipboard('all')} 
                      className={`font-bold transition-all duration-200 shadow-soft btn-pill text-white ${
                        copySuccess === 'all'
                          ? 'transform scale-[1.02]' 
                          : 'hover:scale-[1.02]'
                      }`}
                      style={{ background: '#5a88b5' }}
                      title="Copy entire template (Ctrl+Enter)"
                    >
                      <Copy className="h-5 w-5 mr-2" />
                      {copySuccess === 'all' ? t.copied : (t.copyAll || 'All')}
                    </Button>

                    {/* Compose button (plain-text mailto) */}
                    <Button 
                      onClick={() => composePlainTextEmailDraft()}
                      className="font-bold transition-all duration-200 shadow-soft text-white btn-pill flex items-center py-3"
                      style={{ background: '#2c3d50', borderRadius: '12px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      title={interfaceLanguage === 'fr' ? 'Ouvrir un brouillon en texte brut dans votre client de courriel' : 'Open a plain-text draft in your email client'}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      <div className="flex flex-col items-center">
                        <span>{interfaceLanguage === 'fr' ? 'Ouvrir dans un courriel' : 'Open in an email'}</span>
                        <span className="text-xs font-normal opacity-80">{interfaceLanguage === 'fr' ? '(texte brut)' : '(plain text)'}</span>
                      </div>
                    </Button>
                  </div>
                  </div>
                </div>
              </>
            ) : (
              <Card className="card-soft border-0 bg-gradient-to-br from-white to-emerald-50 rounded-[18px]">
                <CardContent className="flex items-center justify-center h-80">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto animate-bounce" />
                      <Sparkles className="h-6 w-6 text-[#2c3d50] absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">{t.noTemplate}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Removed permanent AI sidebar; optional slide-over below */}
        </div>
      </main>

      {/* Footer Help button removed per request */}
        </>
      )}

      {/* Reset Warning Dialog */}
      {showResetWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t.resetWarningTitle}</h2>
              <p className="text-gray-600">{t.resetWarningMessage}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowResetWarning(false)}
                variant="outline"
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={confirmReset}
                variant="outline"
                className="flex-1 border-2 text-[#7f1d1d] hover:bg-[#fee2e2]"
                style={{ borderColor: '#7f1d1d' }}
              >
                {t.confirm}
              </Button>
            </div>
          </div>
        </div>
      )}



      {/* Variables minimized pill */}
  {showVariablePopup && varsMinimized && !varsOnlyMode && createPortal(
        <div
          className="fixed z-[9999] select-none"
          style={{ right: pillPos.right, bottom: pillPos.bottom }}
        >
          <button
            className="px-3 py-2 rounded-full shadow-lg border bg-white text-[#aca868] font-semibold"
            style={{ borderColor: '#aca868' }}
            onMouseDown={(e) => {
              e.preventDefault()
              const startX = e.clientX
              const startY = e.clientY
              const startR = pillPos.right
              const startB = pillPos.bottom
              const onMove = (ev) => {
                const dx = ev.clientX - startX
                const dy = ev.clientY - startY
                const grid = 12
                const snap = (v)=> Math.round(v/grid)*grid
                const nextRight = snap(Math.max(8, startR - dx))
                const nextBottom = snap(Math.max(8, startB - dy))
                setPillPos({ right: nextRight, bottom: nextBottom })
              }
              const onUp = () => {
                document.removeEventListener('mousemove', onMove)
                document.removeEventListener('mouseup', onUp)
              }
              document.addEventListener('mousemove', onMove)
              document.addEventListener('mouseup', onUp)
            }}
            onClick={() => setVarsMinimized(false)}
            title={interfaceLanguage==='fr'?'Variables':'Variables'}
          >
            <Edit3 className="inline h-4 w-4 mr-1" /> {t.variables}
          </button>
        </div>,
        document.body
      )}

      {/* Resizable Variables Popup (no blocking backdrop) */}
    {showVariablePopup && !varsMinimized && selectedTemplate && templatesData && templatesData.variables && selectedTemplate.variables && selectedTemplate.variables.length > 0 && createPortal(
  <div className="fixed inset-0 z-[9999] pointer-events-none" style={varsOnlyMode ? { background: '#ffffff' } : undefined}>
          <div 
            ref={varPopupRef}
            className={`bg-white ${varsOnlyMode ? '' : 'rounded-[14px] shadow-2xl border border-[#e6eef5]'} min-w-[420px] ${varsOnlyMode ? 'max-w-[100vw] max-h-[100vh]' : 'max-w-[92vw] max-h-[88vh]'} resizable-popup pointer-events-auto flex flex-col`}
            style={{ 
              position: 'fixed',
              top: varPopupPos.top,
              left: varPopupPos.left,
              width: varPopupPos.width,
              height: varPopupPos.height,
              cursor: dragState.current.dragging ? 'grabbing' : 'default'
            }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vars-title"
            // Do not close on keyboard; keep persistent unless user clicks X
          >
            {/* Popup Header: Teal background, white text + sticky tools */}
            <div 
              className={`px-3 py-2 select-none flex-shrink-0 ${varsOnlyMode ? '' : ''}`}
              style={{ background: 'var(--primary)', color: '#fff', cursor: 'grab' }}
              onMouseDown={(e)=>{
                // allow dragging by header background but not when targeting inputs/buttons/icons
                const tag = (e.target && e.target.tagName) ? String(e.target.tagName).toUpperCase() : ''
                if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SVG' || tag === 'PATH') return
                startDrag(e)
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Edit3 className="h-5 w-5 mr-2 text-white" />
                  <h2 id="vars-title" className="text-base font-bold text-white">{t.variables}</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {!varsOnlyMode && (
                    <Button
                      onClick={(e) => {
                        if (e.shiftKey) {
                          // Shift+click toggles preference
                          setPreferPopout(v => !v)
                          return
                        }
                        
                        // Normal click opens popout
                        const url = new URL(window.location.href)
                        url.searchParams.set('varsOnly', '1')
                        if (selectedTemplate?.id) url.searchParams.set('id', selectedTemplate.id)
                        if (templateLanguage) url.searchParams.set('lang', templateLanguage)
                        // Narrower popout: single column, ~4 cards tall by default
                        const baseWidth = 460
                        const baseHeight = 700
                        const count = selectedTemplate?.variables?.length || 0
                        const cardW = 360 // px per field card
                        const padding = 48 // padding around cards
                        const headerH = 80
                        const rowH = 120 // approx per row with spacing
                        const rows = Math.max(1, count)
                        let w = Math.max(baseWidth, cardW + padding)
                        let h = Math.max(baseHeight, headerH + Math.min(rows, 8) * rowH + padding)
                        const availW = (window.screen?.availWidth || window.innerWidth) - 40
                        const availH = (window.screen?.availHeight || window.innerHeight) - 80
                        w = Math.min(w, availW)
                        h = Math.min(h, availH)
                        const left = Math.max(0, Math.floor(((window.screen?.availWidth || window.innerWidth) - w) / 2))
                        const top = Math.max(0, Math.floor(((window.screen?.availHeight || window.innerHeight) - h) / 3))
                        const features = `popup=yes,width=${Math.round(w)},height=${Math.round(h)},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0,scrollbars=1,resizable=1,noopener=1`
                        
                        const win = window.open(url.toString(), '_blank', features)
                        if (win && win.focus) win.focus()
                        
                        // Auto-close the popup when popout opens successfully
                        if (win) {
                          setVarsMinimized(false)
                          setVarsPinned(false)
                          setShowVariablePopup(false)
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="border-2 text-white"
                      style={{ 
                        borderColor: preferPopout ? 'rgba(139, 195, 74, 0.8)' : 'rgba(255,255,255,0.5)', 
                        borderRadius: 10, 
                        background: preferPopout ? 'rgba(139, 195, 74, 0.1)' : 'transparent' 
                      }}
                      title={interfaceLanguage==='fr'?`Détacher dans une nouvelle fenêtre${preferPopout ? ' (préféré)' : ''}\n• Déplacer sur un autre écran\n• Redimensionner librement\n• Ferme automatiquement cette popup\n\nShift+clic pour basculer la préférence`:`Detach to new window${preferPopout ? ' (preferred)' : ''}\n• Move to another screen\n• Resize freely\n• Auto-closes this popup\n\nShift+click to toggle preference`}
                      onMouseDown={(e)=> e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {varsOnlyMode && (
                    <Button
                      onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
                      variant="outline"
                      size="sm"
                      className="border-2 text-white"
                      style={{ borderColor: 'rgba(255,255,255,0.5)', borderRadius: 10, background: 'transparent' }}
                      title={interfaceLanguage==='fr'?(isFullscreen?'Quitter le plein écran':'Plein écran'):(isFullscreen?'Exit full screen':'Full screen')}
                      onMouseDown={(e)=> e.stopPropagation()}
                    >
                      {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    onClick={() => setVarsPinned(v => !v)}
                    variant="outline"
                    size="sm"
                    className="border-2 text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.5)', borderRadius: 10, background: 'transparent' }}
                    title={interfaceLanguage==='fr'?(varsPinned?'Épinglé (cliquer pour libérer)':'Libre (cliquer pour épingler)'):(varsPinned?'Pinned (click to unpin)':'Unpinned (click to pin)')}
                    onMouseDown={(e)=> e.stopPropagation()}
                  >
                    {varsPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedTemplate || !templatesData) return
                      const initialVars = buildInitialVariables(selectedTemplate, templatesData, templateLanguage)
                      setVariables(prev => applyAssignments(prev, initialVars))
                    }}
                    variant="outline"
                    size="sm"
                    className="border-2 text-[#aca868]"
                    style={{ borderColor: 'rgba(20,90,100,0.35)', borderRadius: 10, background: '#fff' }}
                    title={t.reset}
                    onMouseDown={(e)=> e.stopPropagation()}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> {t.reset}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedTemplate) return
                      setVariables(prev => {
                        const assignments = {}
                        const preferredLang = (templateLanguageRef.current || 'fr').toUpperCase()
                        selectedTemplate.variables.forEach((vn) => {
                          Object.assign(assignments, expandVariableAssignment(vn, '', {
                            preferredLanguage: preferredLang,
                            variables: prev
                          }))
                        })
                        return applyAssignments(prev, assignments)
                      })
                    }}
                    variant="outline"
                    size="sm"
                    className="border-2 text-[#7f1d1d] hover:bg-[#fee2e2]"
                    style={{ borderColor: '#7f1d1d', borderRadius: 10, background: '#fff' }}
                    title={interfaceLanguage==='fr'?'Tout effacer':'Clear all'}
                    onMouseDown={(e)=> e.stopPropagation()}
                  >
                    <Eraser className="h-4 w-4 mr-1" /> {interfaceLanguage==='fr'?'Effacer':'Clear'}
                  </Button>
                  <Button
                    onClick={() => setVarsMinimized(true)}
                    variant="outline"
                    size="sm"
                    className="border-2 text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.5)', borderRadius: 10, background: 'transparent' }}
                    title={interfaceLanguage === 'fr' 
                      ? 'Minimiser\n\nRaccourcis clavier:\n• Tab/Entrée: Champ suivant\n• Échap: Minimiser\n• Ctrl+Entrée: Fermer\n• Ctrl+R: Réinitialiser\n• Ctrl+Shift+V: Coller intelligent' 
                      : 'Minimize\n\nKeyboard shortcuts:\n• Tab/Enter: Next field\n• Escape: Minimize\n• Ctrl+Enter: Close\n• Ctrl+R: Reset all\n• Ctrl+Shift+V: Smart paste'
                    }
                    onMouseDown={(e)=> e.stopPropagation()}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      if (varsOnlyMode) {
                        // close pop-out window
                        window.close()
                      } else {
                        setShowVariablePopup(false)
                        
                        // Notify that variables popup closed
                        if (canUseBC) {
                          try {
                            const channel = new BroadcastChannel('email-assistant-sync')
                            channel.postMessage({ type: 'variablesPopupClosed', timestamp: Date.now() })
                            channel.close()
                          } catch (e) {
                            console.log('BroadcastChannel not available for popup close sync')
                          }
                        }
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-100 hover:text-red-600"
                    onMouseDown={(e)=> e.stopPropagation()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Popup Content - Scrollable Area */}
            <div className="flex-1 overflow-y-auto" style={{ padding: varsOnlyMode ? '12px' : '16px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(() => {
                  // Extract variables in the order they appear in template text
                  const subjectText = selectedTemplate.subject?.[templateLanguage] || ''
                  const bodyText = selectedTemplate.body?.[templateLanguage] || ''
                  const combinedText = subjectText + '\n' + bodyText
                  
                  const seenVars = new Set()
                  const orderedVars = []
                  const regex = /<<([^>]+)>>/g
                  let match
                  
                  while ((match = regex.exec(combinedText)) !== null) {
                    const varNameInText = match[1] // e.g., "client_name_FR"
                    // Strip language suffix to match template.variables format
                    const baseVarName = varNameInText.replace(/_(FR|EN)$/i, '')
                    
                    if (!seenVars.has(baseVarName) && selectedTemplate.variables.includes(baseVarName)) {
                      seenVars.add(baseVarName)
                      orderedVars.push(baseVarName)
                    }
                  }
                  
                  // Add any remaining variables not found in text (shouldn't happen normally)
                  selectedTemplate.variables.forEach(v => {
                    if (!seenVars.has(v)) orderedVars.push(v)
                  })
                  
                  return orderedVars
                })().map((varName) => {
                  const varInfo = templatesData?.variables?.[varName]
                  if (!varInfo) return null
                  
                  const getVarValue = (name = '') => resolveVariableValue(variables, name, templateLanguage)

                  const currentValue = getVarValue(varName)
                  const sanitizedVarId = `var-${varName.replace(/[^a-z0-9_-]/gi, '-')}`
                  const langForDisplay = (templateLanguage || interfaceLanguage || 'fr').toLowerCase()
                  const targetVarForLanguage = (name) => {
                    if (/_(FR|EN)$/i.test(name)) return name
                    return `${name}_${(templateLanguage || 'fr').toUpperCase()}`
                  }
                  
                  return (
                    <div key={varName} className="rounded-[10px] p-3 transition-all duration-200" style={{ 
                      background: focusedVar === varName 
                        ? 'rgba(59, 130, 246, 0.15)' // Blue background when focused
                        : 'rgba(200, 215, 150, 0.4)', 
                      border: focusedVar === varName 
                        ? '2px solid rgba(59, 130, 246, 0.4)' // Blue border when focused
                        : '1px solid rgba(190, 210, 140, 0.6)',
                      boxShadow: focusedVar === varName 
                        ? '0 0 0 3px rgba(59, 130, 246, 0.1)' // Subtle outer glow when focused
                        : 'none'
                    }}>
                      <div className="bg-white rounded-[8px] p-4 border" style={{ border: '1px solid rgba(190, 210, 140, 0.4)' }}>
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <label htmlFor={sanitizedVarId} className="text-[14px] font-semibold text-gray-900 flex-1 leading-tight">
                            {varInfo?.description?.[langForDisplay] || varInfo?.description?.fr || varInfo?.description?.en || varName}
                          </label>
                          <div className="shrink-0 flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button
                              className="text-[11px] px-2 py-0.5 rounded border border-[#e6eef5] text-[#aca868] hover:bg-[#f0fbfb]"
                              title={interfaceLanguage==='fr'?'Remettre l’exemple':'Reset to example'}
                              onClick={() => {
                                const exampleValue = guessSampleValue(templatesData, targetVarForLanguage(varName))
                                const preferredLang = (templateLanguage || templateLanguageRef.current || 'fr').toUpperCase()
                                setVariables(prev => {
                                  const assignments = expandVariableAssignment(varName, exampleValue, {
                                    preferredLanguage: preferredLang,
                                    variables: prev
                                  })
                                  return applyAssignments(prev, assignments)
                                })
                              }}
                            >Ex.</button>
                            <button
                              className="text-[11px] px-2 py-0.5 rounded border border-[#e6eef5] text-[#7f1d1d] hover:bg-[#fee2e2]"
                              title={interfaceLanguage==='fr'?'Effacer ce champ':'Clear this field'}
                              onClick={() => {
                                const preferredLang = (templateLanguage || templateLanguageRef.current || 'fr').toUpperCase()
                                setVariables(prev => {
                                  const assignments = expandVariableAssignment(varName, '', {
                                    preferredLanguage: preferredLang,
                                    variables: prev
                                  })
                                  return applyAssignments(prev, assignments)
                                })
                              }}
                            >X</button>
                          </div>
                        </div>
                        <textarea
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-bwignore="true"
                          data-gramm="false"
                          data-enable-grammarly="false"
                          data-ms-editor="false"
                          ref={el => { if (el) varInputRefs.current[varName] = el }}
                          id={sanitizedVarId}
                          name={sanitizedVarId}
                          value={currentValue}
                          onChange={(e) => {
                            const newValue = e.target.value
                            // Only update if value actually changed
                            if (newValue !== currentValue) {
                              const preferredLang = (templateLanguage || templateLanguageRef.current || 'fr').toUpperCase()
                              setVariables(prev => {
                                const assignments = expandVariableAssignment(varName, newValue, {
                                  preferredLanguage: preferredLang,
                                  variables: prev
                                })
                                return applyAssignments(prev, assignments)
                              })
                            }
                            // Auto-resize (max 2 lines)
                            const lines = (newValue.match(/\n/g) || []).length + 1
                            e.target.style.height = lines <= 2 ? (lines === 1 ? '32px' : '52px') : '52px'
                          }}
                          onInput={(e) => {
                            const newValue = e.target.value
                            const preferredLang = (templateLanguage || templateLanguageRef.current || 'fr').toUpperCase()
                            setVariables(prev => {
                              const assignments = expandVariableAssignment(varName, newValue, {
                                preferredLanguage: preferredLang,
                                variables: prev
                              })
                              return applyAssignments(prev, assignments)
                            })
                          }}
                          onFocus={() => setFocusedVar(varName)}
                          onKeyDown={(e) => {
                            if (!selectedTemplate?.variables) return
                            const list = selectedTemplate.variables
                            
                            // Tab or Enter to next field (unless Shift+Enter for new line)
                            if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
                              e.preventDefault()
                              const currentIdx = list.indexOf(varName)
                              let nextIdx
                              
                              if (e.shiftKey && e.key === 'Tab') {
                                // Shift+Tab = previous field
                                nextIdx = (currentIdx - 1 + list.length) % list.length
                              } else {
                                // Tab or Enter = next empty field, or next field if none empty
                                const emptyFields = list.filter(vn => !(getVarValue(vn).trim()))
                                if (emptyFields.length > 0) {
                                  const currentEmptyIdx = emptyFields.findIndex(vn => 
                                    list.indexOf(vn) > currentIdx
                                  )
                                  nextIdx = currentEmptyIdx >= 0 
                                    ? list.indexOf(emptyFields[currentEmptyIdx])
                                    : list.indexOf(emptyFields[0])
                                } else {
                                  nextIdx = (currentIdx + 1) % list.length
                                }
                              }
                              
                              const nextVar = list[nextIdx]
                              const el = varInputRefs.current[nextVar]
                              if (el && el.focus) { 
                                el.focus()
                                el.select?.()
                              }
                            }
                          }}
                          onBlur={() => setFocusedVar(prev => (prev===varName? null : prev))}
                          placeholder={(() => {
                            if (varInfo.examples && varInfo.examples[langForDisplay]) return varInfo.examples[langForDisplay]
                            const ex = varInfo?.example
                            if (ex && typeof ex === 'object') {
                              return langForDisplay === 'en' ? (ex.en || ex.fr || '') : (ex.fr || ex.en || '')
                            }
                            return ex || ''
                          })()}
                          className="w-full min-h-[32px] border-2 input-rounded border-[#e6eef5] resize-none transition-all duration-200 text-sm px-2 py-1 leading-5 flex items-center"
                          style={{ 
                            height: (() => {
                              const lines = (currentValue.match(/\n/g) || []).length + 1
                              return lines <= 2 ? (lines === 1 ? '32px' : '52px') : '52px'
                            })(),
                            maxHeight: '52px',
                            overflow: 'hidden',
                            borderColor: currentValue.trim() 
                              ? 'rgba(34, 197, 94, 0.4)' // Green for filled
                              : (focusedVar === varName 
                                ? 'rgba(59, 130, 246, 0.6)' // Stronger blue for focused
                                : 'rgba(239, 68, 68, 0.2)'), // Light red for empty
                            backgroundColor: !currentValue.trim() && focusedVar !== varName 
                              ? 'rgba(254, 242, 242, 0.5)' 
                              : (focusedVar === varName ? 'rgba(219, 234, 254, 0.3)' : 'white'), // Light blue background when focused
                            boxShadow: focusedVar === varName 
                              ? '0 0 0 3px rgba(59, 130, 246, 0.1)' // Subtle glow for focused
                              : 'none'
                          }}
                        />
                        {/* Soft validation hint: email/URL/date/amount */}
                        {(currentValue || focusedVar===varName) && (()=>{
                          const v = (currentValue||'').trim()
                          const fmt = (varInfo?.format||'').toLowerCase()
                          let kind = ''
                          let ok = true
                          if (fmt==='email' || (!fmt && /@/.test(v))) {
                            kind='email'
                            ok=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
                          } else if (fmt==='url' || (!fmt && /^(https?:\/\/|www\.)/i.test(v))) {
                            kind='url'
                            try { new URL(v.startsWith('http')? v : ('https://'+v)); ok=true } catch { ok=false }
                          } else if (fmt==='date' || (!fmt && /\d{4}-\d{2}-\d{2}/.test(v))) {
                            kind='date'
                            ok=/^\d{4}-\d{2}-\d{2}$/.test(v)
                          } else if (fmt==='amount' || (!fmt && /[\d][\d,.]*\s?(€|\$|usd|cad|eur|$)/i.test(v))) {
                            kind='amount'
                            ok=/^[-+]?\d{1,3}(?:[\s,]\d{3})*(?:[.,]\d+)?(?:\s?(€|\$|usd|cad|eur))?$/i.test(v)
                          }
                          if (!kind) return null
                          return (
                            <div className="mt-1 text-[11px] flex items-center gap-1" style={{color: ok? '#166534' : '#7f1d1d'}}>
                              <span aria-hidden="true" style={{display:'inline-block', width:8, height:8, borderRadius:9999, background: ok? '#16a34a' : '#dc2626'}} />
                              <span>
                                {kind==='email' && (ok ? (interfaceLanguage==='fr'?'Courriel valide':'Looks like an email') : (interfaceLanguage==='fr'?'Vérifiez le courriel':'Check email format'))}
                                {kind==='url' && (ok ? (interfaceLanguage==='fr'?'URL':'Looks like a URL') : (interfaceLanguage==='fr'?'Vérifiez l’URL':'Check URL'))}
                                {kind==='date' && (ok ? (interfaceLanguage==='fr'?'Date AAAA-MM-JJ':'Date YYYY-MM-DD') : (interfaceLanguage==='fr'?'Format: AAAA-MM-JJ':'Format: YYYY-MM-DD'))}
                                {kind==='amount' && (ok ? (interfaceLanguage==='fr'?'Montant':'Amount') : (interfaceLanguage==='fr'?'Ex: 100,50 €':'Ex: $1,600.50'))}
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Custom resize handle in bottom-right (hidden in varsOnlyMode) */}
              {!varsOnlyMode && <div
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // emulate resize by dragging from bottom-right corner
                  const startX = e.clientX
                  const startY = e.clientY
                  const startW = varPopupPos.width
                  const startH = varPopupPos.height
                  const onMove = (ev) => {
                    const dw = ev.clientX - startX
                    const dh = ev.clientY - startY
                    setVarPopupPos(p => ({ ...p, width: Math.max(420, Math.min(window.innerWidth * 0.92, startW + dw)), height: Math.max(380, Math.min(window.innerHeight * 0.88, startH + dh)) }))
                  }
                  const onUp = () => {
                    document.removeEventListener('mousemove', onMove)
                    document.removeEventListener('mouseup', onUp)
                  }
                  document.addEventListener('mousemove', onMove)
                  document.addEventListener('mouseup', onUp)
                }}
                title="Resize"
                className="custom-resize-handle"
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  width: 16,
                  height: 16,
                  cursor: 'nwse-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}
              >
                <MoveRight className="h-4 w-4 text-gray-400 transform rotate-45 hover:text-gray-600 transition-colors" />
              </div>}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Help center now opens in a popout */}

      {/* Slide-over AI panel */}
      {showAIPanel && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAIPanel(false)} />
          <div className="absolute right-0 top-0 h-full w-[420px] bg-gradient-to-br from-gray-50 to-blue-50 shadow-2xl border-l border-gray-200 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
                <span className="font-semibold text-gray-800">Assistant de rédaction Copilot M365</span>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-all" 
                onClick={() => setShowAIPanel(false)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AISidebar
                emailText={finalBody}
                onResult={setFinalBody}
                variables={variables}
                interfaceLanguage={interfaceLanguage}
                templateLanguage={templateLanguage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
