const { test, expect } = require('@playwright/test');

async function registerAndLogin(page) {
  const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 1000)}@neonledger.app`;
  await page.goto('/register');
  await page.getByLabel(/Nombre/i).fill('Tester');
  await page.getByLabel(/Correo electrónico/i).fill(email);
  await page.getByLabel(/^Contraseña/).fill('secret123');
  await page.getByLabel(/Confirmar contraseña/i).fill('secret123');
  await page.getByRole('button', { name: /Crear cuenta/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('CRUD de transacciones', () => {
  test('crea una transacción y aparece en el ledger', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto('/transactions');
    await expect(page.getByRole('heading', { name: /Libro de Transacciones/i })).toBeVisible();

    // Abrir "Agregar" desde la cabecera de la página (datos ya cargados).
    await page.getByRole('button', { name: 'Agregar' }).last().click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Título/i).fill('Compra E2E única');
    await dialog.getByLabel(/Monto/i).fill('321.50');
    // Esperar a que existan categorías antes de seleccionar.
    const categorySelect = dialog.getByLabel(/Categoría/i);
    await expect(categorySelect.locator('option').nth(1)).toBeAttached();
    await categorySelect.selectOption({ index: 1 });
    await dialog.getByRole('button', { name: /Registrar/i }).click();

    await expect(page.getByText(/Compra E2E única/i).first()).toBeVisible();
  });

  test('valida campos obligatorios en el formulario', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'Agregar' }).first().click();

    const dialog = page.getByRole('dialog');
    // Enviar vacío → aparece error, no se cierra el modal.
    await dialog.getByRole('button', { name: /Registrar/i }).click();
    await expect(dialog.getByText(/el título es obligatorio/i)).toBeVisible();
  });

  test('la búsqueda filtra el ledger', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto('/transactions');
    await page.getByPlaceholder(/Buscar por título/i).fill('Renta');
    // Debe mostrar la fila de renta sembrada y filtrar el resto.
    await expect(page.getByText(/Modernist Loft/i).first()).toBeVisible();
  });
});
