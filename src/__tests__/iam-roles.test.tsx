/**
 * IAM Roles - Frontend Tests
 *
 * Tests for:
 * - ProtectedRoute renders children for correct role
 * - ProtectedRoute redirects for wrong role
 * - ProtectedRoute handles allowedRoles array
 * - ProtectedRoute superadmin bypass
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn()
  })
}))

// Mock the AuthContext
const mockUseAuth = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <span data-testid="icon-alert">AlertCircle</span>,
  Loader2: () => <span data-testid="icon-loader">Loader2</span>,
  Clock: () => <span data-testid="icon-clock">Clock</span>
}))

// Mock UI components to simplify rendering
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}))

// Import the component under test AFTER all mocks are set up
import { ProtectedRoute } from '@/components/auth/protected-route'

// Default auth state for authenticated superadmin
const defaultAuthState = {
  user: {
    id: 1,
    nombre: 'Admin',
    apellidos: 'Test',
    email: 'admin@test.com',
    rol: 'superadmin' as const,
    roles: ['superadmin'],
    activo: true
  },
  token: 'valid-token',
  isAuthenticated: true,
  isLoading: false,
  authReady: true,
  sessionExpired: false,
  sessionExpiredReason: null,
  login: jest.fn(),
  logout: jest.fn(),
  logoutWithReason: jest.fn(),
  refreshUser: jest.fn(),
  waitForAuthReady: jest.fn(),
  activeRole: 'superadmin',
  availableRoles: ['superadmin'],
  switchRole: jest.fn()
}

describe('ProtectedRoute - IAM Roles', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({ ...defaultAuthState })
  })

  // ============================================================
  // Renders children for correct role
  // ============================================================
  describe('renders children for correct role', () => {

    it('should render children when user has superadmin role and route requires superadmin', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { ...defaultAuthState.user, rol: 'superadmin', roles: ['superadmin'] }
      })

      render(
        <ProtectedRoute requiredRole="superadmin">
          <div data-testid="protected-content">Admin Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })

    it('should render children when user has kraal role and route allows kraal', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { ...defaultAuthState.user, rol: 'kraal', roles: ['kraal'] }
      })

      render(
        <ProtectedRoute allowedRoles={['superadmin', 'kraal']}>
          <div data-testid="protected-content">Kraal Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should render children when user has familia role and route allows familia', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { ...defaultAuthState.user, rol: 'familia', roles: ['familia'] }
      })

      render(
        <ProtectedRoute allowedRoles={['familia']}>
          <div data-testid="protected-content">Familia Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should render children when no role restriction is specified', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { ...defaultAuthState.user, rol: 'educando', roles: ['educando'] }
      })

      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Open Content</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Superadmin bypass
  // ============================================================
  describe('superadmin bypass', () => {

    it('should render children for superadmin even when route requires kraal', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { ...defaultAuthState.user, rol: 'superadmin', roles: ['superadmin'] }
      })

      render(
        <ProtectedRoute requiredRole="kraal">
          <div data-testid="protected-content">Should be visible to superadmin</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should render children for superadmin when allowedRoles does not include superadmin explicitly', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { ...defaultAuthState.user, rol: 'superadmin', roles: ['superadmin'] }
      })

      render(
        <ProtectedRoute allowedRoles={['kraal', 'jefe_seccion']}>
          <div data-testid="protected-content">Superadmin bypass</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Redirects for wrong role
  // ============================================================
  describe('redirects for wrong role', () => {

    it('should show AccessDenied and redirect when familia tries to access superadmin route', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { ...defaultAuthState.user, rol: 'familia', roles: ['familia'] }
      })

      render(
        <ProtectedRoute requiredRole="superadmin">
          <div data-testid="protected-content">Should not be visible</div>
        </ProtectedRoute>
      )

      // Children should NOT be rendered
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      // Should show Access Denied message
      expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
    })

    it('should show AccessDenied when educando tries to access admin route with allowedRoles', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: { ...defaultAuthState.user, rol: 'educando', roles: ['educando'] }
      })

      render(
        <ProtectedRoute allowedRoles={['superadmin', 'kraal', 'jefe_seccion']}>
          <div data-testid="protected-content">Admin only</div>
        </ProtectedRoute>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
    })

    it('should redirect to /login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: null,
        token: null,
        isAuthenticated: false,
        authReady: true
      })

      render(
        <ProtectedRoute requiredRole="superadmin">
          <div data-testid="protected-content">Should not be visible</div>
        </ProtectedRoute>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should redirect to custom redirectTo path when provided', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: null,
        token: null,
        isAuthenticated: false,
        authReady: true
      })

      render(
        <ProtectedRoute requiredRole="superadmin" redirectTo="/custom-login">
          <div data-testid="protected-content">Should not be visible</div>
        </ProtectedRoute>
      )

      expect(mockPush).toHaveBeenCalledWith('/custom-login')
    })
  })

  // ============================================================
  // Loading and session expired states
  // ============================================================
  describe('loading and session states', () => {

    it('should show loading screen when auth is not ready', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        authReady: false,
        isLoading: true
      })

      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Content</div>
        </ProtectedRoute>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.getByText('Verificando sesion...')).toBeInTheDocument()
    })

    it('should show session expired message when session has expired', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: null,
        token: null,
        isAuthenticated: false,
        sessionExpired: true,
        authReady: true
      })

      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Content</div>
        </ProtectedRoute>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.getByText('Sesion expirada')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Multi-role support
  // ============================================================
  describe('multi-role support', () => {

    it('should render children when user has multiple roles and one matches allowedRoles', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: {
          ...defaultAuthState.user,
          rol: 'kraal',
          roles: ['kraal', 'jefe_seccion']
        }
      })

      render(
        <ProtectedRoute allowedRoles={['jefe_seccion']}>
          <div data-testid="protected-content">Multi-role content</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })

    it('should show AccessDenied when none of the user roles match allowedRoles', () => {
      mockUseAuth.mockReturnValue({
        ...defaultAuthState,
        user: {
          ...defaultAuthState.user,
          rol: 'familia',
          roles: ['familia', 'educando']
        }
      })

      render(
        <ProtectedRoute allowedRoles={['superadmin', 'kraal']}>
          <div data-testid="protected-content">Should not be visible</div>
        </ProtectedRoute>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
    })
  })
})
