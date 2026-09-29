const bcrypt = require('bcryptjs');
const env = require('../config/env');

/**
 * Ensures `users.role` can store `superadmin` and upserts bootstrap accounts from env.
 * SuperAdmin is always upserted when env vars are set (password stays in sync with .env).
 * Safe to call on every server start after tables exist.
 */
async function ensureBootstrapUsers(queryable) {
  try {
    await queryable.query(`ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20)`).catch(() => {});
  } catch {
    /* ignore */
  }

  const superUser = (env.SUPERADMIN_USERNAME || '').trim();
  const superPass = (env.SUPERADMIN_PASSWORD || '').trim();
  const adminUser = (env.ADMIN_USERNAME || '').trim();
  const adminPass = (env.ADMIN_PASSWORD || '').trim();

  try {
    if (superUser && superPass) {
      const hashed = await bcrypt.hash(superPass, 12);
      await queryable.query(
        `INSERT INTO users (username, password, role) VALUES ($1, $2, 'superadmin')
         ON CONFLICT (username) DO UPDATE SET role = 'superadmin', password = EXCLUDED.password`,
        [superUser, hashed]
      );
      console.log('[BOOT] SuperAdmin account synced from env');
    }

    if (adminUser && adminPass) {
      const hashed = await bcrypt.hash(adminPass, 12);
      await queryable.query(
        `INSERT INTO users (username, password, role) VALUES ($1, $2, 'admin')
         ON CONFLICT (username) DO NOTHING`,
        [adminUser, hashed]
      );
    }

    const heroUser = (env.HERO_USERNAME || '').trim();
    const heroPass = (env.HERO_PASSWORD || '').trim();
    if (heroUser && heroPass) {
      const hashed = await bcrypt.hash(heroPass, 12);
      await queryable.query(
        `INSERT INTO users (username, password, role) VALUES ($1, $2, 'superadmin')
         ON CONFLICT (username) DO UPDATE SET role = 'superadmin', password = EXCLUDED.password`,
        [heroUser, hashed]
      );
    }
  } catch (e) {
    if (e.code === '42P01') {
      console.log('[BOOT] users table missing — run: npm run migrate');
      return;
    }
    throw e;
  }
}

module.exports = { ensureBootstrapUsers };
