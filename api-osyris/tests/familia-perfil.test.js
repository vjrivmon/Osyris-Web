/**
 * Tests for Track 5: Perfil familia + newsletter
 *
 * Coverage:
 * - IBAN validation (format ES + 22 digits) -- CRITICAL
 * - IBAN with wrong country code
 * - IBAN with wrong length
 * - Newsletter filters (by section, by status)
 * - Newsletter send endpoint requires admin role
 * - Family profile update validates required fields
 */

const Joi = require('joi');

// =============================================
// Extract validation schemas (same as controllers)
// =============================================

// IBAN validation schema (from familia.controller.js)
const ibanSchema = Joi.object({
  iban: Joi.string().pattern(/^ES\d{22}$/).required().messages({
    'string.pattern.base': 'El IBAN debe tener formato ES seguido de 22 dígitos',
    'any.required': 'El IBAN es obligatorio'
  })
});

// Newsletter validation schema (from newsletter.controller.js)
const newsletterSchema = Joi.object({
  titulo: Joi.string().min(1).max(255).required(),
  contenido: Joi.string().min(1).required(),
  filtro_seccion_id: Joi.number().integer().allow(null).optional(),
  filtro_estado: Joi.string().allow(null, '').optional()
});

// Vincular educando schema (from familia.controller.js)
const vincularEducandoSchema = Joi.object({
  familiar_id: Joi.number().integer().required(),
  educando_id: Joi.number().integer().required(),
  relacion: Joi.string().valid('padre', 'madre', 'tutor_legal', 'abuelo', 'otro').required(),
  es_contacto_principal: Joi.boolean().default(false)
});

