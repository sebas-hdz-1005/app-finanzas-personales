const { test, expect } = require('@playwright/test');

test.describe('Autenticación y protección de rutas', () => {
  test('redirige a /login cuando no hay sesión', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/Correo electrónico/i).first()).toBeVisible();
  });

  test('registro de nueva cuenta → dashboard con datos sembrados', async ({ page }) => {
    const email = `e2e_${Date.now()}@neonledger.app`;
    await page.goto('/register');

    await page.getByLabel(/Nombre/i).fill('Operador E2E');
    await page.getByLabel(/Correo electrónico/i).fill(email);
    await page.getByLabel(/^Contraseña/).fill('secret123');
    await page.getByLabel(/Confirmar contraseña/i).fill('secret123');
    await page.getByRole('button', { name: /Crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { level: 1, name: /Hola/i })).toBeVisible();
    // El seed crea KPIs con datos.
    await expect(page.getByText(/Ingresos Totales/i)).toBeVisible();
  });

  test('login con Google (simulado en demo)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Continuar con Google/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { level: 1, name: /Hola/i })).toBeVisible();
  });

  test('login demo y logout', async ({ page }) => {
    await page.goto('/login');
    await page.getByText(/usar credenciales demo/i).click();
    await page.getByRole('button', { name: /Iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    // Abrir menú de usuario y cerrar sesión.
    await page.getByRole('button', { name: /Menú de usuario/i }).click();
    await page.getByRole('menuitem', { name: /Cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
