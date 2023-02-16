const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const utils = require('../helpers/utils');
const { RESPONSE_MESSAGE } = require('../helpers/constants');

const controller = {};

controller.getAllUser = async (req, res) => {
    const users = await User.findAll({
        attributes: ['id', 'username', 'role']
    })

    return res.API.success(users, 200)
}

controller.getOneUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({
            where: {
                id: id
            },
            attributes: ['id', 'username', 'role']
        })
    
        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404)
    
        return res.API.success(user, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
}

controller.getAllOnlineUser = async (req, res) => {
    const users = await User.findAll({
        where: {
            is_online: true
        },
        attributes: ['id', 'username', 'role']
    })

    return res.API.success(users, 200)
}

controller.createUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        let missing = utils.missing_params(['username', 'password', 'role'], req.body)
        if (missing.length > 0) return res.API.error(RESPONSE_MESSAGE.invalid_parameter(missing), 400)

        const user = await User.findOne({
            where: {
                username: username
            }
        })

        if (user) return res.API.error(RESPONSE_MESSAGE.already_exist, 400)

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        User.create({
            username: username,
            password: hash,
            role: role,
            created_at: new Date(),
            updated_at: new Date()
        })
        
        return res.API.success(RESPONSE_MESSAGE.success, 201)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
}

module.exports = controller;