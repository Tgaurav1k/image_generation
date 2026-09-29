const bcrypt = require('bcryptjs');
const pool = require('../../config/db');
const env = require('../../config/env');

const HIDDEN_USERS = () => [env.HERO_USERNAME].filter(Boolean);

async function createUser(username, password, adminId, role = 'user') {
  const allowedRoles = ['user', 'admin'];
  if (!allowedRoles.includes(role)) {
    return { error: 'Invalid role' };
  }

  const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (existing.rowCount > 0) {
    return { error: 'Username already exists' };
  }

  const hashed = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (username, password, role, created_by)
     VALUES ($1, $2, $3, $4) RETURNING id, username, role, created_at`,
    [username, hashed, role, adminId]
  );

  await pool.query(
    `INSERT INTO activity_log (user_id, action, meta) VALUES ($1, $2, $3)`,
    [adminId, role === 'admin' ? 'admin_created' : 'user_created', JSON.stringify({ new_username: username, new_user_id: rows[0].id, new_role: role })]
  );

  return { user: rows[0] };
}

async function listUsers(requestingUser) {
  if (requestingUser.role === 'superadmin') {
    const { rows } = await pool.query(`
      SELECT u.id, u.username, u.role, u.created_at, u.created_by,
             COUNT(i.id)::int AS image_count,
             creator.username AS created_by_username
      FROM users u
      LEFT JOIN images i ON i.user_id = u.id
      LEFT JOIN users creator ON creator.id = u.created_by
      WHERE u.role IN ('user', 'admin')
        AND u.username != ALL($1)
      GROUP BY u.id, creator.username
      ORDER BY u.created_at DESC
    `, [HIDDEN_USERS()]);
    return rows;
  }

  const { rows } = await pool.query(`
    SELECT u.id, u.username, u.role, u.created_at,
           COUNT(i.id)::int AS image_count
    FROM users u
    LEFT JOIN images i ON i.user_id = u.id
    WHERE u.created_by = $1
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `, [requestingUser.id]);
  return rows;
}

async function getDashboard(requestingUser) {
  if (requestingUser.role === 'superadmin') {
    return getGlobalDashboard();
  }
  return getScopedDashboard(requestingUser.id);
}

async function getGlobalDashboard() {
  const hidden = HIDDEN_USERS();

  const totalsQ = pool.query(`
    SELECT COUNT(*)::int AS total_images,
           COALESCE(SUM(file_size), 0)::bigint AS total_storage_bytes
    FROM images
    WHERE user_id NOT IN (
      SELECT id FROM users WHERE username = ANY($1)
    )
  `, [hidden]);

  const perUserQ = pool.query(`
    SELECT u.username,
           COUNT(i.id)::int AS image_count,
           MAX(al.created_at) AS last_active
    FROM users u
    LEFT JOIN images i ON i.user_id = u.id
    LEFT JOIN activity_log al ON al.user_id = u.id
    WHERE u.username != ALL($1)
    GROUP BY u.id, u.username
    ORDER BY image_count DESC
  `, [hidden]);

  const activityQ = pool.query(`
    SELECT al.action, al.meta, al.created_at,
           u.username
    FROM activity_log al
    LEFT JOIN users u ON u.id = al.user_id
    WHERE u.username != ALL($1)
    ORDER BY al.created_at DESC
    LIMIT 50
  `, [hidden]);

  const [totals, perUser, activity] = await Promise.all([totalsQ, perUserQ, activityQ]);

  return {
    total_images: totals.rows[0].total_images,
    total_storage_bytes: parseInt(totals.rows[0].total_storage_bytes),
    users: perUser.rows,
    recent_activity: activity.rows,
  };
}

async function getScopedDashboard(adminId) {
  const userIdsRes = await pool.query(
    `SELECT id FROM users WHERE created_by = $1`, [adminId]
  );
  const userIds = userIdsRes.rows.map(r => r.id);
  const allIds = [adminId, ...userIds];

  const totalsQ = pool.query(`
    SELECT COUNT(*)::int AS total_images,
           COALESCE(SUM(file_size), 0)::bigint AS total_storage_bytes
    FROM images
    WHERE user_id = ANY($1)
  `, [allIds]);

  const perUserQ = pool.query(`
    SELECT u.username,
           COUNT(i.id)::int AS image_count,
           MAX(al.created_at) AS last_active
    FROM users u
    LEFT JOIN images i ON i.user_id = u.id
    LEFT JOIN activity_log al ON al.user_id = u.id
    WHERE u.id = ANY($1)
    GROUP BY u.id, u.username
    ORDER BY image_count DESC
  `, [allIds]);

  const activityQ = pool.query(`
    SELECT al.action, al.meta, al.created_at,
           u.username
    FROM activity_log al
    LEFT JOIN users u ON u.id = al.user_id
    WHERE al.user_id = ANY($1)
    ORDER BY al.created_at DESC
    LIMIT 50
  `, [allIds]);

  const [totals, perUser, activity] = await Promise.all([totalsQ, perUserQ, activityQ]);

  return {
    total_images: totals.rows[0].total_images,
    total_storage_bytes: parseInt(totals.rows[0].total_storage_bytes),
    users: perUser.rows,
    recent_activity: activity.rows,
  };
}

async function listAdmins() {
  const { rows } = await pool.query(`
    SELECT u.id, u.username, u.role, u.created_at,
           COUNT(DISTINCT sub.id)::int AS user_count,
           COUNT(DISTINCT i.id)::int AS total_images
    FROM users u
    LEFT JOIN users sub ON sub.created_by = u.id AND sub.role = 'user'
    LEFT JOIN images i ON i.user_id = sub.id
    WHERE u.role = 'admin'
      AND u.username != ALL($1)
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `, [HIDDEN_USERS()]);
  return rows;
}

async function deleteAdmin(adminId) {
  const check = await pool.query('SELECT id, role FROM users WHERE id = $1', [adminId]);
  if (check.rowCount === 0) return { error: 'Admin not found' };
  if (check.rows[0].role !== 'admin') return { error: 'User is not an admin' };

  await pool.query('UPDATE users SET created_by = NULL WHERE created_by = $1', [adminId]);
  await pool.query('DELETE FROM users WHERE id = $1', [adminId]);
  return { success: true };
}

async function changePassword(userId, newPassword, requestingUser) {
  const target = await pool.query('SELECT id, role, created_by FROM users WHERE id = $1', [userId]);
  if (target.rowCount === 0) return { error: 'User not found' };

  const targetUser = target.rows[0];

  // Superadmin can change anyone's password (except other superadmins)
  // Admin can only change passwords of users they created
  if (requestingUser.role === 'superadmin') {
    if (targetUser.role === 'superadmin' && targetUser.id !== requestingUser.id) {
      return { error: 'Cannot change another superadmin password' };
    }
  } else if (requestingUser.role === 'admin') {
    if (targetUser.created_by !== requestingUser.id) {
      return { error: 'You can only change passwords for users you created' };
    }
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

  await pool.query(
    `INSERT INTO activity_log (user_id, action, meta) VALUES ($1, $2, $3)`,
    [requestingUser.id, 'password_changed', JSON.stringify({ target_user_id: userId })]
  );

  return { success: true };
}

async function syncUser(username, password, role, createdById) {
  const allowedRoles = ['user', 'admin'];
  if (!allowedRoles.includes(role)) {
    return { error: 'Invalid role. Must be "user" or "admin"' };
  }

  const hashed = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (username, password, role, created_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
     RETURNING id, username, role, created_at,
       (xmax = 0) AS is_insert`,
    [username, hashed, role, createdById]
  );

  const user = rows[0];
  const created = user.is_insert;
  delete user.is_insert;

  await pool.query(
    `INSERT INTO activity_log (user_id, action, meta) VALUES ($1, $2, $3)`,
    [createdById, 'user_synced', JSON.stringify({
      target_username: username,
      target_user_id: user.id,
      role,
      created,
    })]
  );

  return { user, created };
}

module.exports = { createUser, listUsers, getDashboard, listAdmins, deleteAdmin, changePassword, syncUser };
