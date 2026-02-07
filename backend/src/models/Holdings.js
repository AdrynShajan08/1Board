const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Holdings = sequelize.define('Holdings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tradingsymbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  folio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fund: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 3),
    allowNull: false
  },
  average_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  last_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  last_price_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  pnl: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  invested_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  current_value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  return_percentage: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  fetch_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'holdings',
  timestamps: true,
  indexes: [
    {
      unique: false,
      fields: ['tradingsymbol']
    },
    {
      unique: false,
      fields: ['fetch_date']
    }
  ]
});

module.exports = Holdings;