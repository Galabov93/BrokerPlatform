const app = require('../src/app');
// const env = process.env.NODE_ENV || 'development';
require('dotenv').config();
const dialect = 'mysql'; // Or your dialect name

const connectionString = process.env.DB_CONNECTION_STRING;

module.exports = {
    connectionString,
    dialect,
    url: app.get(dialect),
    migrationStorageTableName: '_migrations',
};
