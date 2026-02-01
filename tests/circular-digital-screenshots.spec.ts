import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = './docs/design/circular-digital/screenshots';

async function loginAs(page: Page, email: string, password: string) {
  const response = await page.request.post(`${API_URL}/api/auth/login`, {
    data: { email, password }
  });
  const data = await response.json();
  const token = data.data.token;
  const usuario = data.data.usuario;

  await page.goto(`${BASE_URL}/familia`);
  await page.evaluate(({ t, u }) => {
    localStorage.setItem('familia_token', t);
    localStorage.setItem('token', t);
    localStorage.setItem('usuario', JSON.stringify(u));
  }, { t: token, u: usuario });
  return data.data;
}

test('Screenshot: Página de circulares del familiar', async ({ page }) => {
  await loginAs(page, 'maria.garcia@test.com', 'Admin123#');
  await page.goto(`${BASE_URL}/familia/circulares`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-familia-circulares-lista.png`, fullPage: true });
});

test('Screenshot: Detalle de circular (ya firmada)', async ({ page }) => {
  await loginAs(page, 'maria.garcia@test.com', 'Admin123#');
  await page.goto(`${BASE_URL}/familia/circulares/1?educandoId=1`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02-familia-circular-detalle.png`, fullPage: true });
});

test('Screenshot: Página admin circulares', async ({ page }) => {
  await loginAs(page, 'web.osyris@gmail.com', 'Admin123#');
  await page.goto(`${BASE_URL}/admin/circulares`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03-admin-circulares-dashboard.png`, fullPage: true });
});
