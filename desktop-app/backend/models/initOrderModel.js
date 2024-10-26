// models/initOrderModel.js
const { DataTypes } = require('sequelize');

const initOrderModel = (sequelize) => {
    return {
        orderDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        orderNumber: {
            type: DataTypes.STRING(4),
            autoIncrement: true, // Ensure this is set to true
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
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    };
};

module.exports = initOrderModel;
