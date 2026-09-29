const pool = require('../config/db');
const { ensureBootstrapUsers } = require('./bootstrapUsers');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username    VARCHAR(100) UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        role        VARCHAR(20) NOT NULL DEFAULT 'user',
        created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20)`).catch(() => {});

    await client.query(`
      CREATE TABLE IF NOT EXISTS images (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        prompt      TEXT NOT NULL,
        image_name  VARCHAR(255) NOT NULL,
        image_data  BYTEA NOT NULL,
        width       INTEGER NOT NULL DEFAULT 512,
        height      INTEGER NOT NULL DEFAULT 512,
        file_size   INTEGER,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
        action      VARCHAR(100) NOT NULL,
        meta        JSONB,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_log(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at)`);

    await ensureBootstrapUsers(client);

    await client.query('COMMIT');
    console.log('[MIGRATE] All tables created/verified successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATE] Failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
