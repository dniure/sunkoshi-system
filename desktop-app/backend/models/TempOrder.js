// models/TempOrder.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ensure this path is correct
const initOrderModel = require('./initOrderModel');

const TempOrder = sequelize.define('TempOrder', initOrderModel(sequelize), {
    tableName: 'TempOrders',
    timestamps: true,
});

module.exports = TempOrder;
