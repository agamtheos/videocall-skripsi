const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/admin.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/online', AdminController.getAllAdminOnline);

module.exports = router;