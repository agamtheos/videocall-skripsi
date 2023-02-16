const JWT = require('jsonwebtoken');

const { RESPONSE_MESSAGE } = require('../helpers/constants');
const env = require('../config/env');

module.exports = async (req, res, next) => {
    let token = req.headers['authorization'] || req.header('Authorization');
    if (!token) return res.error(RESPONSE_MESSAGE.unauthorized, 401);

    try {
        token = token.split(" ")[1];
        const decoded = JWT.verify(token, env.jwtSecret);
        req.auth = decoded;

        next();
    } catch (error) {
        console.log(error)
        return res.error(RESPONSE_MESSAGE.invalid_token, 498);
    }
}