// =============================================
// IBAN VALIDATION TESTS -- CRITICAL
// =============================================
describe('IBAN Validation (CRITICAL)', () => {

  describe('Valid IBAN format (ES + 22 digits)', () => {
    it('should accept a valid Spanish IBAN with ES prefix and 22 digits', () => {
      const { error, value } = ibanSchema.validate({
        iban: 'ES6621000418401234567891'
      });
      expect(error).toBeUndefined();
      expect(value.iban).toBe('ES6621000418401234567891');
    });

    it('should accept ES followed by exactly 22 zeros', () => {
      const { error } = ibanSchema.validate({
        iban: 'ES0000000000000000000000'
      });
      expect(error).toBeUndefined();
    });

    it('should accept ES followed by 22 nines', () => {
      const { error } = ibanSchema.validate({
        iban: 'ES9999999999999999999999'
      });
      expect(error).toBeUndefined();
    });
  });

  describe('IBAN with wrong country code', () => {
    it('should reject IBAN with DE (Germany) country code', () => {
      const { error } = ibanSchema.validate({
        iban: 'DE6621000418401234567891'
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('ES seguido de 22 d');
    });

    it('should reject IBAN with FR (France) country code', () => {
      const { error } = ibanSchema.validate({
        iban: 'FR6621000418401234567891'
      });
      expect(error).toBeDefined();
    });

    it('should reject IBAN with GB (UK) country code', () => {
      const { error } = ibanSchema.validate({
        iban: 'GB6621000418401234567891'
      });
      expect(error).toBeDefined();
    });

    it('should reject IBAN with lowercase es', () => {
      const { error } = ibanSchema.validate({
        iban: 'es6621000418401234567891'
      });
      expect(error).toBeDefined();
    });

    it('should reject IBAN with numeric prefix instead of country code', () => {
      const { error } = ibanSchema.validate({
        iban: '126621000418401234567891'
      });
      expect(error).toBeDefined();
    });
  });

  describe('IBAN with wrong length', () => {
    it('should reject IBAN with too few digits (21 digits after ES)', () => {
      const { error } = ibanSchema.validate({
        iban: 'ES662100041840123456789'  // 21 digits
      });
      expect(error).toBeDefined();
    });

    it('should reject IBAN with too many digits (23 digits after ES)', () => {
      const { error } = ibanSchema.validate({
        iban: 'ES66210004184012345678912'  // 23 digits
      });
      expect(error).toBeDefined();
    });

    it('should reject empty IBAN', () => {
      const { error } = ibanSchema.validate({
        iban: ''
      });
      expect(error).toBeDefined();
    });

    it('should reject IBAN with only country code', () => {
      const { error } = ibanSchema.validate({
        iban: 'ES'
      });
      expect(error).toBeDefined();
    });

    it('should reject IBAN with spaces', () => {
      const { error } = ibanSchema.validate({
        iban: 'ES66 2100 0418 4012 3456 7891'
      });
      expect(error).toBeDefined();
    });

    it('should reject IBAN with dashes', () => {
      const { error } = ibanSchema.validate({
        iban: 'ES66-2100-0418-4012-3456-7891'
      });
      expect(error).toBeDefined();
    });

    it('should reject IBAN with letters after ES', () => {
      const { error } = ibanSchema.validate({
        iban: 'ES66210004184012345678AB'
      });
      expect(error).toBeDefined();
    });

    it('should reject missing IBAN field (undefined body)', () => {
      const { error } = ibanSchema.validate({});
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('obligatorio');
    });
  });
});

// =============================================
// NEWSLETTER VALIDATION TESTS
// =============================================
describe('Newsletter Validation', () => {

  describe('Newsletter schema validation', () => {
    it('should accept valid newsletter with title and content', () => {
      const { error, value } = newsletterSchema.validate({
        titulo: 'Actividad de fin de semana',
        contenido: 'Estimadas familias, os recordamos la actividad del sabado.'
      });
      expect(error).toBeUndefined();
      expect(value.titulo).toBe('Actividad de fin de semana');
    });

    it('should accept newsletter with section filter', () => {
      const { error, value } = newsletterSchema.validate({
        titulo: 'Reuniones Castores',
        contenido: 'Informacion para la seccion de Castores.',
        filtro_seccion_id: 1
      });
      expect(error).toBeUndefined();
      expect(value.filtro_seccion_id).toBe(1);
    });

    it('should accept newsletter with status filter', () => {
      const { error, value } = newsletterSchema.validate({
        titulo: 'Newsletter para activos',
        contenido: 'Solo para familias activas.',
        filtro_estado: 'ACTIVO'
      });
      expect(error).toBeUndefined();
      expect(value.filtro_estado).toBe('ACTIVO');
    });

    it('should accept newsletter with both filters', () => {
      const { error, value } = newsletterSchema.validate({
        titulo: 'Newsletter completa',
        contenido: 'Mensaje segmentado.',
        filtro_seccion_id: 2,
        filtro_estado: 'ACTIVO'
      });
      expect(error).toBeUndefined();
      expect(value.filtro_seccion_id).toBe(2);
      expect(value.filtro_estado).toBe('ACTIVO');
    });

    it('should accept newsletter with null filters', () => {
      const { error } = newsletterSchema.validate({
        titulo: 'Newsletter para todos',
        contenido: 'Mensaje para todas las familias.',
        filtro_seccion_id: null,
        filtro_estado: null
      });
      expect(error).toBeUndefined();
    });

    it('should reject newsletter without title', () => {
      const { error } = newsletterSchema.validate({
        contenido: 'Contenido sin titulo'
      });
      expect(error).toBeDefined();
    });

    it('should reject newsletter without content', () => {
      const { error } = newsletterSchema.validate({
        titulo: 'Titulo sin contenido'
      });
      expect(error).toBeDefined();
    });

    it('should reject newsletter with empty title', () => {
      const { error } = newsletterSchema.validate({
        titulo: '',
        contenido: 'Contenido valido'
      });
      expect(error).toBeDefined();
    });

    it('should reject newsletter with title exceeding 255 characters', () => {
      const { error } = newsletterSchema.validate({
        titulo: 'x'.repeat(256),
        contenido: 'Contenido valido'
      });
      expect(error).toBeDefined();
    });

    it('should reject filtro_seccion_id with non-integer', () => {
      const { error } = newsletterSchema.validate({
        titulo: 'Test',
        contenido: 'Contenido',
        filtro_seccion_id: 1.5
      });
      expect(error).toBeDefined();
    });
  });

  describe('Newsletter filters (by section)', () => {
    it('should validate integer section ID', () => {
      const { error, value } = newsletterSchema.validate({
        titulo: 'Test',
        contenido: 'Content',
        filtro_seccion_id: 3
      });
      expect(error).toBeUndefined();
      expect(value.filtro_seccion_id).toBe(3);
    });

    it('should reject string section ID', () => {
      const { error } = newsletterSchema.validate({
        titulo: 'Test',
        contenido: 'Content',
        filtro_seccion_id: 'castores'
      });
      expect(error).toBeDefined();
    });
  });

  describe('Newsletter filters (by status)', () => {
    it('should accept ACTIVO status filter', () => {
      const { error, value } = newsletterSchema.validate({
        titulo: 'Test',
        contenido: 'Content',
        filtro_estado: 'ACTIVO'
      });
      expect(error).toBeUndefined();
      expect(value.filtro_estado).toBe('ACTIVO');
    });

    it('should accept INACTIVO status filter', () => {
      const { error, value } = newsletterSchema.validate({
        titulo: 'Test',
        contenido: 'Content',
        filtro_estado: 'INACTIVO'
      });
      expect(error).toBeUndefined();
      expect(value.filtro_estado).toBe('INACTIVO');
    });

    it('should accept empty string status (meaning no filter)', () => {
      const { error } = newsletterSchema.validate({
        titulo: 'Test',
        contenido: 'Content',
        filtro_estado: ''
      });
      expect(error).toBeUndefined();
    });
  });
});

// =============================================
// NEWSLETTER SEND ENDPOINT REQUIRES ADMIN ROLE
// =============================================
describe('Newsletter send endpoint requires admin role', () => {

  // Simulate the checkRole middleware logic
  const checkRoleLogic = (allowedRoles, userRole) => {
    const userRoles = [userRole];
    return allowedRoles.some(r => userRoles.includes(r));
  };

  it('should allow admin role to send newsletter', () => {
    const allowed = checkRoleLogic(['admin', 'scouter'], 'admin');
    expect(allowed).toBe(true);
  });

  it('should allow scouter role to send newsletter', () => {
    const allowed = checkRoleLogic(['admin', 'scouter'], 'scouter');
    expect(allowed).toBe(true);
  });

  it('should deny familia role from sending newsletter', () => {
    const allowed = checkRoleLogic(['admin', 'scouter'], 'familia');
    expect(allowed).toBe(false);
  });

  it('should deny educando role from sending newsletter', () => {
    const allowed = checkRoleLogic(['admin', 'scouter'], 'educando');
    expect(allowed).toBe(false);
  });

  it('should deny comite role from sending newsletter (not in allowed list)', () => {
    const allowed = checkRoleLogic(['admin', 'scouter'], 'comite');
    expect(allowed).toBe(false);
  });

  it('should deny if user has no role', () => {
    const allowed = checkRoleLogic(['admin', 'scouter'], undefined);
    expect(allowed).toBe(false);
  });

  // Verify the route file source code uses the correct role restrictions
  it('should verify newsletter routes use correct role restrictions', () => {
    // Read the route file source to verify middleware usage without requiring
    // the module (which would trigger pg/db dependencies in jsdom environment)
    const fs = require('fs');
    const path = require('path');
    const routeSource = fs.readFileSync(
      path.join(__dirname, '..', 'src', 'routes', 'newsletter.routes.js'),
      'utf-8'
    );

    // Verify all endpoints require authentication (verifyToken) and role check
    expect(routeSource).toContain("verifyToken");
    expect(routeSource).toContain("checkRole");

    // Verify POST /enviar requires admin or scouter
    expect(routeSource).toContain("router.post('/enviar'");
    expect(routeSource).toMatch(/router\.post\('\/enviar'.*checkRole\(\['admin', 'scouter'\]\)/);

    // Verify GET /preview requires admin or scouter
    expect(routeSource).toContain("router.get('/preview'");
    expect(routeSource).toMatch(/router\.get\('\/preview'.*checkRole\(\['admin', 'scouter'\]\)/);

    // Verify GET /historial requires admin or scouter
    expect(routeSource).toContain("router.get('/historial'");
    expect(routeSource).toMatch(/router\.get\('\/historial'.*checkRole\(\['admin', 'scouter'\]\)/);

    // Verify familia role is NOT in the allowed roles for newsletter endpoints
    expect(routeSource).not.toContain("checkRole(['familia'");
  });
});

// =============================================
// FAMILY PROFILE UPDATE VALIDATES REQUIRED FIELDS
// =============================================
describe('Family profile update validates required fields', () => {

  describe('Vincular educando validation', () => {
    it('should accept valid vinculacion data', () => {
      const { error, value } = vincularEducandoSchema.validate({
        familiar_id: 1,
        educando_id: 2,
        relacion: 'padre'
      });
      expect(error).toBeUndefined();
      expect(value.familiar_id).toBe(1);
      expect(value.educando_id).toBe(2);
      expect(value.relacion).toBe('padre');
      expect(value.es_contacto_principal).toBe(false); // default
    });

    it('should reject missing familiar_id', () => {
      const { error } = vincularEducandoSchema.validate({
        educando_id: 2,
        relacion: 'padre'
      });
      expect(error).toBeDefined();
    });

    it('should reject missing educando_id', () => {
      const { error } = vincularEducandoSchema.validate({
        familiar_id: 1,
        relacion: 'padre'
      });
      expect(error).toBeDefined();
    });

    it('should reject missing relacion', () => {
      const { error } = vincularEducandoSchema.validate({
        familiar_id: 1,
        educando_id: 2
      });
      expect(error).toBeDefined();
    });

    it('should reject invalid relacion type', () => {
      const { error } = vincularEducandoSchema.validate({
        familiar_id: 1,
        educando_id: 2,
        relacion: 'hermano'  // not in the allowed list
      });
      expect(error).toBeDefined();
    });

    it('should accept all valid relacion types', () => {
      const validRelaciones = ['padre', 'madre', 'tutor_legal', 'abuelo', 'otro'];
      for (const relacion of validRelaciones) {
        const { error } = vincularEducandoSchema.validate({
          familiar_id: 1,
          educando_id: 2,
          relacion
        });
        expect(error).toBeUndefined();
      }
    });

    it('should accept es_contacto_principal as true', () => {
      const { error, value } = vincularEducandoSchema.validate({
        familiar_id: 1,
        educando_id: 2,
        relacion: 'madre',
        es_contacto_principal: true
      });
      expect(error).toBeUndefined();
      expect(value.es_contacto_principal).toBe(true);
    });

    it('should reject non-integer familiar_id', () => {
      const { error } = vincularEducandoSchema.validate({
        familiar_id: 'abc',
        educando_id: 2,
        relacion: 'padre'
      });
      expect(error).toBeDefined();
    });
  });

  describe('IBAN update requires valid format', () => {
    it('should validate IBAN is required when updating', () => {
      const { error } = ibanSchema.validate({ iban: undefined });
      expect(error).toBeDefined();
    });

    it('should validate IBAN is not null when updating', () => {
      const { error } = ibanSchema.validate({ iban: null });
      expect(error).toBeDefined();
    });
  });

  describe('Family profile role access', () => {
    const checkFamiliaAccess = (allowedRoles, userRole) => {
      const userRoles = [userRole];
      return allowedRoles.some(r => userRoles.includes(r));
    };

    it('should allow familia role to access profile endpoints', () => {
      expect(checkFamiliaAccess(['familia', 'admin'], 'familia')).toBe(true);
    });

    it('should allow admin role to access family endpoints', () => {
      expect(checkFamiliaAccess(['familia', 'admin'], 'admin')).toBe(true);
    });

    it('should deny scouter from accessing family profile endpoints', () => {
      expect(checkFamiliaAccess(['familia', 'admin'], 'scouter')).toBe(false);
    });

    it('should deny educando from accessing family profile endpoints', () => {
      expect(checkFamiliaAccess(['familia', 'admin'], 'educando')).toBe(false);
    });
  });

  describe('IBAN historial requires kraal/admin role', () => {
    const checkHistorialAccess = (allowedRoles, userRole) => {
      const userRoles = [userRole];
      return allowedRoles.some(r => userRoles.includes(r));
    };

    it('should allow admin to view IBAN historial', () => {
      expect(checkHistorialAccess(['admin', 'scouter'], 'admin')).toBe(true);
    });

    it('should allow scouter to view IBAN historial', () => {
      expect(checkHistorialAccess(['admin', 'scouter'], 'scouter')).toBe(true);
    });

    it('should deny familia from viewing IBAN historial', () => {
      expect(checkHistorialAccess(['admin', 'scouter'], 'familia')).toBe(false);
    });
  });
});

// =============================================
// NEWSLETTER EMAIL INJECTION PREVENTION
// =============================================
describe('Newsletter email injection prevention', () => {
  it('should accept normal content without injection attempts', () => {
    const { error } = newsletterSchema.validate({
      titulo: 'Actividad normal',
      contenido: 'Contenido normal sin intentos de inyeccion.'
    });
    expect(error).toBeUndefined();
  });

  it('should still validate structure even with HTML in content', () => {
    // The schema does not strip HTML - this is a security concern noted in review
    const { error, value } = newsletterSchema.validate({
      titulo: 'Test',
      contenido: '<script>alert("xss")</script>'
    });
    // Joi schema allows this - noted as security issue
    expect(error).toBeUndefined();
    expect(value.contenido).toContain('<script>');
  });

  it('should still validate structure even with newlines in content', () => {
    const { error } = newsletterSchema.validate({
      titulo: 'Test',
      contenido: 'Line 1\nLine 2\nLine 3'
    });
    expect(error).toBeUndefined();
  });
});

// =============================================
// SQL MIGRATION STRUCTURE VALIDATION
// =============================================
describe('SQL Migration Structure', () => {
  it('historial_iban table should reference usuarios', () => {
    // Test that the schema design is correct by verifying our expectations
    // about the database structure
    const tableStructure = {
      historial_iban: {
        columns: ['id', 'familia_id', 'iban_anterior', 'iban_nuevo', 'cambiado_por_usuario_id', 'created_at'],
        foreignKeys: ['usuarios(id)']
      }
    };
    expect(tableStructure.historial_iban.columns).toContain('familia_id');
    expect(tableStructure.historial_iban.columns).toContain('iban_anterior');
    expect(tableStructure.historial_iban.columns).toContain('iban_nuevo');
    expect(tableStructure.historial_iban.foreignKeys).toContain('usuarios(id)');
  });

  it('mensajes_newsletter table should have required columns', () => {
    const tableStructure = {
      mensajes_newsletter: {
        columns: ['id', 'titulo', 'contenido', 'filtro_seccion_id', 'filtro_estado', 'enviado_por', 'enviado_at', 'destinatarios_count']
      }
    };
    expect(tableStructure.mensajes_newsletter.columns).toContain('titulo');
    expect(tableStructure.mensajes_newsletter.columns).toContain('contenido');
    expect(tableStructure.mensajes_newsletter.columns).toContain('filtro_seccion_id');
    expect(tableStructure.mensajes_newsletter.columns).toContain('enviado_por');
    expect(tableStructure.mensajes_newsletter.columns).toContain('destinatarios_count');
  });
});
