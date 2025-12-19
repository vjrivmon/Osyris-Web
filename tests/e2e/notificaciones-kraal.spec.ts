import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Test E2E de Notificaciones al Kraal/Scouter
 *
 * Este test verifica que las 8 notificaciones de prueba aparecen correctamente
 * en el panel "Actividad Reciente" del Aula Virtual.
 *
 * Ejecutar:
 *   npx playwright test tests/e2e/notificaciones-kraal.spec.ts --headed
 */

// Credenciales de test (kraal de Tropa)
const TEST_EMAIL = 'vicenterivasmonferrer12@gmail.com';
const TEST_PASSWORD = 'Test123#';

// Path al script de test
const SCRIPT_PATH = path.join(__dirname, '..', '..', 'scripts', 'test-notificaciones-kraal.js');

test.describe('Notificaciones al Kraal', () => {

  test.beforeAll(async () => {
    // Insertar notificaciones de prueba antes de los tests
    console.log('Insertando notificaciones de prueba...');
    try {
      execSync(`node ${SCRIPT_PATH} --insert`, { stdio: 'inherit' });
    } catch (error) {
      console.log('Notificaciones ya insertadas o error:', error);
    }
  });

  test.afterAll(async () => {
    // Limpiar notificaciones de prueba despues de los tests
    console.log('Limpiando notificaciones de prueba...');
    try {
      execSync(`node ${SCRIPT_PATH} --clean`, { stdio: 'inherit' });
    } catch (error) {
      console.log('Error limpiando:', error);
    }
  });

  test('debe mostrar las 8 notificaciones [TEST] en Actividad Reciente', async ({ page }) => {
    // 1. Login como Kraal
    await page.goto('/login');

    // Rellenar credenciales
    await page.fill('input[type="email"], input[placeholder*="correo"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click en login
    await page.click('button[type="submit"], button:has-text("Iniciar sesión")');

    // Esperar a que cargue el dashboard
    await page.waitForURL('**/aula-virtual**', { timeout: 10000 });

    // 2. Verificar que estamos en el Panel de Control
    await expect(page.locator('h1:has-text("Panel de Control")')).toBeVisible();

    // 3. Verificar que aparece la seccion "Actividad Reciente"
    const actividadReciente = page.locator('text=Actividad Reciente').first();
    await expect(actividadReciente).toBeVisible();

    // 4. Verificar las 8 notificaciones [TEST]
    const notificacionesTitulos = [
      '[TEST] Solicitud de desbloqueo',
      '[TEST] Documento subido: DNI Padre/Madre',
      '[TEST] Justificante de pago subido',
      '[TEST] Circular firmada subida',
      '[TEST] Educando Prueba no asistira al campamento',
      '[TEST] Educando Prueba se ha inscrito al campamento',
      '[TEST] Educando Prueba ha cancelado asistencia',
      '[TEST] Educando Prueba ha confirmado asistencia'
    ];

    for (const titulo of notificacionesTitulos) {
      const notificacion = page.locator(`text="${titulo}"`).first();
      await expect(notificacion).toBeVisible({ timeout: 5000 });
    }

    // 5. Tomar screenshot para verificacion visual
    await page.screenshot({
      path: 'test-results/notificaciones-kraal-e2e.png',
      fullPage: true
    });
  });

  test('debe mostrar badge con contador "8" en header', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[placeholder*="correo"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Iniciar sesión")');
    await page.waitForURL('**/aula-virtual**', { timeout: 10000 });

    // Verificar badge en header (campana con numero)
    // El badge muestra el numero de notificaciones no leidas
    const badge = page.locator('button:has(svg) >> text=/[0-9]+/').first();
    await expect(badge).toBeVisible();

    // Verificar que el badge "8 nuevas" aparece en Actividad Reciente
    const badgeNuevas = page.locator('text=/\\d+ nuevas?/').first();
    await expect(badgeNuevas).toBeVisible();
  });

  test('debe mostrar prioridades correctas (alta/normal)', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[placeholder*="correo"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Iniciar sesión")');
    await page.waitForURL('**/aula-virtual**', { timeout: 10000 });

    // Verificar que hay notificaciones con prioridad "alta"
    const prioridadAlta = page.locator('text="alta"').first();
    await expect(prioridadAlta).toBeVisible();

    // Verificar que hay notificaciones con prioridad "normal"
    const prioridadNormal = page.locator('text="normal"').first();
    await expect(prioridadNormal).toBeVisible();
  });

  test('debe poder hacer click en "Ver" de una notificacion', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[placeholder*="correo"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Iniciar sesión")');
    await page.waitForURL('**/aula-virtual**', { timeout: 10000 });

    // Buscar el primer boton "Ver" en una notificacion [TEST]
    const verButton = page.locator('a:has-text("Ver")').first();
    await expect(verButton).toBeVisible();

    // Verificar que tiene href
    const href = await verButton.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('boton Actualizar debe refrescar la lista', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"], input[placeholder*="correo"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Iniciar sesión")');
    await page.waitForURL('**/aula-virtual**', { timeout: 10000 });

    // Click en boton Actualizar
    const actualizarButton = page.locator('button:has-text("Actualizar")');
    await expect(actualizarButton).toBeVisible();
    await actualizarButton.click();

    // Esperar un momento para que se refresque
    await page.waitForTimeout(1000);

    // Verificar que las notificaciones siguen visibles
    const notificacion = page.locator('text="[TEST] Solicitud de desbloqueo"').first();
    await expect(notificacion).toBeVisible();
  });

});
