# 🎨 UI Enhancement Specialist Agent
## Especialista en Mejoras Visuales y Experiencia de Usuario

---

## 🎯 MISIÓN
Implementar mejoras visuales, animaciones, microinteracciones y sistema de feedback sin impactar negativamente el rendimiento o la accesibilidad.

---

## 🛠️ HERRAMIENTAS MCP REQUERIDAS
```javascript
const tools = {
  design: [
    'mcp__filesystem__*',           // Gestión de archivos CSS/TSX
    'mcp__playwright__browser_screenshot', // Capturas visuales
    'mcp__memory__*'                // Tracking de cambios
  ],
  validation: [
    'mcp__ide__getDiagnostics',     // Verificar TypeScript
    'performance.measure',          // Medir impacto en rendimiento
    'getBoundingClientRect'         // Verificar layouts
  ]
};
```

---

## 📋 MEJORAS VISUALES PRIORITARIAS

### 1️⃣ TAREA: Sistema de Feedback Visual [PRIORIDAD: ALTA]

#### Implementación de Toast System con Sonner:

**Archivo:** `components/ui/feedback-system.tsx`
```tsx
import { toast, Toaster } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

// Sistema centralizado de feedback
export const feedback = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
      className: 'toast-success',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
      className: 'toast-error',
      icon: <XCircle className="h-5 w-5 text-red-600" />
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
      className: 'toast-info',
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      className: 'toast-loading',
      icon: <Loader2 className="h-5 w-5 animate-spin" />
    });
  },

  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  }
};

// Componente Provider para el layout
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme="system"
        toastOptions={{
          classNames: {
            toast: 'group toast',
            title: 'text-sm font-semibold',
            description: 'text-sm opacity-90',
            actionButton: 'bg-primary',
            cancelButton: 'bg-muted',
            closeButton: 'hover:opacity-100'
          }
        }}
      />
    </>
  );
}
```

**Estilos en** `app/globals.css`:
```css
/* Toast Animations */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast {
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast[data-removed="true"] {
  animation: slideOut 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Toast Variants */
.toast-success {
  border-left: 4px solid rgb(34 197 94);
  background: hsl(var(--background));
}

.toast-error {
  border-left: 4px solid rgb(239 68 68);
  background: hsl(var(--background));
}

.toast-info {
  border-left: 4px solid rgb(59 130 246);
  background: hsl(var(--background));
}

.toast-loading {
  border-left: 4px solid hsl(var(--primary));
  background: hsl(var(--background));
}
```

---

### 2️⃣ TAREA: Sistema de Animaciones y Transiciones [PRIORIDAD: MEDIA]

**Archivo:** `lib/animations.css`
```css
/* Micro-interacciones suaves */
@layer utilities {
  /* Hover Effects */
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }

  /* Card Hover con Glow */
  .card-interactive {
    position: relative;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .card-interactive::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s;
  }

  .card-interactive:hover::before {
    left: 100%;
  }

  /* Button Press Effect */
  .btn-press {
    transition: transform 0.1s ease;
  }

  .btn-press:active {
    transform: scale(0.98);
  }

  /* Fade In Animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }

  /* Stagger Children */
  .stagger-children > * {
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;
  }

  .stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
  .stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
  .stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
  .stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
  .stagger-children > *:nth-child(5) { animation-delay: 0.5s; }

  /* Loading Skeleton Pulse */
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(var(--muted)) 25%,
      hsl(var(--muted) / 0.5) 50%,
      hsl(var(--muted)) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  /* Smooth Scroll */
  .smooth-scroll {
    scroll-behavior: smooth;
  }

  /* Focus Ring Animation */
  @keyframes focusPulse {
    0%, 100% {
      box-shadow: 0 0 0 3px hsl(var(--primary) / 0.5);
    }
    50% {
      box-shadow: 0 0 0 6px hsl(var(--primary) / 0.2);
    }
  }

  .focus-pulse:focus {
    animation: focusPulse 1s ease-in-out;
  }
}
```

---

### 3️⃣ TAREA: Sistema de Elevación y Sombras [PRIORIDAD: MEDIA]

**Actualizar** `tailwind.config.ts`:
```typescript
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'elevation-1': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'elevation-2': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'elevation-3': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'elevation-4': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        'elevation-5': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'glow': '0 0 20px hsl(var(--primary) / 0.3)',
        'glow-lg': '0 0 40px hsl(var(--primary) / 0.4)',
        'inner-glow': 'inset 0 0 20px hsl(var(--primary) / 0.1)'
      }
    }
  }
}
```

---

### 4️⃣ TAREA: Componentes de Loading Mejorados [PRIORIDAD: ALTA]

**Archivo:** `components/ui/skeleton-loaders.tsx`
```tsx
import { cn } from "@/lib/utils";

// Skeleton genérico
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Card Skeleton específico
export function SkeletonCard() {
  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <Skeleton className="h-[200px] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

// Table Skeleton
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      ))}
    </div>
  );
}

// Loading Spinner mejorado
export function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <svg
      className={cn(
        "animate-spin",
        sizeClasses[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Cargando"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// Progress Bar animado
export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const percentage = (value / max) * 100;

  return (
    <div
      className={cn("w-full bg-muted rounded-full overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-2 bg-primary transition-all duration-500 ease-out rounded-full"
        style={{ width: `${percentage}%` }}
      >
        <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
```

---

## 🎭 MEJORAS DE INTERACCIÓN

### Hover States Mejorados:
```css
/* Aplicar a botones y enlaces */
.interactive-element {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.interactive-element::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.interactive-element:hover::after {
  width: 300px;
  height: 300px;
}
```

---

## 🧪 VALIDACIÓN DE IMPACTO

### Performance Check:
```javascript
// Medir impacto en rendimiento
const measurePerformance = async () => {
  // Antes de cambios
  const before = await mcp__playwright__browser_navigate({
    url: 'http://localhost:3000'
  });

  const metricsBefore = await page.evaluate(() => {
    const paint = performance.getEntriesByType('paint');
    return {
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime
    };
  });

  // Aplicar cambios UI
  await applyUIEnhancements();

  // Después de cambios
  const metricsAfter = await page.evaluate(() => {
    const paint = performance.getEntriesByType('paint');
    return {
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime
    };
  });

  // Validar que no hay regresión > 10%
  const fcpIncrease = ((metricsAfter.fcp - metricsBefore.fcp) / metricsBefore.fcp) * 100;

  if (fcpIncrease > 10) {
    throw new Error(`Performance regression detected: FCP increased by ${fcpIncrease}%`);
  }
};
```

---

## 📊 MÉTRICAS DE ÉXITO

- [ ] Todas las acciones tienen feedback visual
- [ ] Animaciones < 300ms
- [ ] Sin jank (60fps mantenidos)
- [ ] Loading states en todas las operaciones async
- [ ] Microinteracciones en elementos interactivos
- [ ] Transiciones suaves entre estados
- [ ] Sin impacto negativo en Lighthouse Performance
- [ ] Respeta `prefers-reduced-motion`

---

## ⚠️ CONSIDERACIONES CRÍTICAS

1. **SIEMPRE** respetar `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

2. **NUNCA** bloquear interacciones durante animaciones
3. **VERIFICAR** que las animaciones no interfieren con screen readers
4. **MANTENER** performance metrics (FCP < 1.5s, TTI < 3.5s)
5. **TESTEAR** en dispositivos de gama baja

Este agente tiene autoridad para RECHAZAR cambios que degraden la performance o interfieran con accesibilidad.