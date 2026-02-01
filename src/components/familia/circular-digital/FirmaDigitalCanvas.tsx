'use client'

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import SignaturePad from 'signature_pad'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

interface FirmaDigitalCanvasProps {
  onChange: (firmaBase64: string | null) => void
  height?: number
  penColor?: string
  placeholder?: string
  disabled?: boolean
  minPoints?: number
}

export interface FirmaDigitalCanvasRef {
  clear: () => void
  toDataURL: () => string
  isEmpty: () => boolean
}

export const FirmaDigitalCanvas = forwardRef<FirmaDigitalCanvasRef, FirmaDigitalCanvasProps>(
  ({ onChange, height = 200, penColor = '#1a1a2e', placeholder = 'Firme aquí', disabled = false, minPoints = 30 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const padRef = useRef<SignaturePad | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isEmpty, setIsEmpty] = useState(true)

    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = container.offsetWidth * ratio
      canvas.height = height * ratio
      canvas.style.width = `${container.offsetWidth}px`
      canvas.style.height = `${height}px`
      
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(ratio, ratio)

      if (padRef.current) {
        padRef.current.clear()
        setIsEmpty(true)
        onChange(null)
      }
    }, [height, onChange])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const pad = new SignaturePad(canvas, {
        penColor,
        minWidth: 1,
        maxWidth: 3,
      })

      pad.addEventListener('endStroke', () => {
        const data = pad.toData()
        const totalPoints = data.reduce((acc, stroke) => acc + stroke.points.length, 0)
        const valid = totalPoints >= minPoints
        setIsEmpty(pad.isEmpty())
        onChange(valid ? pad.toDataURL() : null)
      })

      padRef.current = pad
      resizeCanvas()

      const observer = new ResizeObserver(() => resizeCanvas())
      if (containerRef.current) observer.observe(containerRef.current)

      return () => {
        pad.off()
        observer.disconnect()
      }
    }, [penColor, minPoints, onChange, resizeCanvas])

    useImperativeHandle(ref, () => ({
      clear: () => {
        padRef.current?.clear()
        setIsEmpty(true)
        onChange(null)
      },
      toDataURL: () => padRef.current?.toDataURL() || '',
      isEmpty: () => padRef.current?.isEmpty() ?? true,
    }))

    const handleClear = () => {
      padRef.current?.clear()
      setIsEmpty(true)
      onChange(null)
    }

    return (
      <div ref={containerRef} className="relative w-full">
        <canvas
          ref={canvasRef}
          className={`w-full border-2 rounded-lg cursor-crosshair touch-none ${
            !isEmpty ? 'border-green-400' : 'border-gray-300'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          style={{ height: `${height}px` }}
          data-testid="firma-canvas"
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-lg">{placeholder}</span>
          </div>
        )}
        {!isEmpty && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleClear}
          >
            <Eraser className="h-4 w-4 mr-1" /> Limpiar
          </Button>
        )}
      </div>
    )
  }
)

FirmaDigitalCanvas.displayName = 'FirmaDigitalCanvas'
