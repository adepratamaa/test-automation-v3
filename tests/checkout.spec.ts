import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { loginUsers } from '../src/data/loginUsers';
import { LoginPage } from '../src/pages/LoginPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { CartPage } from '../src/pages/CartPage';
import { products } from '../src/data/products';

test(`checkout`, async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);

  // login
  await page.goto('/');
  await loginPage.login(loginUsers[0].username, loginUsers[0].password);
  await productsPage.expectLoaded();

  // add product
  const backpack = products[0];
  const lightBike = products[1];
  // console.log(backpack);
  const backpackPrice = await productsPage.getPrice(backpack);
  const lightBikePrice = await productsPage.getPrice(lightBike);
  // console.log('backpackPrice: ', backpackPrice);

  // add to cart
  await productsPage.addProductToCart(backpack);
  await productsPage.addProductToCart(lightBike);
  await expect(cartPage.shoppingCartBadge).toHaveText('2');

  // cart
  await productsPage.cartLink.click();
  await expect(page).toHaveURL('/cart.html');
  await expect(productsPage.title).toHaveText('Your Cart');
  await expect(productsPage.inventoryItem).toHaveCount(2);
  await productsPage.expectProductQuantity(backpack, '1');
  await productsPage.expectProductQuantity(lightBike, '1');
  await productsPage.expectProductPrice(
    backpack,
    `$${backpackPrice.toString()}`,
  );
  await productsPage.expectProductPrice(
    lightBike,
    `$${lightBikePrice.toString()}`,
  );
  await expect(productsPage.productByName(backpack)).toContainText(backpack);
  await expect(productsPage.productByName(lightBike)).toContainText(lightBike);

  // checkout
  await cartPage.checkoutButton.click();
  await expect(page).toHaveURL('/checkout-step-one.html');
  await expect(productsPage.title).toHaveText('Checkout: Your Information');

  // fill information
  await cartPage.firstNameInput.pressSequentially(faker.person.firstName(), {
    delay: 50,
  });
  await cartPage.lastNameInput.pressSequentially(faker.person.lastName(), {
    delay: 50,
  });
  await cartPage.postalCodeInput.pressSequentially(faker.location.zipCode(), {
    delay: 50,
  });

  // checkout step two
  await cartPage.continueButton.click();
  await expect(page).toHaveURL('/checkout-step-two.html');
  await expect(productsPage.title).toHaveText('Checkout: Overview');
  // total price
  const totalPrice = backpackPrice + lightBikePrice;
  await expect(productsPage.subTotal).toHaveText(
    `Item total: $${totalPrice.toString()}`,
  );

  // finish
  await cartPage.finishButton.click();
  await expect(page).toHaveURL('/checkout-complete.html');
  await expect(productsPage.title).toHaveText('Checkout: Complete!');
  await expect(cartPage.completeHeader).toHaveText('Thank you for your order!');

  //   await cartPage.backHomeButton.click();
  //   await productsPage.expectLoaded();
  //   await expect(cartPage.shoppingCartBadge).not.toBeVisible();
});
