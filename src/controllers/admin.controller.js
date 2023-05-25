const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const utils = require('../helpers/utils');
const encrypt = require('../helpers/encrypt');
const { RESPONSE_MESSAGE } = require('../helpers/constants');

const controller = {};

controller.addUser = async (req, res) => {
    const { username, password, role } = req.body;
    let missing = utils.missing_params(['username', 'password', 'role'], req.body)
    if (missing.length > 0) return res.API.error(RESPONSE_MESSAGE.invalid_parameter(missing), 400)
    try {
        const isExist = await User.findOne({
            where: {
                username: username
            }
        })

        if (isExist) return res.API.error(RESPONSE_MESSAGE.already_exist, 400)

        const hashPassword = await encrypt.encryptPassword(password)
        
        User.create({
            username: username,
            password: hashPassword,
            role: role,
            created_at: new Date(),
        })

        return res.API.success(RESPONSE_MESSAGE.success, 201)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
}

controller.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({
            where: {
                id: id
            }
        })

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404)

        await User.destroy({
            where: {
                id: id
            }
        })

        return res.API.success(RESPONSE_MESSAGE.success, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
}

controller.getAllAdminOnline = async (req, res) => {
    const options = {
        where: {
            is_online: true,
            role: 'admin'
        },
        attributes: ['id', ['username', 'name'], ['short_name', 'shortName'], 'role']
    }

    const users = await User.findAll({
        ...options,
    })

    return res.API.success(users, 200)
}

controller.changePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                id: id
            }
        })

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404)

        const newPassword = await encrypt.encryptPassword(password)

        await User.update({
            password: newPassword
        }, {
            where: {
                id: id
            }
        })

        return res.API.success(RESPONSE_MESSAGE.success, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
}

controller.changeUsername = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try {
        const user = await User.findOne({
            where: {
                id: id
            }
        })

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404)

        await User.update({
            username: username
        }, {
            where: {
                id: id
            }
        })

        return res.API.success(RESPONSE_MESSAGE.success, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
}

module.exports = controller;