export const normalizeVarKey = (name) => {
  if (!name) return ''
  const trimmed = String(name ?? '').trim()
  if (!trimmed) return ''
  const lowered = trimmed.toLowerCase()
  return lowered.replace(/_(fr|en)$/i, '')
}

export const varKeysMatch = (a, b) => {
  if (!a || !b) return false
  return normalizeVarKey(a) === normalizeVarKey(b)
}
