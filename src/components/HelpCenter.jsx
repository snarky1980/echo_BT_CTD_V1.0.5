import React, { useEffect, useMemo, useRef, useState } from 'react'
import { LifeBuoy, Lightbulb, BookOpen, AlertTriangle, MessageCircle, ExternalLink, Mail, X, CheckCircle2, Loader2, Copy, Star, Shield } from 'lucide-react'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { ScrollArea } from './ui/scroll-area.jsx'
import { Separator } from './ui/separator.jsx'
import { Input } from './ui/input.jsx'
import { Textarea } from './ui/textarea.jsx'

const translations = {
  fr: {
    title: 'Centre d\'aide',
  subtitle: 'Réponses express pour ECHO',
    quickStart: {
      heading: 'Prise en main rapide',
      description: 'Suivez ces étapes pour générer un courriel prêt à envoyer en moins d\'une minute.',
      bullets: [
        'Choisissez un modèle dans la colonne de gauche. Utilisez la recherche et le filtre de catégories pour accélérer.',
        'Ajoutez vos informations : tapez directement dans les zones “Objet” et “Message” ou utilisez le popup Variables pour profiter des mises à jour en temps réel.',
        'Copiez le résultat (objet, corps ou tout) ou composez directement dans Outlook lorsque vous êtes satisfait.'
      ]
    },
    sections: {
      variables: {
        heading: 'Variables & pastilles',
        points: [
          'Les variables apparaissent comme des pastilles dans l\'Objet et le Corps. Cliquez dessus ou tapez pour les modifier.',
          'Les pastilles montrent la valeur en temps réel. Vous ne devriez pas voir «<>» : si c\'est le cas, vérifiez que la variable existe et n\'a pas été supprimée.',
          'Utilisez le panneau Variables pour voir et éditer toutes les valeurs d\'un coup; la synchronisation est bidirectionnelle.'
        ]
      },
      popout: {
        heading: 'Fenêtre détachée (popout)',
        points: [
          'Ouvrez le panneau Variables dans une fenêtre séparée pour travailler côte à côte.',
          'À l\'ouverture, les valeurs sont extraites immédiatement de l\'Objet et du Corps (via les pastilles).',
          'Les changements dans l\'une ou l\'autre fenêtre se reflètent automatiquement (BroadcastChannel).'
        ]
      },
      copying: {
        heading: 'Copier & Envoyer',
        points: [
          'Les boutons Copier Objet / Copier Corps / Copier Tout incluent vos valeurs actuelles et le formatage riche (gras, surlignage, etc.).',
          'Le bouton « Ouvrir dans un courriel » génère un lien mailto qui ouvre votre client de messagerie par défaut (Outlook, Gmail, etc.) et insère automatiquement l\'objet et le corps en texte brut.',
          'Important : Le formatage riche est perdu avec le bouton mailto. Pour conserver le gras, les couleurs et le surlignage, utilisez « Copier Tout » puis collez dans votre client préféré.',
          'Le lien direct (icône de lien) inclut l\'identifiant et la langue dans l\'URL pour partager le modèle avec des collègues.'
        ]
      },
      favorites: {
        heading: 'Favoris',
        points: [
          'Cliquez l\'icône étoile pour marquer un modèle. L\'icône devient or quand favori et très claire sinon.',
          'Activez « Afficher uniquement les favoris » pour filtrer la liste.',
          'Les favoris sont mémorisés localement dans le navigateur.'
        ]
      },
      shortcuts: {
        heading: 'Raccourcis clavier',
        items: [
          ['Ctrl/Cmd + Entrée', 'Copier tout'],
          ['Ctrl/Cmd + B', 'Copier le corps'],
          ['Ctrl/Cmd + J', 'Copier l\'objet'],
          ['Ctrl/Cmd + Shift + Entrée', 'Ouvrir dans un courriel'],
          ['Ctrl/Cmd + /', 'Focus sur la recherche'],
          ['Ctrl/Cmd + R (Variables)', 'Réinitialiser aux exemples'],
          ['Ctrl/Cmd + Shift + V (Variables)', 'Collage intelligent var: valeur']
        ]
      },
      privacy: {
        heading: 'Confidentialité & stockage',
        points: [
          'Tout fonctionne localement dans votre navigateur. Aucune donnée n\'est envoyée à un serveur, sauf si vous soumettez le formulaire de contact.',
          'Les préférences (langues, favoris, etc.) et les variables en cours sont sauvegardées en local.',
          'Exportez vos modèles JSON pour sauvegarder ou partager vos modifications.'
        ]
      }
    },
    faq: {
      heading: 'Questions fréquentes',
      items: [
        {
          question: 'Comment garder le popup Variables à l\'écran ?',
          answer: 'Cliquez sur l\'icône d\'épingle. Quand elle est active, le panneau reste ouvert même si vous interagissez ailleurs dans l\'application.'
        },
        {
          question: 'Les valeurs du popup correspondent-elles toujours au texte ?',
          answer: 'Oui. À l\'ouverture, le popup synchronise immédiatement les valeurs actuelles grâce à l\'extraction directe de l\'objet et du message. Les modifications faites dans le texte sont détectées automatiquement.'
        },
        {
          question: 'Comment revenir à l\'écran « Sélectionner un modèle » ?',
          answer: 'Par défaut, ECHO n\'ouvre plus automatiquement un modèle au premier chargement. Si vous souhaitez repartir d\'un état vierge, utilisez l\'URL avec ?reset=1 (ex. https://.../index.html?reset=1).' 
        },
        {
          question: 'Comment revenir aux valeurs par défaut ?',
          answer: 'Utilisez le bouton Réinitialiser dans l\'éditeur. Il recharge le modèle sélectionné, restaure les valeurs d\'exemple et efface les champs personnalisés.'
        },
        {
          question: 'Puis-je travailler sans connexion ?',
          answer: 'Oui. Tous les traitements se font dans votre navigateur et les données restent locales.'
        }
      ]
    },
    troubleshooting: {
      heading: 'Dépannage express',
      items: [
        {
          title: 'Le popup ne montre pas les nouvelles valeurs',
          steps: [
            'Fermez puis rouvrez le popup pour déclencher une synchronisation complète.',
            'Vérifiez que vous n\'êtes pas sur un onglet inactif qui bloquerait les BroadcastChannels (certains navigateurs limitent la communication).',
            'Rechargez la page avec ⇧ + ⌘ + R (Mac) ou ⇧ + Ctrl + R (Windows) pour repartir d\'un état propre.'
          ]
        },
        {
          title: 'Le bouton “Ouvrir dans un courriel” ne fait rien',
          steps: [
            'Confirmez qu\'un modèle est sélectionné. Le bouton s\'active uniquement quand un contenu final est disponible.',
            'Certaines organisations bloquent les liens `mailto:`. Dans ce cas, utilisez « Copier Tout » puis collez manuellement dans votre client de messagerie.',
            'Si rien ne se produit, vérifiez que vous avez un client de messagerie par défaut configuré dans Windows (Paramètres > Applications > Applications par défaut > E-mail).'
          ]
        }
      ]
    },
    resources: {
      heading: 'Ressources utiles',
      links: []
    },
    contact: {
      heading: 'Besoin d\'un coup de main ?',
      description: 'Choisissez ce qui décrit le mieux votre demande et envoyez-nous un court message.',
      options: [
        {
          value: 'support',
          label: 'Support',
          helper: 'Accès, permissions ou fonctionnement général',
          messageLabel: 'Décrivez la situation',
          placeholder: 'Expliquez ce dont vous avez besoin, les personnes impliquées et les échéances.'
        },
        {
          value: 'glitch',
          label: 'Glitch / bogue',
          helper: 'Fonctionnalité en panne ou comportement étrange',
          messageLabel: 'Que s\'est-il produit ?',
          placeholder: 'Ajoutez les étapes pour reproduire, le navigateur utilisé et tout message d\'erreur.'
        },
        {
          value: 'improvement',
          label: 'Amélioration / idée',
          helper: 'Partagez une idée ou une optimisation pour ECHO',
          messageLabel: 'Quelle est votre suggestion ?',
          placeholder: 'Décrivez l\'amélioration souhaitée et l\'impact attendu.'
        },
        {
          value: 'template',
          label: 'Soumettre un modèle',
          helper: 'Envoyez un modèle à réviser ou à publier',
          messageLabel: 'Présentez votre modèle',
          placeholder: 'Résumé, ton, contexte d\'utilisation et points à surveiller.',
          extraField: {
            label: 'Lien vers le fichier ou SharePoint (facultatif)',
            placeholder: 'Collez un lien vers Teams, OneDrive ou SharePoint.'
          }
        }
      ],
      form: {
        nameLabel: 'Nom complet',
  namePlaceholder: 'Ex. Jeanne Tremblay',
    emailLabel: 'Courriel professionnel',
  emailPlaceholder: 'prenom.nom@moncourriel.com',
        messageLabelFallback: 'Message',
        optional: '(facultatif)',
        submit: 'Envoyer la demande',
        submitting: 'Envoi en cours…',
        successTitle: 'Merci !',
        successMessage: 'Votre message a été transmis à l\'équipe. Nous vous répondrons sous deux jours ouvrables.',
        sendAnother: 'Envoyer une autre demande',
  errorTitle: 'Oups…',
        errorMessage: (email) => `Impossible d\'envoyer pour le moment. Réessayez plus tard ou écrivez-nous à ${email}.`,
        validation: {
          nameRequired: 'Indiquez votre nom.',
          emailRequired: 'Entrez un courriel valide.',
          messageRequired: 'Merci d\'ajouter quelques détails.'
        },
        extraHelp: 'Pour les soumissions de modèles, joignez un lien accessible si possible.'
      },
      close: 'Fermer le centre d\'aide'
    }
  },
  en: {
    title: 'Help Centre',
    subtitle: 'Get answers fast for ECHO',
    quickStart: {
      heading: 'Quick start',
      description: 'Follow these steps to produce a ready-to-send message in under a minute.',
      bullets: [
        'Pick a template from the left rail. Use search and category filters to narrow the list.',
        'Add your details: type directly in the Subject and Message areas or open the Variables popout for real-time updates.',
        'Copy the result (subject, body, or everything) or launch Outlook when you\'re happy with the message.'
      ]
    },
    sections: {
      variables: {
        heading: 'Variables & pills',
        points: [
          'Variables render as pills inside Subject and Body. Click or type to change values.',
          'Pills show live values. You should not see "<>"; if you do, ensure the variable exists and wasn\'t removed.',
          'Use the Variables panel to view/edit all values at once; syncing is bidirectional.'
        ]
      },
      popout: {
        heading: 'Detached window (popout)',
        points: [
          'Open Variables in a separate window to work side-by-side.',
          'When opening, values are extracted immediately from the Subject and Body (via the pills).',
          'Edits reflect both ways automatically using BroadcastChannel.'
        ]
      },
      copying: {
        heading: 'Copying & Sending',
        points: [
          'Copy Subject / Copy Body / Copy All buttons include your current values and preserve rich formatting (bold, highlights, etc.).',
          'The "Open in an email" button generates a mailto link that opens your default email client (Outlook, Gmail, etc.) and pre-fills the subject and body with plain text.',
          'Important: Rich formatting is lost when using the mailto button. To preserve bold, colors, and highlights, use "Copy All" and paste into your preferred client.',
          'The direct-link icon includes id & language in the URL to share the template with colleagues.'
        ]
      },
      favorites: {
        heading: 'Favorites',
        points: [
          'Click the star to favorite a template. The icon turns gold when favorited and very light when not.',
          'Turn on “Show only favorites” to filter the list.',
          'Favorites are stored locally in your browser.'
        ]
      },
      shortcuts: {
        heading: 'Keyboard shortcuts',
        items: [
          ['Ctrl/Cmd + Enter', 'Copy all'],
          ['Ctrl/Cmd + B', 'Copy body'],
          ['Ctrl/Cmd + J', 'Copy subject'],
          ['Ctrl/Cmd + Shift + Enter', 'Open in an email'],
          ['Ctrl/Cmd + /', 'Focus search'],
          ['Ctrl/Cmd + R (Variables)', 'Reset to examples'],
          ['Ctrl/Cmd + Shift + V (Variables)', 'Smart paste var: value']
        ]
      },
      privacy: {
        heading: 'Privacy & storage',
        points: [
          'Everything runs locally in your browser. No data is sent to a server unless you submit the contact form.',
          'Preferences (languages, favorites, etc.) and in-progress variables are saved in local storage.',
          'Export your JSON templates to back up or share edits.'
        ]
      }
    },
    faq: {
      heading: 'Frequently asked questions',
      items: [
        {
          question: 'How do I keep the Variables popout visible?',
          answer: 'Click the pin icon. When it\'s active, the panel stays open even if you interact elsewhere in the app.'
        },
        {
          question: 'Does the popout always match the main editors?',
          answer: 'Yes. Opening the popout triggers an immediate sync that extracts the current subject and body. Text edits are auto-detected and reflected back.'
        },
        {
          question: 'How do I get back to “Select a template”?',
          answer: 'By default, ECHO no longer auto-opens a template on first load. To start fresh, use the URL with ?reset=1 (e.g., https://.../index.html?reset=1).'
        },
        {
          question: 'How do I restore default example values?',
          answer: 'Use the Reset button in the editor. It reloads the selected template, restores example values, and clears custom text fields.'
        },
        {
          question: 'Can I work offline?',
          answer: 'Absolutely. Everything runs in your browser and data stays local.'
        }
      ]
    },
    troubleshooting: {
      heading: 'Troubleshooting checklist',
      items: [
        {
          title: 'Popout is missing recent edits',
          steps: [
            'Close and reopen the popout to force a full refresh.',
            'Make sure the tab stays active—some browsers pause BroadcastChannels in background tabs.',
            'Hard reload with ⇧ + ⌘ + R (Mac) or ⇧ + Ctrl + R (Windows) to clear cached state.'
          ]
        },
        {
          title: '"Open in an email" button does nothing',
          steps: [
            'Confirm that a template is selected. The button is enabled only when final content is available.',
            'Some organizations block `mailto:` links. If that\'s the case, use "Copy All" and paste into your email client manually.',
            'If nothing happens, check that you have a default email client configured in Windows (Settings > Apps > Default apps > Email).'
          ]
        }
      ]
    },
    resources: {
      heading: 'Helpful resources',
      links: []
    },
    contact: {
      heading: 'Need something else?',
      description: 'Pick the option that fits best and send us a quick note.',
      options: [
        {
          value: 'support',
          label: 'Support',
          helper: 'Access, permissions, or general guidance',
          messageLabel: 'Tell us what you need',
          placeholder: 'Share the context, people involved, and any deadlines.'
        },
        {
          value: 'glitch',
          label: 'Glitch',
          helper: 'Broken feature or unexpected behaviour',
          messageLabel: 'What happened?',
          placeholder: 'List the steps to reproduce, browser used, and any error messages.'
        },
        {
          value: 'improvement',
          label: 'Improvement / suggestion',
          helper: 'Share an idea to make ECHO better',
          messageLabel: 'What would you improve?',
          placeholder: 'Describe the enhancement and the impact you expect.'
        },
        {
          value: 'template',
          label: 'Submit a template',
          helper: 'Send a new template or a modification',
          messageLabel: 'Describe your template',
          placeholder: 'Summarize tone, audience, context, and any review notes.',
          extraField: {
            label: 'Link to files or SharePoint (optional)',
            placeholder: 'Paste a Teams, OneDrive, or SharePoint link.'
          }
        }
      ],
      form: {
        nameLabel: 'Full name',
  namePlaceholder: 'e.g. Jordan Lee',
    emailLabel: 'Work email',
  emailPlaceholder: 'firstname.lastname@myemail.com',
        messageLabelFallback: 'Message',
        optional: '(optional)',
        submit: 'Send request',
        submitting: 'Sending…',
        successTitle: 'Thanks!',
        successMessage: 'Your message is on its way. We usually respond within two business days.',
        sendAnother: 'Send another request',
  errorTitle: 'Uh-oh…',
        errorMessage: (email) => `We couldn\'t send your message. Try again later or reach us at ${email}.`,
        validation: {
          nameRequired: 'Please share your name.',
          emailRequired: 'Enter a valid email address.',
          messageRequired: 'Add a few details so we can help.'
        },
        extraHelp: 'For template submissions, include a link we can open if possible.'
      },
      close: 'Close help centre'
    }
  }
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg border border-[#bfe7e3] bg-[#f0fbfb] text-[#145a64]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[#123a45]">{title}</h3>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
    </div>
  )
}

