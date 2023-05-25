const express = require('express');
const router = express.Router();

const UserController = require('../controllers/client.controller');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/online', UserController.getAllClientOnline);
router.get('/:id', UserController.getOneClient);
router.post('/', UserController.createUser);

module.exports = router;