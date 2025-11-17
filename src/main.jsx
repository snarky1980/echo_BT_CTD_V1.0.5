/* eslint-disable no-unused-vars */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import VariablesPage from './VariablesPage.jsx'
import HelpPopout from './HelpPopout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ToastProvider } from './components/ui/toast.jsx'

// Check if this is the variables popout window
const params = new URLSearchParams(window.location.search)
const isVarsOnly = params.get('varsOnly') === '1'
const isHelpOnly = params.get('helpOnly') === '1'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        {isVarsOnly ? <VariablesPage /> : isHelpOnly ? <HelpPopout /> : <App />}
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
)
