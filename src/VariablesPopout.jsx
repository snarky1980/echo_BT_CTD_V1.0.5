import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Edit3, X, RotateCcw, Pin, PinOff } from 'lucide-react'
import { normalizeVarKey, varKeysMatch, resolveVariableValue } from './utils/variables'

const LANGUAGE_SUFFIXES = ['FR', 'EN']

const expandVariableAssignment = (varName, value, preferredLanguage = null) => {
  const assignments = {}
  if (!varName) return assignments
  assignments[varName] = value
  const match = varName.match(/^(.*)_(FR|EN)$/i)
  if (match) {
    const base = match[1]
    assignments[base] = value
  } else {
    const targetLang = (preferredLanguage && LANGUAGE_SUFFIXES.includes(preferredLanguage.toUpperCase()))
      ? preferredLanguage.toUpperCase()
      : null
    if (targetLang) {
      assignments[`${varName}_${targetLang}`] = value
    } else {
      LANGUAGE_SUFFIXES.forEach((suffix) => {
        assignments[`${varName}_${suffix}`] = value
      })
    }
  }
  return assignments
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

const resolveVariableInfo = (templatesData, name = '') => {
  if (!templatesData?.variables || !name) return null
  if (templatesData.variables[name]) return templatesData.variables[name]
  const baseName = name.replace(/_(FR|EN)$/i, '')
  return templatesData.variables[baseName] || null
}

const guessSampleValue = (templatesData, name = '') => {
  const info = resolveVariableInfo(templatesData, name)
  // Prefer per-language examples when available based on suffix
  const suffix = (name || '').match(/_(FR|EN)$/i)?.[1]?.toLowerCase()
  if (suffix === 'en' && info?.examples?.en) return info.examples.en
  if (suffix === 'fr' && info?.examples?.fr) return info.examples.fr
  // Support object example { fr, en }
  if (info?.example && typeof info.example === 'object') {
    if (suffix === 'en') return info.example.en ?? info.example.fr ?? ''
    if (suffix === 'fr') return info.example.fr ?? info.example.en ?? ''
    return info.example.fr ?? info.example.en ?? ''
  }
  if (info?.example) return info.example
  const normalized = (name || '').toLowerCase()
  const format = info?.format || (
    /date|jour|day/.test(normalized) ? 'date' :
    /heure|time/.test(normalized) ? 'time' :
    /montant|total|nombre|count|amount|num|quant/.test(normalized) ? 'number' :
    'text'
  )
  switch (format) {
    case 'date':
      return new Date().toISOString().slice(0, 10)
    case 'time':
      return '09:00'
    case 'number':
      return '0'
    default:
      return '…'
  }
}

/**
 * Standalone Variables Editor Popout Window
 * 
 * This component renders in a separate browser window (popout) and allows
 * editing of template variables. Changes are synced back to the main window
 * via BroadcastChannel.
 */
export default function VariablesPopout({ 
  selectedTemplate, 
  templatesData, 
  initialVariables, 
  interfaceLanguage,
  templateLanguage = 'fr'
}) {
  console.log('🔍 VariablesPopout props:', {
    selectedTemplate: selectedTemplate?.id,
    templatesData: !!templatesData,
    initialVariables,
    interfaceLanguage,
    templateLanguage
  })
  
  const [variables, setVariables] = useState(initialVariables || {})
  const varInputRefs = useRef({})

  // Auto-resize helper for textareas
  const autoResize = useCallback((el) => {
    if (!el) return
    try {
      el.style.height = 'auto'
      const next = Math.max(32, el.scrollHeight)
      el.style.height = `${next}px`
    } catch {}
  }, [])
  const lastInitialVarsRef = useRef(initialVariables)
  // Keep local variables in sync with prop changes from parent page
  useEffect(() => {
    if (lastInitialVarsRef.current !== initialVariables) {
      lastInitialVarsRef.current = initialVariables
      if (initialVariables && typeof initialVariables === 'object') {
        setVariables({ ...initialVariables })
      } else {
        setVariables({})
      }
    }
  }, [initialVariables])

  // Resize all inputs whenever variables change (content update) or on mount
  useEffect(() => {
    try {
      const map = varInputRefs.current || {}
      Object.values(map).forEach((el) => autoResize(el))
    } catch {}
  }, [variables, autoResize])

  const activeLanguageCode = useMemo(() => (templateLanguage || 'fr').toUpperCase(), [templateLanguage])
  const targetVarForLanguage = useCallback((name = '') => {
    if (/_(FR|EN)$/i.test(name)) return name
    return `${name}_${activeLanguageCode}`
  }, [activeLanguageCode])

  const getVarValue = useCallback((name = '') => {
    return resolveVariableValue(variables, name, templateLanguage)
  }, [variables, templateLanguage])
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem('ea_popout_pinned') === 'true'
    } catch {
      return false
    }
  })
  
  console.log('🔍 VariablesPopout initialized with variables:', variables)
  const [focusedVar, setFocusedVar] = useState(null)
  const channelRef = useRef(null)
  const senderIdRef = useRef(Math.random().toString(36).slice(2))
  const retryIntervalRef = useRef(null)
  // varInputRefs declared earlier
  const focusedVarRef = useRef(focusedVar)
  const sendTimerRef = useRef(null)
  const lastSentAtRef = useRef(0)
  const lastScrollFocusRef = useRef(null)

  useEffect(() => {
    focusedVarRef.current = focusedVar
  }, [focusedVar])

  useEffect(() => {
    try {
      localStorage.setItem('ea_popout_pinned', String(isPinned))
    } catch (err) {
      console.warn('Failed to persist popout pin state:', err)
    }
    if (isPinned) {
      window.focus()
    }
  }, [isPinned])

  useEffect(() => {
    if (!isPinned) return

    let focusThrottle = false
    let lastFocusAttempt = 0

    const refocus = () => {
      if (!isPinned || focusThrottle) return
      
      const now = Date.now()
      if (now - lastFocusAttempt < 50) return // Debounce rapid attempts
      
      lastFocusAttempt = now
      focusThrottle = true
      
      requestAnimationFrame(() => {
        try {
          // Aggressively bring window to front
          window.focus()
          
          // Try multiple approaches for cross-browser/multi-monitor support
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.focus()
              setTimeout(() => window.focus(), 10)
            } catch {}
          }
        } catch {}
        
        setTimeout(() => { focusThrottle = false }, 100)
      })
    }

    // Handle window blur (when clicking anywhere outside)
    const handleBlur = () => {
      if (!isPinned) return
      // Immediately try to regain focus when window loses it
      setTimeout(refocus, 0)
      setTimeout(refocus, 50) // Second attempt for stubborn cases
    }

    // Handle visibility changes (switching tabs, minimizing, etc.)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && isPinned) {
        setTimeout(refocus, 0)
      }
    }

    // Handle mouse leaving the window
    const handleMouseLeave = (e) => {
      if (!isPinned) return
      // Check if mouse actually left the window bounds
      if (e.clientY <= 0 || e.clientX <= 0 || 
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        setTimeout(refocus, 0)
      }
    }

    // Handle clicks on the parent window or other windows
    const handleParentActivity = () => {
      if (!isPinned) return
      setTimeout(refocus, 0)
    }

    window.addEventListener('blur', handleBlur, { capture: true })
    document.addEventListener('visibilitychange', handleVisibility)
    document.addEventListener('mouseleave', handleMouseLeave)
    
    // Listen for activity in the opener window
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.addEventListener('mousedown', handleParentActivity, { capture: true })
        window.opener.addEventListener('focus', handleParentActivity, { capture: true })
      } catch {}
    }

    // Aggressive periodic check to ensure window stays on top
    const intervalId = setInterval(() => {
      if (!isPinned) return
      
      // Check if we're truly focused
      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        refocus()
      }
    }, 500) // More frequent checks

    // Initial focus when pin is activated
    refocus()

    return () => {
      window.removeEventListener('blur', handleBlur, { capture: true })
      document.removeEventListener('visibilitychange', handleVisibility)
      document.removeEventListener('mouseleave', handleMouseLeave)
      
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.removeEventListener('mousedown', handleParentActivity, { capture: true })
          window.opener.removeEventListener('focus', handleParentActivity, { capture: true })
        } catch {}
      }
      
      clearInterval(intervalId)
    }
  }, [isPinned])

  const notifyFocusChange = (varName, broadcast = true) => {
    const nextRaw = varName ?? null
    const prevRaw = focusedVarRef.current ?? null
    const nextNormalized = normalizeVarKey(nextRaw)
    const prevNormalized = normalizeVarKey(prevRaw)

    if (prevNormalized !== nextNormalized || prevRaw !== nextRaw) {
      focusedVarRef.current = nextRaw
      setFocusedVar(nextRaw)
      lastScrollFocusRef.current = nextNormalized
    } else if (!broadcast) {
      return
    }

    if (broadcast) {
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({
            type: 'focusedVar',
            varName: nextRaw,
            normalizedVar: nextNormalized || null,
            sender: senderIdRef.current
          })
        } catch (e) {
          console.error('Failed to send focus update:', e)
        }
      }

      try {
        localStorage.setItem('ea_focused_var', JSON.stringify({
          focusedVar: nextRaw,
          normalizedVar: nextNormalized || null,
          timestamp: Date.now(),
          sender: senderIdRef.current
        }))
      } catch (storageError) {
        console.warn('Unable to persist focus sync payload:', storageError)
      }
    }
  }

  const notifyHoverChange = (varName) => {
    if (!channelRef.current) return
    try {
      channelRef.current.postMessage({
        type: 'variableHovered',
        varName: varName ?? null,
        sender: senderIdRef.current
      })
    } catch (e) {
      console.error('Failed to send hover update:', e)
    }
  }

  // Initialize BroadcastChannel for syncing with main window
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('email-assistant-sync')
      channelRef.current = channel
      console.log('🔍 BroadcastChannel created successfully')

      // Listen for messages from main window
      channel.onmessage = (event) => {
        try {
          const message = event.data
          if (!message || message.sender === senderIdRef.current) return

          console.log('🔍 Received message:', message.type, message)

          if (message.type === 'focusedVar') {
            const next = message.varName ?? null
            const normalized = message.normalizedVar || normalizeVarKey(next)
            notifyFocusChange(next, false)

            document.querySelectorAll('.ea-popout-card').forEach((card) => {
              const cardVar = card.getAttribute('data-var')
              const matches = normalized && normalizeVarKey(cardVar) === normalized
              if (matches) {
                card.classList.add('ea-popout-focused')
                if (lastScrollFocusRef.current !== normalized) {
                  try {
                    card.scrollIntoView({ block: 'center', behavior: 'smooth' })
                    lastScrollFocusRef.current = normalized
                  } catch {}
                }
              } else {
                card.classList.remove('ea-popout-focused')
              }

              const textarea = card.querySelector('textarea')
              if (textarea) {
                if (matches) {
                  textarea.classList.add('ea-popout-input-focused')
                } else {
                  textarea.classList.remove('ea-popout-input-focused')
                }
              }
            })

            if (!normalized) {
              lastScrollFocusRef.current = null
            }
            return
          }

          if (message.type === 'variableHovered') {
            const hoveredVar = message.varName ?? null
            const hoveredNormalized = normalizeVarKey(hoveredVar)
            document.querySelectorAll('.ea-popout-card').forEach((card) => {
              const cardVarName = card.getAttribute('data-var')
              const matches = hoveredNormalized && normalizeVarKey(cardVarName) === hoveredNormalized
              card.classList.toggle('ea-popout-hovered', !!matches)
            })
            return
          }

          if (message.type === 'variablesUpdated') {
            console.log('🔍 Updating variables from variablesUpdated:', message.variables)
            setVariables(message.variables || {})
            return
          }
          
          // Handle sync completion (from explicit syncFromText requests)
          if (message.type === 'syncComplete') {
            console.log('🔄 Received sync completion:', message)
            const nextVariables = message.variables || {}
            console.log('🔄 Applying sync result variables:', nextVariables)
            setVariables(nextVariables)
            return
          }
        } catch (msgError) {
          console.error('Error processing BroadcastChannel message:', msgError)
        }
      }

      return () => {
        try {
          channel.close()
        } catch (closeError) {
          console.error('Error closing BroadcastChannel:', closeError)
        }
      }
    } catch (e) {
      console.error('BroadcastChannel not available:', e)
    }
  }, [])

  // Wait for initial variables from main window via variablesUpdated message
  // No need to request syncFromText - main window will send variablesUpdated when popout opens
  useEffect(() => {
    if (!channelRef.current) return
    
    console.log('🔄 Popout ready - waiting for initial variables from main window')
    
    // The main window will send variablesUpdated when it detects popoutOpened
    // We just need to wait for it
    
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current)
        retryIntervalRef.current = null
      }
    }
  }, [])

  // Sync variable changes to main window
  const enqueueVariableUpdate = (varName, value, allVariables) => {
    if (!channelRef.current) return
    try {
      channelRef.current.postMessage({
        type: 'variableChanged',
        varName,
        value,
        allVariables,
        sender: senderIdRef.current
      })
      lastSentAtRef.current = Date.now()
    } catch (e) {
      console.error('Failed to send variable update:', e)
    }
  }

  const updateVariable = (varName, value) => {
    const assignments = expandVariableAssignment(varName, value, activeLanguageCode)
    // Compute the next snapshot synchronously to avoid race conditions
    const snapshot = applyAssignments(variables || {}, assignments)
    setVariables(snapshot)
    enqueueVariableUpdate(varName, value, snapshot)
  }

  const removeVariable = (varName) => {
    // Compute next snapshot synchronously to avoid race conditions
    const assignments = expandVariableAssignment(varName, '', activeLanguageCode)
    const snapshot = applyAssignments(variables || {}, assignments)
    setVariables(snapshot)
    enqueueVariableUpdate(varName, '', snapshot)

    if (!channelRef.current) return

    try {
      channelRef.current.postMessage({
        type: 'variableRemoved',
        varName,
        allVariables: snapshot,
        sender: senderIdRef.current
      })
    } catch (e) {
      console.error('Failed to send variable removal:', e)
    }
  }

  const reinitializeVariable = (varName) => {
    const targetName = targetVarForLanguage(varName)
    const exampleValue = guessSampleValue(templatesData, targetName)
    // Compute next snapshot synchronously to avoid race conditions
    const assignments = expandVariableAssignment(varName, exampleValue, activeLanguageCode)
    const snapshot = applyAssignments(variables || {}, assignments)
    setVariables(snapshot)
    enqueueVariableUpdate(varName, exampleValue, snapshot)

    if (!channelRef.current) return

    try {
      channelRef.current.postMessage({
        type: 'variableReinitialized',
        varName,
        value: exampleValue,
        sender: senderIdRef.current
      })
    } catch (e) {
      console.error('Failed to send variable reinitialization:', e)
    }
  }

  useEffect(() => () => { clearTimeout(sendTimerRef.current) }, [])
  
  // Auto-focus first empty variable on mount
  useEffect(() => {
    if (!selectedTemplate?.variables || selectedTemplate.variables.length === 0) return
    
    try {
      const firstEmpty = selectedTemplate.variables.find(
        (vn) => !getVarValue(vn).trim()
      ) || selectedTemplate.variables[0]
      
      const el = varInputRefs.current?.[firstEmpty]
      if (el && typeof el.focus === 'function') {
        setTimeout(() => {
          try {
            el.focus()
            if (typeof el.select === 'function') {
              el.select()
            }
          } catch (focusError) {
            console.warn('Focus error:', focusError)
          }
        }, 100)
      }
    } catch (error) {
      console.error('Auto-focus error:', error)
    }
  }, [])

  if (!selectedTemplate || !templatesData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const t = interfaceLanguage === 'fr' ? {
    title: 'Modifier les variables',
    reinitialize: 'Réinitialiser',
    clear: 'Supprimer',
    close: 'Fermer',
    pin: ({ pinned }) => pinned ? 'Épinglé • cette fenêtre reste devant' : 'Épingler cette fenêtre'
  } : {
    title: 'Edit Variables',
    reinitialize: 'Reinitialize',
    clear: 'Delete',
    close: 'Close',
    pin: ({ pinned }) => pinned ? 'Pinned • window stays on top' : 'Pin this window'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-5 py-2 flex items-center justify-between"
        style={{ 
          background: '#2c3d50',
          borderBottom: '3px solid rgba(163, 179, 84, 0.3)'
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Edit3 className="h-5 w-5 mr-2 text-white" />
            <h1 className="text-lg font-bold text-white">{t.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPinned((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-sm ${
              isPinned 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={t.pin({ pinned: isPinned })}
          >
            {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
            <span>{isPinned ? (interfaceLanguage === 'fr' ? 'Épinglé' : 'Pinned') : (interfaceLanguage === 'fr' ? 'Épingler' : 'Pin')}</span>
          </button>
          <button
            onClick={() => window.close()}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            title={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Variables Grid */}
      <div className="py-2 px-5">
        <div className="grid grid-cols-1 gap-2" style={{ width: '100%', minWidth: 0 }}>
          {(() => {
            // Extract variables in the order they appear in template text
            const subjectText = selectedTemplate?.subject?.[templateLanguage] || ''
            const bodyText = selectedTemplate?.body?.[templateLanguage] || ''
            const combinedText = subjectText + '\n' + bodyText
            
            const seenVars = new Set()
            const orderedVars = []
            const regex = /<<([^>]+)>>/g
            let match
            
            while ((match = regex.exec(combinedText)) !== null) {
              const varNameInText = match[1] // e.g., "client_name_FR"
              // Strip language suffix to match template.variables format
              const baseVarName = varNameInText.replace(/_(FR|EN)$/i, '')
              
              if (!seenVars.has(baseVarName) && (selectedTemplate?.variables || []).includes(baseVarName)) {
                seenVars.add(baseVarName)
                orderedVars.push(baseVarName)
              }
            }
            
            // Add any remaining variables not found in text (shouldn't happen normally)
            ;(selectedTemplate?.variables || []).forEach(v => {
              if (!seenVars.has(v)) orderedVars.push(v)
            })
            
            return orderedVars
          })().map((varName) => {
            const varInfo = templatesData?.variables?.[varName]
            if (!varInfo) {
              console.warn('🔍 Variable info not found for:', varName)
              return null
            }

            const currentValue = getVarValue(varName)
            const isFocused = varKeysMatch(focusedVar, varName)
            const sanitizedVarId = `popout-var-${varName.replace(/[^a-z0-9_-]/gi, '-')}`
            const langForDisplay = (templateLanguage || interfaceLanguage || 'fr').toLowerCase()

            return (
              <div
                key={varName}
                data-var={varName}
                className={`ea-popout-card rounded-lg transition-all duration-200 ${isFocused ? 'ea-popout-focused' : ''}`}
                style={isFocused ? {
                  background: 'rgba(219, 234, 254, 0.35)',
                  border: '2px solid rgba(29, 78, 216, 0.6)',
                  boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.25), 0 8px 24px rgba(30, 64, 175, 0.25)',
                  transform: 'scale(1.02)'
                } : undefined}
                onMouseEnter={() => notifyHoverChange(varName)}
                onMouseLeave={() => notifyHoverChange(null)}
              >
                <div className="ea-popout-card-inner rounded-lg p-2">
                  {/* Label and buttons */}
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <label htmlFor={sanitizedVarId} className="text-sm font-semibold text-gray-900 flex-1 leading-tight">
                      {varInfo.description?.[langForDisplay] || varInfo.description?.fr || varInfo.description?.en || varName}
                    </label>
                    <div className="shrink-0 flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        className="text-xs px-2 py-0.5 rounded border border-gray-300 text-teal-700 hover:bg-teal-50 flex items-center gap-1"
                        title={t.reinitialize}
                        onClick={() => reinitializeVariable(varName)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t.reinitialize}
                      </button>
                      <button
                        className="text-xs px-2 py-0.5 rounded border border-gray-300 text-red-700 hover:bg-red-50"
                        title={t.clear}
                        onClick={() => removeVariable(varName)}
                      >
                        X
                      </button>
                    </div>
                  </div>

                  {/* Input field */}
                  <textarea
                    ref={el => { if (el) varInputRefs.current[varName] = el }}
                    id={sanitizedVarId}
                    name={sanitizedVarId}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    // Hint popular extensions to ignore these fields to avoid content_script errors
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-gramm="false"
                    data-enable-grammarly="false"
                    data-ms-editor="false"
                    value={currentValue}
                    onChange={(e) => { updateVariable(varName, e.target.value); autoResize(e.target) }}
                    onInput={(e) => { updateVariable(varName, e.target.value); }}
                    onFocus={(e) => {
                      notifyFocusChange(varName)
                      requestAnimationFrame(() => {
                        try {
                          e.target.select()
                        } catch {}
                        autoResize(e.target)
                      })
                    }}
                    onBlur={() => notifyFocusChange(null)}
                    onKeyDown={(e) => {
                      // Tab or Enter to next field
                      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
                        e.preventDefault()
                        const list = selectedTemplate.variables
                        const currentIdx = list.indexOf(varName)
                        
                        let nextIdx
                        if (e.shiftKey && e.key === 'Tab') {
                          // Shift+Tab = previous
                          nextIdx = (currentIdx - 1 + list.length) % list.length
                        } else {
                          // Tab or Enter = next
                          nextIdx = (currentIdx + 1) % list.length
                        }
                        
                        const nextVar = list[nextIdx]
                        const el = varInputRefs.current[nextVar]
                        if (el && el.focus) {
                          el.focus()
                          el.select?.()
                        }
                      }
                    }}
                    placeholder={(() => {
                      if (varInfo.examples && varInfo.examples[langForDisplay]) return varInfo.examples[langForDisplay]
                      const ex = varInfo.example
                      if (ex && typeof ex === 'object') {
                        return langForDisplay === 'en' ? (ex.en || ex.fr || '') : (ex.fr || ex.en || '')
                      }
                      return ex || ''
                    })()}
                    className={`w-full min-h-[32px] border-2 border-gray-200 rounded-md resize-none overflow-hidden transition-all duration-200 text-sm px-2 py-1 leading-5 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 ${isFocused ? 'ea-popout-input-focused' : ''}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
