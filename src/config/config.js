const env = require('./env');

module.exports = {
    "development": {
        "username": env.mysql.user,
        "password": env.mysql.password,
        "database": env.mysql.database,
        "host": env.mysql.host,
        "dialect": env.mysql.dialect,
        "seederStorage": 'sequelize',
        "seederStorageTableName": "SequelizeSeed"
    },
    "test": {
        "username": env.mysql.user,
        "password": env.mysql.password,
        "database": env.mysql.database,
        "host": env.mysql.host,
        "dialect": env.mysql.dialect,
        "seederStorage": 'sequelize',
        "seederStorageTableName": "SequelizeSeed"
    },
    "production": {
        "username": env.mysql.user,
        "password": env.mysql.password,
        "database": env.mysql.database,
        "host": env.mysql.host,
        "dialect": env.mysql.dialect,
        "seederStorage": 'sequelize',
        "seederStorageTableName": "SequelizeSeed"
    }
}