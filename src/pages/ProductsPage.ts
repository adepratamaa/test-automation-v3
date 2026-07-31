import { expect, type Locator, type Page } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryItem: Locator;
  readonly cartLink: Locator;
  readonly inventoryContainer: Locator;
  readonly burgerButton: Locator;
  readonly aboutBtn: Locator;

  // set up products page locators
  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.inventoryItem = page.getByTestId('inventory-item');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.inventoryContainer = page.getByTestId('inventory-container');
    this.burgerButton = page.getByTestId('open-menu');
    this.aboutBtn = page.locator('[href="https://saucelabs.com/"]');
  }

  // verify the products page is displayed
  async expectLoaded() {
    await expect(this.page).toHaveURL('/inventory.html');
    await expect(this.title).toHaveText('Products');
    await expect(this.inventoryContainer).toBeVisible();
  }

  // find a product card by product name
  productByName(productName: string) {
    return this.inventoryItem.filter({
      hasText: productName,
    });
  }

  // find the add-to-cart button for a selected product
  addButton(productName: string) {
    return this.productByName(productName).getByRole('button', {
      name: 'Add to cart',
    });
  }

  // find the remove button for a selected product
  removeButton(productName: string) {
    return this.productByName(productName).getByRole('button', {
      name: 'Remove',
    });
  }

  // find the quantity element for a selected product
  quantity(productName: string) {
    return this.productByName(productName).getByTestId('item-quantity');
  }

  // find the price element for a selected product
  price(productName: string) {
    return this.productByName(productName).getByTestId('inventory-item-price');
  }

  // get the price
  async getPrice(productName: string) {
    await expect(this.price(productName)).toBeVisible();
    const priceText = await this.price(productName).innerText();
    return Number(priceText.replace('$', ''));
  }

  // read the visible name from a product card
  async getProductName(productName: string) {
    return this.productByName(productName).innerText();
  }

  // add a selected product to the shopping cart
  async addProductToCart(productName: string) {
    await expect(this.productByName(productName)).toBeVisible();
    await this.addButton(productName).click();
  }

  // remove a selected product from the shopping cart
  async removeProductFromCart(productName: string) {
    await expect(this.productByName(productName)).toBeVisible();
    await this.removeButton(productName).click();
  }

  // verify the quantity shown for a selected product
  async expectProductQuantity(productName: string, quantity: string) {
    await expect(this.quantity(productName)).toHaveText(quantity);
  }

  // verify the price shown for a selected product
  async expectProductPrice(productName: string, price: string) {
    await expect(this.price(productName)).toHaveText(price);
  }
}
