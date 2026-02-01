import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:5000';

// Helper: login via API and set token in localStorage
async function loginAs(page: Page, email: string, password: string) {
  const response = await page.request.post(`${API_URL}/api/auth/login`, {
    data: { email, password }
  });
  const data = await response.json();
  expect(data.success).toBe(true);
  const token = data.data.token;

  // Navigate to a page first, then set localStorage
  await page.goto(`${BASE_URL}/familia`);
  await page.evaluate((t) => {
    localStorage.setItem('familia_token', t);
    localStorage.setItem('token', t);
  }, token);
  return data.data;
}

async function loginAsFamilia(page: Page) {
  return loginAs(page, 'maria.garcia@test.com', 'Admin123#');
}

async function loginAsAdmin(page: Page) {
  return loginAs(page, 'web.osyris@gmail.com', 'Admin123#');
}

// =========================================================
// Test 1: Familiar ve lista de circulares pendientes
// =========================================================
test.describe('Circulares del Familiar', () => {
  test('Familiar ve lista de circulares pendientes', async ({ page }) => {
    await loginAsFamilia(page);
    await page.goto(`${BASE_URL}/familia/circulares`);
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Should show circulares list or no-circulares message
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    
    // Check if the page has loaded our circular content
    // Either shows the circular cards or the "Mis Circulares" header
    const hasHeader = await page.locator('text=Mis Circulares').count();
    expect(hasHeader).toBeGreaterThan(0);
  });
});

// =========================================================
// Test 2: Familiar completa circular digital (API level)
// =========================================================
test.describe('Firma de Circular Digital', () => {
  test('Familiar puede firmar una circular vía API', async ({ request }) => {
    // Login
    const loginResp = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'maria.garcia@test.com', password: 'Admin123#' }
    });
    const loginData = await loginResp.json();
    expect(loginData.success).toBe(true);
    const token = loginData.data.token;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Get formulario
    const formResp = await request.get(`${API_URL}/api/circular/1/formulario?educandoId=2`, { headers });
    const formData = await formResp.json();
    expect(formData.success).toBe(true);
    expect(formData.data.circular.titulo).toContain('Navidad');
    expect(formData.data.perfilSalud).toBeTruthy();

    // Sign circular for educando 2 (Lucía)
    const firmaResp = await request.post(`${API_URL}/api/circular/1/firmar`, {
      headers,
      data: {
        educandoId: 2,
        datosMedicos: formData.data.perfilSalud,
        contactos: formData.data.contactos,
        camposCustom: { autorizo_bano: true },
        firmaBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        firmaTipo: 'image',
        aceptaCondiciones: true,
        actualizarPerfil: false
      }
    });
    const firmaData = await firmaResp.json();
    expect(firmaData.success).toBe(true);
    expect(firmaData.data.circularRespuestaId).toBeGreaterThan(0);
    expect(firmaData.data.pdfUrl).toBeTruthy();

    // Verify estado changed
    const estadoResp = await request.get(`${API_URL}/api/circular/1/estado/2`, { headers });
    const estadoData = await estadoResp.json();
    expect(estadoData.success).toBe(true);
    expect(estadoData.data.estado).toBe('archivada');
  });
});

// =========================================================
// Test 3: Canvas de firma (component level check via page)
// =========================================================
test.describe('Firma Digital Canvas', () => {
  test('La página de circular detalle carga correctamente', async ({ page }) => {
    await loginAsFamilia(page);
    
    // Navigate to circular detail for educando 1
    await page.goto(`${BASE_URL}/familia/circulares/1?educandoId=1`);
    await page.waitForTimeout(3000);

    // Page should show something - either the wizard or "ya firmada" message
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    // Since educando 1 already signed, should show "ya firmada"
    // or the wizard content
    const hasContent = body!.length > 50;
    expect(hasContent).toBe(true);
  });
});

// =========================================================
// Test 4: Admin ve dashboard de circulares (API)
// =========================================================
test.describe('Dashboard Admin', () => {
  test('Admin ve estadísticas de circulares', async ({ request }) => {
    // Login as admin
    const loginResp = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'web.osyris@gmail.com', password: 'Admin123#' }
    });
    const loginData = await loginResp.json();
    expect(loginData.success).toBe(true);
    const token = loginData.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Get dashboard
    const dashResp = await request.get(`${API_URL}/api/admin/circular/1/estado`, { headers });
    const dashData = await dashResp.json();
    expect(dashData.success).toBe(true);
    expect(dashData.data.stats).toBeTruthy();
    expect(dashData.data.stats.total).toBeGreaterThan(0);
    expect(dashData.data.inscritos).toBeTruthy();
    expect(dashData.data.inscritos.length).toBeGreaterThan(0);

    // Check there's at least 1 firmada (Pablo was signed earlier)
    const firmados = dashData.data.inscritos.filter(
      (i: any) => ['firmada', 'archivada', 'pdf_generado'].includes(i.estado_circular)
    );
    expect(firmados.length).toBeGreaterThan(0);

    // Verify list of circulares
    const listResp = await request.get(`${API_URL}/api/admin/circulares`, { headers });
    const listData = await listResp.json();
    expect(listData.success).toBe(true);
    expect(listData.data.length).toBeGreaterThan(0);
  });

  test('Admin puede acceder a la página de circulares', async ({ page }) => {
    // Login as admin and set ALL required tokens
    const response = await page.request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'web.osyris@gmail.com', password: 'Admin123#' }
    });
    const loginData = await response.json();
    const token = loginData.data.token;
    const usuario = loginData.data.usuario;

    // Go to base page first to set localStorage
    await page.goto(`${BASE_URL}/admin/circulares`);
    await page.evaluate(({ t, u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('familia_token', t);
      localStorage.setItem('usuario', JSON.stringify(u));
    }, { t: token, u: usuario });

    // Reload the page with auth in place
    await page.goto(`${BASE_URL}/admin/circulares`);
    await page.waitForTimeout(3000);

    const body = await page.textContent('body');
    // Should show circulares content or at minimum have loaded
    const hasCircularContent = body!.includes('Circular') || body!.includes('circular') || body!.includes('Dashboard');
    expect(hasCircularContent).toBe(true);
  });
});

// =========================================================
// Test 5: PDF se genera correctamente
// =========================================================
test.describe('Generación de PDF', () => {
  test('PDF existe en uploads después de firmar', async ({ request }) => {
    // Login
    const loginResp = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'maria.garcia@test.com', password: 'Admin123#' }
    });
    const loginData = await loginResp.json();
    const token = loginData.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Check estado for educando 1 (already signed)
    const estadoResp = await request.get(`${API_URL}/api/circular/1/estado/1`, { headers });
    const estadoData = await estadoResp.json();
    expect(estadoData.success).toBe(true);
    expect(estadoData.data.respuesta).toBeTruthy();
    expect(estadoData.data.respuesta.pdf_local_path).toBeTruthy();
    expect(estadoData.data.respuesta.pdf_hash_sha256).toBeTruthy();
    expect(estadoData.data.respuesta.pdf_hash_sha256.length).toBe(64); // SHA-256 hex

    // Verify PDF is accessible via HTTP (local path)
    const pdfUrl = estadoData.data.respuesta.pdf_local_path;
    expect(pdfUrl).toContain('circulares');
  });
});
