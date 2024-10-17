const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://userDipesh:sunkoshiSystem@localhost:5432/sunkoshiDatabase');

const Order = sequelize.define('Order', {
  order_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_notes: {
    type: DataTypes.STRING,
  },
  order_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Order;
