const { Router } = require('express');
const authController = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

const router = Router();

router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.me);

module.exports = router;
