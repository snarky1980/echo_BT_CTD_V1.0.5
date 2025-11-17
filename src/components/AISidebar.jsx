/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { Sparkles, Settings, Loader2, MessageCircle, Wand2, CheckCircle, AlertTriangle } from 'lucide-react'
import { callOpenAI, hasOpenAIKey, setOpenAIKey } from '../utils/openai'

const AISidebar = ({ emailText, onResult, variables }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const [lastAction, setLastAction] = useState(null)
  const [result, setResult] = useState('')

  const handleAIAction = async (action) => {
    if (!hasOpenAIKey()) {
      setShowApiKeyInput(true)
      return
    }

    if (!emailText || emailText.trim() === '') {
      alert('Veuillez d\'abord sélectionner un modèle et saisir du contenu.')
      return
    }

    setIsProcessing(true)
    setLastAction(action)

    try {
      let prompt = ''

      switch (action) {
        case 'improve':
          prompt = `Améliore ce texte d'email pour le rendre plus professionnel et engageant tout en préservant exactement toutes les variables (<<...>>) :\n\n${emailText}`
          break
        case 'formal':
          prompt = `Rends ce texte d'email plus formel et professionnel tout en préservant exactement toutes les variables (<<...>>) :\n\n${emailText}`
          break
        case 'friendly':
          prompt = `Rends ce texte d'email plus chaleureux et amical tout en gardant un ton professionnel et en préservant exactement toutes les variables (<<...>>) :\n\n${emailText}`
          break
        case 'concise':
          prompt = `Rends ce texte d'email plus concis et direct tout en préservant exactement toutes les variables (<<...>>) et les informations essentielles :\n\n${emailText}`
          break
        case 'grammar':
          prompt = `Corrige la grammaire, l'orthographe et la ponctuation de ce texte d'email tout en préservant exactement toutes les variables (<<...>>) :\n\n${emailText}`
          break
        default:
          throw new Error('Action AI inconnue')
      }

  const response = await callOpenAI({ prompt })
      setResult(response)
    } catch (error) {
      console.error('Erreur AI:', error)
      alert(`Erreur AI: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const applyResult = () => {
    if (result && onResult) {
      onResult(result)
      setResult('')
      setLastAction(null)
    }
  }

  const rejectResult = () => {
    setResult('')
    setLastAction(null)
  }

  const saveApiKey = () => {
    if (tempApiKey.trim()) {
      setOpenAIKey(tempApiKey.trim())
      setTempApiKey('')
      setShowApiKeyInput(false)
      alert('Clé API sauvegardée ! Vous pouvez maintenant utiliser les fonctionnalités AI.')
    }
  }

  return (
    <Card className="h-fit shadow-xl border-0 bg-gradient-to-br from-white to-purple-50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
          Assistant IA
        </CardTitle>
        <p className="text-sm text-gray-600">Améliorez vos emails avec l'IA</p>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {!hasOpenAIKey() ? (
          <div className="text-center space-y-4">
            <div className="text-amber-600 mb-4">
              <Settings className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm font-medium">Configuration requise</p>
            </div>
            <Button
              onClick={() => setShowApiKeyInput(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurer OpenAI
            </Button>
          </div>
        ) : (
          <>
            {!result ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => handleAIAction('improve')}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm"
                  >
                    {isProcessing && lastAction === 'improve' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Améliorer
                  </Button>

                  <Button
                    onClick={() => handleAIAction('formal')}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white text-sm"
                  >
                    {isProcessing && lastAction === 'formal' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Plus formel
                  </Button>

                  <Button
                    onClick={() => handleAIAction('friendly')}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-sm"
                  >
                    {isProcessing && lastAction === 'friendly' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Plus amical
                  </Button>

                  <Button
                    onClick={() => handleAIAction('concise')}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm"
                  >
                    {isProcessing && lastAction === 'concise' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Plus concis
                  </Button>

                  <Button
                    onClick={() => handleAIAction('grammar')}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm"
                  >
                    {isProcessing && lastAction === 'grammar' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Corriger
                  </Button>
                </div>

                {isProcessing && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-purple-800 font-medium">
                      L'IA travaille sur votre texte...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Suggestion IA
                    {lastAction && (
                      <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                        {lastAction}
                      </span>
                    )}
                  </h4>
                  <div className="bg-white p-3 rounded border text-sm max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-gray-800">
                      {result}
                    </pre>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={rejectResult}
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    Rejeter
                  </Button>
                  <Button
                    onClick={applyResult}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    Appliquer
                  </Button>
                </div>

                <Button
                  onClick={() => handleAIAction(lastAction)}
                  variant="outline"
                  className="w-full text-sm"
                  disabled={isProcessing}
                >
                  Réessayer
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Modal de configuration de la clé API */}
      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-purple-500 text-5xl mb-4">🔑</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration OpenAI</h2>
              <p className="text-gray-600 text-sm">
                Entrez votre clé API OpenAI pour activer les fonctionnalités d'intelligence artificielle.
                <br />
                <span className="text-xs text-gray-500">
                  Votre clé est stockée localement et n'est jamais envoyée ailleurs.
                </span>
              </p>
            </div>

            <div className="mb-6">
              <input
                type="password"
                id="openai-api-key"
                name="openai-api-key"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-2">
                Obtenez votre clé API sur{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-500 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  setShowApiKeyInput(false)
                  setTempApiKey('')
                }}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={saveApiKey}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!tempApiKey.trim()}
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default AISidebar
