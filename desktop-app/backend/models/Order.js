// models/Order.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database.js'); // Ensure this path is correct
const initOrderModel = require('./initOrderModel.js');

const Order = sequelize.define('Order', initOrderModel(sequelize), {
    tableName: 'Orders',
    timestamps: true,
});

module.exports = Order;
