import { test, expect, defineConfig } from '@playwright/test';
import { loginUsers } from '../src/data/loginUsers';
import { LoginPage } from '../src/pages/LoginPage';
import { ProductsPage } from '../src/pages/ProductsPage';

// test case: valid user login
test.skip('valid user can log in', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);
  const user = loginUsers[0];

  await page.goto('/');

  await expect(loginPage.usernameInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.loginButton).toBeVisible();

  await loginPage.login(user.username, user.password);
  await productsPage.expectLoaded();
});
