# Test Automation Demo

Automated UI tests using Playwright and TypeScript.

## Test coverage

### Login

The login spec includes a skipped validation for successful login:

- Verify the username field, password field, and login button are visible.
- Log in with valid credentials.
- Verify the Products page loads after login.

### Checkout

The checkout spec verifies the complete purchase flow:

- Log in with valid credentials.
- Add the backpack and bike light to the cart.
- Verify the cart badge and number of products.
- Verify each product's name, quantity, and price.
- Calculate and verify the item subtotal.
- Calculate and verify tax and total price.
- Enter generated customer information.
- Complete checkout and verify the confirmation message.

## Project structure

The `playwright.config.ts` file contains the Playwright configuration. The `src/config` folder handles environment variables, while `src/data` stores login and product test data. Page locators and actions are kept in `src/pages`. The `tests` folder contains the Playwright specs for login and checkout coverage.

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

## Docker

Build the Playwright Docker image:

```bash
docker build --tag test-automation-v3 .
```

Run the tests inside Docker:

```bash
docker run --rm \
  --env-file .env \
  --volume "$(pwd)/playwright-report:/app/playwright-report" \
  --volume "$(pwd)/test-results:/app/test-results" \
  test-automation-v3
```

The `--env-file .env` option passes the required test configuration into the container. This is needed because `.env` is excluded from the Docker image and `--env BASE_URL` only works when `BASE_URL` is already exported in your shell. The mounted `playwright-report` and `test-results` folders keep Playwright reports, traces, screenshots, and videos available after the container exits.

## GitHub Actions

The GitHub Actions workflow in `.github/workflows/playwright.yml` runs on pushes to `main` and can also be started manually with `workflow_dispatch`.

The workflow:

- Checks out the repository.
- Builds the Docker image with the tag `test-automation-v3`.
- Runs `npm test` inside the Docker container.
- Passes `BASE_URL`, `VALID_USERNAME`, and `VALID_PASSWORD` from GitHub Actions secrets.
- Uploads the Playwright HTML report as a workflow artifact.

Configure these repository secrets before running the workflow:

- `BASE_URL`
- `VALID_USERNAME`
- `VALID_PASSWORD`

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
