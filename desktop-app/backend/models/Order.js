// models/Order.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ensure this path is correct
const initOrderModel = require('./initOrderModel');

const Order = sequelize.define('Order', initOrderModel(sequelize), {
    tableName: 'Orders',
    timestamps: true,
});

module.exports = Order;
