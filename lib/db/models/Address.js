// lib/db/models/Address.js
import { DataTypes } from 'sequelize'

export default function initAddress(sequelize) {
  const Address = sequelize.define('address', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      field: 'order_id',
      allowNull: false,
    },
    clientId: {
      type: DataTypes.UUID,
      field: 'client_id',
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,  // Обязательное поле
    },
    house: {
      type: DataTypes.STRING,
      allowNull: false,  // Обязательное поле
    },
    entrance: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    floor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    intercom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_default',
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return Address
}