/**
 * Frontend tests for the Admin Secciones page
 *
 * Tests:
 * - Admin secciones page renders section list
 * - "Terminar Ronda" button is present for authorized users
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the hooks used by the page
const mockToast = jest.fn()
const mockFetch = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, nombre: 'Admin', seccion_nombre: 'Rutas' },
    token: 'test-token-123',
    activeRole: 'admin',
  }),
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

jest.mock('@/lib/api-utils', () => ({
  apiEndpoint: (path: string) => `http://localhost:5000${path}`,
}))

// Mock the UI components to simplify rendering
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}))

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
}))

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  AlertDialogCancel: ({ children }: any) => <button>{children}</button>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}))

jest.mock('lucide-react', () => ({
  Users: () => <span>UsersIcon</span>,
  Save: () => <span>SaveIcon</span>,
  RefreshCw: () => <span>RefreshIcon</span>,
  ArrowRightLeft: () => <span>ArrowIcon</span>,
  AlertTriangle: () => <span>AlertIcon</span>,
  CheckCircle: () => <span>CheckIcon</span>,
  Flag: () => <span>FlagIcon</span>,
}))

// Import the page component after mocks are set up
import SeccionesAdminPage from '@/app/admin/secciones/page'

// Sample API response data
const mockRangosResponse = {
  success: true,
  data: [
    { id: 1, seccion_id: 1, edad_min: 6, edad_max: 8, activo: true, seccion_nombre: 'Castores', seccion_color: '#ff6600', seccion_icono: 'beaver' },
    { id: 2, seccion_id: 2, edad_min: 9, edad_max: 11, activo: true, seccion_nombre: 'Lobatos', seccion_color: '#ffcc00', seccion_icono: 'wolf' },
    { id: 3, seccion_id: 3, edad_min: 12, edad_max: 14, activo: true, seccion_nombre: 'Tropa', seccion_color: '#00cc00', seccion_icono: 'fleur' },
    { id: 4, seccion_id: 4, edad_min: 15, edad_max: 17, activo: true, seccion_nombre: 'Pioneros', seccion_color: '#cc0000', seccion_icono: 'mountain' },
    { id: 5, seccion_id: 5, edad_min: 18, edad_max: 20, activo: true, seccion_nombre: 'Rutas', seccion_color: '#006600', seccion_icono: 'backpack' },
  ],
}

const mockCalculoResponse = {
  success: true,
  data: {
    movidos: [
      { id: 10, nombre: 'Juan', apellidos: 'Garcia', edad_efectiva: 9, seccion_actual_id: 1, seccion_actual_nombre: 'Castores', seccion_nueva_id: 2, seccion_nueva_nombre: 'Lobatos' },
    ],
    sinCambio: [
      { id: 11, nombre: 'Maria', apellidos: 'Lopez', edad_efectiva: 7, seccion_actual_id: 1, seccion_actual_nombre: 'Castores', seccion_nueva_id: 1, seccion_nueva_nombre: 'Castores' },
    ],
    pendientesRutas: [],
    sinRango: [],
    ronda: { id: 1, fecha_fin: '2024-08-31' },
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  // Set up global fetch mock
  global.fetch = jest.fn((url: string) => {
    if (url.includes('/rangos')) {
      return Promise.resolve({
        json: () => Promise.resolve(mockRangosResponse),
      })
    }
    if (url.includes('/calcular-todos')) {
      return Promise.resolve({
        json: () => Promise.resolve(mockCalculoResponse),
      })
    }
    return Promise.resolve({
      json: () => Promise.resolve({ success: false }),
    })
  }) as jest.Mock
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('SeccionesAdminPage - renders section list', () => {
  test('renders the page title', async () => {
    render(<SeccionesAdminPage />)

    expect(screen.getByText('Gestión de Secciones')).toBeInTheDocument()
  })

  test('renders section names from API in the rangos table', async () => {
    render(<SeccionesAdminPage />)

    await waitFor(() => {
      // Use getAllByText since section names appear in both rangos table and calculo table
      expect(screen.getAllByText('Castores').length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.getAllByText('Lobatos').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Tropa').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Pioneros').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Rutas').length).toBeGreaterThanOrEqual(1)
  })

  test('renders Rangos de Edad table header', async () => {
    render(<SeccionesAdminPage />)

    await waitFor(() => {
      expect(screen.getByText('Rangos de Edad por Sección')).toBeInTheDocument()
    })
  })

  test('renders the educandos comparison section', async () => {
    render(<SeccionesAdminPage />)

    await waitFor(() => {
      expect(screen.getByText(/Secci.n Actual vs Calculada/i)).toBeInTheDocument()
    })
  })

  test('fetches rangos and calculo on mount', async () => {
    render(<SeccionesAdminPage />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/secciones/rangos',
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/secciones/calcular-todos',
        expect.any(Object)
      )
    })
  })
})

describe('SeccionesAdminPage - Terminar Ronda button', () => {
  test('renders "Terminar Ronda" button for admin users', async () => {
    render(<SeccionesAdminPage />)

    await waitFor(() => {
      const terminarButton = screen.getByText('Terminar Ronda')
      expect(terminarButton).toBeInTheDocument()
    })
  })

  test('renders Refrescar button', async () => {
    render(<SeccionesAdminPage />)

    expect(screen.getByText('Refrescar')).toBeInTheDocument()
  })
})
