const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const utils = require('../utils/utils');

const controller = {};

controller.createUser = async (req, res) => {
    const { username, password, role } = req.body;

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
}