const Sequelize = require('sequelize');
const path = require('path');
require('dotenv').config();

const DATA_DIRECTORY = process.env.DATA_DIRECTORY;
const DATA_FILE = process.env.DATA_FILE;
const SQLITE_STORAGE_PATH = path.join(DATA_DIRECTORY, DATA_FILE);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: SQLITE_STORAGE_PATH,
    logging: false
    //logging: console.log
});

module.exports = sequelize;
