'use client'

import { useState, useEffect } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, GripVertical, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableListProps<T = any> {
  contentId: number
  identificador: string
  seccion: string
  children?: string // JSON string desde API
  fallback?: T[] // Array de objetos por defecto
  render: (item: T, index: number) => React.ReactNode
  emptyItem: T // Template para nuevos items
  itemEditor?: (item: T, onChange: (item: T) => void, onDelete: () => void) => React.ReactNode
  className?: string
  addButtonText?: string
}

export function EditableList<T = any>({
  contentId,
  identificador,
  seccion,
  children,
  fallback = [],
  render,
  emptyItem,
  itemEditor,
  className,
  addButtonText = 'Añadir elemento'
}: EditableListProps<T>) {
  const { isEditMode, canEdit, addPendingChange } = useEditMode()
  const [items, setItems] = useState<T[]>([])
  const [isEditing, setIsEditing] = useState(false)

  // Hidratar items desde children (API) o fallback
  useEffect(() => {
    try {
      if (children && children.trim()) {
        const parsed = JSON.parse(children)
        setItems(Array.isArray(parsed) ? parsed : fallback)
      } else {
        setItems(fallback)
      }
    } catch (err) {
      console.error('Error parsing JSON for EditableList:', err)
      setItems(fallback)
    }
  }, [children, fallback])

  const handleAdd = () => {
    const newItems = [...items, emptyItem]
    setItems(newItems)
    registerChange(newItems)
  }

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    registerChange(newItems)
  }

  const handleUpdate = (index: number, updatedItem: T) => {
    const newItems = items.map((item, i) => (i === index ? updatedItem : item))
    setItems(newItems)
    registerChange(newItems)
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return
    }

    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]

    setItems(newItems)
    registerChange(newItems)
  }

  const registerChange = (newItems: T[]) => {
    addPendingChange({
      contentId,
      identificador,
      seccion,
      tipo: 'json',
      contenido: JSON.stringify(newItems)
    })
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const cancelEdit = () => {
    // Restaurar desde children o fallback
    try {
      if (children && children.trim()) {
        const parsed = JSON.parse(children)
        setItems(Array.isArray(parsed) ? parsed : fallback)
      } else {
        setItems(fallback)
      }
    } catch {
      setItems(fallback)
    }
    setIsEditing(false)
  }

  // Vista normal (no editable)
  if (!isEditMode || !canEdit) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={index}>{render(item, index)}</div>
        ))}
      </div>
    )
  }

  // Vista edición simple (sin editor personalizado)
  if (!isEditing) {
    return (
      <div className={cn('relative group', className)}>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index}>{render(item, index)}</div>
          ))}
        </div>

        {/* Botón para activar modo edición */}
        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={toggleEdit}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Editar lista
          </Button>
        </div>
      </div>
    )
  }

  // Vista edición avanzada
  return (
    <div className={cn('border-2 border-dashed border-primary rounded-lg p-4', className)}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative border rounded-lg p-4 bg-background"
          >
            {/* Controles de orden */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Button
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor personalizado o vista por defecto */}
            <div className="pl-8 pr-8">
              {itemEditor ? (
                itemEditor(item, (updated) => handleUpdate(index, updated), () => handleDelete(index))
              ) : (
                <div className="space-y-2">
                  <pre className="text-sm bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Botón eliminar */}
            <div className="absolute top-2 right-2">
              <Button
                onClick={() => handleDelete(index)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="mt-4 flex gap-2">
        <Button onClick={handleAdd} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {addButtonText}
        </Button>
        <Button onClick={toggleEdit} variant="ghost" size="sm" className="gap-2">
          <Check className="h-4 w-4" />
          Finalizar edición
        </Button>
        <Button onClick={cancelEdit} variant="ghost" size="sm" className="gap-2">
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {items.length} elemento{items.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
