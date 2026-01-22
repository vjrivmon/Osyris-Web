'use client'

import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldTooltipProps {
  /** ID for the label's htmlFor attribute */
  htmlFor?: string
  /** The label text */
  label: string
  /** The tooltip content explaining the field */
  tooltip: string
  /** Whether the field is required */
  required?: boolean
  /** Additional class names for the container */
  className?: string
  /** Additional class names for the label */
  labelClassName?: string
}

/**
 * A form field label with an integrated tooltip icon.
 * The tooltip is accessible via keyboard navigation.
 *
 * @example
 * <FormFieldTooltip
 *   htmlFor="dni"
 *   label="DNI/NIE"
 *   tooltip="Documento Nacional de Identidad del educando"
 * />
 */
export function FormFieldTooltip({
  htmlFor,
  label,
  tooltip,
  required = false,
  className,
  labelClassName,
}: FormFieldTooltipProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
        {required && ' *'}
      </Label>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger
            type="button"
            className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`Informacion sobre ${label}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs text-sm"
          >
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

/**
 * Standalone tooltip icon that can be placed next to any element.
 * Useful when you need more flexibility in layout.
 *
 * @example
 * <div className="flex items-center gap-1">
 *   <Label>Campo</Label>
 *   <FieldInfoTooltip tooltip="Explicacion del campo" />
 * </div>
 */
export function FieldInfoTooltip({
  tooltip,
  label,
  className,
}: {
  tooltip: string
  label?: string
  className?: string
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            className
          )}
          aria-label={label ? `Informacion sobre ${label}` : 'Mas informacion'}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-sm"
        >
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
