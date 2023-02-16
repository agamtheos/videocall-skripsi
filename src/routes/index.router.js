const express = require('express');
const router = express.Router();

const UserRouter = require('./users.router')
const AuthRouter = require('./auth.router')

router.use('/user', UserRouter)
router.use('/auth', AuthRouter)

module.exports = router;