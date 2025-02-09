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
            // autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        orderType: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        prepareOrderFor: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        orderTimeInMinutes: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        totalPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        finalCost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        paymentMethod: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("CURRENT_TIME"),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal("CURRENT_TIME"),
        },
    };
};

module.exports = initOrderModel;
