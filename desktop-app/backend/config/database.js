const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sunkoshiDatabase', 'userDipesh', 'sunkoshiSystem', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false, // Disable SQL logging for cleaner console output
});

module.exports = sequelize;
