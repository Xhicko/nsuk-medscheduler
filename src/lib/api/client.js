export function getApiErrorMessage(error, fallback = 'Operation failed') {
  try {
    const msg = error?.response?.data?.error || error?.response?.data?.message
    if (msg && typeof msg === 'string') return msg
    if (error?.message) return error.message
  } catch {}
  return fallback
}
