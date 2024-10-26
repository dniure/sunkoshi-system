// models/Order.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    orderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    orderNumber: {
        type: DataTypes.STRING(4),
        allowNull: false,
    },
    creationTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    lastModifiedTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    orderedItems: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    orderType: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    orderNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    customerID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'customerInfo',
            key: 'customerID',
        },
        allowNull: true,
    },
});

module.exports = Order;
