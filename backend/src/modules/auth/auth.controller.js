const authService = require('./auth.service');
const env = require('../../config/env');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authService.login(username, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const cookieSecure =
      env.COOKIE_SECURE !== undefined && env.COOKIE_SECURE !== ''
        ? String(env.COOKIE_SECURE).toLowerCase() === 'true'
        : env.NODE_ENV === 'production';
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login successful', user: result.user });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const pool = require('../../config/db');
    await pool.query(
      `INSERT INTO activity_log (user_id, action) VALUES ($1, 'logout')`,
      [req.user.id]
    );
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, me };
