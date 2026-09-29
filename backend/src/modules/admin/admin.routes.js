const { Router } = require('express');
const adminController = require('./admin.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireAdmin, requireSuperAdmin } = require('../../middleware/role.middleware');

const router = Router();

router.use(verifyToken, requireAdmin);

router.post('/users', adminController.createUser);
router.get('/users', adminController.listUsers);
router.put('/users/:id/password', adminController.changePassword);
router.get('/dashboard', adminController.dashboard);

router.post('/admins', requireSuperAdmin, adminController.createAdmin);
router.get('/admins', requireSuperAdmin, adminController.listAdmins);
router.delete('/admins/:id', requireSuperAdmin, adminController.deleteAdmin);

router.post('/sync-user', requireSuperAdmin, adminController.syncUser);

module.exports = router;
