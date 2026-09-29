const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const env = require('../../config/env');

async function login(username, password) {
  const u = String(username || '').trim();
  const p = String(password || '');
  const { rows } = await pool.query(
    'SELECT id, username, password, role FROM users WHERE username = $1',
    [u]
  );
  if (rows.length === 0) return null;

  const user = rows[0];
  const valid = await bcrypt.compare(p, user.password);
  if (!valid) return null;

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  await pool.query(
    `INSERT INTO activity_log (user_id, action) VALUES ($1, 'login')`,
    [user.id]
  );

  return {
    token,
    user: { id: user.id, username: user.username, role: user.role },
  };
}

async function getMe(userId) {
  const { rows } = await pool.query(
    'SELECT id, username, role FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
}

module.exports = { login, getMe };
