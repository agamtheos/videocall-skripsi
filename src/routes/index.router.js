const express = require('express');
const router = express.Router();

const ClientRouter = require('./client.router')
const AdminRouter = require('./admin.router')
const AuthRouter = require('./auth.router')

router.use('/client', ClientRouter)
router.use('/admin', AdminRouter)
router.use('/auth', AuthRouter)

module.exports = router;