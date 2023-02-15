require('dotenv').config();

const env = {
    port: process.env.PORT || 3000,
    as_uri: process.env.AS_URI,
    ws_uri: process.env.WS_URI,
    mysql: {
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || '',
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        dialect: process.env.MYSQL_DIALECT || 'mysql'
    }
}

module.exports = env;