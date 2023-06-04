const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/users.controller');
const auth = require('../middlewares/auth');
const { USER_ROLE } = require('../helpers/constants');
const checkRoleClaim = require('../middlewares/check-role-claim');

router.use(auth, checkRoleClaim(USER_ROLE.ADMIN));
router.get('/', UsersController.getAllUser);
router.get('/:id', UsersController.getDetailUser);
router.put('/:id', UsersController.updateUser);
router.post('/', UsersController.createUser);
router.delete('/:id', UsersController.deleteUser);

module.exports = router;