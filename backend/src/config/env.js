const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const defaultOrigin = 'http://localhost:5173';
const frontendOrigins = (process.env.FRONTEND_ORIGIN || defaultOrigin)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  /** Set to "true" only behind HTTPS. Plain HTTP (typical Docker IP:port) must use "false". */
  COOKIE_SECURE: process.env.COOKIE_SECURE,
  /** First origin (legacy); use FRONTEND_ORIGINS for CORS checks. */
  FRONTEND_ORIGIN: frontendOrigins[0] || defaultOrigin,
  /** All browser origins allowed for CORS (comma-separated in FRONTEND_ORIGIN). */
  FRONTEND_ORIGINS: frontendOrigins,
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT || 5432,
  PGDATABASE: process.env.PGDATABASE,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  IMAGE_API_URL: process.env.IMAGE_API_URL,
  IMAGE_API_KEY: process.env.IMAGE_API_KEY,
  ENHANCE_API_URL: process.env.ENHANCE_API_URL,
  ENHANCE_API_KEY: process.env.ENHANCE_API_KEY,
  ENHANCE_MODEL: process.env.ENHANCE_MODEL,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SUPERADMIN_USERNAME: process.env.SUPERADMIN_USERNAME,
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD,
  HERO_USERNAME: process.env.HERO_USERNAME,
  HERO_PASSWORD: process.env.HERO_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};
