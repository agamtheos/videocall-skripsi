const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const User = require('../models/user.model');
const { RESPONSE_MESSAGE } = require('../helpers/constants');
const utils = require('../helpers/utils');
const pagination = require('../helpers/pagination');
const { encryptPassword } = require('../helpers/encrypt');

const controller = {};

controller.getAllUser = async (req, res) => {
    const {q, page, size, sort} = req.query;
    const { limit, offset } = pagination.getPagination(page, size);

    let configs = {
        attributes: ['id', 'username', 'role', 'created_at', 'updated_at'],
        order: [],
        offset,
        limit,
    }

    switch (sort) {
        case 'username_asc':
            configs.order.push(['username', 'ASC']);
        break;
        case 'username_desc':
            configs.order.push(['username', 'DESC']);
        break;
        case 'role_asc':
            configs.order.push(['role', 'ASC']);
        break;
        case 'role_desc':
            configs.order.push(['role', 'DESC']);
        break;
        case 'created_asc':
            configs.order.push(['created_at', 'ASC']);
        break;
        case 'created_desc':
            configs.order.push(['created_at', 'DESC']);
        break;
        case 'updated_asc':
            configs.order.push(['updated_at', 'ASC']);
        break;
    }

    if (q) {
        configs.where = {
            ...configs.where,
            username: {
                [Op.like]: `%${q}%`
            }
        }
    }

    try {
        const users = await User.findAndCountAll(configs);

        const meta = pagination.getMetaData(users.count, page, limit);

        return res.API.success(users.rows, 200, meta);
    } catch (error) {
        console.log(error);
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500);
    }
};

controller.getDetailUser = async (req, res) => {
    const {id} = req.params;
    try {
        const user = await User.findOne({
            where: {
                id: id
            },
            attributes: ['id', 'username', 'role', 'created_at', 'updated_at']
        });
    } catch (error) {
        console.log(error);
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500);
    }
};

controller.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({
            where: {
                id: id
            }
        });

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404);

        await User.destroy({
            where: {
                id: id
            }
        });

        return res.API.success(RESPONSE_MESSAGE.success, 200);
    } catch (error) {
        console.log(error);
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500);
    }
};

controller.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;
    try {
        let configs = {}

        const user = await User.findOne({
            where: {
                id: id
            }
        });

        if (username) {
            configs.username = username;
        }

        if (password) {
            configs.password = await encryptPassword(password);
        }

        if (role) {
            configs.role = role;
        }

        if (!user) return res.API.error(RESPONSE_MESSAGE.not_found, 404);

        await User.update(configs, {
            where: {
                id: id
            }
        });

        return res.API.success(RESPONSE_MESSAGE.success, 200);
    } catch (error) {
        console.log(error);
        return res.API.error(RESPONSE_MESSAGE.internal_server_error, 500);
    }
};

controller.createUser = async (req, res) => {
    const { password, role } = req.body;
    let { username } = req.body;
    username = username.toLowerCase().replace(' ', '');
    const shortName = username.split(' ').map(word => word[0]).join('').toUpperCase()
    try {
        const isExist = await User.findOne({
            where: {
                username: username
            }
        })

        if (isExist) return res.API.error(RESPONSE_MESSAGE.already_exist, 400)

        const hashPassword = await encryptPassword(password)

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
};

module.exports = controller;