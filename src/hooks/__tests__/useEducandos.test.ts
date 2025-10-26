/**
 * Tests unitarios para el hook useEducandos
 *
 * Pruebas de:
 * - Fetching de educandos con filtros
 * - Creación de educandos
 * - Actualización de educandos
 * - Desactivación/reactivación
 * - Eliminación de educandos
 * - Búsqueda
 * - Manejo de errores
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useEducandos } from '../useEducandos'
import { getApiUrl } from '@/lib/api-utils'

// Mock de fetch global
global.fetch = jest.fn()

// Mock de toast
jest.mock('../use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

// Mock de getApiUrl
jest.mock('@/lib/api-utils', () => ({
  getApiUrl: jest.fn(() => 'http://localhost:5000')
}))

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useEducandos Hook', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks()
    localStorageMock.clear()

    // Mock del token en localStorage
    localStorageMock.setItem('token', 'fake-jwt-token')
  })

  describe('fetchEducandos', () => {
    it('debería cargar educandos exitosamente', async () => {
      const mockEducandos = [
        {
          id: 1,
          nombre: 'Juan',
          apellidos: 'Pérez',
          seccion_id: 1,
          activo: true
        },
        {
          id: 2,
          nombre: 'María',
          apellidos: 'García',
          seccion_id: 2,
          activo: true
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockEducandos,
          pagination: {
            total: 2,
            limit: 50,
            offset: 0
          }
        })
      })

      const { result } = renderHook(() => useEducandos())

      await act(async () => {
        await result.current.fetchEducandos()
      })

      expect(result.current.educandos).toEqual(mockEducandos)
      expect(result.current.pagination.total).toBe(2)
      expect(result.current.loading).toBe(false)
    })

    it('debería aplicar filtros correctamente', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
          pagination: { total: 0, limit: 50, offset: 0 }
        })
      })

      const { result } = renderHook(() => useEducandos())

      await act(async () => {
        await result.current.fetchEducandos({
          seccion_id: 1,
          activo: true,
          search: 'Juan',
          genero: 'masculino'
        })
      })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const url = fetchCall[0]

      expect(url).toContain('seccion_id=1')
      expect(url).toContain('activo=true')
      expect(url).toContain('search=Juan')
      expect(url).toContain('genero=masculino')
    })

    it('debería manejar error al cargar educandos', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useEducandos())

      await act(async () => {
        const educandos = await result.current.fetchEducandos()
        expect(educandos).toEqual([])
      })

      expect(result.current.loading).toBe(false)
    })

    it('debería manejar error 401 (no autenticado)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'No autenticado' })
      })

      const { result } = renderHook(() => useEducandos())

      await act(async () => {
        const educandos = await result.current.fetchEducandos()
        expect(educandos).toEqual([])
      })
    })
  })

  describe('fetchEducandoById', () => {
    it('debería obtener un educando por ID', async () => {
      const mockEducando = {
        id: 1,
        nombre: 'Juan',
        apellidos: 'Pérez',
        fecha_nacimiento: '2015-05-20',
        seccion_id: 1
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockEducando })
      })

      const { result } = renderHook(() => useEducandos())

      let educando
      await act(async () => {
        educando = await result.current.fetchEducandoById(1)
      })

      expect(educando).toEqual(mockEducando)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/educandos/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token'
          })
        })
      )
    })

    it('debería manejar educando no encontrado', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Educando no encontrado' })
      })

      const { result } = renderHook(() => useEducandos())

      let educando
      await act(async () => {
        educando = await result.current.fetchEducandoById(999)
      })

      expect(educando).toBeNull()
    })
  })

  describe('createEducando', () => {
    it('debería crear un educando exitosamente', async () => {
      const nuevoEducando = {
        nombre: 'Pedro',
        apellidos: 'Martínez',
        genero: 'masculino' as const,
        fecha_nacimiento: '2016-03-15',
        seccion_id: 1
      }

      const educandoCreado = {
        id: 3,
        ...nuevoEducando
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: educandoCreado })
        })
        // Mock para el refetch automático
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [educandoCreado],
            pagination: { total: 1, limit: 50, offset: 0 }
          })
        })

      const { result } = renderHook(() => useEducandos())

      let educando
      await act(async () => {
        educando = await result.current.createEducando(nuevoEducando)
      })

      expect(educando).toEqual(educandoCreado)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/educandos'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(nuevoEducando)
        })
      )
    })

    it('debería manejar error de validación al crear', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Datos inválidos' })
      })

      const { result } = renderHook(() => useEducandos())

      const educandoInvalido = {
        nombre: '',
        apellidos: '',
        genero: 'masculino' as const,
        fecha_nacimiento: '',
        seccion_id: 0
      }

      let educando
      await act(async () => {
        educando = await result.current.createEducando(educandoInvalido)
      })

      expect(educando).toBeNull()
    })
  })

  describe('updateEducando', () => {
    it('debería actualizar un educando exitosamente', async () => {
      const datosActualizados = {
        nombre: 'Juan Carlos',
        apellidos: 'Pérez López'
      }

      const educandoActualizado = {
        id: 1,
        ...datosActualizados,
        seccion_id: 1
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: educandoActualizado })
        })
        // Mock para refetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [educandoActualizado],
            pagination: { total: 1, limit: 50, offset: 0 }
          })
        })

      const { result } = renderHook(() => useEducandos())

      let educando
      await act(async () => {
        educando = await result.current.updateEducando(1, datosActualizados)
      })

      expect(educando).toEqual(educandoActualizado)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/educandos/1'),
        expect.objectContaining({
          method: 'PUT'
        })
      )
    })
  })

  describe('deactivateEducando', () => {
    it('debería desactivar un educando exitosamente', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Educando desactivado' })
        })
        // Mock para refetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: { total: 0, limit: 50, offset: 0 }
          })
        })

      const { result } = renderHook(() => useEducandos())

      let exito
      await act(async () => {
        exito = await result.current.deactivateEducando(1)
      })

      expect(exito).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/educandos/1/deactivate'),
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })
  })

  describe('reactivateEducando', () => {
    it('debería reactivar un educando exitosamente', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Educando reactivado' })
        })
        // Mock para refetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: { total: 0, limit: 50, offset: 0 }
          })
        })

      const { result } = renderHook(() => useEducandos())

      let exito
      await act(async () => {
        exito = await result.current.reactivateEducando(1)
      })

      expect(exito).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/educandos/1/reactivate'),
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })
  })

  describe('deleteEducando', () => {
    it('debería eliminar un educando permanentemente', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Educando eliminado' })
        })
        // Mock para refetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: { total: 0, limit: 50, offset: 0 }
          })
        })

      const { result } = renderHook(() => useEducandos())

      let exito
      await act(async () => {
        exito = await result.current.deleteEducando(1)
      })

      expect(exito).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/educandos/1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('searchEducandos', () => {
    it('debería buscar educandos por término', async () => {
      const resultadosBusqueda = [
        { id: 1, nombre: 'Juan', apellidos: 'Pérez' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: resultadosBusqueda })
      })

      const { result } = renderHook(() => useEducandos())

      let resultados
      await act(async () => {
        resultados = await result.current.searchEducandos('Juan')
      })

      expect(resultados).toEqual(resultadosBusqueda)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/educandos/search?q=Juan'),
        expect.any(Object)
      )
    })

    it('debería manejar búsqueda sin resultados', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      })

      const { result } = renderHook(() => useEducandos())

      let resultados
      await act(async () => {
        resultados = await result.current.searchEducandos('NoExiste')
      })

      expect(resultados).toEqual([])
    })
  })

  describe('fetchEducandosBySeccion', () => {
    it('debería obtener educandos de una sección específica', async () => {
      const educandosSeccion = [
        { id: 1, nombre: 'Juan', seccion_id: 1 },
        { id: 2, nombre: 'María', seccion_id: 1 }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: educandosSeccion })
      })

      const { result } = renderHook(() => useEducandos())

      let educandos
      await act(async () => {
        educandos = await result.current.fetchEducandosBySeccion(1)
      })

      expect(educandos).toEqual(educandosSeccion)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/educandos/seccion/1'),
        expect.any(Object)
      )
    })
  })

  describe('fetchEstadisticas', () => {
    it('debería obtener estadísticas de educandos', async () => {
      const estadisticasMock = {
        total: 100,
        activos: 95,
        inactivos: 5,
        masculino: 50,
        femenino: 45,
        otro: 5,
        por_seccion: [
          { seccion_nombre: 'Castores', total: 20 },
          { seccion_nombre: 'Manada', total: 30 }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: estadisticasMock })
      })

      const { result } = renderHook(() => useEducandos())

      await act(async () => {
        await result.current.fetchEstadisticas()
      })

      expect(result.current.estadisticas).toEqual(estadisticasMock)
    })
  })

  describe('Manejo de autenticación', () => {
    it('debería manejar token faltante', async () => {
      localStorageMock.removeItem('token')

      const { result } = renderHook(() => useEducandos())

      await act(async () => {
        const educandos = await result.current.fetchEducandos()
        expect(educandos).toEqual([])
      })

      // No debería hacer llamada a la API
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('debería incluir token JWT en todas las peticiones', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] })
      })

      const { result } = renderHook(() => useEducandos())

      await act(async () => {
        await result.current.fetchEducandos()
        await result.current.fetchEducandoById(1)
        await result.current.searchEducandos('test')
      })

      const fetchCalls = (global.fetch as jest.Mock).mock.calls
      fetchCalls.forEach(call => {
        const headers = call[1]?.headers
        expect(headers).toHaveProperty('Authorization', 'Bearer fake-jwt-token')
      })
    })
  })
})
