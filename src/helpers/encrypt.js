const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const env = require('../config/env');

module.exports = {
    encryptPassword: async (password) => {
        try {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);
            return hash;
        } catch (error) {
            console.log(error)
            return error;
        }
    },
    comparePassword: async (password, hash) => {
        try {
            const result = await bcrypt.compare(password, hash);
            return result;
        } catch (error) {
            console.log(error)
            return error;
        }
    },
    generateToken: async (id, username, role) => {
        try {
            const token = JWT.sign({ uid: id, username: username, role: role }, env.jwtSecret, { expiresIn: env.jwtExpires });
            return token;
        } catch (error) {
            console.log(error)
            return error;
        }
    }
}