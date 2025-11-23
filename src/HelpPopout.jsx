import React, { useMemo } from 'react'
import HelpCenter from './components/HelpCenter.jsx'

export default function HelpPopout() {
  const params = new URLSearchParams(window.location.search)
  const langParam = params.get('lang')
  const language = langParam === 'en' ? 'en' : 'fr'
  const supportEmail = params.get('support') || 'support@example.com'

  const onClose = useMemo(() => () => {
    try { window.close() } catch {}
  }, [])

  return (
    <div className="w-full h-full overflow-auto">
      <HelpCenter language={language} onClose={onClose} supportEmail={supportEmail} />
    </div>
  )
}
