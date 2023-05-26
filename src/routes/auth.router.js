const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');

router.get('/ok', AuthController.checkServer);
router.get('/profile', auth, AuthController.getProfile);
router.get('/logout/:username', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);
router.post('/change-password', auth, AuthController.changePassword);


module.exports = router;