"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Bold,
  Italic,
  Link,
  List,
  Quote,
  Code,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Eye,
  Edit3,
  SplitSquareHorizontal,
  Save,
  Timer,
  Type,
  Loader2
} from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSave?: () => void
  onImageInsert?: () => void
  autoSave?: boolean
  saving?: boolean
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escribe tu contenido en Markdown...",
  onSave,
  onImageInsert,
  autoSave = true,
  saving = false,
  className = ""
}: MarkdownEditorProps) {
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && onSave && value.length > 0) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }

      autoSaveRef.current = setTimeout(() => {
        onSave()
        setLastSaved(new Date())
      }, 30000) // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [value, autoSave, onSave])

  // Update word and character counts
  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0
    const chars = value.length
    setWordCount(words)
    setCharCount(chars)
  }, [value])

  // Insert text at cursor position
  const insertAtCursor = (insertText: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const textBefore = value.substring(0, start)
    const textAfter = value.substring(end)
    const newValue = textBefore + insertText + textAfter

    onChange(newValue)

    // Set cursor after inserted text
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + insertText.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  // Wrap selected text or insert at cursor
  const wrapText = (before: string, after: string = before) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textBefore = value.substring(0, start)
    const textAfter = value.substring(end)

    let newText: string
    if (selectedText) {
      newText = textBefore + before + selectedText + after + textAfter
    } else {
      newText = textBefore + before + after + textAfter
    }

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newStart = start + before.length
      const newEnd = selectedText ? newStart + selectedText.length : newStart
      textarea.setSelectionRange(newStart, newEnd)
    }, 0)
  }

  // Quick format buttons handlers
  const handleBold = () => wrapText('**')
  const handleItalic = () => wrapText('*')
  const handleCode = () => wrapText('`')
  const handleQuote = () => insertAtCursor('\n> ')
  const handleList = () => insertAtCursor('\n- ')
  const handleH1 = () => insertAtCursor('\n# ')
  const handleH2 = () => insertAtCursor('\n## ')
  const handleH3 = () => insertAtCursor('\n### ')

  const handleLink = () => {
    const url = prompt('Ingresa la URL:')
    const text = prompt('Texto del enlace (opcional):')
    if (url) {
      insertAtCursor(`[${text || 'enlace'}](${url})`)
    }
  }

  // Drag and drop functionality
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    // Handle file drops here if needed
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // Process files - this would integrate with your file upload system
      console.log('Files dropped:', files)
    }
  }

  // Enhanced markdown renderer
  const renderMarkdown = (content: string) => {
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-red-900 dark:text-red-100">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-4 text-red-800 dark:text-red-200">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-3 text-red-700 dark:text-red-300">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-medium mb-2 text-red-600 dark:text-red-400">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-red-900 dark:text-red-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-red-100 dark:bg-red-900 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\s*("([^"]*)")?\)/g, '<img src="$2" alt="$1" title="$4" class="max-w-full h-auto rounded-lg shadow-md my-4" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-red-600 hover:text-red-800 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-red-500 pl-4 italic text-muted-foreground bg-red-50 dark:bg-red-950 p-3 rounded-r-lg my-4">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l|b|i|a|c])(.+)$/gm, '<p class="mb-4">$1</p>')
      .replace(/<li>/g, '<ul class="list-disc list-inside space-y-1 mb-4 pl-4"><li>')
      .replace(/<\/li>(?=(?:(?!<li>).)*$)/g, '</li></ul>')
  }

  // Toolbar component
  const Toolbar = () => (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
      <div className="flex items-center gap-1 border-r border-red-200 dark:border-red-800 pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBold}
          className="h-8 w-8 p-0"
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          className="h-8 w-8 p-0"
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCode}
          className="h-8 w-8 p-0"
          title="Código"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-red-200 dark:border-red-800 pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleH1}
          className="h-8 w-8 p-0"
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleH2}
          className="h-8 w-8 p-0"
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleH3}
          className="h-8 w-8 p-0"
          title="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-red-200 dark:border-red-800 pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleList}
          className="h-8 w-8 p-0"
          title="Lista"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleQuote}
          className="h-8 w-8 p-0"
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLink}
          className="h-8 w-8 p-0"
          title="Enlace"
        >
          <Link className="h-4 w-4" />
        </Button>
        {onImageInsert && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onImageInsert}
            className="h-8 w-8 p-0"
            title="Insertar imagen"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {saving && (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Guardando...</span>
          </div>
        )}
        {lastSaved && !saving && (
          <div className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            <span>Guardado: {lastSaved.toLocaleTimeString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Type className="h-3 w-3" />
          <span>{wordCount} palabras · {charCount} caracteres</span>
        </div>
      </div>
    </div>
  )

  return (
    <Card className={`border-red-200 dark:border-red-800 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-red-900 dark:text-red-100">Editor de Contenido</CardTitle>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit" className="text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="split" className="text-xs">
                <SplitSquareHorizontal className="h-3 w-3 mr-1" />
                Dividido
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Vista Previa
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Toolbar />

        {isDragging && (
          <div className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-500 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
              <Badge variant="outline" className="text-blue-600">
                <ImageIcon className="h-4 w-4 mr-2" />
                Suelta los archivos aquí para insertarlos
              </Badge>
            </div>
          </div>
        )}

        <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} min-h-[600px]`}>
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`min-h-[600px] resize-none font-mono text-sm border-0 border-r border-red-200 dark:border-red-800 rounded-none transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            </div>
          )}

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="p-6 bg-white dark:bg-gray-950 overflow-y-auto">
              <div
                className="prose prose-sm max-w-none min-h-[550px]"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
              {value.length === 0 && (
                <div className="text-center text-muted-foreground py-20">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>La vista previa aparecerá aquí cuando escribas contenido</p>
                </div>
              )}
            </div>
          )}
        </div>

        {onSave && (
          <div className="p-4 border-t border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {autoSave ? (
                  <span>Auto-guardado activado cada 30 segundos</span>
                ) : (
                  <span>Recuerda guardar tus cambios</span>
                )}
              </div>
              <Button
                onClick={onSave}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}