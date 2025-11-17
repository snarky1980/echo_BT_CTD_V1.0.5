import React, { useMemo } from 'react'
import HelpCenter from './components/HelpCenter.jsx'

export default function HelpPopout() {
  const params = new URLSearchParams(window.location.search)
  const langParam = params.get('lang')
  const language = langParam === 'en' ? 'en' : 'fr'
  const supportEmail = params.get('support') || 'jskennedy80@gmail.com'

  const onClose = useMemo(() => () => {
    try { window.close() } catch {}
  }, [])

  return (
    <div className="min-h-screen w-full">
      <HelpCenter language={language} onClose={onClose} supportEmail={supportEmail} />
    </div>
  )
}
