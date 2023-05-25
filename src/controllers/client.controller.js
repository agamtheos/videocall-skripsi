const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const utils = require('../helpers/utils');
const encrypt = require('../helpers/encrypt');
const { RESPONSE_MESSAGE } = require('../helpers/constants');

const controller = {};

controller.getAllClientOnline = async (req, res) => {
    const options = {
        where: {
            is_online: true,
            role: 'client'
        },
        attributes: ['id', ['username', 'name'], ['short_name', 'shortName'], 'role']
    }

    const users = await User.findAll({
        ...options,
    })

    return res.API.success(users, 200)
}

controller.getOneClient = async (req, res) => {
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

controller.createUser = async (req, res) => {
    const { username, password } = req.body;
    const role = 'admin'
    try {
        let missing = utils.missing_params(['username', 'password'], req.body)
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

        const newPasword = await encrypt.encryptPassword(password)

        await User.update({
            password: newPasword,
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
};

module.exports = controller;