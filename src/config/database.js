const { Sequelize } = require('sequelize');
const env = require('./env')

module.exports = db = {};

const sequelize = new Sequelize(
    env.mysql.database,
    env.mysql.user,
    env.mysql.password,
    {
        host: env.mysql.host,
        port: env.mysql.port,
        dialect: env.mysql.dialect,
        logging: false,
    }
);

db.sequelize = sequelize;

sequelize
    .authenticate()
    .then(() => console.log('Connected to mysql server'))
    .catch((err) => console.error(`${env.mysql}`, err.message))