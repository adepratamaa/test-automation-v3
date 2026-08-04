FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

# Copy dependency files first to improve Docker layer caching
COPY package.json package-lock.json ./

# Install the exact dependencies from package-lock.json
RUN npm ci

# Copy the rest of the automation framework
COPY . .

# Run all Playwright tests by default
CMD ["npx", "playwright", "test"]