/**
 * IAM Roles - Backend Middleware Tests
 *
 * Tests for:
 * - checkRole() middleware with new roles (superadmin, kraal, familia)
 * - checkPermiso() middleware allows/denies correctly
 * - verifyToken returns 401 without token
 * - checkRole returns 403 with wrong role
 */

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

// Mock db.config
jest.mock('../src/config/db.config', () => ({
  getUserById: jest.fn(),
  getUserPermisos: jest.fn(),
  query: jest.fn()
}));

const jwt = require('jsonwebtoken');
const db = require('../src/config/db.config');
const {
  verifyToken,
  checkRole,
  checkPermiso,
  requireRole,
  requireSuperAdmin,
  isSuperAdmin
} = require('../src/middleware/auth.middleware');

// Helper to create mock req/res/next
function createMocks(overrides = {}) {
  const req = {
    headers: { authorization: 'Bearer valid-token' },
    usuario: null,
    tokenPayload: null,
    ...overrides
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('IAM Middleware - auth.middleware.js', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: set JWT_SECRET env
    process.env.JWT_SECRET = 'test-secret';
  });

  // ============================================================
  // verifyToken
  // ============================================================
  describe('verifyToken', () => {

    it('should return 401 when no authorization header is present', async () => {
      const { req, res, next } = createMocks({
        headers: {}
      });

      await verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No se proporcion\u00f3 token de autenticaci\u00f3n'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header has no Bearer prefix', async () => {
      const { req, res, next } = createMocks({
        headers: { authorization: 'Basic some-token' }
      });

      await verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', async () => {
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw expiredError; });

      const { req, res, next } = createMocks();

      await verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token expirado'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      const invalidError = new Error('invalid token');
      invalidError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => { throw invalidError; });

      const { req, res, next } = createMocks();

      await verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token inv\u00e1lido'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 when user is not found in database', async () => {
      jwt.verify.mockReturnValue({ id: 999 });
      db.getUserById.mockResolvedValue(null);

      const { req, res, next } = createMocks();

      await verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario no encontrado'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user is inactive', async () => {
      jwt.verify.mockReturnValue({ id: 1 });
      db.getUserById.mockResolvedValue({ id: 1, activo: false, rol: 'kraal' });

      const { req, res, next } = createMocks();

      await verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'El usuario est\u00e1 desactivado'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() and attach user when token is valid and user active', async () => {
      const mockUser = { id: 1, activo: true, rol: 'kraal', nombre: 'Test' };
      const mockPayload = { id: 1, roles: ['kraal'] };

      jwt.verify.mockReturnValue(mockPayload);
      db.getUserById.mockResolvedValue(mockUser);

      const { req, res, next } = createMocks();

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.usuario).toEqual(mockUser);
      expect(req.tokenPayload).toEqual(mockPayload);
    });

    it('should use fallback JWT_SECRET when env variable is not set', async () => {
      delete process.env.JWT_SECRET;
      const mockUser = { id: 1, activo: true, rol: 'superadmin' };

      jwt.verify.mockReturnValue({ id: 1 });
      db.getUserById.mockResolvedValue(mockUser);

      const { req, res, next } = createMocks();

      await verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'osyrisScoutGroup2024SecretKey');
      expect(next).toHaveBeenCalled();
    });
  });

  // ============================================================
  // checkRole
  // ============================================================
  describe('checkRole', () => {

    it('should return 500 when req.usuario is not set', () => {
      const { req, res, next } = createMocks({
        usuario: null,
        tokenPayload: null
      });

      const middleware = checkRole(['superadmin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow superadmin access to any route regardless of required roles', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 1, rol: 'superadmin' },
        tokenPayload: { id: 1, roles: ['superadmin'] }
      });

      const middleware = checkRole(['kraal', 'familia']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow kraal when kraal role is in allowed list', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 2, rol: 'kraal' },
        tokenPayload: { id: 2, roles: ['kraal'] }
      });

      const middleware = checkRole(['superadmin', 'kraal']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow familia when familia role is in allowed list', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 3, rol: 'familia' },
        tokenPayload: { id: 3, roles: ['familia'] }
      });

      const middleware = checkRole(['familia']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access (403) when user role is not in allowed list', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 4, rol: 'familia' },
        tokenPayload: { id: 4, roles: ['familia'] }
      });

      const middleware = checkRole(['superadmin', 'kraal']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No tienes permiso para acceder a este recurso'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny educando access to admin-only routes', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 5, rol: 'educando' },
        tokenPayload: { id: 5, roles: ['educando'] }
      });

      const middleware = checkRole(['superadmin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should support multi-role users from JWT payload', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 6, rol: 'kraal' },
        tokenPayload: { id: 6, roles: ['kraal', 'jefe_seccion'] }
      });

      const middleware = checkRole(['jefe_seccion']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fallback to usuario.rol when tokenPayload.roles is absent', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 7, rol: 'kraal' },
        tokenPayload: { id: 7 } // no roles array
      });

      const middleware = checkRole(['kraal']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny when fallback rol does not match', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 8, rol: 'familia' },
        tokenPayload: { id: 8 } // no roles array
      });

      const middleware = checkRole(['superadmin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // checkPermiso
  // ============================================================
  describe('checkPermiso', () => {

    it('should return 500 when req.usuario is not set', async () => {
      const { req, res, next } = createMocks({
        usuario: null,
        tokenPayload: null
      });

      const middleware = checkPermiso('aprobar_documentos');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow superadmin without checking permisos table', async () => {
      const { req, res, next } = createMocks({
        usuario: { id: 1, rol: 'superadmin' },
        tokenPayload: { id: 1, roles: ['superadmin'] }
      });

      const middleware = checkPermiso('aprobar_documentos');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // Should NOT have queried the database for permisos
      expect(db.getUserPermisos).not.toHaveBeenCalled();
    });

    it('should allow access when user has the required permiso', async () => {
      db.getUserPermisos.mockResolvedValue([
        { id: 1, permiso: 'aprobar_documentos', usuario_id: 2 },
        { id: 2, permiso: 'ver_metricas', usuario_id: 2 }
      ]);

      const { req, res, next } = createMocks({
        usuario: { id: 2, rol: 'kraal' },
        tokenPayload: { id: 2, roles: ['kraal'] }
      });

      const middleware = checkPermiso('aprobar_documentos');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(db.getUserPermisos).toHaveBeenCalledWith(2);
    });

    it('should deny access (403) when user lacks the required permiso', async () => {
      db.getUserPermisos.mockResolvedValue([
        { id: 1, permiso: 'ver_metricas', usuario_id: 2 }
      ]);

      const { req, res, next } = createMocks({
        usuario: { id: 2, rol: 'kraal' },
        tokenPayload: { id: 2, roles: ['kraal'] }
      });

      const middleware = checkPermiso('aprobar_documentos');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('aprobar_documentos')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user has zero permisos', async () => {
      db.getUserPermisos.mockResolvedValue([]);

      const { req, res, next } = createMocks({
        usuario: { id: 3, rol: 'familia' },
        tokenPayload: { id: 3, roles: ['familia'] }
      });

      const middleware = checkPermiso('gestionar_eventos');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 when database query fails', async () => {
      db.getUserPermisos.mockRejectedValue(new Error('Database connection error'));

      const { req, res, next } = createMocks({
        usuario: { id: 2, rol: 'kraal' },
        tokenPayload: { id: 2, roles: ['kraal'] }
      });

      const middleware = checkPermiso('aprobar_documentos');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error al verificar permisos'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should bypass for superadmin even via fallback rol (no roles array)', async () => {
      const { req, res, next } = createMocks({
        usuario: { id: 1, rol: 'superadmin' },
        tokenPayload: { id: 1 } // no roles array; fallback to [req.usuario.rol]
      });

      const middleware = checkPermiso('gestionar_secciones');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(db.getUserPermisos).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // requireRole (composite middleware)
  // ============================================================
  describe('requireRole', () => {

    it('should return an array of two middlewares [verifyToken, checkRole]', () => {
      const middlewares = requireRole(['kraal']);
      expect(Array.isArray(middlewares)).toBe(true);
      expect(middlewares).toHaveLength(2);
      expect(typeof middlewares[0]).toBe('function');
      expect(typeof middlewares[1]).toBe('function');
    });
  });

  // ============================================================
  // requireSuperAdmin (composite middleware)
  // ============================================================
  describe('requireSuperAdmin', () => {

    it('should be an array of two middlewares', () => {
      expect(Array.isArray(requireSuperAdmin)).toBe(true);
      expect(requireSuperAdmin).toHaveLength(2);
    });
  });

  // ============================================================
  // isSuperAdmin
  // ============================================================
  describe('isSuperAdmin', () => {

    it('should set req.isSuperAdmin to true for superadmin users', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 1, rol: 'superadmin' }
      });

      isSuperAdmin(req, res, next);

      expect(req.isSuperAdmin).toBe(true);
      expect(next).toHaveBeenCalled();
    });

    it('should set req.isSuperAdmin to false for non-superadmin users', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 2, rol: 'kraal' }
      });

      isSuperAdmin(req, res, next);

      expect(req.isSuperAdmin).toBe(false);
      expect(next).toHaveBeenCalled();
    });

    it('should set req.isSuperAdmin to false when no usuario is set', () => {
      const { req, res, next } = createMocks({
        usuario: null
      });

      isSuperAdmin(req, res, next);

      expect(req.isSuperAdmin).toBe(false);
      expect(next).toHaveBeenCalled();
    });
  });

  // ============================================================
  // Integration-style: Protected route returns 401 without token
  // ============================================================
  describe('Protected routes - 401 without token', () => {

    it('should return 401 when accessing protected route without any token', async () => {
      const { req, res, next } = createMocks({
        headers: {} // no authorization header
      });

      await verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty string', async () => {
      const { req, res, next } = createMocks({
        headers: { authorization: '' }
      });

      await verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ============================================================
  // Integration-style: Protected route returns 403 with wrong role
  // ============================================================
  describe('Protected routes - 403 with wrong role', () => {

    it('should return 403 when familia user tries to access superadmin-only route', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 10, rol: 'familia' },
        tokenPayload: { id: 10, roles: ['familia'] }
      });

      const middleware = checkRole(['superadmin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when educando user tries to access kraal route', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 11, rol: 'educando' },
        tokenPayload: { id: 11, roles: ['educando'] }
      });

      const middleware = checkRole(['superadmin', 'kraal', 'jefe_seccion']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when kraal tries to access superadmin-only permisos route', () => {
      const { req, res, next } = createMocks({
        usuario: { id: 12, rol: 'kraal' },
        tokenPayload: { id: 12, roles: ['kraal'] }
      });

      const middleware = checkRole(['superadmin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
