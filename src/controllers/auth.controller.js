const User = require('../models/user.model');

const encrypt = require('../helpers/encrypt');
const utils = require('../helpers/utils');
const { RESPONSE_MESSAGE } = require('../helpers/constants');

const controller = {};

controller.registerUser = async (req, res) => {
    const { username, password, role } = req.body;
    // const role = 'admin'
    // create shorName from first letter of each word in username
    const shortName = username.split(' ').map(word => word[0]).join('').toUpperCase()
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
            short_name: shortName,
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

        const token = await encrypt.generateToken(user.id, user.username, user.role)

        await User.update({
            is_online: true
        }, {
            where: {
                username: username
            }
        })

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

controller.logout = async (req, res) => {
    const { username } = req.params;
    try {
        await User.update({
            is_online: false
        }, {
            where: {
                username: username
            }
        })

        return res.API.success(RESPONSE_MESSAGE.success, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
};

controller.verifyJwt = async (req, res, next) => {
    let token = req.headers['authorization'] || req.header('Authorization');
    if (!token) return res.error(RESPONSE_MESSAGE.unauthorized, 401);

    try {
        const data = {
            token: token,
            role: req.auth.token
        }

        return res.API.success(data, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
};

controller.forgotPassword = async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({
            where: {
                username: username
            }
        });

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404)

        return res.API.success(RESPONSE_MESSAGE.success, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
};

controller.resetPassword = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                username: username
            }
        })

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404)

        const hashPassword = await encrypt.encryptPassword(password)

        await User.update({
            password: hashPassword
        },{
            where: {
                username: username
            }
        });

        return res.API.success(RESPONSE_MESSAGE.success, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
};

controller.changePassword = async (req, res) => {
    const { password, newPassword } = req.body;
    try {
        const user = await User.findOne({
            where: {
                id: req.auth.uid
            }
        });

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404)
        console.log(password, user.password)
        const isMatch = await encrypt.comparePassword(password, user.password)

        if (!isMatch) return res.API.error(RESPONSE_MESSAGE.invalid_password, 400)

        const hashPassword = await encrypt.encryptPassword(newPassword)

        await User.update({
            password: hashPassword
        }, {
            where: {
                id: req.auth.uid
            }
        });
        
        return res.API.success(RESPONSE_MESSAGE.success, 200)
    } catch (error) {
        console.log(error)
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500)
    }
};

controller.getProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.auth.uid
            },
            attributes: ['id', 'username', 'role', 'is_online']
        });
    
        return res.API.success(user)
    } catch (error) {
        return res.API.error(error.message)
    }
};

controller.checkServer = async (req, res) => {
    try {
        return res.API.success(RESPONSE_MESSAGE.success, 200)
    } catch (error) {
        return res.API.error(error.message)
    }
};

module.exports = controller;