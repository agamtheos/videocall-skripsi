const express = require('express');
const router = express.Router();

const ClientRouter = require('./client.router')
const AdminRouter = require('./admin.router')
const AuthRouter = require('./auth.router')
const UsersRouter = require('./users.router')

router.use('/client', ClientRouter)
router.use('/admin', AdminRouter)
router.use('/auth', AuthRouter)
router.use('/users', UsersRouter)

module.exports = router;