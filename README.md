# Test Automation Demo

Automated UI tests using Playwright and TypeScript.

## Test coverage

The checkout test verifies the complete purchase flow:

- Log in with valid credentials.
- Add the backpack and bike light to the cart.
- Verify the cart badge and number of products.
- Verify each product's name, quantity, and price.
- Calculate and verify the item subtotal.
- Enter generated customer information.
- Complete checkout and verify the confirmation message.
- Return to the Products page and verify the cart is empty.

## Project structure

The `playwright.config.ts` file contains the Playwright configuration. The `src/config` folder handles environment variables, while `src/data` stores login and product test data. Page locators and actions are kept in `src/pages`. The `tests` folder contains the end-to-end checkout test.

## Prerequisites

- Node.js
- npm

## Setup

1. Clone the repository:

```bash
git clone
```

2. Open the project folder:

```bash
cd
```

3. Install the project dependencies:

```bash
npm install
```

4. Install the Playwright Chromium browser:

```bash
npx playwright install chromium
```

5. Create a `.env` file in the project root:

```env
BASE_URL=https://www.saucedemo.com
VALID_USERNAME=your_username
VALID_PASSWORD=your_password
```

6. Run the test:

```bash
npm test
```

The test stops with a clear error if a required environment variable is missing. The `.env` file is ignored by Git and should not be committed.

## Run tests

Run the test in Chromium:

```bash
npm test
```

Run tests with the browser visible:

```bash
npm run test:headed
```

## Reports and debugging artifacts

Open the Playwright HTML report:

```bash
npm run report
```

Playwright stores the HTML report in `playwright-report/`. Traces are recorded for every run, while screenshots and videos are retained when a test fails.

## Configuration

The main settings are defined in `playwright.config.ts`:

- Tests run from the `tests/` directory.
- Chromium is used by the default npm test command.
- Tests run headlessly by default.
- The project uses `data-test` attributes for `getByTestId()` locators.
- CI runs use one retry and one worker.
