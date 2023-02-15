const { Sequelize } = require('sequelize');
const env = require('./env')

module.exports = db = {};

const sequelize = new Sequelize(
    env.database,
    env.username,
    env.password,
    {
        host: env.host,
        port: env.port,
        dialect: env.dialect,
        logging: false,
    }
);

db.sequelize = sequelize;

sequelize
    .authenticate()
    .then(() => console.log('Connected to mysql server'))
    .catch((err) => console.error(`${env.mysql}`, err.message))