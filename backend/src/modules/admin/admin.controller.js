const adminService = require('./admin.service');

async function createUser(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await adminService.createUser(username, password, req.user.id, 'user');
    if (result.error) {
      return res.status(409).json({ error: result.error });
    }

    res.status(201).json({ message: 'User created', user: result.user });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await adminService.listUsers(req.user);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function dashboard(req, res, next) {
  try {
    const data = await adminService.getDashboard(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function createAdmin(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await adminService.createUser(username, password, req.user.id, 'admin');
    if (result.error) {
      return res.status(409).json({ error: result.error });
    }

    res.status(201).json({ message: 'Admin created', user: result.user });
  } catch (err) {
    next(err);
  }
}

async function listAdmins(req, res, next) {
  try {
    const admins = await adminService.listAdmins();
    res.json({ admins });
  } catch (err) {
    next(err);
  }
}

async function deleteAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const result = await adminService.deleteAdmin(id);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const result = await adminService.changePassword(id, newPassword, req.user);
    if (result.error) {
      return res.status(403).json({ error: result.error });
    }
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function syncUser(req, res, next) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const finalRole = role || 'user';
    const result = await adminService.syncUser(username, password, finalRole, req.user.id);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const status = result.created ? 201 : 200;
    res.status(status).json({
      message: 'User synced',
      user: result.user,
      created: result.created,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser, listUsers, dashboard, createAdmin, listAdmins, deleteAdmin, changePassword, syncUser };