export default function HelpCenter({ language = 'fr', onClose, supportEmail = 'jskennedy80@gmail.com', contactEndpoint }) {
  const strings = useMemo(() => translations[language] || translations.fr, [language])
  const contactOptions = strings.contact?.options || []
  const closeBtnRef = useRef(null)
  const contactFormRef = useRef(null)
  const [query, setQuery] = useState('')
  
  // Check URL for initial category
  const initialCategory = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const cat = params.get('category')
      if (cat && contactOptions.some(opt => opt.value === cat)) {
        return cat
      }
    } catch {}
    return contactOptions[0]?.value || 'support'
  }, [contactOptions])
  
  const [formData, setFormData] = useState(() => ({
    category: initialCategory,
    name: '',
    email: '',
    message: '',
    extra: ''
  }))
  const [templateDetails, setTemplateDetails] = useState({
    templateType: 'new', // 'new' | 'modify'
    existingId: '',
    languages: { fr: false, en: false },
    titleFr: '',
    titleEn: '',
    category: '',
    audience: '',
    context: '',
    variablePlan: '',
    examples: '',
    deadline: ''
  })
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({})

  const submissionUrl = contactEndpoint || `https://formsubmit.co/ajax/${encodeURIComponent(supportEmail)}`
  const selectedCategory = contactOptions.find((option) => option.value === formData.category) || contactOptions[0] || null
  const isSubmitting = status === 'submitting'
  const feedbackMessage = status === 'success'
    ? strings.contact.form.successMessage
    : status === 'error'
      ? strings.contact.form.errorMessage(supportEmail)
      : ''

  useEffect(() => {
    if (!selectedCategory && contactOptions[0]) {
      setFormData((prev) => ({ ...prev, category: contactOptions[0].value }))
    }
  }, [selectedCategory, contactOptions])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      // If template category is pre-selected, scroll to contact form
      if (initialCategory === 'template' && contactFormRef.current) {
        setTimeout(() => {
          contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      } else {
        closeBtnRef.current?.focus()
      }
    })

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, initialCategory])

  const handleCategorySelect = (value) => {
    setFormData((prev) => ({ ...prev, category: value }))
    if (status !== 'idle') {
      setStatus('idle')
    }
  }

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    if (status !== 'idle') {
      setStatus('idle')
    }
  }

  const resetAfterSuccess = () => {
    setStatus('idle')
    setErrors({})
    setFormData((prev) => ({
      ...prev,
      message: '',
      extra: ''
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const validationErrors = {}
    if (!formData.name.trim()) {
      validationErrors.name = strings.contact.form.validation.nameRequired
    }
    const emailValue = formData.email.trim()
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      validationErrors.email = strings.contact.form.validation.emailRequired
    }
    if (!formData.message.trim()) {
      validationErrors.message = strings.contact.form.validation.messageRequired
    }

    // Additional validation for template submissions
    if (formData.category === 'template') {
      if (!templateDetails.languages.fr && !templateDetails.languages.en) {
        validationErrors.languages = language === 'fr'
          ? 'Choisissez au moins une langue (FR ou EN).'
          : 'Choose at least one language (FR or EN).'
      }
      if (!templateDetails.templateType) {
        validationErrors.templateType = language === 'fr' ? 'Sélectionnez le type.' : 'Select the type.'
      }
      if (templateDetails.templateType === 'modify' && !templateDetails.existingId.trim()) {
        validationErrors.existingId = language === 'fr' ? 'Indiquez l’ID ou le nom du modèle existant.' : 'Provide the existing template ID or name.'
      }
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setStatus('submitting')

    try {
      const payload = {
        category: formData.category,
        categoryLabel: selectedCategory?.label || formData.category,
        name: formData.name.trim(),
        email: emailValue,
        message: formData.message.trim(),
        extra: formData.extra.trim(),
        language,
        submittedAt: new Date().toISOString(),
        product: 'ECHO'
      }

      if (formData.category === 'template') {
        payload.templateDetails = {
          type: templateDetails.templateType,
          existingId: templateDetails.existingId || undefined,
          languages: Object.keys(templateDetails.languages).filter((k) => templateDetails.languages[k]),
          titleFr: templateDetails.titleFr || undefined,
          titleEn: templateDetails.titleEn || undefined,
          category: templateDetails.category || undefined,
          audience: templateDetails.audience || undefined,
          context: templateDetails.context || undefined,
          variablePlan: templateDetails.variablePlan || undefined,
          examples: templateDetails.examples || undefined,
          deadline: templateDetails.deadline || undefined
        }
      }

      // Try to submit via fetch (works if custom endpoint is configured or formsubmit.co is verified)
      const response = await fetch(submissionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`)
      }

      setStatus('success')
      setErrors({})
      setFormData((prev) => ({
        ...prev,
        message: '',
        extra: ''
      }))
      setTemplateDetails({
        templateType: 'new',
        existingId: '',
        languages: { fr: false, en: false },
        titleFr: '',
        titleEn: '',
        category: '',
        audience: '',
        context: '',
        variablePlan: '',
        examples: '',
        deadline: ''
      })
    } catch (error) {
      console.error('Contact form submission failed, using mailto fallback:', error)
      
      // Fallback: Open mailto link with the form data
      const subject = `ECHO ${formData.category}: ${formData.name}`
      const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nCategory: ${formData.category}\n\nMessage:\n${formData.message}\n\n${formData.extra ? `Additional info:\n${formData.extra}\n\n` : ''}${formData.category === 'template' ? `\nTemplate Details:\nType: ${templateDetails.templateType}\nLanguages: ${Object.keys(templateDetails.languages).filter(k => templateDetails.languages[k]).join(', ')}\nTitle (FR): ${templateDetails.titleFr}\nTitle (EN): ${templateDetails.titleEn}\n` : ''}`
      
      const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      
      // Open mailto link - use location.href for better compatibility
      window.location.href = mailtoUrl
      
      // Don't set error status - the mailto link will handle it
      // Set success after a short delay to give the mailto time to trigger
      setTimeout(() => {
        setStatus('success')
        setErrors({})
        setFormData((prev) => ({
          ...prev,
          message: '',
          extra: ''
        }))
        setTemplateDetails({
          templateType: 'new',
          existingId: '',
          languages: { fr: false, en: false },
          titleFr: '',
          titleEn: '',
          category: '',
          audience: '',
          context: '',
          variablePlan: '',
          examples: '',
          deadline: ''
        })
      }, 100)
    }
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-centre-title"
        className="relative z-10 flex w-full max-w-4xl flex-col border-0 bg-white/95 shadow-2xl"
        style={{ borderRadius: '18px', height: '88vh', maxHeight: '88vh' }}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div>
            {/* Removed small brand title "Email Assistant" as requested */}
            <CardTitle id="help-centre-title" className="text-2xl font-bold text-[#0f2c33]">
              {strings.title}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-600">{strings.subtitle}</p>
          </div>
          <Button
            ref={closeBtnRef}
            variant="ghost"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900"
            aria-label={strings.contact.close}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 pt-0" style={{ minHeight: 0 }}>
          <ScrollArea className="h-full w-full pr-2">
            <div className="space-y-8 pb-4">
              <div className="flex flex-col gap-3 rounded-xl border border-[#e6eef5] bg-white/70 p-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                  <a href="#quickstart" className="rounded-full bg-[#f0fbfb] px-3 py-1 font-semibold text-[#145a64] hover:underline">{strings.quickStart.heading}</a>
                  {strings.sections?.variables ? (
                    <a href="#variables" className="rounded-full bg-[#f0fbfb] px-3 py-1 font-semibold text-[#145a64] hover:underline">{strings.sections.variables.heading}</a>
                  ) : null}
                  {strings.sections?.popout ? (
                    <a href="#popout" className="rounded-full bg-[#f0fbfb] px-3 py-1 font-semibold text-[#145a64] hover:underline">{strings.sections.popout.heading}</a>
                  ) : null}
                  {strings.sections?.copying ? (
                    <a href="#copying" className="rounded-full bg-[#f0fbfb] px-3 py-1 font-semibold text-[#145a64] hover:underline">{strings.sections.copying.heading}</a>
                  ) : null}
                  {strings.sections?.favorites ? (
                    <a href="#favorites" className="rounded-full bg-[#f0fbfb] px-3 py-1 font-semibold text-[#145a64] hover:underline">{strings.sections.favorites.heading}</a>
                  ) : null}
                  {strings.sections?.shortcuts ? (
                    <a href="#shortcuts" className="rounded-full bg-[#f0fbfb] px-3 py-1 font-semibold text-[#145a64] hover:underline">{strings.sections.shortcuts.heading}</a>
                  ) : null}
                  {strings.sections?.privacy ? (
                    <a href="#privacy" className="rounded-full bg-[#f0fbfb] px-3 py-1 font-semibold text-[#145a64] hover:underline">{strings.sections.privacy.heading}</a>
                  ) : null}
                </div>
                <div className="md:w-60">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={language === 'fr' ? "Rechercher dans l'aide…" : 'Search the help…'}
                  />
                </div>
              </div>
              <section id="quickstart">
                <SectionHeader
                  icon={Lightbulb}
                  title={strings.quickStart.heading}
                  description={strings.quickStart.description}
                />
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {strings.quickStart.bullets.map((item, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1f8a99]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
              {strings.sections?.variables ? (
                <section id="variables">
                  <SectionHeader icon={BookOpen} title={strings.sections.variables.heading} />
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {(strings.sections.variables.points || [])
                      .filter((p) => !query || p.toLowerCase().includes(query.toLowerCase()))
                      .map((p, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1f8a99]" aria-hidden="true" />
                          <span>{p}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}

              {strings.sections?.popout ? (
                <section id="popout">
                  <SectionHeader icon={ExternalLink} title={strings.sections.popout.heading} />
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {(strings.sections.popout.points || [])
                      .filter((p) => !query || p.toLowerCase().includes(query.toLowerCase()))
                      .map((p, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1f8a99]" aria-hidden="true" />
                          <span>{p}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}

              {strings.sections?.copying ? (
                <section id="copying">
                  <SectionHeader icon={Copy} title={strings.sections.copying.heading} />
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {(strings.sections.copying.points || [])
                      .filter((p) => !query || p.toLowerCase().includes(query.toLowerCase()))
                      .map((p, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1f8a99]" aria-hidden="true" />
                          <span>{p}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}

              {strings.sections?.favorites ? (
                <section id="favorites">
                  <SectionHeader icon={Star} title={strings.sections.favorites.heading} />
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {(strings.sections.favorites.points || [])
                      .filter((p) => !query || p.toLowerCase().includes(query.toLowerCase()))
                      .map((p, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1f8a99]" aria-hidden="true" />
                          <span>{p}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}

              <Separator className="bg-[#e6eef5]" />

              <section>
                <SectionHeader icon={BookOpen} title={strings.faq.heading} />
                <div className="mt-4 space-y-4">
                  {strings.faq.items
                    .filter((qa) => {
                      if (!query) return true
                      const q = query.toLowerCase()
                      return qa.question.toLowerCase().includes(q) || qa.answer.toLowerCase().includes(q)
                    })
                    .map((item, index) => (
                      <div key={index} className="rounded-lg border border-[#e1eff4] bg-[#f9feff] p-4 shadow-sm">
                        <p className="font-semibold text-[#124a52]">{item.question}</p>
                        <p className="mt-2 text-sm text-slate-700">{item.answer}</p>
                      </div>
                    ))}
                </div>
              </section>

              <Separator className="bg-[#e6eef5]" />

              <section>
                <SectionHeader icon={AlertTriangle} title={strings.troubleshooting.heading} />
                <div className="mt-4 space-y-5">
                  {strings.troubleshooting.items
                    .filter((blk) => {
                      if (!query) return true
                      const q = query.toLowerCase()
                      return blk.title.toLowerCase().includes(q) || (blk.steps || []).some((s) => s.toLowerCase().includes(q))
                    })
                    .map((block, index) => (
                      <div key={index} className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-[#92400e]">{block.title}</h4>
                        <ul className="mt-3 space-y-1.5 text-sm text-[#78350f]">
                          {block.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#f59e0b]" aria-hidden="true" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              </section>

              <Separator className="bg-[#e6eef5]" />

              {strings.sections?.shortcuts ? (
                <section id="shortcuts">
                  <SectionHeader icon={Lightbulb} title={strings.sections.shortcuts.heading} />
                  <div className="mt-3 overflow-hidden rounded-lg border border-[#e6eef5]">
                    <div className="grid grid-cols-1 divide-y divide-[#e6eef5] text-sm md:grid-cols-2 md:divide-x md:divide-y-0">
                      {(strings.sections.shortcuts.items || [])
                        .filter(([combo, desc]) => {
                          if (!query) return true
                          const q = query.toLowerCase()
                          return combo.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
                        })
                        .map(([combo, desc], i) => (
                          <div key={i} className="flex items-center justify-between gap-3 p-3">
                            <span className="font-mono text-xs text-slate-700">{combo}</span>
                            <span className="text-slate-800">{desc}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </section>
              ) : null}

              {strings.sections?.privacy ? (
                <section id="privacy">
                  <SectionHeader icon={Shield} title={strings.sections.privacy.heading} />
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {(strings.sections.privacy.points || [])
                      .filter((p) => !query || p.toLowerCase().includes(query.toLowerCase()))
                      .map((p, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1f8a99]" aria-hidden="true" />
                          <span>{p}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}

              <Separator className="bg-[#e6eef5]" />

              <section>
                {Array.isArray(strings.resources?.links) && strings.resources.links.length > 0 ? (
                  <>
                    <SectionHeader icon={MessageCircle} title={strings.resources.heading} />
                    <ul className="mt-4 grid gap-2 text-sm text-[#145a64] md:grid-cols-2">
                      {strings.resources.links.map((link) => (
                        <li key={link.href}>
                          <a
                            className="group inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 transition-colors duration-150 hover:border-[#bfe7e3] hover:bg-[#f0fbfb]"
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-[#1f8a99] transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                            <span>{link.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </section>

              <Separator className="bg-[#e6eef5]" />

              <section ref={contactFormRef} className="rounded-2xl border border-[#bfe7e3] bg-[#f5fffb] p-6">
                <div className="flex items-center gap-2 text-[#145a64]">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                  <h3 className="text-lg font-semibold">{strings.contact.heading}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-700">{strings.contact.description}</p>

                <form onSubmit={handleSubmit} className="mt-4 space-y-5" noValidate>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {contactOptions.map((option) => {
                      const isActive = formData.category === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`group flex flex-col rounded-xl border px-3 py-3 text-left transition-all duration-200 ${isActive ? 'border-[#1f8a99] bg-white shadow-md' : 'border-transparent bg-white/60 hover:border-[#bfe7e3] hover:bg-white'}`}
                          aria-pressed={isActive}
                          onClick={() => handleCategorySelect(option.value)}
                        >
                          <span className="font-semibold text-[#0f4c55]">{option.label}</span>
                          <span className="mt-1 text-xs text-slate-600">{option.helper}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      <span>{strings.contact.form.nameLabel}</span>
                      <Input
                        value={formData.name}
                        onChange={handleFieldChange('name')}
                        placeholder={strings.contact.form.namePlaceholder}
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name ? (
                        <span className="text-xs font-normal text-red-600">{errors.name}</span>
                      ) : null}
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      <span>{strings.contact.form.emailLabel}</span>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={handleFieldChange('email')}
                        placeholder={strings.contact.form.emailPlaceholder}
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email ? (
                        <span className="text-xs font-normal text-red-600">{errors.email}</span>
                      ) : null}
                    </label>
                  </div>

                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    <span>{selectedCategory?.messageLabel || strings.contact.form.messageLabelFallback}</span>
                    <Textarea
                      value={formData.message}
                      onChange={handleFieldChange('message')}
                      placeholder={selectedCategory?.placeholder || ''}
                      rows={5}
                      aria-invalid={Boolean(errors.message)}
                    />
                    {errors.message ? (
                      <span className="text-xs font-normal text-red-600">{errors.message}</span>
                    ) : null}
                  </label>

                  {formData.category === 'template' ? (
                    <div className="space-y-4 rounded-xl border border-[#e6eef5] bg-white p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Type de demande' : 'Request type'}</span>
                          <select
                            className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                            value={templateDetails.templateType}
                            onChange={(e) => setTemplateDetails((p) => ({ ...p, templateType: e.target.value }))}
                            aria-invalid={Boolean(errors.templateType)}
                          >
                            <option value="new">{language === 'fr' ? 'Nouveau modèle' : 'New template'}</option>
                            <option value="modify">{language === 'fr' ? 'Modification d\'un modèle' : 'Modification of existing'}</option>
                          </select>
                          {errors.templateType ? (
                            <span className="text-xs font-normal text-red-600">{errors.templateType}</span>
                          ) : null}
                        </label>

                        {templateDetails.templateType === 'modify' ? (
                          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                            <span>{language === 'fr' ? 'ID/nom du modèle existant' : 'Existing template ID/name'}</span>
                            <Input
                              value={templateDetails.existingId}
                              onChange={(e) => setTemplateDetails((p) => ({ ...p, existingId: e.target.value }))}
                              placeholder={language === 'fr' ? 'Ex. q002 – Avis de fermeture' : 'e.g. q002 – Closure notice'}
                              aria-invalid={Boolean(errors.existingId)}
                            />
                            {errors.existingId ? (
                              <span className="text-xs font-normal text-red-600">{errors.existingId}</span>
                            ) : null}
                          </label>
                        ) : null}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <fieldset className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Langue de votre soumission' : 'Submission language'}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={templateDetails.languages.fr}
                                onChange={(e) => setTemplateDetails((p) => ({ ...p, languages: { ...p.languages, fr: e.target.checked } }))}
                              />
                              <span>FR</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={templateDetails.languages.en}
                                onChange={(e) => setTemplateDetails((p) => ({ ...p, languages: { ...p.languages, en: e.target.checked } }))}
                              />
                              <span>EN</span>
                            </label>
                          </div>
                          {errors.languages ? (
                            <span className="text-xs font-normal text-red-600">{errors.languages}</span>
                          ) : (
                            <span className="text-xs font-normal text-slate-500">{language === 'fr' ? 'Envoyez au moins en français ou en anglais.' : 'Submit in English or French at minimum.'}</span>
                          )}
                        </fieldset>

                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Catégorie suggérée' : 'Suggested category'}</span>
                          <Input
                            value={templateDetails.category}
                            onChange={(e) => setTemplateDetails((p) => ({ ...p, category: e.target.value }))}
                            placeholder={language === 'fr' ? 'Ex. Voyages, RH, IT' : 'e.g., Travel, HR, IT'}
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Titre FR' : 'Title (FR)'}</span>
                          <Input
                            value={templateDetails.titleFr}
                            onChange={(e) => setTemplateDetails((p) => ({ ...p, titleFr: e.target.value }))}
                            placeholder={language === 'fr' ? 'Intitulé côté FR (si connu)' : 'French title (if known)'}
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Titre EN' : 'Title (EN)'}</span>
                          <Input
                            value={templateDetails.titleEn}
                            onChange={(e) => setTemplateDetails((p) => ({ ...p, titleEn: e.target.value }))}
                            placeholder={language === 'fr' ? 'Titre anglais (si connu)' : 'English title (if known)'}
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Public visé' : 'Audience'}</span>
                          <Input
                            value={templateDetails.audience}
                            onChange={(e) => setTemplateDetails((p) => ({ ...p, audience: e.target.value }))}
                            placeholder={language === 'fr' ? 'Ex. employés, gestionnaires, partenaires' : 'e.g., employees, managers, partners'}
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Contexte' : 'Context'}</span>
                          <Input
                            value={templateDetails.context}
                            onChange={(e) => setTemplateDetails((p) => ({ ...p, context: e.target.value }))}
                            placeholder={language === 'fr' ? 'Ex. annonce, rappel, incident' : 'e.g., announcement, reminder, incident'}
                          />
                        </label>
                      </div>

                      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                        <span>{language === 'fr' ? 'Où insérer les variables ?' : 'Where should variables go?'}</span>
                        <Textarea
                          rows={4}
                          value={templateDetails.variablePlan}
                          onChange={(e) => setTemplateDetails((p) => ({ ...p, variablePlan: e.target.value }))}
                          placeholder={language === 'fr'
                            ? 'Ex.: <<date_evenement>> dans l\'objet, <<nom_client>> au début du message, etc.'
                            : 'e.g., <<event_date>> in Subject, <<client_name>> at start of body, etc.'}
                        />
                        <span className="text-xs font-normal text-slate-500">{language === 'fr' ? 'Ajoutez ce que vous savez; nous compléterons si nécessaire.' : 'Add what you know; we can fill in the rest.'}</span>
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Exemples (valeurs connues)' : 'Examples (known values)'}</span>
                          <Textarea
                            rows={3}
                            value={templateDetails.examples}
                            onChange={(e) => setTemplateDetails((p) => ({ ...p, examples: e.target.value }))}
                            placeholder={language === 'fr' ? 'Ex.: date_evenement = 10-17 juin 2025' : 'e.g., event_date = June 10–17, 2025'}
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                          <span>{language === 'fr' ? 'Échéance (facultatif)' : 'Deadline (optional)'}</span>
                          <Input
                            value={templateDetails.deadline}
                            onChange={(e) => setTemplateDetails((p) => ({ ...p, deadline: e.target.value }))}
                            placeholder={language === 'fr' ? 'Ex.: d\'ici le 15 juin' : 'e.g., by June 15'}
                          />
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {selectedCategory?.extraField ? (
                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      <span>
                        {selectedCategory.extraField.label}{' '}
                        <span className="font-normal text-slate-500">{strings.contact.form.optional}</span>
                      </span>
                      <Input
                        value={formData.extra}
                        onChange={handleFieldChange('extra')}
                        placeholder={selectedCategory.extraField.placeholder}
                      />
                    </label>
                  ) : null}

                  {selectedCategory?.extraField && strings.contact.form.extraHelp ? (
                    <p className="text-xs text-slate-500">{strings.contact.form.extraHelp}</p>
                  ) : null}

                  {feedbackMessage ? (
                    <div
                      className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}
                    >
                      {status === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {status === 'success' ? strings.contact.form.successTitle : strings.contact.form.errorTitle}
                        </p>
                        <p className="mt-1">{feedbackMessage}</p>
                        {status === 'success' ? (
                          <button
                            type="button"
                            onClick={resetAfterSuccess}
                            className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#166f7b] hover:text-[#0f4c55]"
                          >
                            {strings.contact.form.sendAnother}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-[#1f8a99] px-5 py-2 text-white hover:bg-[#166f7b]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                      <span>{isSubmitting ? strings.contact.form.submitting : strings.contact.form.submit}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      className="text-[#145a64] hover:bg-[#f0fbfb]"
                    >
                      {strings.contact.close}
                    </Button>
                  </div>
                </form>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
