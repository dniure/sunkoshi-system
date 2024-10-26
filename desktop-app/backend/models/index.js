// models/index.js
const sequelize = require('../config/database');
const Customer = require('./Customer');
const Order = require('./Order');
const TempOrder = require('./TempOrder');

// Define associations
Customer.hasMany(Order, { foreignKey: 'customerID' });
Order.belongsTo(Customer, { foreignKey: 'customerID' });

// Export the models and sequelize connection
module.exports = {
    sequelize,
    Customer,
    TempOrder,
    Order,
};
