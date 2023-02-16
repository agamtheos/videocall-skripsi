const express = require('express');
const router = express.Router();

const UserController = require('../controllers/users.controller');
const auth = require('../middlewares/auth');


router.get('/', UserController.getAllUser);
router.get('/online', UserController.getAllOnlineUser);
router.get('/:id', UserController.getOneUser);
router.post('/', UserController.createUser);

module.exports = router;