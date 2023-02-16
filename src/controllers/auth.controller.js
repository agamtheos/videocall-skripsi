const User = require('../models/user.model');

const encrypt = require('../helpers/encrypt');
const utils = require('../helpers/utils');
const { RESPONSE_MESSAGE } = require('../helpers/constants');

const controller = {};

controller.registerUser = async (req, res) => {
    const { username, password, role } = req.body;
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

controller.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                username: username
            }
        })

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404)

        const isMatch = await encrypt.comparePassword(password, user.password)

        if (!isMatch) return res.API.error(RESPONSE_MESSAGE.invalid_password, 400)

        const token = await encrypt.generateToken(user.username, user.role)

        const data = {
            token: token,
            role: user.role
        }

        return res.API.success(data, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
}

module.exports = controller;