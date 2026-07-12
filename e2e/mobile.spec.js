const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 375, height: 800 } });

test('sin scroll horizontal en móvil (375px)', async ({ page }) => {
  const email = `m_${Date.now()}@neonledger.app`;
  await page.goto('/register');
  await page.getByLabel(/Nombre/i).fill('Móvil');
  await page.getByLabel(/Correo electrónico/i).fill(email);
  await page.getByLabel(/^Contraseña/).fill('secret123');
  await page.getByLabel(/Confirmar contraseña/i).fill('secret123');
  await page.getByRole('button', { name: /Crear cuenta/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForTimeout(1500);

  for (const path of ['/dashboard', '/budgets', '/debts', '/wallets', '/goals', '/transactions', '/analysis', '/settings']) {
    await page.goto(path);
    await page.waitForTimeout(1200);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    // Sin overflow horizontal (tolerancia mínima de 2px por redondeos).
    expect(overflow, `overflow en ${path}`).toBeLessThanOrEqual(2);
  }
});
