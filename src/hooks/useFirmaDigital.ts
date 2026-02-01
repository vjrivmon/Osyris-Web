import { useState, useRef, useCallback } from 'react'

interface FirmaDigitalCanvasRef {
  clear: () => void
  toDataURL: () => string
  isEmpty: () => boolean
}

export function useFirmaDigital() {
  const canvasRef = useRef<FirmaDigitalCanvasRef>(null)
  const [firmaBase64, setFirmaBase64] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const handleChange = useCallback((firma: string | null) => {
    setFirmaBase64(firma)
    setIsValid(!!firma)
  }, [])

  const clear = useCallback(() => {
    canvasRef.current?.clear()
    setFirmaBase64(null)
    setIsValid(false)
  }, [])

  const saveToLocal = useCallback(() => {
    if (firmaBase64) {
      try {
        localStorage.setItem('firma_backup', firmaBase64)
      } catch { /* ignore */ }
    }
  }, [firmaBase64])

  const restoreFromLocal = useCallback((): string | null => {
    try {
      return localStorage.getItem('firma_backup')
    } catch {
      return null
    }
  }, [])

  return { canvasRef, firmaBase64, isValid, handleChange, clear, saveToLocal, restoreFromLocal }
}
