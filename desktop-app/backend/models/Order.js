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
        primaryKey: true,
    },
    orderType: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    customerID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Customers', // Name of the referenced table
            key: 'customerID', // Name of the column in the referenced table
        },
        allowNull: true,
    },
    orderedItems: {
        type: DataTypes.JSONB,
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
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'Orders',
    timestamps: true,
});

module.exports = Order;
