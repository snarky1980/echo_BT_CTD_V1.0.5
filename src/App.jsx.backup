/* DEPLOY: 2025-10-15 07:40 - FIXED: Function hoisting error resolved */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Fuse from 'fuse.js'
import { loadState, saveState } from './utils/storage.js';
// Deploy marker: 2025-10-16T07:31Z
import { Search, FileText, Copy, RotateCcw, Languages, Filter, Globe, Sparkles, Mail, Edit3, Link, Settings, X, Move, Send, Star, ClipboardPaste, Eraser, Pin, PinOff, Minimize2, ExternalLink, Expand, Shrink, MoveRight, RefreshCw } from 'lucide-react'
import { Button } from './components/ui/button.jsx'
import { Input } from './components/ui/input.jsx'
import HighlightingEditor from './components/HighlightingEditor';
import AISidebar from './components/AISidebar';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card.jsx'
import { Badge } from './components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select.jsx'
import { ScrollArea } from './components/ui/scroll-area.jsx'
import './App.css'

// Custom CSS for modern typography and variable highlighting with the EXACT original teal/sage styling
const customEditorStyles = `
  /* Translation Bureau Brand Colors - EXACT MATCH from original design */
  :root {
    --tb-teal: #059669;         /* Emerald-600 - Main teal */
    --tb-teal-light: #10b981;   /* Emerald-500 - Light teal */
    --tb-teal-dark: #047857;    /* Emerald-700 - Dark teal */
    --tb-sage: #65a30d;         /* Lime-600 - Sage green */
    --tb-sage-light: #84cc16;   /* Lime-500 - Light sage */
    --tb-mint: #d9f99d;         /* Lime-200 - Mint background */
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
  
  /* Scrollbar always visible */
  [data-slot="scroll-area-scrollbar"] {
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  [data-slot="scroll-area-thumb"] {
    background-color: #cbd5e1 !important;
    opacity: 1 !important;
  }
  
  [data-slot="scroll-area-scrollbar"]:hover [data-slot="scroll-area-thumb"] {
    background-color: #94a3b8 !important;
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
    background: rgba(216, 226, 176, 0.7); /* sage */
    color: #1a365d; /* navy text */
    border: 1px solid rgba(163, 179, 84, 0.5);
    font-style: normal;
  }
  mark.var-highlight.filled {
    background: rgba(216, 226, 176, 0.9);
    border-color: rgba(163, 179, 84, 0.8);
    font-weight: 700;
  }
  mark.var-highlight.empty {
    background: rgba(216, 226, 176, 0.45);
    border-color: rgba(163, 179, 84, 0.45);
    color: #1a365d;
    font-style: italic;
  }
  /* Focus assist: when a variable input is focused, outline matching marks */
  mark.var-highlight.focused {
    outline: 2px solid rgba(20, 90, 100, 0.9);
    box-shadow: 0 0 0 3px rgba(20, 90, 100, 0.18);
    transition: outline-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
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
    title: 'Assistant pour rédaction de courriels aux clients',
    subtitle: 'Bureau de la traduction',
    selectTemplate: 'Sélectionnez un modèle',
    templatesCount: `modèles disponibles`,
  searchPlaceholder: 'Rechercher un modèle...',
    allCategories: 'Toutes les catégories',
    categories: {
      'Devis et estimations': 'Devis et estimations',
      'Gestion de projets': 'Gestion de projets', 
      'Problèmes techniques': 'Problèmes techniques',
      'Communications générales': 'Communications générales',
      'Services spécialisés': 'Services spécialisés'
    },
    templateLanguage: 'Langue du modèle:',
    interfaceLanguage: 'Langue de l\'interface:',
    variables: 'Variables',
    editEmail: 'Éditez votre courriel',
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
    openInOutlook: 'Ouvrir dans Outlook',
    openInOutlookTitle: 'Composer un courriel avec Outlook',
    sendEmail: 'Envoyer courriel',
  favorites: 'Favoris',
  showFavoritesOnly: 'Afficher uniquement les favoris',
    noTemplate: 'Sélectionnez un modèle pour commencer',
    resetWarningTitle: 'Confirmer la réinitialisation',
    resetWarningMessage: 'Êtes-vous sûr de vouloir réinitialiser toutes les variables ? Cette action ne peut pas être annulée.',
    cancel: 'Annuler',
    confirm: 'Confirmer'
  },
  en: {
    title: 'Email Writing Assistant for Clients',
    subtitle: 'Translation Bureau',
    selectTemplate: 'Select a template',
    templatesCount: `templates available`,
  searchPlaceholder: 'Search for a template...',
    allCategories: 'All categories',
    categories: {
      'Devis et estimations': 'Quotes and estimates',
      'Gestion de projets': 'Project management', 
      'Problèmes techniques': 'Technical issues',
      'Communications générales': 'General communications',
      'Services spécialisés': 'Specialized services'
    },
    templateLanguage: 'Template language:',
    interfaceLanguage: 'Interface language:',
    variables: 'Variables',
    editEmail: 'Edit your email',
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
    openInOutlook: 'Open in Outlook',
    openInOutlookTitle: 'Compose email in Outlook',
    sendEmail: 'Send Email',
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
  const savedState = loadState()
  
  // State for template data
  const [templatesData, setTemplatesData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Separate interface language from template language
  const [interfaceLanguage, setInterfaceLanguage] = useState(savedState.interfaceLanguage || 'fr') // Interface language
  const [templateLanguage, setTemplateLanguage] = useState(savedState.templateLanguage || 'fr')   // Template language
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [searchQuery, setSearchQuery] = useState(savedState.searchQuery || '')
  const [selectedCategory, setSelectedCategory] = useState(savedState.selectedCategory || 'all')
  
  const [finalSubject, setFinalSubject] = useState('') // Final editable version
  const [finalBody, setFinalBody] = useState('') // Final editable version
  const [variables, setVariables] = useState(savedState.variables || {})
  const [favorites, setFavorites] = useState(savedState.favorites || [])
  const [favoritesOnly, setFavoritesOnly] = useState(savedState.favoritesOnly || false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showVariablePopup, setShowVariablePopup] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [preferPopout, setPreferPopout] = useState(() => {
    try { return localStorage.getItem('ea_prefer_popout') === 'true' } catch { return false }
  })
  const [showHighlights, setShowHighlights] = useState(() => {
    const saved = localStorage.getItem('ea_show_highlights')
    return saved === null ? true : saved === 'true'
  })
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = Number(localStorage.getItem('ea_left_width'))
    return Number.isFinite(saved) && saved >= 340 && saved <= 680 ? saved : 480
  })
  const isDragging = useRef(false)
  const [varPopupPos, setVarPopupPos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ea_var_popup_pos') || 'null')
      if (saved && typeof saved.top === 'number' && typeof saved.left === 'number' && typeof saved.width === 'number' && typeof saved.height === 'number') return saved
    } catch {}
    // Comfortable default size
    return { top: 80, left: 80, width: 980, height: 620 }
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
  const varsRemoteUpdateRef = useRef(false)
  const pendingTemplateIdRef = useRef(null)
  const canUseBC = typeof window !== 'undefined' && 'BroadcastChannel' in window
  // Focus → outline matching marks in subject/body; blur → fade out
  useEffect(() => {
    if (!focusedVar) return
    try {
      const selector = `mark.var-highlight[data-var="${CSS.escape(focusedVar)}"]`
      const nodes = document.querySelectorAll(selector)
      nodes.forEach(n => n.classList.add('focused'))
      return () => { nodes.forEach(n => n.classList.remove('focused')) }
    } catch {}
  }, [focusedVar])

  // Refresh outlines if content updates while focused
  useEffect(() => {
    if (!focusedVar) return
    try {
      requestAnimationFrame(() => {
        const selector = `mark.var-highlight[data-var="${CSS.escape(focusedVar)}"]`
        document.querySelectorAll('mark.var-highlight.focused').forEach(n => n.classList.remove('focused'))
        document.querySelectorAll(selector).forEach(n => n.classList.add('focused'))
      })
    } catch {}
  }, [variables, showHighlights, focusedVar])
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
        variables,
        favorites,
        favoritesOnly
      })
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [interfaceLanguage, templateLanguage, searchQuery, selectedCategory, variables, favorites, favoritesOnly])

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
    try { localStorage.setItem('ea_var_popup_pos', JSON.stringify(varPopupPos)) } catch {}
  }, [varPopupPos])

  // Persist popout preference
  useEffect(() => {
    try { localStorage.setItem('ea_prefer_popout', String(preferPopout)) } catch {}
  }, [preferPopout])

  // Smart function to open variables (popup or popout based on preference)
  const openVariables = useCallback(() => {
    if (preferPopout && selectedTemplate?.variables?.length > 0) {
      // Auto-open popout
      const url = new URL(window.location.href)
      url.searchParams.set('varsOnly', '1')
      if (selectedTemplate?.id) url.searchParams.set('id', selectedTemplate.id)
      if (templateLanguage) url.searchParams.set('lang', templateLanguage)
      
      const count = selectedTemplate?.variables?.length || 0
      const columns = Math.max(1, Math.min(3, count >= 3 ? 3 : count))
      const cardW = 360, gap = 8, headerH = 64, rowH = 112
      const rows = Math.max(1, Math.ceil(count / columns))
      let w = columns * cardW + (columns - 1) * gap
      let h = headerH + rows * rowH
      const availW = (window.screen?.availWidth || window.innerWidth) - 40
      const availH = (window.screen?.availHeight || window.innerHeight) - 80
      w = Math.min(Math.max(560, w), availW)
      h = Math.min(Math.max(420, h), availH)
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
            setInterfaceLanguage(m.templateLanguage)
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
            setVariables(prev => ({ ...prev, ...msg.variables }))
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
            setVariables(prev => ({ ...prev, ...msg.variables }))
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

  // Emit updates when local variables change (avoid echo loops) with debouncing
  useEffect(() => {
    if (!canUseBC) return
    if (varsRemoteUpdateRef.current) { varsRemoteUpdateRef.current = false; return }
    
    const timeoutId = setTimeout(() => {
      const ch = varsChannelRef.current
      if (!ch) return
      try { ch.postMessage({ type: 'update', variables, sender: varsSenderIdRef.current }) } catch {}
    }, 150) // 150ms debounce for real-time sync
    
    return () => clearTimeout(timeoutId)
  }, [variables])

  // Emit selected template and language so pop-out stays in sync
  const selectedTemplateId = selectedTemplate?.id
  useEffect(() => {
    if (!canUseBC) return
    const ch = varsChannelRef.current
    if (!ch) return
    try { ch.postMessage({ type: 'update', templateId: selectedTemplateId || null, templateLanguage, sender: varsSenderIdRef.current }) } catch {}
  }, [selectedTemplateId, templateLanguage])

  // Emit focused variable changes immediately for real-time visual feedback
  useEffect(() => {
    // Primary: BroadcastChannel for immediate sync
    if (canUseBC) {
      const ch = varsChannelRef.current
      if (ch) {
        try { ch.postMessage({ type: 'update', focusedVar, sender: varsSenderIdRef.current }) } catch {}
      }
    }
    
    // Fallback: localStorage with minimal delay
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('ea_focused_var', JSON.stringify({ 
          focusedVar, 
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
        if (!selectedTemplate) return
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
      setVariables(prev => ({ ...prev, ...map }))
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
      setFinalSubject('')
      setFinalBody('')
    }
  }, [interfaceLanguage]) // Update when interface language changes

  // Load template data on startup
  useEffect(() => {
    const loadTemplatesData = async () => {
      try {
    if (debug) console.log('[EA][Debug] Fetching templates (with prod raw GitHub fallback)...')
  const REPO_RAW_URL = 'https://raw.githubusercontent.com/snarky1980/email-assistant-v8-fixed/main/complete_email_templates.json'
        const LOCAL_URL = './complete_email_templates.json'
        // Absolute path based on Vite base for GitHub Pages (e.g., /email-assistant-v8-fixed/)
        const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/'
        const ABSOLUTE_URL = (BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/') + 'complete_email_templates.json'
        const ts = Date.now()
        const withBust = (u) => u + (u.includes('?') ? '&' : '?') + 'cb=' + ts
        // Prefer local JSON first in all environments; fall back to raw repo
        // This avoids transient network/CORS issues on GitHub Pages
        const candidates = [withBust(LOCAL_URL), withBust(ABSOLUTE_URL), withBust(REPO_RAW_URL)]

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
        setTemplatesData(loaded)
        if (debug) console.log('[EA][Debug] Templates loaded:', loaded.templates?.length)
      } catch (error) {
        console.error('Error loading templates data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTemplatesData()
  }, [])

  // Do NOT auto-select a template once data is available; wait for user selection
  useEffect(() => {
    if (!loading && templatesData && !selectedTemplate && Array.isArray(templatesData.templates)) {
      if (debug) console.log('[EA][Debug] Templates loaded; no auto-selection')
    }
  }, [loading, templatesData, selectedTemplate, debug])

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
   * KEYBOARD SHORTCUTS FOR PROFESSIONAL UX
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter: Copy all (main quick action)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (selectedTemplate) {
          copyToClipboard('all')
        }
      }
      
      // Ctrl/Cmd + B: Copy body only (Body)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        if (selectedTemplate) {
          copyToClipboard('body')
        }
      }
      
      // Ctrl/Cmd + J: Copy subject only (subJect)
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault()
        if (selectedTemplate) {
          copyToClipboard('subject')
        }
      }
      
      // Ctrl/Cmd + Shift + Enter: Send email (Enhanced send action)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        if (selectedTemplate) {
          openInOutlook()
        }
      }
      
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
          if (templatesData?.variables) {
            const initialVars = {}
            selectedTemplate.variables.forEach(varName => {
              const varInfo = templatesData.variables[varName]
              if (varInfo) initialVars[varName] = varInfo.example || ''
            })
            setVariables(prev => ({ ...prev, ...initialVars }))
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

    // Apply category and favorites filters first
    if (selectedCategory !== 'all') dataset = dataset.filter(t => t.category === selectedCategory)
    if (favoritesOnly) {
      const favSet = new Set(favorites)
      dataset = dataset.filter(t => favSet.has(t.id))
    }

    const qRaw = (searchQuery || '').trim()
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
        return { filteredTemplates: exactItems, searchMatchMap: exactMap }
      }
    }

    // Stage 2: exact match on expanded synonyms if raw terms produced nothing
    const expanded = expandQuery(qRaw)
    const expandedTerms = Array.from(new Set(expanded.split(/\s+/).filter(Boolean)))
    if (expandedTerms.length) {
      const { items: exactItems2, matchMap: exactMap2 } = collectExact(gated, expandedTerms)
      if (exactItems2.length) {
        return { filteredTemplates: exactItems2, searchMatchMap: exactMap2 }
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
      return { filteredTemplates: simple.map(s => s.item), searchMatchMap: sMatchMap }
    }

    // Sort by best (lowest) score, stable by original order
    const results = Array.from(acc.values()).sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    const items = results.map(r => r.item)
    const matchMap = {}
    for (const r of results) {
      const id = r.item.id
      matchMap[id] = r.matches
    }
    return { filteredTemplates: items, searchMatchMap: matchMap }
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

  // Get unique categories
  const categories = useMemo(() => {
    if (!templatesData) return []
    const cats = [...new Set(templatesData.templates.map(t => t.category))]
    return cats
  }, [templatesData])

  const isFav = (id) => favorites.includes(id)
  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // Replace variables in text
  const replaceVariables = (text) => {
    let result = text
    Object.entries(variables).forEach(([varName, value]) => {
      const regex = new RegExp(`<<${varName}>>`, 'g')
      result = result.replace(regex, value || `<<${varName}>>`)
    })
    return result

  // Sync from text: Extract variable values from text areas back to Variables Editor
  const syncFromText = () => {
    console.log('🔄 Sync from text: Starting reverse synchronization...')
    
    if (!selectedTemplate || !templatesData) {
      console.log('🔄 No template selected or templates data unavailable')
      return
    }

    const extracted = {}
    
    // Process subject
    if (selectedTemplate.subject && subject) {
      const subjectTemplate = selectedTemplate.subject
      selectedTemplate.variables.forEach(varName => {
        if (subjectTemplate.includes(`<<${varName}>>`)) {
          const value = extractValueFromText(subject, subjectTemplate, varName)
          if (value !== null) extracted[varName] = value
        }
      })
    }
    
    // Process body  
    if (selectedTemplate.body && body) {
      const bodyTemplate = selectedTemplate.body
      selectedTemplate.variables.forEach(varName => {
        if (bodyTemplate.includes(`<<${varName}>>`)) {
          const value = extractValueFromText(body, bodyTemplate, varName)
          if (value !== null) extracted[varName] = value
        }
      })
    }
    
    console.log('🔄 Extracted values:', extracted)
    
    // Update variables state
    if (Object.keys(extracted).length > 0) {
      setVariables(prev => ({ ...prev, ...extracted }))
      console.log('🔄 Variables updated successfully')
    } else {
      console.log('🔄 No values extracted')
    }
  }
  
  // Helper function to extract a variable value from text
  const extractValueFromText = (text, templateText, varName) => {
    try {
      const varPlaceholder = `<<${varName}>>`
      const varIndex = templateText.indexOf(varPlaceholder)
      
      if (varIndex === -1) return null
      
      // Find literal text before the variable
      const beforeText = templateText.substring(0, varIndex)
      const lastNewlineIndex = beforeText.lastIndexOf('\n')
      const beforeLiteral = lastNewlineIndex === -1 
        ? beforeText 
        : beforeText.substring(lastNewlineIndex + 1)
      
      // Find literal text after the variable  
      const afterStart = varIndex + varPlaceholder.length
      const afterText = templateText.substring(afterStart)
      const nextNewlineIndex = afterText.indexOf('\n')
      const afterLiteral = nextNewlineIndex === -1
        ? afterText
        : afterText.substring(0, nextNewlineIndex)
      
      // Find positions in actual text
      let startPos = 0
      if (beforeLiteral.trim()) {
        startPos = text.indexOf(beforeLiteral)
        if (startPos === -1) return null
        startPos += beforeLiteral.length
      }
      
      let endPos = text.length
      if (afterLiteral.trim()) {
        endPos = text.indexOf(afterLiteral, startPos)
        if (endPos === -1) return null
      }
      
      const extracted = text.substring(startPos, endPos).trim()
      console.log(`🔄 Extracted ${varName}: "${extracted}"`)
      return extracted
      
    } catch (error) {
      console.warn(`Error extracting ${varName}:`, error)
      return null
    }
  }
  }

  // Load a selected template
  useEffect(() => {
    if (selectedTemplate) {
      // Initialize variables with example/default values
      const initialVars = {}
      selectedTemplate.variables.forEach(varName => {
        const varInfo = templatesData.variables[varName]
        if (varInfo) {
          initialVars[varName] = varInfo.example || ''
        }
      })
      
      // Set the template text with <<VarName>> placeholders
      // The HighlightingEditor will display the filled values via highlighting
      const subjectTemplate = selectedTemplate.subject[templateLanguage] || ''
      const bodyTemplate = selectedTemplate.body[templateLanguage] || ''
      
      // Batch all state updates together - React will apply them in one render cycle
      setVariables(initialVars)
      setFinalSubject(subjectTemplate)
      setFinalBody(bodyTemplate)
    } else {
      // No template selected - clear editors; placeholder text shown via UI
      setVariables({})
      setFinalSubject('')
      setFinalBody('')
    }
  }, [selectedTemplate, templateLanguage, interfaceLanguage])

  // Update final versions when variables change
  useEffect(() => {
    if (selectedTemplate) {
      const subjectWithVars = replaceVariables(selectedTemplate.subject[templateLanguage] || '')
      const bodyWithVars = replaceVariables(selectedTemplate.body[templateLanguage] || '')
      setFinalSubject(subjectWithVars)
      setFinalBody(bodyWithVars)
    }
  }, [variables, selectedTemplate, templateLanguage])

  /**
   * GRANULAR COPY FUNCTION
   */
  const copyToClipboard = async (type = 'all') => {
    let content = ''
    
    // Content selection based on requested type
    switch (type) {
      case 'subject':
        content = finalSubject
        break
      case 'body':
        content = finalBody
        break
      case 'all':
      default:
        content = `${finalSubject}\n\n${finalBody}`
        break
    }
    
    try {
      // Modern and secure method (HTTPS required)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      
      // Visual success feedback (2 seconds)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      // Error handling with user message
      alert('Copy error. Please select the text manually and use Ctrl+C.')
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
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Link copy error:', error)
      alert('Link copy error. Please copy the URL manually from the address bar.')
    }
  }

  // Export helpers for .eml, HTML, and copy HTML
  const exportAs = async (mode) => {
    const subject = finalSubject || ''
    const bodyText = finalBody || ''
    const bodyHtml = `<html><body><pre style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; white-space: pre-wrap; line-height: 1.6">${
      (bodyText || '').replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))
    }</pre></body></html>`

    if (mode === 'eml') {
      // Build a minimal .eml content
      const eml = [
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        '',
        bodyText
      ].join('\r\n')
      const blob = new Blob([eml], { type: 'message/rfc822' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'email.eml'
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    if (mode === 'html') {
      const blob = new Blob([bodyHtml], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'email.html'
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    if (mode === 'copy-html') {
      try {
        if (navigator.clipboard && navigator.clipboard.write) {
          const type = 'text/html'
          const blob = new Blob([bodyHtml], { type })
          const item = new ClipboardItem({ [type]: blob })
          await navigator.clipboard.write([item])
        } else {
          // Fallback: copy as plain text
          await navigator.clipboard.writeText(bodyHtml)
        }
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 1500)
      } catch (e) {
        console.error('Copy HTML failed', e)
        alert('Copy HTML failed. Please try again or use the HTML export option.')
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
    if (selectedTemplate) {
      const initialVars = {}
      selectedTemplate.variables.forEach(varName => {
        const varInfo = templatesData.variables[varName]
        if (varInfo) {
          initialVars[varName] = varInfo.example || ''
        }
      })
      setVariables(initialVars)
      
      const subjectWithVars = replaceVariables(selectedTemplate.subject[templateLanguage] || '')
      const bodyWithVars = replaceVariables(selectedTemplate.body[templateLanguage] || '')
      setFinalSubject(subjectWithVars)
      setFinalBody(bodyWithVars)
    }
    setShowResetWarning(false)
  }

  // Open default mail client (Outlook if default) with subject/body prefilled
  function openInOutlook() {
    if (debug) console.log('Opening email client with subject:', finalSubject)
    
    if (!finalSubject && !finalBody) {
      alert(templateLanguage === 'fr' ? 'Veuillez d\'abord sélectionner un modèle et remplir le contenu.' : 'Please first select a template and fill in the content.')
      return
    }
    
    const subject = finalSubject || ''
    const body = (finalBody || '').replace(/\n/g, '\r\n')
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    try {
      // Try to open using window.location.href first (preferred method)
      window.location.href = mailtoUrl
      
      // Provide visual feedback
      if (document.activeElement) {
        const button = document.activeElement
        const originalText = button.textContent
        button.textContent = templateLanguage === 'fr' ? 'Ouverture...' : 'Opening...'
        setTimeout(() => {
          if (button.textContent === (templateLanguage === 'fr' ? 'Ouverture...' : 'Opening...')) {
            button.textContent = originalText
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Error opening email client:', error)
      // Fallback method
      try {
        window.open(mailtoUrl, '_blank')
      } catch (fallbackError) {
        console.error('Fallback method failed:', fallbackError)
        // Final fallback - copy to clipboard and show instructions
        navigator.clipboard.writeText(`${subject}\n\n${finalBody}`).then(() => {
          alert(templateLanguage === 'fr' 
            ? 'Impossible d\'ouvrir votre client de messagerie. Le contenu a été copié dans le presse-papiers.' 
            : 'Unable to open your email client. The content has been copied to your clipboard.')
        }).catch(() => {
          alert(templateLanguage === 'fr' 
            ? 'Impossible d\'ouvrir votre client de messagerie. Veuillez copier manuellement le contenu.' 
            : 'Unable to open your email client. Please copy the content manually.')
        })
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e0f2fe)' }}>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f8a99] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des modèles...</p>
          </div>
        </div>
      ) : (
        !varsOnlyMode && <>
      {/* Exact banner from attached design */}
      <header className="w-full mx-auto max-w-none page-wrap py-4 relative z-50 sticky top-0 border-b" style={{ backgroundColor: '#ffffff', borderColor: 'var(--tb-mint)' }}>
        {/* Decorative pills and lines - EXACT positions from design */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Top row of pills */}
          <div className="banner-pill" style={{ top: '-38px', left: '-190px', width: '320px', height: '112px', background: 'var(--tb-navy)', opacity: 0.93, borderRadius: '140px' }}></div>
          <div className="banner-pill" style={{ top: '-28px', left: '250px', width: '220px', height: '90px', background: 'var(--tb-light-blue)', opacity: 0.58, borderRadius: '130px' }}></div>
          <div className="banner-pill" style={{ top: '-20px', left: '720px', width: '260px', height: '46px', background: 'var(--tb-gray)', opacity: 0.34, borderRadius: '120px' }}></div>
          <div className="banner-pill" style={{ top: '-10px', left: '960px', width: '360px', height: '90px', background: 'var(--tb-mint)', opacity: 0.5, borderRadius: '140px' }}></div>
          <div className="banner-pill" style={{ top: '-40px', left: '1180px', width: '430px', height: '96px', background: 'var(--tb-navy)', opacity: 0.85, borderRadius: '120px' }}></div>
          <div className="banner-pill" style={{ top: '-30px', left: '1740px', width: '250px', height: '104px', background: 'var(--tb-navy)', opacity: 0.88, borderRadius: '140px' }}></div>
          
          {/* Bottom row of pills */}
          <div className="banner-pill" style={{ top: '62px', left: '-180px', width: '300px', height: '86px', background: 'var(--tb-teal)', opacity: 0.35, borderRadius: '120px' }}></div>
          <div className="banner-pill" style={{ top: '98px', left: '760px', width: '620px', height: '160px', background: 'var(--tb-teal)', opacity: 0.28, borderRadius: '180px' }}></div>
          <div className="banner-pill" style={{ top: '62px', left: '1320px', width: '120px', height: '68px', background: 'var(--tb-light-blue)', opacity: 0.58, borderRadius: '100px' }}></div>
          <div className="banner-pill" style={{ top: '74px', left: '1600px', width: '150px', height: '76px', background: 'var(--tb-mint)', opacity: 0.56, borderRadius: '110px' }}></div>
          <div className="banner-pill" style={{ top: '-8px', left: '130px', width: '110px', height: '70px', background: 'var(--tb-light-blue)', opacity: 0.32, borderRadius: '110px' }}></div>
          
          {/* Horizontal line with dot */}
          <div className="hpill-line" style={{ left: '600px', top: '40px', height: '2px', width: '320px', background: 'var(--tb-navy)', opacity: 0.35 }}>
            <span className="hpill-dot" style={{ top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: '18px', height: '18px', background: '#ffffff', borderRadius: '9999px', boxShadow: '0 0 0 4px var(--tb-mint), 0 0 0 6px #fff', position: 'absolute' }}></span>
          </div>
          
          {/* Vertical line with dot */}
          <div className="hpill-line" style={{ left: '1530px', top: '-44px', height: '176px', width: '2px', background: 'var(--tb-navy)', opacity: 0.5 }}>
            <span className="hpill-dot" style={{ top: '52%', left: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', background: '#ffffff', borderRadius: '9999px', boxShadow: '0 0 0 4px var(--tb-teal), 0 0 0 6px #fff', position: 'absolute' }}></span>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex items-center justify-between relative">
          {/* Left side: Logo + Title with 2in margin */}
          <div className="flex items-center space-x-6" style={{ marginLeft: '2in' }}>
            {/* Large navy circle with mail icon */}
            <div className="relative">
              <div className="p-6" style={{ backgroundColor: 'var(--tb-navy)', borderRadius: '56px' }}>
                <Mail className="text-white" style={{ width: '60px', height: '60px' }} />
              </div>
            </div>
            
            {/* Title and subtitle */}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--tb-navy)' }}>
                {t.title}
              </h1>
              <p className="text-xl md:text-2xl font-semibold" style={{ color: '#1f8a99' }}>
                {t.subtitle}
              </p>
            </div>
          </div>
          
          {/* Right side: Language selector - Pure Teal */}
          <div className="flex items-center space-x-3 px-4 py-3 shadow-xl" style={{ backgroundColor: 'var(--primary)', borderRadius: 'calc(var(--radius) + 8px)' }}>
            <Globe className="h-8 w-8 text-white" />
            <span className="font-bold text-base text-white">{t.interfaceLanguage}</span>
            <div className="flex bg-white p-1.5 shadow-lg" style={{ borderRadius: '14px' }}>
              <button
                onClick={() => setInterfaceLanguage('fr')}
                className={`px-4 py-2 text-sm font-bold transition-all duration-300 transform ${
                  interfaceLanguage === 'fr' ? 'text-white shadow-xl scale-105' : ''
                }`}
                style={
                  interfaceLanguage === 'fr'
                    ? { backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'calc(var(--radius) + 4px)' }
                    : { backgroundColor: 'transparent', borderRadius: 'calc(var(--radius) + 4px)' }
                }
              >
                FR
              </button>
              <button
                onClick={() => setInterfaceLanguage('en')}
                className={`px-4 py-2 text-sm font-bold transition-all duration-300 transform ${
                  interfaceLanguage === 'en' ? 'text-white shadow-xl scale-105' : 'hover:scale-105'
                }`}
                style={
                  interfaceLanguage === 'en'
                    ? { backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'calc(var(--radius) + 4px)' }
                    : { backgroundColor: 'transparent', borderRadius: 'calc(var(--radius) + 4px)' }
                }
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

  {/* Main content with resizable panes - full width */}
  <main className="w-full max-w-none px-3 sm:px-4 lg:px-6 py-5">
  {/* Data integrity banner: show when templates failed to load */}
  {!loading && (!templatesData || !Array.isArray(templatesData.templates) || templatesData.templates.length === 0) && (
    <div className="mb-6 p-4 rounded-lg border-2 border-amber-300 bg-amber-50 text-amber-900 shadow-sm">
      <div className="font-semibold mb-1">{interfaceLanguage === 'fr' ? 'Aucun modèle chargé' : 'No templates loaded'}</div>
      <div className="text-sm">
        {interfaceLanguage === 'fr'
          ? "Le fichier complete_email_templates.json n'a pas été trouvé ou n'a pas pu être chargé. Le bouton d'envoi s'affiche uniquement quand un modèle est sélectionné."
          : 'The complete_email_templates.json file was not found or could not be loaded. The Send Email button only shows when a template is selected.'}
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
        style={{ borderColor: '#bfe7e3', borderRadius: 12 }}
        onClick={() => { setShowMobileTemplates(true); setTimeout(() => searchRef.current?.focus(), 0) }}
      >
        <FileText className="h-4 w-4 mr-2 text-[#1f8a99]" />
        Templates
      </Button>
    </div>
    {/* Left panel - Template list (resizable) */}
    <div className="hidden md:block shrink-0" style={{ width: leftWidth }}>
      <Card className="h-fit card-soft border-0 overflow-hidden rounded-[14px]" style={{ background: '#ffffff' }}>
        <CardContent className="p-0">
          <ScrollArea
            className="rounded-[14px] overflow-hidden"
            style={{ '--scrollbar-width': '8px', height: 'calc(100vh - 208px)' }}
            viewportRef={viewportRef}
            onViewportScroll={() => {
              const vp = viewportRef.current
              if (!vp) return
              setScrollTop(vp.scrollTop)
              setViewportH(vp.clientHeight)
            }}
          >
            {/* Sticky header inside scroll area */}
            <div className="sticky top-0 z-10 px-0 pt-2 pb-2 bg-white border-b border-[#e6eef5]">
              {/* Teal header bar - match style of "Langue du modèle" */}
              <div className="h-[48px] w-full rounded-[14px] px-4 flex items-center justify-center mb-3" style={{ background: 'var(--primary)' }}>
                <div className="text-base font-bold text-white inline-flex items-center gap-2 leading-none whitespace-nowrap">
                  <FileText className="h-5 w-5 text-white" aria-hidden="true" />
                  <span className="truncate">{interfaceLanguage === 'fr' ? 'Modèles' : 'Templates'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
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
                  className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-200 border ${favoritesOnly ? 'bg-[#f0fbfb] text-[#145a64] border-[#bfe7e3]' : 'bg-white text-[#145a64] border-[#bfe7e3]'} flex items-center gap-2`}
                  title={t.showFavoritesOnly}
                  aria-pressed={favoritesOnly}
                  aria-live="polite"
                >
                  <span className={`text-base transition-all duration-150 ${favoritesOnly ? 'text-[#f5c542] scale-110' : 'text-gray-300 scale-100'}`}>★</span>
                  {favoritesOnly ? `${t.favorites} (${favorites.length || 0})` : t.favorites}
                  <span style={{position:'absolute',left:'-9999px',height:0,width:0,overflow:'hidden'}} aria-live="polite">{favLiveMsg}</span>
                </button>
              </div>
              {/* Category filter */}
              <div className="mt-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger
                    className={`w-full h-12 border-2 rounded-[14px] ${selectedCategory === 'all' ? 'font-semibold' : ''}`}
                    style={{ background: 'rgba(163, 179, 84, 0.36)', borderColor: '#bfe7e3', color: '#1a365d' }}
                  >
                    <Filter className="h-4 w-4 mr-2 text-[#1f8a99]" />
                    <SelectValue placeholder={t.allCategories} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-semibold">{t.allCategories}</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {t.categories[category] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Search */}
              <div className="relative group mt-2">
                <Search className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" style={{ left: 18 }} />
                <Input
                  ref={searchRef}
                  id="template-search-main"
                  name="template-search-main"
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-[14px] bg-transparent px-3 py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 pl-12 pr-10 border-2"
                  style={{ borderColor: '#bfe7e3' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    title="Clear search"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              {/* Template language */}
              <div className="h-[48px] w-full rounded-[14px] mt-3 px-4 flex items-center justify-between" style={{ background: 'var(--primary)' }}>
                <div className="text-base font-bold text-white inline-flex items-center gap-2 leading-none whitespace-nowrap">
                  <Languages className="h-5 w-5 text-white" />
                  <span className="truncate">{t.templateLanguage}</span>
                </div>
                <div className="flex bg-white rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setTemplateLanguage('fr')}
                    className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-300 button-ripple teal-focus ${templateLanguage === 'fr' ? 'text-white' : 'text-gray-600'}`}
                    style={templateLanguage === 'fr' ? { background: 'var(--primary)' } : {} }
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setTemplateLanguage('en')}
                    className={`px-3 py-1 text-sm font-bold rounded-md transition-all duration-300 button-ripple teal-focus ${templateLanguage === 'en' ? 'text-white' : 'text-gray-600'}`}
                    style={templateLanguage === 'en' ? { background: 'var(--primary)' } : {} }
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

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
                <div className="p-2" style={{ minHeight: (count + 1) * ITEM_H }}>
                  <div style={{ height: topPad }} />
                  <div className="space-y-3">
                    {filteredTemplates.slice(start, end).map((template) => (
                      <div
                        key={template.id}
                        ref={(el) => { if (el) itemRefs.current[template.id] = el }}
                        onClick={() => setSelectedTemplate(template)}
                        onMouseDown={() => setPressedCardId(template.id)}
                        onMouseUp={() => setPressedCardId(null)}
                        onMouseLeave={() => setPressedCardId(null)}
                        className={`w-full p-4 border cursor-pointer transition-all duration-150 ${
                          selectedTemplate?.id === template.id
                            ? 'shadow-lg transform scale-[1.02]'
                            : 'border-[#e1eaf2] bg-white hover:border-[#7bd1ca] hover:shadow-md hover:-translate-y-[1px]'
                        }`}
                        style={
                          selectedTemplate?.id === template.id
                            ? {
                                borderColor: '#1f8a99',
                                background: '#e6f0ff',
                                borderRadius: '14px',
                                scrollMarginTop: 220,
                              }
                            : { borderRadius: '14px', transform: pressedCardId === template.id ? 'scale(0.995)' : undefined, boxShadow: pressedCardId === template.id ? 'inset 0 0 0 1px rgba(0,0,0,0.05)' : undefined, scrollMarginTop: 220 }
                        }
                      >
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
                            <Badge variant="secondary" className="text-[11px] font-medium bg-[#e6f0ff] text-[#1a365d] border-[#c7dbff]">
                              {template.category}
                            </Badge>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFav(template.id) }}
                            className={`ml-3 text-base ${isFav(template.id) ? 'text-[#f5c542]' : 'text-gray-300 hover:text-[#f5c542]'}`}
                            title={isFav(template.id) ? 'Unfavorite' : 'Favorite'}
                            aria-label="Toggle favorite"
                          >★</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: bottomPad }} />
                </div>
              )
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
                  <SelectTrigger className={`w-full h-12 border-2 transition-all duration-200 rounded-[14px] ${selectedCategory === 'all' ? 'font-semibold' : ''}`} style={{ background: 'rgba(163, 179, 84, 0.36)', borderColor: '#bfe7e3', color: '#1a365d' }}>
                    <Filter className="h-4 w-4 mr-2 text-[#1f8a99]" />
                    <SelectValue placeholder={t.allCategories} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-semibold">{t.allCategories}</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {t.categories[category] || category}
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
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-[14px] bg-transparent px-3 py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 pl-12 pr-10 border-2"
                  style={{ borderColor: '#bfe7e3' }}
                />
              </div>
              <div className="mt-3 space-y-3">
                {filteredTemplates.slice(0, 80).map((template) => (
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
                        <Badge variant="secondary" className="text-[11px] font-medium bg-[#e6f0ff] text-[#1a365d] border-[#c7dbff]">
                          {template.category}
                        </Badge>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleFav(template.id) }} className={`ml-3 text-base ${isFav(template.id) ? 'text-[#f5c542]' : 'text-gray-300 hover:text-[#f5c542]'}`} title={isFav(template.id) ? 'Unfavorite' : 'Favorite'} aria-label="Toggle favorite">★</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

          {/* Drag handle between left and main */}
          <div
            role="separator"
            aria-orientation="vertical"
            className="w-[3px] cursor-col-resize select-none rounded"
            style={{
              background: 'rgba(20,90,100,0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(31,138,153,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(20,90,100,0.15)';
            }}
            onMouseDown={(e) => {
              isDragging.current = 'left';
              const startX = e.clientX; const startLeft = leftWidth;
              const onMove = (ev) => {
                if (isDragging.current !== 'left') return
                const dx = ev.clientX - startX
                const nextLeft = Math.max(340, Math.min(680, startLeft + dx))
                setLeftWidth(nextLeft)
              }
              const onUp = () => { isDragging.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
              document.addEventListener('mousemove', onMove)
              document.addEventListener('mouseup', onUp)
            }}
          />

          {/* Main editing panel (flexible) */}
          <div className="flex-1 min-w-[600px] space-y-5">
            {selectedTemplate ? (
              <>
                {/* Editable version - MAIN AREA */}
                <Card className="card-soft border-0 overflow-hidden rounded-[14px]" style={{ background: '#ffffff' }}>
                  <CardHeader style={{ background: 'var(--primary)', paddingTop: 10, paddingBottom: 10, minHeight: 56, boxShadow: 'none', borderBottom: 'none', borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                    <CardTitle className="text-2xl font-bold text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-6 w-6 mr-3 text-white" />
	                      {t.editEmail}
	                    </div>
	                    <div className="flex items-center space-x-3">
	                      {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                          <>
                            <Button
                              onClick={openVariables}
                              size="sm"
                              className="shadow-soft"
                              variant="outline"
                              style={{ background: '#fff', color: '#145a64', borderColor: 'rgba(20,90,100,0.35)' }}
                            >
	                          <Settings className="h-4 w-4 mr-2" />
	                          {t.variables}
	                        </Button>
                            {/* Toggle removed for stability - highlighting always enabled */}
                          </>
	                      )}
                        {/* IA trigger: opens hidden AI panel - Sage accent */}
                        <Button
                          onClick={() => setShowAIPanel(true)}
                          size="sm"
                          variant="outline"
                          className="shadow-soft"
                          style={{ background: '#fff', color: '#145a64', borderColor: 'rgba(20,90,100,0.35)' }}
                          title="Ouvrir les fonctions IA"
                        >
                          IA
                        </Button>
                        {/* Outlook button moved below editor */}
	                    </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5 mt-1" style={{ background: '#f6fbfb', borderRadius: 14 }}>


                    {/* Editable subject with preview highlighting */}
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#1f8a99]"></span>
                        <span>{t.subject}</span>
                      </div>
                      <HighlightingEditor
                        key={`subject-${selectedTemplate?.id}-${Object.keys(variables).length}`}
                        value={finalSubject}
                        onChange={(e) => setFinalSubject(e.target.value)}
                        variables={variables}
                        placeholder={getPlaceholderText()}
                        minHeight="60px"
                        templateOriginal={selectedTemplate?.subject?.[templateLanguage] || ''}
                        showHighlights={true}
                      />

                    </div>

                    {/* Editable body with preview highlighting */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <span className="inline-block h-2 w-2 rounded-full bg-[#1f8a99]"></span>
                        <span>{t.body}</span>
                      </div>
                      <HighlightingEditor
                        key={`body-${selectedTemplate?.id}-${Object.keys(variables).length}`}
                        value={finalBody}
                        onChange={(e) => setFinalBody(e.target.value)}
                        variables={variables}
                        placeholder={getPlaceholderText()}
                        minHeight="250px"
                        templateOriginal={selectedTemplate?.body?.[templateLanguage] || ''}
                        showHighlights={true}
                      />

                    </div>
                  </CardContent>
                </Card>

                {/* Actions with modern style */}
                <div className="flex justify-between items-center actions-row">
                  {/* Left-side tools: Export (+) then Copy link */}
                  <div className="flex items-center gap-2 relative" ref={exportMenuRef}>
                    <Button size="sm" variant="outline" className="font-medium border-2" style={{ borderRadius: 12, borderColor: '#bfe7e3' }} onClick={() => setShowExportMenu(v => !v)} aria-expanded={showExportMenu} aria-haspopup="menu">
                      +
                    </Button>
                    {showExportMenu && (
                      <div className="absolute left-0 z-20 mt-2 w-48 bg-white border border-[#e6eef5] rounded-[12px] shadow-soft py-1" role="menu">
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('eml'); setShowExportMenu(false) }}>Exporter en .eml</button>
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('html'); setShowExportMenu(false) }}>Exporter en HTML</button>
                        <button className="w-full text-left px-3 py-2 hover:bg-[#f5fbff] text-sm" onClick={() => { exportAs('copy-html'); setShowExportMenu(false) }}>Copier en HTML</button>
                      </div>
                    )}
                    <Button 
                      variant="ghost" 
                      onClick={() => copyTemplateLink()}
                      className="text-gray-500 hover:text-[#1f8a99] hover:bg-[#dbeafe] transition-all duration-300 font-medium text-sm"
                      style={{ borderRadius: '12px' }}
                      title={t.copyLinkTitle}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      {t.copyLink}
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
                        borderColor: 'rgba(31, 138, 153, 0.3)',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(219, 234, 254, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1f8a99';
                        e.currentTarget.style.backgroundColor = 'rgba(219, 234, 254, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(31, 138, 153, 0.3)';
                        e.currentTarget.style.backgroundColor = 'rgba(219, 234, 254, 0.3)';
                      }}
                      title="Copy subject only (Ctrl+J)"
                    >
                      <Mail className="h-4 w-4 mr-2 text-[#1f8a99]" />
                      <span className="text-[#1a365d]">{t.copySubject || 'Subject'}</span>
                    </Button>
                    
                    {/* Body Copy Button - Sage accent (slightly darker) */}
                    <Button 
                      onClick={() => copyToClipboard('body')} 
                      variant="outline"
                      size="sm"
                      className="font-medium border-2 transition-all duration-300 group shadow-soft"
                      style={{ 
                        borderColor: 'rgba(163, 179, 84, 0.5)',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(163, 179, 84, 0.18)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#8ea345';
                        e.currentTarget.style.backgroundColor = 'rgba(163, 179, 84, 0.28)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(163, 179, 84, 0.5)';
                        e.currentTarget.style.backgroundColor = 'rgba(163, 179, 84, 0.18)';
                      }}
                      title="Copy body only (Ctrl+B)"
                    >
                      <Edit3 className="h-4 w-4 mr-2 text-[#8ea345]" />
                      <span className="text-[#1a365d]">{t.copyBody || 'Body'}</span>
                    </Button>
                    
                    {/* Complete Copy Button - Gradient (main action) */}
                    <Button 
                      onClick={() => copyToClipboard('all')} 
                      className={`font-bold transition-all duration-200 shadow-soft btn-pill text-white ${
                        copySuccess 
                          ? 'transform scale-[1.02]' 
                          : 'hover:scale-[1.02]'
                      }`}
                      style={{ background: '#1f8a99' }}
                      title="Copy entire email (Ctrl+Enter)"
                    >
                      <Copy className="h-5 w-5 mr-2" />
                      {copySuccess ? t.copied : (t.copyAll || 'All')}
                    </Button>

                    {/* Send Email Button - Teal primary action (moved CTA) */}
                    <Button 
                      onClick={openInOutlook}
                      className="font-bold transition-all duration-200 shadow-soft text-white btn-pill"
                      style={{ background: '#145a64', borderRadius: '12px' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      title="Open in your default email client (Ctrl+Shift+Enter)"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      {t.openInOutlook}
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
                      <Sparkles className="h-6 w-6 text-emerald-400 absolute -top-2 -right-2 animate-pulse" />
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
            className="px-3 py-2 rounded-full shadow-lg border bg-white text-[#145a64] font-semibold"
            style={{ borderColor: '#bfe7e3' }}
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
            className={`bg-white ${varsOnlyMode ? '' : 'rounded-[14px] shadow-2xl border border-[#e6eef5]'} min-w-[540px] ${varsOnlyMode ? 'max-w-[100vw] max-h-[100vh]' : 'max-w-[92vw] max-h-[88vh]'} resizable-popup pointer-events-auto flex flex-col`}
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
                        // Compute an approximate size to fit all fields without scroll
                        const count = selectedTemplate?.variables?.length || 0
                        const columns = Math.max(1, Math.min(3, count >= 3 ? 3 : count))
                        const cardW = 360 // px per field card
                        const gap = 8
                        const headerH = 64
                        const rowH = 112 // approx per row
                        const rows = Math.max(1, Math.ceil(count / columns))
                        let w = columns * cardW + (columns - 1) * gap
                        let h = headerH + rows * rowH
                        const availW = (window.screen?.availWidth || window.innerWidth) - 40
                        const availH = (window.screen?.availHeight || window.innerHeight) - 80
                        w = Math.min(Math.max(560, w), availW)
                        h = Math.min(Math.max(420, h), availH)
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
                      if (!selectedTemplate || !templatesData || !templatesData.variables) return
                      const initialVars = {}
                      selectedTemplate.variables.forEach(varName => {
                        const varInfo = templatesData?.variables?.[varName]
                        if (varInfo) initialVars[varName] = varInfo.example || ''
                      })
                      setVariables(prev => ({ ...prev, ...initialVars }))
                    }}
                    variant="outline"
                    size="sm"
                    className="border-2 text-[#145a64]"
                    style={{ borderColor: 'rgba(20,90,100,0.35)', borderRadius: 10, background: '#fff' }}
                    title={t.reset}
                    onMouseDown={(e)=> e.stopPropagation()}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> {t.reset}
                  </Button>
                  <Button
                    onClick={syncFromText}
                    variant="outline"
                    size="sm"
                    className="border-2 text-[#0369a1] hover:bg-[#e0f2fe]"
                    style={{ borderColor: '#0369a1', borderRadius: 10, background: '#fff' }}
                    title={interfaceLanguage==='fr'
                      ? 'Synchroniser depuis le texte\n\nExtrait les valeurs des variables depuis les zones de texte modifiées et les synchronise avec les champs du Variables Editor.'
                      : 'Sync from text\n\nExtracts variable values from the edited text areas and syncs them to the Variables Editor fields.'
                    }
                    onMouseDown={(e)=> e.stopPropagation()}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> {interfaceLanguage==='fr'?'Synchro':'Sync'}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedTemplate) return
                      const cleared = {}
                      selectedTemplate.variables.forEach(vn => { cleared[vn] = '' })
                      setVariables(prev => ({ ...prev, ...cleared }))
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
                {selectedTemplate.variables
                  .map((varName) => {
                  const varInfo = templatesData?.variables?.[varName]
                  if (!varInfo) return null
                  
                  const currentValue = variables[varName] || ''
                  
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
                          <label className="text-[14px] font-semibold text-gray-900 flex-1 leading-tight">
                            {varInfo?.description?.[interfaceLanguage] || varName}
                          </label>
                          <div className="shrink-0 flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button
                              className="text-[11px] px-2 py-0.5 rounded border border-[#e6eef5] text-[#145a64] hover:bg-[#f0fbfb]"
                              title={interfaceLanguage==='fr'?'Remettre l’exemple':'Reset to example'}
                              onClick={() => setVariables(prev => ({ ...prev, [varName]: (varInfo?.example || '') }))}
                            >Ex.</button>
                            <button
                              className="text-[11px] px-2 py-0.5 rounded border border-[#e6eef5] text-[#7f1d1d] hover:bg-[#fee2e2]"
                              title={interfaceLanguage==='fr'?'Effacer ce champ':'Clear this field'}
                              onClick={() => setVariables(prev => ({ ...prev, [varName]: '' }))}
                            >X</button>
                          </div>
                        </div>
                        <textarea
                          ref={el => { if (el) varInputRefs.current[varName] = el }}
                          id={`var-${varName}`}
                          name={`var-${varName}`}
                          value={currentValue}
                          onChange={(e) => {
                            const newValue = e.target.value
                            // Only update if value actually changed
                            if (newValue !== currentValue) {
                              setVariables(prev => ({
                                ...prev,
                                [varName]: newValue
                              }))
                            }
                            // Auto-resize (max 2 lines)
                            const lines = (newValue.match(/\n/g) || []).length + 1
                            e.target.style.height = lines <= 2 ? (lines === 1 ? '32px' : '52px') : '52px'
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
                                const emptyFields = list.filter(vn => !((variables[vn] || '').trim()))
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
                          placeholder={varInfo?.example || ''}
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
                    setVarPopupPos(p => ({ ...p, width: Math.max(540, Math.min(window.innerWidth * 0.92, startW + dw)), height: Math.max(380, Math.min(window.innerHeight * 0.88, startH + dh)) }))
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

      {/* Slide-over AI panel */}
      {showAIPanel && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAIPanel(false)} />
          <div className="absolute right-0 top-0 h-full w-[420px] bg-white shadow-2xl border-l border-gray-200 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-700">Assistant IA</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowAIPanel(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AISidebar emailText={finalBody} onResult={setFinalBody} variables={variables} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
