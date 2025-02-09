const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sunkoshiDatabase', 'userDipesh', 'sunkoshiSystem', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
});

sequelize.authenticate()
    .then(() => console.log('Database connected successfully!'))
    .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
