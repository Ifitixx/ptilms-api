// updateEnv.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = process.argv[2];

if (!url) {
  console.error('No URL provided.');
  process.exit(1);
}

const envPath = path.resolve(__dirname, '.env');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  // Remove any trailing slash and append "/api/v1"
  const newBaseUrl = `${url.replace(/\/$/, '')}/api/v1`;
  envContent = envContent.replace(/APP_BASE_URL=.*/, `APP_BASE_URL=${newBaseUrl}`);
  fs.writeFileSync(envPath, envContent);
  console.log(`.env updated with APP_BASE_URL=${newBaseUrl}`);
} catch (err) {
  console.error('Error updating .env:', err);
  process.exit(1);
}