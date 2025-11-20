export const normalizeVarKey = (name) => {
  if (!name) return ''
  const trimmed = String(name ?? '').trim()
  if (!trimmed) return ''
  const lowered = trimmed.toLowerCase()
  const withoutSuffix = lowered.replace(/_(fr|en)$/i, '')
  return withoutSuffix.replace(/[^a-z0-9]+/g, '')
}

export const varKeysMatch = (a, b) => {
  if (!a || !b) return false
  return normalizeVarKey(a) === normalizeVarKey(b)
}

export const resolveVariableValue = (variables = {}, name = '', templateLanguage = 'fr') => {
  if (!variables || typeof variables !== 'object' || !name) return ''

  const safeName = String(name)
  const direct = variables[safeName]
  if (direct !== undefined && direct !== null) return String(direct)

  // Attempt case-insensitive direct lookup
  const lowerName = safeName.toLowerCase()
  if (lowerName !== safeName) {
    const lowerDirect = variables[lowerName]
    if (lowerDirect !== undefined && lowerDirect !== null) return String(lowerDirect)
  }

  const normalizedTarget = normalizeVarKey(safeName)
  if (!normalizedTarget) return ''

  const requestedSuffix = safeName.match(/_(fr|en)$/i)?.[1]?.toLowerCase() || null
  const preferredLang = (templateLanguage || 'fr').toLowerCase()
  let langMatch = null
  let baseMatch = null
  let anyMatch = null

  const debugMatches = []
  for (const [key, value] of Object.entries(variables)) {
    if (value === undefined || value === null) continue
    const normalizedKey = normalizeVarKey(key)
    if (normalizedKey === normalizedTarget) {
      debugMatches.push({ key, value: String(value).substring(0, 20), normalizedKey })
    }
    if (normalizedKey !== normalizedTarget) continue

    const keySuffix = key.match(/_(fr|en)$/i)?.[1]?.toLowerCase() || null
    const stringValue = String(value)

    if (requestedSuffix) {
      if (keySuffix === requestedSuffix) return stringValue
      if (!keySuffix && !baseMatch) baseMatch = stringValue
      continue
    }

    if (!keySuffix) {
      if (!baseMatch) baseMatch = stringValue
      continue
    }

    if (keySuffix === preferredLang && !langMatch) {
      langMatch = stringValue
    }

    if (!anyMatch) {
      anyMatch = stringValue
    }
  }

  return langMatch || baseMatch || anyMatch || ''
}
