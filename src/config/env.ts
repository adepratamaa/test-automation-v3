// environment variable
type EnvKey = 'BASE_URL' | 'VALID_PASSWORD' | 'VALID_USERNAME';

// read a required environment variable
export function getEnv(key: EnvKey) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}
