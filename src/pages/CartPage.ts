import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly quantity: Locator;
  readonly itemName: Locator;
  readonly checkoutButton: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;
  readonly shoppingCartBadge: Locator;
  readonly cartList: Locator;

  // set up cart and checkout page locators
  constructor(page: Page) {
    this.page = page;
    this.quantity = page.getByTestId('item-quantity');
    this.itemName = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
    this.cartList = page.getByTestId('cart-list');
  }
}
